/**
 * Opérations d'administration — à exécuter uniquement avec des
 * privilèges serveur (Firebase Admin SDK).
 *
 * Toute modification de créneau passe par une transaction qui :
 *   1. relit le verrou du créneau concerné ;
 *   2. refuse un chevauchement avec un autre rendez-vous / séance ;
 *   3. réécrit le verrou et le document de demande ensemble.
 */

import {
  APPOINTMENT_STATUS,
  BLOCKING_STATUSES,
  COLLECTIONS,
  DEFAULT_TIMEZONE,
} from "@/lib/constants";
import { normalizePhone, validateDoctorInput, validateServiceInput, validateSettingsInput, validateSessionInput, validatePlanInput, toMinutes, isValidDateString, nowInTimeZone } from "@/lib/validation";
import {
  validateSlotRequest,
  minutesToTime,
} from "@/lib/availability";
import { msg } from "@/lib/messages";
import {
  fetchCollection,
  fetchDoc,
  fsCollection,
  fsDoc,
  fsQuery,
  getSettings,
  invalidateCache,
  listBlockedForDate,
  listDoctors,
  listLocksForDate,
  listServices,
  runTransaction,
  srvTs,
  toJsonSafe,
  writeBatch,
} from "@/lib/server/store";
import { addInterval, findConflict, lockDocId, removeInterval } from "@/lib/server/slots";
import { ApiError } from "@/lib/server/booking";
import { DEMO_DOCTORS, DEMO_SERVICES, DEMO_SETTINGS } from "@/lib/demo-data";

/* ------------------------------------------------------ transformations */

function statusHistoryPush(appointment, status) {
  const history = Array.isArray(appointment.statusHistory)
    ? appointment.statusHistory.slice(-20)
    : [];
  history.push({ status, at: new Date().toISOString() });
  return history;
}

async function loadAppointment(id) {
  const appointment = await fetchDoc(fsDoc(`${COLLECTIONS.APPOINTMENTS}/${id}`));
  if (!appointment) throw new ApiError(404, "not_found", msg("error.notFound"));
  return appointment;
}

async function updateMarker(reference, patch) {
  if (!reference) return;
  const ref = fsDoc(`${COLLECTIONS.APPOINTMENT_REFERENCES}/${reference}`);
  await ref.set({ ...patch, updatedAtMs: Date.now() }, { merge: true });
}

/** Libère / déplace l'intervalle verrouillé d'un rendez-vous. */
async function moveLock(tx, { from, to, interval }) {
  if (from) {
    const ref = fsDoc(`${COLLECTIONS.SLOT_LOCKS}/${from}`);
    const snap = await tx.get(ref);
    if (snap.exists) {
      const data = snap.data() || {};
      await tx.set(
        ref,
        { ...data, intervals: removeInterval(data.intervals || [], interval.refId), updatedAtMs: Date.now() },
        { merge: true }
      );
    }
  }
  if (to) {
    const ref = fsDoc(`${COLLECTIONS.SLOT_LOCKS}/${to}`);
    const snap = await tx.get(ref);
    const data = snap.exists ? snap.data() || {} : {};
    const intervals = removeInterval(data.intervals || [], interval.refId);
    intervals.push(interval);
    await tx.set(
      ref,
      { doctorId: interval.doctorId, date: interval.date, intervals, updatedAtMs: Date.now() },
      { merge: true }
    );
  }
}

/* ---------------------------------------------------------- rendez-vous */

/**
 * Liste des demandes / rendez-vous.
 *
 * ⚠️ Les requêtes Firestore combinant un filtre et un tri sur deux champs
 * différents exigent un index composite (non déployé partout). On garde
 * donc des requêtes « mono-champ » (égalité ou tri simple) et on filtre /
 * trie en mémoire : le volume d'un cabinet reste modeste (quelques
 * centaines de dossiers), et le tableau de bord fonctionne immédiatement.
 *
 * @param {object} options { status, search, from, to, doctorId, limit }
 */
