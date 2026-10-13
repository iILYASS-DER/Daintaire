/**
 * Logique de planification — pure et sans dépendance Firestore, afin d'être
 * testable (voir tests/availability.test.mjs) et réutilisable côté client
 * (affichage) comme côté serveur (validation autoritaire).
 *
 * Convention : la date (AAAA-MM-JJ) et l'heure (HH:MM) sont exprimées dans
 * le fuseau du cabinet (Africa/Casablanca par défaut). Ce sont ces valeurs
 * « horloge murale » qui font foi pour les conflits ; les timestamps servent
 * uniquement au tri et aux requêtes.
 */

import { DEFAULT_TIMEZONE } from "@/lib/constants";
import {
  diffDays,
  isValidDateString,
  isValidTimeString,
  nowInTimeZone,
  toMinutes,
} from "@/lib/validation";

export { diffDays, toMinutes };

export function minutesToTime(total) {
  const m = ((total % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

/** Jour de semaine JS (0 = dimanche) d'une date AAAA-MM-JJ. */
export function weekdayOf(dateStr) {
  if (!isValidDateString(dateStr)) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).getUTCDay();
}

export function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Nettoie les listes de praticiens : les identifiants de soins orphelins
 * (un soin supprimé de la base) sont retirés des praticiens, sans quoi un
 * seul soin supprimé exclurait le praticien de TOUS les autres soins.
 * Un praticien dont toutes les affectations sont orphelines retrouve la
 * signification « accueille tous les soins » (tableau vide).
 *
 * @param {Array} doctors praticiens bruts (Firestore / démo)
 * @param {Array} services soins actuellement connus
 * @returns {Array} praticiens avec serviceIds filtrés (nouveaux objets)
 */
export function pruneOrphanServiceIds(doctors, services) {
  const knownIds = new Set(
    (Array.isArray(services) ? services : []).map((s) => s?.id).filter(Boolean)
  );
  return (Array.isArray(doctors) ? doctors : []).map((doctor) => {
    if (!doctor || !Array.isArray(doctor.serviceIds) || !doctor.serviceIds.length) {
      return doctor;
    }
    const pruned = doctor.serviceIds.filter((id) => knownIds.has(id));
    if (pruned.length === doctor.serviceIds.length) return doctor;
    return { ...doctor, serviceIds: pruned };
  });
}

/** Instant UTC correspondant à une horloge murale dans un fuseau. */
export function zonedTimeToUtc(dateStr, timeStr, timeZone = DEFAULT_TIMEZONE) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  const naive = Date.UTC(y, m - 1, d, hh, mm, 0);
  let guess = naive - tzOffsetMs(new Date(naive), timeZone);
  guess = naive - tzOffsetMs(new Date(guess), timeZone);
  return new Date(guess);
}

function tzOffsetMs(utcDate, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(utcDate);
  const get = (type) => Number(parts.find((p) => p.type === type)?.value || 0);
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") % 24,
    get("minute"),
    get("second")
  );
  return asUtc - utcDate.getTime();
}

/** Vrai si le praticien travaille ce jour-là. */
export function isWorkingDay(doctor, dateStr) {
  const day = weekdayOf(dateStr);
  if (day === null) return false;
  const days = Array.isArray(doctor?.workingDays) ? doctor.workingDays : [];
  return days.map(Number).includes(day);
}

export function isUnavailableDate(doctor, dateStr) {
  const list = Array.isArray(doctor?.unavailableDates) ? doctor.unavailableDates : [];
  return list.includes(dateStr);
}

/** Vrai si [start,end] (minutes) tombe dans une pause du praticien. */
export function isInBreak(doctor, startMin, endMin) {
  const breaks = Array.isArray(doctor?.breaks) ? doctor.breaks : [];
  return breaks.some((b) => {
    const s = toMinutes(b?.start);
    const e = toMinutes(b?.end);
    if (s === null || e === null) return false;
    return overlaps(startMin, endMin, s, e);
  });
}

