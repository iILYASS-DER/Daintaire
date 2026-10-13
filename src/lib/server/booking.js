/**
 * Création d'une demande de rendez-vous.
 *
 * Sécurité et cohérence :
 *  - validation complète côté serveur (jamais de confiance au client) ;
 *  - transaction atomique : verrou de créneau + document de demande +
 *    marqueur de référence écrits ensemble ;
 *  - deux demandes simultanées sur le même créneau ne peuvent pas toutes
 *    les deux aboutir (lecture/écriture du document de verrou) ;
 *  - protection anti double-envoi par clé de requête (idempotence) ;
 *  - aucun identifiant interne n'est renvoyé au patient : uniquement un
 *    numéro de référence.
 */

import { APPOINTMENT_STATUS, COLLECTIONS, DEFAULT_PENDING_HOLD_HOURS, DEFAULT_TIMEZONE } from "@/lib/constants";
import { normalizePhone, validateAppointmentInput, toMinutes } from "@/lib/validation";
import { validateSlotRequest, minutesToTime } from "@/lib/availability";
import {
  fetchDoc,
  fsDoc,
  fsQuery,
  getSettings,
  invalidateCache,
  listActiveOccupiedForDate,
  listBlockedForDate,
  listDoctors,
  listServices,
  runTransaction,
  srvTs,
} from "@/lib/server/store";
import { addInterval, findConflict, lockDocId } from "@/lib/server/slots";
import { generateReference, isValidReference, normalizeReference, sanitizeRequestKey } from "@/lib/server/reference";
import { phoneFingerprint } from "@/lib/server/hash";
import { isPermissionDenied, RULES_MISSING_MESSAGE } from "@/lib/server/firebase-errors";
import { msg } from "@/lib/messages";

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function createAppointmentRequest(rawInput = {}, options = {}) {
  const settings = (await getSettings()) || {};
  const policy = settings.booking || {};
  const timeZone = settings.timeZone || DEFAULT_TIMEZONE;

  const validation = validateAppointmentInput(rawInput, {
    maxAdvanceDays: policy.maxAdvanceDays ?? 90,
    requireEmail: false,
    timeZone,
  });
  if (!validation.valid) {
    throw new ApiError(400, "invalid_payload", msg("error.invalidPayload"), validation.errors);
  }

  const requestKey = sanitizeRequestKey(options.requestKey);
  if (!requestKey) {
    throw new ApiError(400, "invalid_payload", msg("error.invalidPayload"), {
      requestKey: "form.error.invalid",
    });
  }

  const { clean } = validation;

  // Anti-spam : la page doit rester affichée au moins 2 secondes.
  const startedAt = Number(options.startedAt || 0);
  if (startedAt && Date.now() - startedAt < 2000) {
    throw new ApiError(429, "rate_limited", msg("error.rateLimited"), {
      form: "form.error.rateLimited",
    });
  }

  const services = await listServices({ activeOnly: true });
  const service = services.find((s) => s.id === clean.serviceId);
  if (!service) {
    throw new ApiError(404, "service_not_found", msg("error.serviceNotFound"), {
      serviceId: "form.error.serviceRequired",
    });
  }

  const duration = Number(service.durationMinutes) || 30;
  const startMin = toMinutes(clean.time);
  const end = minutesToTime(startMin + duration);

  const doctors = (await listDoctors({ activeOnly: true })).filter((doctor) =>
    Array.isArray(doctor.serviceIds) && doctor.serviceIds.length
      ? doctor.serviceIds.includes(service.id)
      : true
  );

  const candidates =
    clean.doctorId && clean.doctorId !== "any"
      ? doctors.filter((d) => d.id === clean.doctorId)
      : doctors;

  if (!candidates.length) {
    throw new ApiError(404, "doctor_not_found", msg("error.doctorNotFound"), {
      doctorId: "form.error.doctorRequired",
    });
  }

  const blocked = await listBlockedForDate(clean.date);
  const occupied = await listActiveOccupiedForDate(clean.date);

  let lastErrorKey = "form.error.slotUnavailable";

  for (const doctor of candidates) {
    const scheduleErrors = validateSlotRequest({
      date: clean.date,
      time: clean.time,
      doctor,
      service,
      settings,
      occupied,
      blocked,
    });
    if (scheduleErrors.length) {
      lastErrorKey = scheduleErrors[0];
      continue;
    }

    try {
      const result = await reserveSlot({
        clean,
        doctor,
        service,
        settings,
        timeZone,
        requestKey,
        duration,
        end,
      });
      invalidateCache("settings");
      return result;
    } catch (error) {
      if (isPermissionDenied(error)) {
        throw new ApiError(503, "firestore_rules_missing", RULES_MISSING_MESSAGE);
      }
      if (error instanceof ApiError && error.code === "slot_unavailable") {
        lastErrorKey = "form.error.slotUnavailable";
        continue;
      }
      if (error && error.code === "reference_taken") continue;
      if (error && error.code === "contention") continue;
      throw error;
    }
  }

  throw new ApiError(409, "slot_unavailable", msg("error.slotUnavailable"), {
    time: lastErrorKey,
  });
}