export async function listAppointments({
  status = "",
  search = "",
  from = "",
  to = "",
  doctorId = "",
  limit: max = 200,
} = {}) {
  await expireStaleRequests();

  const wheres = [];
  if (status) wheres.push({ field: "status", value: status });
  if (doctorId) wheres.push({ field: "doctorId", value: doctorId });
  if (from) wheres.push({ field: "date", value: from, op: ">=" });
  if (to) wheres.push({ field: "date", value: to, op: "<=" });

  // Règle Firestore :
  //  - N filtres « == » se combinent sans index composite (zig-zag merge) ;
  //  - un filtre de plage (>= / <=) combiné à un autre champ exige un index
  //    composite — donc jamais envoyé tel quel au serveur.
  // On applique donc au plus UNE plage (sur `date`), et le reste en mémoire.
  const hasRange = from || to;
  let query;
  if (hasRange) {
    const rangeWhere = [];
    if (from) rangeWhere.push({ field: "date", value: from, op: ">=" });
    if (to) rangeWhere.push({ field: "date", value: to, op: "<=" });
    query = fsQuery(COLLECTIONS.APPOINTMENTS, { wheres: rangeWhere, limit: 1000 });
  } else if (wheres.length) {
    query = fsQuery(COLLECTIONS.APPOINTMENTS, { wheres, limit: 1000 });
  } else {
    // Aucun filtre : tri direct sur createdAtMs (index mono-champ auto).
    query = fsQuery(COLLECTIONS.APPOINTMENTS, {
      orders: [{ field: "createdAtMs", dir: "desc" }],
      limit: max,
    });
  }

  let items = await fetchCollection(query);
  if (hasRange) {
    // Filtres restants (statut, praticien) + tri + découpage en mémoire.
    items = items.filter(
      (item) =>
        (!status || item.status === status) &&
        (!doctorId || item.doctorId === doctorId)
    );
  }
  if (wheres.length) {
    items.sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
    items = items.slice(0, max);
  }

  if (search) {
    const needle = search.trim().toLowerCase();
    items = items.filter((item) =>
      [item.patientName, item.patientPhone, item.reference, item.patientEmail]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    );
  }

  return items.map(toJsonSafe);
}

/** Passe en « expiré » les demandes en attente trop vieilles. */
export async function expireStaleRequests() {
  const now = Date.now();
  // Requête mono-champ uniquement (l'égalité + une plage sur un autre champ
  // exigerait un index composite non déployé) : on filtre en mémoire.
  const pending = await fetchCollection(
    fsQuery(COLLECTIONS.APPOINTMENTS, {
      wheres: [{ field: "status", value: APPOINTMENT_STATUS.PENDING }],
      limit: 200,
    })
  );
  const stale = pending.filter(
    (row) => row.pendingExpiresAtMs && row.pendingExpiresAtMs < now
  );

  for (const appointment of stale) {
    try {
      await updateAppointmentStatus(appointment.id, APPOINTMENT_STATUS.EXPIRED, {
        actorRole: "system",
        reason: "expiration",
      });
    } catch {
      /* best effort */
    }
  }
  return stale.length;
}

/**
 * Actions sur une demande : approve, reject, cancel, complete, missed,
 * expired, reschedule, assign, notes.
 */
export async function actOnAppointment(id, action, payload = {}, actor = {}) {
  const appointment = await loadAppointment(id);
  const settings = (await getSettings()) || {};
  const timeZone = settings.timeZone || DEFAULT_TIMEZONE;

  switch (action) {
    case "notes": {
      const notes = String(payload.internalNotes || "").slice(0, 2000);
      await fsDoc(`${COLLECTIONS.APPOINTMENTS}/${id}`).set(
        { internalNotes: notes, updatedAt: srvTs() },
        { merge: true }
      );
      return { ok: true, action };
    }

    case "approve":
      return changeAppointment(id, appointment, {
        status: APPOINTMENT_STATUS.CONFIRMED,
        settings,
        timeZone,
        payload,
        actor,
        releaseOnConflict: false,
      });

    case "reject":
      return changeAppointment(id, appointment, {
        status: APPOINTMENT_STATUS.REJECTED,
        settings,
        timeZone,
        payload,
        actor,
        releaseLock: true,
      });

    case "cancel":
      return changeAppointment(id, appointment, {
        status: APPOINTMENT_STATUS.CANCELLED,
        settings,
        timeZone,
        payload,
        actor,
        releaseLock: true,
      });

    case "complete":
      return changeAppointment(id, appointment, {
        status: APPOINTMENT_STATUS.COMPLETED,
        settings,
        timeZone,
        payload,
        actor,
        releaseLock: true,
      });

    case "missed":
      return changeAppointment(id, appointment, {
        status: APPOINTMENT_STATUS.MISSED,
        settings,
        timeZone,
        payload,
        actor,
        releaseLock: true,
      });

    case "expired":
      return changeAppointment(id, appointment, {
        status: APPOINTMENT_STATUS.EXPIRED,
        settings,
        timeZone,
        payload,
        actor,
        releaseLock: true,
      });

    case "reschedule":
    case "assign": {
      const date = payload.date || appointment.date;
      const start = payload.time || payload.start || appointment.start;
      const nextDoctorId = payload.doctorId || appointment.doctorId;
      return changeAppointment(id, appointment, {
        status: payload.status || appointment.status,
        settings,
        timeZone,
        payload: { ...payload, date, start, doctorId: nextDoctorId },
        actor,
        requireValidSlot: true,
      });
    }

    default:
      throw new ApiError(400, "invalid_payload", msg("error.invalidPayload"), {
        action: "form.error.invalid",
      });
  }
}