export function isInBlockedRange(blocked, doctorId, date, startMin, endMin) {
  if (!Array.isArray(blocked)) return false;
  return blocked.some((b) => {
    if (!b || b.date !== date) return false;
    if (b.doctorId && b.doctorId !== doctorId) return false;
    const s = toMinutes(b.start);
    const e = toMinutes(b.end);
    if (s === null || e === null) return false;
    return overlaps(startMin, endMin, s, e);
  });
}

/** Vrai si le créneau est déjà pris (rendez-vous, demande ou séance). */
export function isOccupied(occupied, doctorId, date, startMin, endMin) {
  if (!Array.isArray(occupied)) return false;
  return occupied.some((o) => {
    if (!o || o.date !== date) return false;
    if (o.doctorId && o.doctorId !== doctorId) return false;
    const s = toMinutes(o.start);
    const e = toMinutes(o.end);
    if (s === null || e === null) return false;
    return overlaps(startMin, endMin, s, e);
  });
}

/**
 * Génère les créneaux théoriques d'un praticien pour une date.
 * @returns {Array<{time:string,endTime:string,start:number,end:number}>}
 */
export function generateCandidateSlots({
  date,
  doctor,
  durationMinutes = 30,
  stepMinutes = 30,
}) {
  if (!isValidDateString(date) || !doctor) return [];
  if (doctor.active === false) return [];
  if (!isWorkingDay(doctor, date)) return [];
  if (isUnavailableDate(doctor, date)) return [];

  const dayStart = toMinutes(doctor?.workingHours?.start);
  const dayEnd = toMinutes(doctor?.workingHours?.end);
  if (dayStart === null || dayEnd === null || dayEnd <= dayStart) return [];

  const step = Math.max(5, Number(stepMinutes) || 30);
  const duration = Math.max(5, Number(durationMinutes) || 30);
  const slots = [];

  for (let start = dayStart; start + duration <= dayEnd; start += step) {
    const end = start + duration;
    if (isInBreak(doctor, start, end)) continue;
    slots.push({
      time: minutesToTime(start),
      endTime: minutesToTime(end),
      start,
      end,
    });
  }
  return slots;
}

/**
 * Calcule la disponibilité complète pour une date.
 *
 * @param {object} params
 * @param {string} params.date              AAAA-MM-JJ (fuseau du cabinet)
 * @param {Array}  params.doctors           praticiens candidats (actifs)
 * @param {object} params.service           soin choisi (durationMinutes)
 * @param {object} params.settings          paramètres du cabinet
 * @param {Array}  params.occupied          créneaux déjà occupés (RDV / verrous / séances)
 * @param {Array}  params.blocked           créneaux bloqués (congés, panne…)
 * @param {string} [params.doctorId]        praticien imposé, ou "any"/vide
 * @returns {{slots:Array, perDoctor:Object}}
 */