async function reserveSlot({ clean, doctor, service, settings, requestKey, duration, end }) {
  const holdHours =
    Number(settings?.booking?.pendingHoldHours) || DEFAULT_PENDING_HOLD_HOURS;
  const expiresAtMs = Date.now() + holdHours * 3600_000;
  const appointmentId = `req_${requestKey}`;
  const lockId = lockDocId(doctor.id, clean.date);
  const phone = normalizePhone(clean.phoneRaw);

  let reference = generateReference();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const outcome = await runTransaction(async (tx) => {
        // 1. Idempotence : la même requête ne crée jamais deux demandes.
        const appointmentRef = fsDoc(`${COLLECTIONS.APPOINTMENTS}/${appointmentId}`);
        const existing = await tx.get(appointmentRef);
        if (existing.exists) {
          const data = existing.data();
          return {
            duplicate: true,
            reference: data.reference,
            status: data.status,
            date: data.date,
            start: data.start,
            doctorName: data.doctorName || "",
          };
        }

        // 2. Référence unique (marqueur non sensible).
        const referenceRef = fsDoc(
          `${COLLECTIONS.APPOINTMENT_REFERENCES}/${reference}`
        );
        const referenceSnap = await tx.get(referenceRef);
        if (referenceSnap.exists) {
          const error = new Error("reference-taken");
          error.code = "reference_taken";
          throw error;
        }

        // 3. Verrou atomique du créneau.
        const lockRef = fsDoc(`${COLLECTIONS.SLOT_LOCKS}/${lockId}`);
        const lockSnap = await tx.get(lockRef);
        const intervals = lockSnap.exists ? lockSnap.data()?.intervals || [] : [];
        const conflict = findConflict(intervals, clean.time, end);
        if (conflict) {
          const error = new Error("slot-taken");
          error.code = "slot_conflict";
          throw error;
        }

        const now = new Date();
        const appointmentDoc = {
          reference,
          status: APPOINTMENT_STATUS.PENDING,
          requestKey,
          serviceId: service.id,
          serviceNameFr: service.nameFr || "",
          serviceNameAr: service.nameAr || "",
          durationMinutes: duration,
          doctorId: doctor.id,
          doctorName: doctor.displayName || "",
          date: clean.date,
          start: clean.time,
          end,
          timeZone: settings?.timeZone || DEFAULT_TIMEZONE,
          patientName: clean.name,
          patientPhone: phone,
          patientEmail: clean.email || "",
          note: clean.note || "",
          internalNotes: "",
          pendingExpiresAtMs: expiresAtMs,
          source: "web",
          statusHistory: [{ status: APPOINTMENT_STATUS.PENDING, at: now.toISOString() }],
          isDemo: false,
          createdAtMs: now.getTime(),
        };

        const markerDoc = {
          reference,
          appointmentId,
          status: APPOINTMENT_STATUS.PENDING,
          date: clean.date,
          start: clean.time,
          end,
          durationMinutes: duration,
          serviceId: service.id,
          serviceNameFr: service.nameFr || "",
          serviceNameAr: service.nameAr || "",
          doctorName: doctor.displayName || "",
          phoneKey: phoneFingerprint(phone),
          pendingExpiresAtMs: expiresAtMs,
          updatedAtMs: now.getTime(),
        };

        tx.set(lockRef, {
          doctorId: doctor.id,
          date: clean.date,
          intervals: addInterval(intervals, {
            start: clean.time,
            end,
            kind: "appointment",
            refId: appointmentId,
            expiresAtMs,
          }),
          updatedAtMs: now.getTime(),
        }, { merge: true });

        tx.set(appointmentRef, { ...appointmentDoc, createdAt: srvTs(), updatedAt: srvTs() });
        tx.set(referenceRef, { ...markerDoc, createdAt: srvTs() });

        return {
          duplicate: false,
          reference,
          status: APPOINTMENT_STATUS.PENDING,
          date: clean.date,
          start: clean.time,
          doctorName: doctor.displayName || "",
          pendingExpiresAtMs: expiresAtMs,
        };
      });

      return outcome;
    } catch (error) {
      if (error?.code === "reference_taken") {
        reference = generateReference();
        continue;
      }
      if (error?.code === "slot_conflict") {
        throw new ApiError(409, "slot_unavailable", msg("error.slotUnavailable"), {
          time: "form.error.slotUnavailable",
        });
      }
      if (isContention(error)) {
        const conflictError = new Error("contention");
        conflictError.code = "contention";
        throw conflictError;
      }
      throw error;
    }
  }

  throw new ApiError(409, "slot_unavailable", msg("error.slotUnavailable"), {
    time: "form.error.slotUnavailable",
  });
}