async function changeAppointment(id, appointment, options) {
  const {
    status,
    settings,
    timeZone,
    payload = {},
    actor = {},
    releaseLock = false,
    requireValidSlot = false,
  } = options;

  const service = await listServices({ activeOnly: false }).then((items) =>
    items.find((s) => s.id === appointment.serviceId)
  );
  // Liste « publique » (avec repli démonstration si la collection est vide) :
  // un rendez-vous pris sur un praticien demo-* doit pouvoir être validé.
  const doctors = await listDoctors({ activeOnly: false });
  const nextDoctorId = payload.doctorId || appointment.doctorId;
  const nextDoctor = doctors.find((d) => d.id === nextDoctorId);

  const nextDate = payload.date || appointment.date;
  const nextStart = payload.time || payload.start || appointment.start;
  const duration = Number(appointment.durationMinutes) || 30;
  const nextEnd = minutesToTime(toMinutes(nextStart) + duration);
  const keepSlot =
    status === APPOINTMENT_STATUS.CONFIRMED ||
    status === APPOINTMENT_STATUS.PENDING;

  if (keepSlot) {
    if (!nextDoctor) {
      throw new ApiError(400, "invalid_payload", msg("error.doctorNotFound"), {
        doctorId: "form.error.doctorRequired",
      });
    }
    const blocked = await listBlockedForDate(nextDate);
    const occupiedAll = await listLocksForDate(nextDate);
    // Retire l'intervalle actuel du rendez-vous avant de revérifier.
    const occupied = occupiedAll.filter((row) => row.refId !== id);

    const scheduleErrors = validateSlotRequest({
      date: nextDate,
      time: nextStart,
      doctor: nextDoctor,
      service: service || { durationMinutes: duration },
      settings,
      occupied,
      blocked,
    });
    if (scheduleErrors.length && (requireValidSlot || status === APPOINTMENT_STATUS.CONFIRMED)) {
      throw new ApiError(409, "slot_unavailable", msg("error.slotUnavailable"), {
        time: scheduleErrors[0],
      });
    }
  }

  const newLockId = keepSlot ? lockDocId(nextDoctorId, nextDate) : null;
  const oldLockId = appointment.doctorId
    ? lockDocId(appointment.doctorId, appointment.date)
    : null;

  const result = await runTransaction(async (tx) => {
    const appointmentRef = fsDoc(`${COLLECTIONS.APPOINTMENTS}/${id}`);
    const snap = await tx.get(appointmentRef);
    if (!snap.exists) throw new ApiError(404, "not_found", msg("error.notFound"));
    const current = snap.data();

    // ⚠️ Toutes les lectures DOIVENT précéder toutes les écritures
    // (règle stricte des transactions Firestore).
    const newLockRef =
      keepSlot && newLockId ? fsDoc(`${COLLECTIONS.SLOT_LOCKS}/${newLockId}`) : null;
    const oldLockRef =
      oldLockId && oldLockId !== newLockId
        ? fsDoc(`${COLLECTIONS.SLOT_LOCKS}/${oldLockId}`)
        : null;

    const newLockSnap = newLockRef ? await tx.get(newLockRef) : null;
    const oldLockSnap = oldLockRef
      ? newLockRef && newLockRef.path === oldLockRef.path
        ? newLockSnap // même verrou : une seule lecture
        : await tx.get(oldLockRef)
      : null;

    // Vérification du conflit sur le verrou cible (lecture seulement).
    if (newLockSnap) {
      const intervals = newLockSnap.exists
        ? newLockSnap.data()?.intervals || []
        : [];
      const others = intervals.filter((interval) => interval.refId !== id);
      const conflict = findConflict(others, nextStart, nextEnd);
      if (conflict && conflict.refId !== id) {
        throw new ApiError(409, "slot_unavailable", msg("error.slotUnavailable"), {
          time: "form.error.slotUnavailable",
        });
      }
    }

    // 1. Retire l'ancien verrou si le créneau ou le praticien change
    //    (ou si le rendez-vous ne retient plus de créneau).
    if (oldLockSnap && oldLockRef) {
      const data = oldLockSnap.exists ? oldLockSnap.data() || {} : {};
      await tx.set(
        oldLockRef,
        { ...data, intervals: removeInterval(data.intervals || [], id), updatedAtMs: Date.now() },
        { merge: true }
      );
    }

    // 2. Réécrit le verrou courant (ajout du créneau retenu).
    if (newLockSnap && newLockRef) {
      const data = newLockSnap.exists ? newLockSnap.data() || {} : {};
      const intervals = [
        ...removeInterval(data.intervals || [], id),
        {
          start: nextStart,
          end: nextEnd,
          kind: "appointment",
          refId: id,
          expiresAtMs:
            status === APPOINTMENT_STATUS.CONFIRMED ? null : Date.now() + holdMs(settings),
        },
      ];
      await tx.set(
        newLockRef,
        { doctorId: nextDoctorId, date: nextDate, intervals, updatedAtMs: Date.now() },
        { merge: true }
      );
    }

    // 3. Met à jour le rendez-vous.
    const patch = {
      status,
      date: keepSlot ? nextDate : current.date,
      start: keepSlot ? nextStart : current.start,
      end: keepSlot ? nextEnd : current.end,
      doctorId: keepSlot ? nextDoctorId : current.doctorId,
      doctorName: keepSlot
        ? nextDoctor?.displayName || ""
        : current.doctorName,
      statusHistory: statusHistoryPush(current, status),
      handledBy: actor.uid || null,
      handledAt: new Date().toISOString(),
      updatedAt: srvTs(),
    };
    if (releaseLock || !keepSlot) patch.pendingExpiresAtMs = null;
    if (keepSlot && status === APPOINTMENT_STATUS.CONFIRMED)
      patch.pendingExpiresAtMs = null;

    await tx.set(appointmentRef, patch, { merge: true });
    return { id, ...patch };
  });

  await updateMarker(appointment.reference, {
    status,
    date: keepSlot ? nextDate : appointment.date,
    start: keepSlot ? nextStart : appointment.start,
    end: keepSlot ? nextEnd : appointment.end,
    doctorName: keepSlot ? nextDoctor?.displayName || "" : appointment.doctorName,
    pendingExpiresAtMs:
      keepSlot && status !== APPOINTMENT_STATUS.CONFIRMED
        ? Date.now() + holdMs(settings)
        : null,
  });

  invalidateCache("settings");
  return toJsonSafe({ ok: true, action: "status", status, id: result.id });
}

