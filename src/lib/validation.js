/**
 * Validation des données — utilisée à la fois côté client (messages
 * d'erreur immédiats) et côté serveur (jamais de confiance au client).
 * Toutes les erreurs sont des clés de traduction du dictionnaire i18n.
 */

import {
  DEFAULT_MAX_ADVANCE_DAYS,
  DEFAULT_TIMEZONE,
} from "@/lib/constants";

/* ----------------------------------------------------------- utilitaires */

export function sanitizeText(value, maxLength = 500) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function sanitizeMultiline(value, maxLength = 2000) {
  if (typeof value !== "string") return "";
  return value
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim()
    .slice(0, maxLength);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export function isValidEmail(value) {
  if (typeof value !== "string") return false;
  const v = value.trim();
  return v.length <= 160 && EMAIL_RE.test(v);
}

/** Normalise un numéro marocain/international en format +212… */
export function normalizePhone(value) {
  if (typeof value !== "string") return "";
  let digits = value.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("212")) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 10) return `+212${digits.slice(1)}`;
  return `+${digits}`;
}

export function isValidPhone(value) {
  if (typeof value !== "string") return false;
  const digits = value.replace(/[^\d]/g, "");
  // Maroc : 06/07 XXX XX XX (10 chiffres) ou +212 6/7 XXX XXXX (12)
  if (/^0[5-7]\d{8}$/.test(digits)) return true;
  if (/^212[5-7]\d{8}$/.test(digits)) return true;
  // Autres pays : format international plausible
  if (/^\d{7,15}$/.test(digits) && !digits.startsWith("00")) return true;
  return false;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateString(value) {
  if (typeof value !== "string" || !DATE_RE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

export function isValidTimeString(value) {
  if (typeof value !== "string") return false;
  const m = /^(\d{2}):(\d{2})$/.exec(value);
  if (!m) return false;
  const h = Number(m[1]);
  const min = Number(m[2]);
  return h >= 0 && h <= 23 && min >= 0 && min <= 59;
}

/** Date et heure courantes dans un fuseau (horloge murale). */
export function nowInTimeZone(timeZone = DEFAULT_TIMEZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type)?.value || "00";
  const hour = get("hour") === "24" ? "00" : get("hour");
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${hour}:${get("minute")}`,
    minutes: Number(hour) * 60 + Number(get("minute")),
  };
}

export function compareDates(a, b) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

/** Nombre de jours entre deux dates AAAA-MM-JJ (b - a). */
export function diffDays(fromDate, toDate) {
  const [fy, fm, fd] = fromDate.split("-").map(Number);
  const [ty, tm, td] = toDate.split("-").map(Number);
  const a = Date.UTC(fy, fm - 1, fd);
  const b = Date.UTC(ty, tm - 1, td);
  return Math.round((b - a) / 86400000);
}

/* --------------------------------------------------- validation rendez-vous */

/**
 * @param {object} input
 * @param {object} options { maxAdvanceDays, requireEmail }
 * @returns {{valid:boolean, errors:Record<string,string>, clean:object}}
 */
export function validateAppointmentInput(input = {}, options = {}) {
  const maxAdvanceDays = options.maxAdvanceDays ?? DEFAULT_MAX_ADVANCE_DAYS;
  const errors = {};

  const rawName = typeof input.fullName === "string" ? input.fullName : "";
  const rawNote = typeof input.note === "string" ? input.note : "";
  const name = sanitizeText(rawName, 80);
  const phoneRaw = typeof input.phone === "string" ? input.phone.trim() : "";
  const email = sanitizeText((input.email || "").toLowerCase(), 160);
  const note = sanitizeMultiline(rawNote, 400);
  const date = typeof input.date === "string" ? input.date.trim() : "";
  const time = typeof input.time === "string" ? input.time.trim() : "";
  const serviceId = sanitizeText(input.serviceId, 60);
  const doctorId = sanitizeText(input.doctorId, 60); // "" = premier disponible

  if (name.length < 2) errors.fullName = "form.error.nameRequired";
  if (rawName.trim().length > 80) errors.fullName = "form.error.nameTooLong";

  if (!phoneRaw) errors.phone = "form.error.phoneInvalid";
  else if (!isValidPhone(phoneRaw)) errors.phone = "form.error.phoneInvalid";

  if (email && !isValidEmail(email)) errors.email = "form.error.emailInvalid";
  if (options.requireEmail && !email) errors.email = "form.error.emailRequired";

  if (rawNote.length > 400) errors.note = "form.error.noteTooLong";

  if (!serviceId) errors.serviceId = "form.error.serviceRequired";

  if (!isValidDateString(date)) {
    errors.date = input.date ? "form.error.dateInvalid" : "form.error.dateRequired";
  } else {
    const now = nowInTimeZone(options.timeZone || DEFAULT_TIMEZONE);
    if (compareDates(date, now.date) < 0) errors.date = "form.error.datePast";
    else if (diffDays(now.date, date) > maxAdvanceDays)
      errors.date = "form.error.dateTooFar";
  }

  if (!isValidTimeString(time)) errors.time = "form.error.slotRequired";

  if (input.doctorId !== undefined && doctorId && doctorId !== "any") {
    if (!/^[a-zA-Z0-9_-]{1,60}$/.test(doctorId)) {
      errors.doctorId = "form.error.doctorRequired";
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    clean: { name, phoneRaw, email, note, date, time, serviceId, doctorId },
  };
}

/* ------------------------------------------------------ validation contact */

export function validateContactInput(input = {}) {
  const errors = {};
  const rawName = typeof input.fullName === "string" ? input.fullName : "";
  const rawMessage = typeof input.message === "string" ? input.message : "";
  const name = sanitizeText(rawName, 80);
  const email = sanitizeText((input.email || "").toLowerCase(), 160);
  const subject = sanitizeText(input.subject, 80);
  const message = sanitizeMultiline(rawMessage, 1500);

  if (name.length < 2) errors.fullName = "form.error.nameRequired";
  if (rawName.trim().length > 80) errors.fullName = "form.error.nameTooLong";
  if (!email) errors.email = "form.error.emailRequired";
  else if (!isValidEmail(email)) errors.email = "form.error.emailInvalid";
  if (message.length < 10) errors.message = "form.error.messageTooShort";
  if (rawMessage.trim().length > 1500) errors.message = "form.error.messageTooLong";

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    clean: { name, email, subject, message },
  };
}

/* ------------------------------------------------------- validation soins */

export function validateServiceInput(input = {}) {
  const errors = {};
  const nameFr = sanitizeText(input.nameFr, 80);
  const nameAr = sanitizeText(input.nameAr, 80);
  const descFr = sanitizeMultiline(input.descFr, 400);
  const descAr = sanitizeMultiline(input.descAr, 400);
  const duration = Number(input.durationMinutes);
  const price =
    input.price === "" || input.price === null || input.price === undefined
      ? null
      : Number(input.price);
  const order = Number.isFinite(Number(input.order)) ? Number(input.order) : 0;
  const image = sanitizeText(input.image, 200);

  if (!nameFr || !nameAr) errors.nameFr = "admin.services.nameRequired";
  if (!Number.isFinite(duration) || duration < 5 || duration > 480)
    errors.durationMinutes = "admin.services.durationInvalid";
  if (price !== null && (!Number.isFinite(price) || price < 0))
    errors.price = "admin.services.durationInvalid";
  if (image && !/^(\/images\/|https?:\/\/)/.test(image))
    errors.image = "admin.services.image";

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    clean: {
      nameFr,
      nameAr,
      descFr,
      descAr,
      durationMinutes: duration,
      price,
      order,
      image,
      active: input.active !== false,
    },
  };
}

/* ---------------------------------------------------- validation praticiens */

const BREAK_RE = /^\d{2}:\d{2}$/;

export function validateDoctorInput(input = {}) {
  const errors = {};
  const displayName = sanitizeText(input.displayName, 80);
  const bioFr = sanitizeMultiline(input.bioFr, 600);
  const bioAr = sanitizeMultiline(input.bioAr, 600);
  const photoUrl = sanitizeText(input.photoUrl, 300);

  if (displayName.length < 2) errors.displayName = "admin.doctors.nameRequired";

  const workingDays = Array.isArray(input.workingDays)
    ? input.workingDays.map(Number).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
    : [];

  const start = input.workingHours?.start;
  const end = input.workingHours?.end;
  const hoursValid =
    BREAK_RE.test(String(start)) &&
    BREAK_RE.test(String(end)) &&
    toMinutes(end) > toMinutes(start);
  if (!hoursValid) errors.workingHours = "admin.doctors.hoursInvalid";

  const breaks = Array.isArray(input.breaks)
    ? input.breaks.filter(
        (b) => BREAK_RE.test(String(b?.start)) && BREAK_RE.test(String(b?.end))
      )
    : [];

  const unavailableDates = Array.isArray(input.unavailableDates)
    ? input.unavailableDates.filter(isValidDateString)
    : [];

  if (photoUrl && !/^(\/images\/|https?:\/\/)/.test(photoUrl))
    errors.photoUrl = "admin.doctors.photoUrlInvalid";

  const serviceIds = Array.isArray(input.serviceIds)
    ? input.serviceIds.map((s) => sanitizeText(s, 60)).filter(Boolean)
    : [];

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    clean: {
      displayName,
      bioFr,
      bioAr,
      photoUrl,
      serviceIds,
      workingDays: [...new Set(workingDays)].sort(),
      workingHours: { start, end },
      breaks,
      unavailableDates,
      timeZone: sanitizeText(input.timeZone, 60) || DEFAULT_TIMEZONE,
      active: input.active !== false,
      order: Number.isFinite(Number(input.order)) ? Number(input.order) : 0,
    },
  };
}

export function toMinutes(time) {
  if (!BREAK_RE.test(String(time))) return null;
  const [h, m] = String(time).split(":").map(Number);
  return h * 60 + m;
}

/* ------------------------------------------------ validation paramètres */

export function validateSettingsInput(input = {}) {
  const errors = {};
  const clinicName = sanitizeText(input.clinicName, 120);
  const phone = sanitizeText(input.phone, 40);
  const email = sanitizeText(input.email, 160);
  const address = sanitizeText(input.address, 200);
  const addressAr = sanitizeText(input.addressAr, 200);
  const mapQuery = sanitizeText(input.mapQuery, 200);
  const timeZone = sanitizeText(input.timeZone, 60) || DEFAULT_TIMEZONE;

  if (clinicName.length < 2) errors.clinicName = "admin.settings.nameRequired";
  if (email && !isValidEmail(email)) errors.email = "form.error.emailInvalid";

  const booking = {
    pendingHoldHours: clampNumber(input.booking?.pendingHoldHours, 1, 720, 48),
    maxAdvanceDays: clampNumber(input.booking?.maxAdvanceDays, 1, 365, 90),
    slotStepMinutes: clampNumber(input.booking?.slotStepMinutes, 5, 240, 30),
    minNoticeMinutes: clampNumber(input.booking?.minNoticeMinutes, 0, 1440, 60),
  };

  const openingHours = {};
  for (let day = 0; day < 7; day += 1) {
    const raw = input.openingHours?.[day];
    if (!raw || (!raw.open && !raw.close)) {
      openingHours[day] = null;
      continue;
    }
    if (!isValidTimeString(raw.open) || !isValidTimeString(raw.close)) {
      openingHours[day] = null;
      continue;
    }
    openingHours[day] = { open: raw.open, close: raw.close };
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    clean: {
      clinicName,
      phone,
      email,
      address,
      addressAr,
      mapQuery,
      timeZone,
      defaultLanguage: input.defaultLanguage === "ar" ? "ar" : "fr",
      openingHours,
      booking,
      isDemo: false,
    },
  };
}

export function clampNumber(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

/* ------------------------------------------- validation plans de traitement */

export function validatePlanInput(input = {}) {
  const errors = {};
  const title = sanitizeText(input.title, 120);
  const patientName = sanitizeText(input.patientName, 80);
  const patientPhone = sanitizeText(input.patientPhone, 40);
  const patientEmail = sanitizeText((input.patientEmail || "").toLowerCase(), 160);
  const internalNote = sanitizeMultiline(input.internalNote, 1200);

  if (title.length < 3) errors.title = "admin.treatments.planTitleRequired";
  if (patientName.length < 2) errors.patientName = "admin.treatments.patientRequired";
  if (!patientPhone || !isValidPhone(patientPhone))
    errors.patientPhone = "admin.treatments.patientRequired";
  if (patientEmail && !isValidEmail(patientEmail))
    errors.patientEmail = "form.error.emailInvalid";

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    clean: { title, patientName, patientPhone, patientEmail, internalNote },
  };
}

export function validateSessionInput(input = {}, options = {}) {
  const errors = {};
  const date = typeof input.date === "string" ? input.date.trim() : "";
  const time = typeof input.time === "string" ? input.time.trim() : "";
  const serviceId = sanitizeText(input.serviceId, 60);
  const number = Number(input.number);

  if (!Number.isInteger(number) || number < 1)
    errors.number = "admin.treatments.sessionDateRequired";
  if (!isValidDateString(date)) errors.date = "admin.treatments.sessionDateRequired";
  else if (options.checkFuture) {
    const now = nowInTimeZone(options.timeZone || DEFAULT_TIMEZONE);
    if (compareDates(date, now.date) < 0) errors.date = "form.error.datePast";
  }
  if (!isValidTimeString(time)) errors.time = "form.error.slotRequired";

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    clean: {
      number,
      date,
      time,
      serviceId,
      doctorId: sanitizeText(input.doctorId, 60),
      status: input.status || "planned",
      note: sanitizeMultiline(input.note, 600),
    },
  };
}