function isContention(error) {
  const code = error?.code || "";
  const message = String(error?.message || "");
  return (
    code === 6 || // ABORTED
    code === "aborted" ||
    /transaction|retry|contend|conflict/i.test(message)
  );
}

/**
 * État d'une demande pour le patient (consultation par référence + téléphone).
 * Ne renvoie jamais de donnée médicale ni de note interne.
 */
export async function getAppointmentStatus(referenceInput, phoneInput) {
  const reference = normalizeReference(referenceInput);
  if (!isValidReference(reference)) {
    throw new ApiError(404, "not_found", msg("error.notFound"));
  }

  let marker;
  try {
    marker = await fetchDoc(
      fsDoc(`${COLLECTIONS.APPOINTMENT_REFERENCES}/${reference}`)
    );
  } catch (error) {
    if (isPermissionDenied(error)) {
      throw new ApiError(503, "firestore_rules_missing", RULES_MISSING_MESSAGE);
    }
    throw error;
  }
  if (!marker) throw new ApiError(404, "not_found", msg("error.notFound"));

  const phone = normalizePhone(phoneInput || "");
  if (!phone || phoneFingerprint(phone) !== marker.phoneKey) {
    throw new ApiError(404, "not_found", msg("error.notFound"));
  }

  let status = marker.status || APPOINTMENT_STATUS.PENDING;
  if (
    status === APPOINTMENT_STATUS.PENDING &&
    marker.pendingExpiresAtMs &&
    marker.pendingExpiresAtMs <= Date.now()
  ) {
    status = APPOINTMENT_STATUS.EXPIRED;
  }

  return {
    reference: marker.reference,
    status,
    date: marker.date,
    start: marker.start,
    durationMinutes: marker.durationMinutes,
    serviceId: marker.serviceId,
    serviceNameFr: marker.serviceNameFr || "",
    serviceNameAr: marker.serviceNameAr || "",
    doctorName: marker.doctorName || "",
    updatedAtMs: marker.updatedAtMs || null,
  };
}

/** Recherche une demande par référence (usage administration). */
export async function findAppointmentByReference(reference) {
  const rows = await fsQuery(COLLECTIONS.APPOINTMENTS, {
    wheres: [{ field: "reference", value: reference }],
    limit: 1,
  });
  const snap = await rows.get();
  const doc = snap.docs[0];
  return doc ? { id: doc.id, ...doc.data() } : null;
}