function holdMs(settings) {
  const hours = Number(settings?.booking?.pendingHoldHours) || 48;
  return hours * 3600_000;
}

export async function updateAppointmentStatus(id, status, options = {}) {
  const allowed = Object.values(APPOINTMENT_STATUS);
  if (!allowed.includes(status)) {
    throw new ApiError(400, "invalid_payload", msg("error.invalidPayload"), {
      status: "form.error.invalid",
    });
  }
  const releaseLock = [
    APPOINTMENT_STATUS.REJECTED,
    APPOINTMENT_STATUS.CANCELLED,
    APPOINTMENT_STATUS.EXPIRED,
    APPOINTMENT_STATUS.COMPLETED,
    APPOINTMENT_STATUS.MISSED,
  ].includes(status);

  return changeAppointment(id, await loadAppointment(id), {
    status,
    settings: (await getSettings()) || {},
    timeZone: DEFAULT_TIMEZONE,
    payload: options.payload || {},
    actor: options.actor || {},
    releaseLock,
  });
}

/* ------------------------------------------------------------ praticiens */

export async function listDoctorsAdmin() {
  return (await fetchCollection(fsCollection(COLLECTIONS.DOCTORS))).sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
}

export async function saveDoctor(input) {
  const validation = validateDoctorInput(input);
  if (!validation.valid) {
    throw new ApiError(400, "invalid_payload", msg("error.invalidPayload"), validation.errors);
  }
  const id = input.id ? String(input.id).slice(0, 60) : null;
  const payload = { ...validation.clean, updatedAt: srvTs(), isDemo: input.isDemo === true };

  if (id) {
    await fsDoc(`${COLLECTIONS.DOCTORS}/${id}`).set(payload, { merge: true });
  } else {
    const ref = fsCollection(COLLECTIONS.DOCTORS).doc();
    await ref.set({ ...payload, createdAt: srvTs(), isDemo: false });
    invalidateCache("doctors");
    return { id: ref.id };
  }
  invalidateCache("doctors");
  return { id };
}