export function computeAvailability({
  date,
  doctors,
  service,
  settings,
  occupied = [],
  blocked = [],
  doctorId = "",
}) {
  const booking = settings?.booking || {};
  const step = Number(booking.slotStepMinutes) || 30;
  const minNotice = Number(booking.minNoticeMinutes) || 0;
  const maxAdvance = Number(booking.maxAdvanceDays) || 90;
  const duration = Number(service?.durationMinutes) || 30;
  const timeZone = settings?.timeZone || DEFAULT_TIMEZONE;

  const requested = doctorId && doctorId !== "any" ? doctorId : null;
  const candidates = (Array.isArray(doctors) ? doctors : [])
    .filter((d) => d && d.active !== false)
    .filter((d) => (requested ? d.id === requested : true))
    .filter((d) =>
      Array.isArray(d.serviceIds) && d.serviceIds.length
        ? d.serviceIds.includes(service?.id)
        : true
    );

  const now = nowInTimeZone(timeZone);
  const dateValid = isValidDateString(date);
  const dateTooSoon = dateValid && date < now.date;
  const dateTooFar = dateValid && maxAdvance > 0 && diffDays(now.date, date) > maxAdvance;

  const perDoctor = {};
  const slotMap = new Map();

  if (dateValid && !dateTooSoon && !dateTooFar) {
    for (const doctor of candidates) {
      const slots = generateCandidateSlots({
        date,
        doctor,
        durationMinutes: duration,
        stepMinutes: step,
      });
      const availableTimes = [];

      for (const slot of slots) {
        if (isOccupied(occupied, doctor.id, date, slot.start, slot.end)) continue;
        if (isInBlockedRange(blocked, doctor.id, date, slot.start, slot.end)) continue;
        if (date === now.date && slot.start < now.minutes + minNotice) continue;

        availableTimes.push(slot.time);
        const existing = slotMap.get(slot.time) || {
          time: slot.time,
          endTime: minutesToTime(slot.start + duration),
          doctors: [],
        };
        existing.doctors.push(doctor.id);
        slotMap.set(slot.time, existing);
      }

      perDoctor[doctor.id] = availableTimes;
    }
  }

  const slots = [...slotMap.values()].sort((a, b) => (a.time < b.time ? -1 : 1));

  return {
    date,
    validDate: dateValid,
    dateTooSoon,
    dateTooFar,
    durationMinutes: duration,
    slotStepMinutes: step,
    timeZone,
    perDoctor,
    slots: requested
      ? slots.map((s) => ({ ...s, available: s.doctors.includes(requested) }))
      : slots.map((s) => ({ ...s, available: true })),
  };
}

/** Vérifie qu'un créneau précis est réservable (validation serveur). */
export function validateSlotRequest({
  date,
  time,
  doctor,
  service,
  settings,
  occupied = [],
  blocked = [],
}) {
  const errors = [];
  if (!isValidDateString(date)) return ["form.error.dateInvalid"];
  if (!isValidTimeString(time)) return ["form.error.slotRequired"];

  const booking = settings?.booking || {};
  const duration = Number(service?.durationMinutes) || 30;
  const step = Number(booking.slotStepMinutes) || 30;
  const minNotice = Number(booking.minNoticeMinutes) || 0;
  const maxAdvance = Number(booking.maxAdvanceDays) || 90;
  const timeZone = settings?.timeZone || DEFAULT_TIMEZONE;
  const now = nowInTimeZone(timeZone);

  if (date < now.date) return ["form.error.datePast"];
  if (maxAdvance > 0 && diffDays(now.date, date) > maxAdvance)
    return ["form.error.dateTooFar"];

  if (!doctor || doctor.active === false) return ["form.error.doctorRequired"];
  if (!isWorkingDay(doctor, date)) return ["form.error.slotUnavailable"];
  if (isUnavailableDate(doctor, date)) return ["form.error.slotUnavailable"];

  const start = toMinutes(time);
  const end = start + duration;
  const dayStart = toMinutes(doctor.workingHours?.start);
  const dayEnd = toMinutes(doctor.workingHours?.end);

  if (start === null || dayStart === null || dayEnd === null)
    return ["form.error.slotUnavailable"];
  if (start < dayStart || end > dayEnd) return ["form.error.slotUnavailable"];
  if ((start - dayStart) % step !== 0) return ["form.error.slotUnavailable"];
  if (isInBreak(doctor, start, end)) return ["form.error.slotUnavailable"];
  if (date === now.date && start < now.minutes + minNotice)
    return ["form.error.slotUnavailable"];
  if (isInBlockedRange(blocked, doctor.id, date, start, end))
    return ["form.error.slotUnavailable"];
  if (isOccupied(occupied, doctor.id, date, start, end))
    return ["form.error.slotUnavailable"];

  return errors;
}