export async function deleteDoctor(id) {
  if (!id) throw new ApiError(400, "invalid_payload", msg("error.invalidPayload"));
  await fsDoc(`${COLLECTIONS.DOCTORS}/${id}`).delete();
  invalidateCache("doctors");
  return { ok: true };
}

/* ---------------------------------------------------------------- soins */

export async function listServicesAdmin() {
  return (await fetchCollection(fsCollection(COLLECTIONS.SERVICES))).sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
}

export async function saveService(input) {
  const validation = validateServiceInput(input);
  if (!validation.valid) {
    throw new ApiError(400, "invalid_payload", msg("error.invalidPayload"), validation.errors);
  }
  const id = input.id ? String(input.id).slice(0, 60) : null;
  const payload = {
    ...validation.clean,
    isDemo: input.isDemo === true,
    updatedAt: srvTs(),
  };

  if (id) {
    await fsDoc(`${COLLECTIONS.SERVICES}/${id}`).set(payload, { merge: true });
  } else {
    const ref = fsCollection(COLLECTIONS.SERVICES).doc();
    await ref.set({ ...payload, createdAt: srvTs(), isDemo: false });
    invalidateCache("services");
    return { id: ref.id };
  }
  invalidateCache("services");
  return { id };
}

export async function deleteService(id) {
  if (!id) throw new ApiError(400, "invalid_payload", msg("error.invalidPayload"));
  await fsDoc(`${COLLECTIONS.SERVICES}/${id}`).delete();

  // Un soin supprimé ne doit pas rester référencé par les praticiens :
  // un identifiant orphelin les exclurait de tous les autres soins.
  const doctors = await listDoctors({ activeOnly: false });
  const affected = doctors.filter(
    (doctor) => Array.isArray(doctor.serviceIds) && doctor.serviceIds.includes(id)
  );
  if (affected.length) {
    const batch = writeBatch();
    for (const doctor of affected) {
      batch.update(fsDoc(`${COLLECTIONS.DOCTORS}/${doctor.id}`), {
        serviceIds: doctor.serviceIds.filter((sid) => sid !== id),
      });
    }
    await batch.commit();
    invalidateCache("doctors");
  }

  invalidateCache("services");
  return { ok: true };
}

/* ------------------------------------------------------------ paramètres */

export async function saveSettings(input) {
  const validation = validateSettingsInput(input);
  if (!validation.valid) {
    throw new ApiError(400, "invalid_payload", msg("error.invalidPayload"), validation.errors);
  }
  await fsDoc(`${COLLECTIONS.CLINIC_SETTINGS}/main`).set(
    { ...validation.clean, updatedAt: srvTs() },
    { merge: true }
  );
  invalidateCache("settings");
  return { ok: true };
}

/* ------------------------------------------------------ plans de traitement */

export async function listTreatmentPlans() {
  const plans = await fetchCollection(
    fsQuery(COLLECTIONS.TREATMENT_PLANS, {
      orders: [{ field: "createdAtMs", dir: "desc" }],
      limit: 200,
    })
  );
  const sessions = await fetchCollection(
    fsQuery(COLLECTIONS.TREATMENT_SESSIONS, { limit: 1000 })
  );
  return { plans: toJsonSafe(plans), sessions: toJsonSafe(sessions) };
}

export async function createTreatmentPlan(input) {
  const validation = validatePlanInput(input);
  if (!validation.valid) {
    throw new ApiError(400, "invalid_payload", msg("error.invalidPayload"), validation.errors);
  }
  const ref = fsCollection(COLLECTIONS.TREATMENT_PLANS).doc();
  const now = Date.now();
  await ref.set({
    ...validation.clean,
    createdAt: srvTs(),
    createdAtMs: now,
    updatedAt: srvTs(),
  });
  return { id: ref.id };
}

export async function deleteTreatmentPlan(id) {
  const sessions = await fetchCollection(
    fsQuery(COLLECTIONS.TREATMENT_SESSIONS, {
      wheres: [{ field: "planId", value: id }],
    })
  );
  for (const session of sessions) {
    await fsDoc(`${COLLECTIONS.TREATMENT_SESSIONS}/${session.id}`).delete();
  }
  await fsDoc(`${COLLECTIONS.TREATMENT_PLANS}/${id}`).delete();
  return { ok: true };
}

/**
 * Ajoute ou met à jour une séance. Une séance n'est réservée qu'après une
 * action explicite « schedule » (jamais automatique).
 */
export async function saveTreatmentSession(planId, input) {
  const validation = validateSessionInput(input, { checkFuture: input.status === "scheduled" });
  if (!validation.valid) {
    throw new ApiError(400, "invalid_payload", msg("error.invalidPayload"), validation.errors);
  }

  const plan = await fetchDoc(fsDoc(`${COLLECTIONS.TREATMENT_PLANS}/${planId}`));
  if (!plan) throw new ApiError(404, "not_found", msg("error.notFound"));

  const settings = (await getSettings()) || {};
  const services = await listServices({ activeOnly: false });
  const service = services.find((s) => s.id === validation.clean.serviceId);
  const doctors = await listDoctors({ activeOnly: false });
  const doctor = doctors.find((d) => d.id === validation.clean.doctorId);

  const wantsSchedule = validation.clean.status === "scheduled";
  const duration = Number(service?.durationMinutes) || 30;
  const end = minutesToTime(toMinutes(validation.clean.time) + duration);

  if (wantsSchedule) {
    if (!doctor) {
      throw new ApiError(400, "invalid_payload", msg("error.doctorNotFound"), {
        doctorId: "form.error.doctorRequired",
      });
    }
    const blocked = await listBlockedForDate(validation.clean.date);
    const occupied = await listLocksForDate(validation.clean.date);
    const errors = validateSlotRequest({
      date: validation.clean.date,
      time: validation.clean.time,
      doctor,
      service: service || { durationMinutes: duration },
      settings,
      occupied,
      blocked,
    });
    if (errors.length) {
      throw new ApiError(409, "slot_unavailable", msg("error.slotUnavailable"), {
        time: errors[0],
      });
    }
  }

  const sessionId = input.id ? String(input.id).slice(0, 60) : null;
  const payload = {
    planId,
    ...validation.clean,
    end: wantsSchedule ? end : validation.clean.time,
    patientName: plan.patientName,
    updatedAt: srvTs(),
  };

  let savedId = sessionId;

  if (sessionId) {
    await fsDoc(`${COLLECTIONS.TREATMENT_SESSIONS}/${sessionId}`).set(payload, {
      merge: true,
    });
  } else {
    const ref = fsCollection(COLLECTIONS.TREATMENT_SESSIONS).doc();
    await ref.set({ ...payload, createdAt: srvTs(), createdAtMs: Date.now() });
    savedId = ref.id;
  }

  if (wantsSchedule && doctor) {
    await runTransaction(async (tx) => {
      const lockRef = fsDoc(`${COLLECTIONS.SLOT_LOCKS}/${lockDocId(doctor.id, validation.clean.date)}`);
      const snap = await tx.get(lockRef);
      const data = snap.exists ? snap.data() || {} : {};
      const intervals = removeInterval(data.intervals || [], savedId);
      const conflict = findConflict(intervals, validation.clean.time, end);
      if (conflict) {
        throw new ApiError(409, "slot_unavailable", msg("error.slotUnavailable"), {
          time: "form.error.slotUnavailable",
        });
      }
      intervals.push({
        start: validation.clean.time,
        end,
        kind: "session",
        refId: savedId,
        expiresAtMs: null,
      });
      await tx.set(
        lockRef,
        { doctorId: doctor.id, date: validation.clean.date, intervals, updatedAtMs: Date.now() },
        { merge: true }
      );
    });
  } else if (sessionId) {
    // Retrait du verrou si la séance quitte le statut « planifié ».
    const existing = await fetchDoc(
      fsDoc(`${COLLECTIONS.TREATMENT_SESSIONS}/${sessionId}`)
    );
    if (existing?.doctorId && existing?.date && existing.status !== "scheduled") {
      const lockRef = fsDoc(
        `${COLLECTIONS.SLOT_LOCKS}/${lockDocId(existing.doctorId, existing.date)}`
      );
      const snap = await fetchDoc(lockRef);
      if (snap) {
        await lockRef.set(
          { intervals: removeInterval(snap.intervals || [], sessionId), updatedAtMs: Date.now() },
          { merge: true }
        );
      }
    }
  }

  return { id: savedId };
}

export async function updateTreatmentSessionStatus(sessionId, status) {
  const allowed = ["planned", "scheduled", "completed", "cancelled", "missed"];
  if (!allowed.includes(status)) {
    throw new ApiError(400, "invalid_payload", msg("error.invalidPayload"), {
      status: "form.error.invalid",
    });
  }
  const session = await fetchDoc(
    fsDoc(`${COLLECTIONS.TREATMENT_SESSIONS}/${sessionId}`)
  );
  if (!session) throw new ApiError(404, "not_found", msg("error.notFound"));

  await fsDoc(`${COLLECTIONS.TREATMENT_SESSIONS}/${sessionId}`).set(
    { status, updatedAt: srvTs() },
    { merge: true }
  );

  if (["completed", "cancelled", "missed", "planned"].includes(status) && session.doctorId) {
    const lockRef = fsDoc(
      `${COLLECTIONS.SLOT_LOCKS}/${lockDocId(session.doctorId, session.date)}`
    );
    const snap = await fetchDoc(lockRef);
    if (snap) {
      await lockRef.set(
        { intervals: removeInterval(snap.intervals || [], sessionId), updatedAtMs: Date.now() },
        { merge: true }
      );
    }
  }

  return { ok: true, status };
}

/* -------------------------------------------------------------- patients */

export async function listPatients({ search = "" } = {}) {
  const rows = await fetchCollection(
    fsQuery(COLLECTIONS.APPOINTMENTS, {
      orders: [{ field: "createdAtMs", dir: "desc" }],
      limit: 1000,
    })
  );

  const byKey = new Map();
  for (const row of rows) {
    const key = row.patientPhone || row.patientEmail || row.patientName;
    if (!key) continue;
    const existing = byKey.get(key);
    if (existing) {
      existing.appointments += 1;
      if (row.createdAtMs && row.createdAtMs > (existing.lastMs || 0)) {
        existing.lastMs = row.createdAtMs;
        existing.lastDate = row.date;
        existing.lastStatus = row.status;
      }
      if (!existing.email && row.patientEmail) existing.email = row.patientEmail;
      continue;
    }
    byKey.set(key, {
      id: key,
      name: row.patientName || "",
      phone: row.patientPhone || "",
      email: row.patientEmail || "",
      appointments: 1,
      lastDate: row.date || "",
      lastStatus: row.status || "",
      lastMs: row.createdAtMs || 0,
    });
  }

  let patients = [...byKey.values()].sort((a, b) => b.lastMs - a.lastMs);
  if (search) {
    const needle = search.trim().toLowerCase();
    patients = patients.filter((p) =>
      [p.name, p.phone, p.email].filter(Boolean).some((v) => String(v).toLowerCase().includes(needle))
    );
  }
  return patients.slice(0, 300).map(({ lastMs, ...rest }) => rest);
}

/* ---------------------------------------------------- tableau de bord */

export async function getOverview() {
  await expireStaleRequests();

  const [pending, confirmed, today, sessions, doctors, patients] = await Promise.all([
    countAppointments(APPOINTMENT_STATUS.PENDING),
    countAppointments(APPOINTMENT_STATUS.CONFIRMED),
    listTodayAppointments(),
    listUpcomingSessions(),
    listDoctorsAdmin(),
    listPatients({}),
  ]);

  return {
    pending,
    confirmed,
    today: today.length,
    activeDoctors: doctors.filter((d) => d.active !== false).length,
    upcomingSessions: sessions.length,
    patients: patients.length,
    todayAppointments: toJsonSafe(today.slice(0, 12)),
    pendingAppointments: toJsonSafe(pending ? await recentByStatus(APPOINTMENT_STATUS.PENDING) : []),
    upcomingSessionList: toJsonSafe(sessions.slice(0, 8)),
  };
}

async function countAppointments(status) {
  const rows = await fetchCollection(
    fsQuery(COLLECTIONS.APPOINTMENTS, {
      wheres: [{ field: "status", value: status }],
      limit: 500,
    })
  );
  return rows.length;
}

async function recentByStatus(status) {
  // Égalité seule (pas d'index composite) + tri mémoire.
  const rows = await fetchCollection(
    fsQuery(COLLECTIONS.APPOINTMENTS, {
      wheres: [{ field: "status", value: status }],
      limit: 100,
    })
  );
  return rows
    .sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0))
    .slice(0, 8);
}

async function listTodayAppointments() {
  // Date calculée dans le fuseau du cabinet (jamais toISOString(), qui
  // décale d'un jour aux petites heures locales).
  const settings = (await getSettings()) || {};
  const today = nowInTimeZone(settings.timeZone || DEFAULT_TIMEZONE).date;
  const rows = await fetchCollection(
    fsQuery(COLLECTIONS.APPOINTMENTS, {
      wheres: [{ field: "date", value: today }],
    })
  );
  return rows
    .filter((row) => BLOCKING_STATUSES.includes(row.status))
    .sort((a, b) => (a.start < b.start ? -1 : 1));
}

async function listUpcomingSessions() {
  // Égalité seule côté Firestore ; plage et tri sur `date` en mémoire
  // (pas d'index composite requis).
  const settings = (await getSettings()) || {};
  const today = nowInTimeZone(settings.timeZone || DEFAULT_TIMEZONE).date;
  const rows = await fetchCollection(
    fsQuery(COLLECTIONS.TREATMENT_SESSIONS, {
      wheres: [{ field: "status", value: "scheduled" }],
      limit: 200,
    })
  );
  return rows
    .filter((row) => row.date && row.date >= today)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(0, 50);
}

/* ---------------------------------------------------- données démo */

/** Crée uniquement les documents manquants (aucune donnée écrasée). */
export async function seedDemoData() {
  const created = { services: 0, doctors: 0, settings: false };

  const existingServices = await fetchCollection(fsCollection(COLLECTIONS.SERVICES));
  if (!existingServices.length) {
    for (const service of DEMO_SERVICES) {
      const { id, ...data } = service;
      const ref = fsCollection(COLLECTIONS.SERVICES).doc(id);
      await ref.set({ ...data, createdAt: srvTs(), updatedAt: srvTs() });
      created.services += 1;
    }
  }

  const existingDoctors = await fetchCollection(fsCollection(COLLECTIONS.DOCTORS));
  if (!existingDoctors.length) {
    for (const doctor of DEMO_DOCTORS) {
      const { id, ...data } = doctor;
      const ref = fsCollection(COLLECTIONS.DOCTORS).doc(id);
      await ref.set({ ...data, createdAt: srvTs(), updatedAt: srvTs() });
      created.doctors += 1;
    }
  }

  const settingsDoc = await fetchDoc(
    fsDoc(`${COLLECTIONS.CLINIC_SETTINGS}/main`)
  );
  if (!settingsDoc) {
    const { id, ...data } = DEMO_SETTINGS;
    await fsDoc(`${COLLECTIONS.CLINIC_SETTINGS}/main`).set(
      { ...data, createdAt: srvTs(), updatedAt: srvTs() },
      { merge: true }
    );
    created.settings = true;
  }

  invalidateCache();
  return created;
}

export { isValidDateString };
