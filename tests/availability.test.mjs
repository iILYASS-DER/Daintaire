import test from "node:test";
import assert from "node:assert/strict";

import {
  computeAvailability,
  diffDays,
  generateCandidateSlots,
  isInBreak,
  isOccupied,
  isWorkingDay,
  minutesToTime,
  overlaps,
  pruneOrphanServiceIds,
  toMinutes,
  validateSlotRequest,
  weekdayOf,
  zonedTimeToUtc,
} from "../src/lib/availability.js";
import {
  isValidEmail,
  isValidPhone,
  normalizePhone,
  nowInTimeZone,
  validateAppointmentInput,
  validateContactInput,
  validateDoctorInput,
  validateServiceInput,
} from "../src/lib/validation.js";

const doctor = {
  id: "doc1",
  active: true,
  workingDays: [0, 1, 2, 3, 4, 6], // fermé le vendredi (5)
  workingHours: { start: "09:00", end: "17:00" },
  breaks: [{ start: "13:00", end: "14:00" }],
  unavailableDates: ["2026-10-20"],
  serviceIds: ["svc1"],
};

const settings = {
  timeZone: "Africa/Casablanca",
  booking: {
    slotStepMinutes: 30,
    minNoticeMinutes: 0,
    maxAdvanceDays: 90,
    pendingHoldHours: 48,
  },
};

const service = { id: "svc1", durationMinutes: 30 };

test("weekdayOf renvoie le bon jour de semaine", () => {
  assert.equal(weekdayOf("2026-10-19"), 1); // lundi
  assert.equal(weekdayOf("2026-10-16"), 5); // vendredi
  assert.equal(weekdayOf("not-a-date"), null);
});

test("génération des créneaux : heures ouvrées, pauses exclues", () => {
  const slots = generateCandidateSlots({
    date: "2026-10-19", // lundi, jour travaillé
    doctor,
    durationMinutes: 30,
    stepMinutes: 30,
  });
  assert.equal(slots.length, 14); // 09:00-12:30 (8) + 14:00-16:30 (6)
  assert.equal(slots[0].time, "09:00");
  assert.equal(slots.at(-1).time, "16:30");
  assert.ok(!slots.some((s) => s.time === "13:00"));
  assert.ok(!slots.some((s) => s.time === "12:30" && s.end > toMinutes("13:00")));
});

test("les créneaux d'un jour non travaillé ou bloqué sont vides", () => {
  assert.deepEqual(
    generateCandidateSlots({ date: "2026-10-16", doctor, durationMinutes: 30 }),
    []
  );
  assert.deepEqual(
    generateCandidateSlots({ date: "2026-10-20", doctor, durationMinutes: 30 }),
    []
  );
  assert.deepEqual(generateCandidateSlots({ date: "bad", doctor }), []);
});

test("un soin plus long filtre les créneaux qui dépassent", () => {
  const longSlots = generateCandidateSlots({
    date: "2026-10-19",
    doctor,
    durationMinutes: 90,
    stepMinutes: 30,
  });
  // dernier départ possible : 15:30 (fin 17:00), pause 13:00-14:00 exclue
  assert.equal(longSlots.at(-1).time, "15:30");
  assert.ok(longSlots.every((s) => s.end <= toMinutes("17:00")));
  assert.ok(
    !longSlots.some((s) => overlaps(s.start, s.end, toMinutes("13:00"), toMinutes("14:00")))
  );
});

test("overlap / isInBreak / minutesToTime", () => {
  assert.ok(overlaps(60, 90, 80, 120));
  assert.ok(!overlaps(60, 90, 90, 120));
  assert.ok(isInBreak(doctor, toMinutes("12:45"), toMinutes("13:15")));
  assert.equal(minutesToTime(540), "09:00");
  assert.equal(minutesToTime(1439), "23:59");
  assert.equal(toMinutes("09:30"), 570);
  assert.equal(toMinutes("bad"), null);
});

test("isWorkingDay respecte les jours du praticien", () => {
  assert.ok(isWorkingDay(doctor, "2026-10-19")); // lundi
  assert.ok(!isWorkingDay(doctor, "2026-10-16")); // vendredi
  assert.ok(!isWorkingDay({ ...doctor, workingDays: [] }, "2026-10-19"));
});

test("isOccupied détecte un chevauchement pour le même praticien", () => {
  const occupied = [
    { doctorId: "doc1", date: "2026-10-19", start: "09:00", end: "09:30" },
    { doctorId: "doc2", date: "2026-10-19", start: "10:00", end: "10:30" },
  ];
  assert.ok(isOccupied(occupied, "doc1", "2026-10-19", 540, 570));
  assert.ok(!isOccupied(occupied, "doc1", "2026-10-19", 570, 600));
  assert.ok(!isOccupied(occupied, "doc3", "2026-10-19", 540, 570));
  assert.ok(!isOccupied(occupied, "doc1", "2026-10-13", 540, 570));
  // doctorId null = tous les praticiens (blocage global)
  const global = [{ doctorId: null, date: "2026-10-19", start: "11:00", end: "12:00" }];
  assert.ok(isOccupied(global, "doc1", "2026-10-19", 660, 690));
  assert.ok(!isOccupied(global, "doc1", "2026-10-19", 600, 630));
});

test("computeAvailability exclut les créneaux déjà occupés", () => {
  const result = computeAvailability({
    date: "2026-10-19",
    doctors: [doctor],
    service,
    settings,
    occupied: [{ doctorId: "doc1", date: "2026-10-19", start: "09:00", end: "09:30" }],
    blocked: [{ doctorId: "doc1", date: "2026-10-19", start: "11:00", end: "12:00" }],
    doctorId: "doc1",
  });
  assert.equal(result.perDoctor.doc1.length, 11); // 14 - 1 occupé - 2 bloqués (11:00, 11:30)
  assert.ok(!result.perDoctor.doc1.includes("09:00"));
  assert.ok(!result.perDoctor.doc1.includes("11:00"));
  assert.ok(result.perDoctor.doc1.includes("10:00"));
  assert.equal(result.slots.length, 11);
});

test("computeAvailability « n'importe quel praticien » fusionne les disponibilités", () => {
  const doctor2 = {
    ...doctor,
    id: "doc2",
    workingHours: { start: "10:00", end: "13:00" },
    breaks: [],
  };
  const result = computeAvailability({
    date: "2026-10-19",
    doctors: [doctor, doctor2],
    service,
    settings,
    occupied: [{ doctorId: "doc1", date: "2026-10-19", start: "10:00", end: "10:30" }],
    doctorId: "",
  });
  assert.ok(result.perDoctor.doc1.includes("10:00") === false);
  assert.ok(result.perDoctor.doc2.includes("10:00") === true);
  const at10 = result.slots.find((s) => s.time === "10:00");
  assert.deepEqual(at10.doctors, ["doc2"]);
  const at11 = result.slots.find((s) => s.time === "11:00");
  assert.deepEqual([...at11.doctors].sort(), ["doc1", "doc2"]);
});

test("validateSlotRequest rejette les créneaux invalides", () => {
  const base = { service, settings, occupied: [], blocked: [] };

  assert.deepEqual(
    validateSlotRequest({ ...base, date: "2026-10-19", time: "09:00", doctor }),
    []
  );

  // déjà occupé
  assert.deepEqual(
    validateSlotRequest({
      ...base,
      date: "2026-10-19",
      time: "09:00",
      doctor,
      occupied: [{ doctorId: "doc1", date: "2026-10-19", start: "09:00", end: "09:30" }],
    }),
    ["form.error.slotUnavailable"]
  );

  // pendant la pause
  assert.deepEqual(
    validateSlotRequest({ ...base, date: "2026-10-19", time: "13:00", doctor }),
    ["form.error.slotUnavailable"]
  );

  // hors des heures ouvrées
  assert.deepEqual(
    validateSlotRequest({ ...base, date: "2026-10-19", time: "08:00", doctor }),
    ["form.error.slotUnavailable"]
  );

  // hors pas de 30 minutes
  assert.deepEqual(
    validateSlotRequest({ ...base, date: "2026-10-19", time: "09:15", doctor }),
    ["form.error.slotUnavailable"]
  );

  // jour non travaillé
  assert.deepEqual(
    validateSlotRequest({ ...base, date: "2026-10-16", time: "09:00", doctor }),
    ["form.error.slotUnavailable"]
  );

  // date invalide / passée
  assert.deepEqual(
    validateSlotRequest({ ...base, date: "2026-99-99", time: "09:00", doctor }),
    ["form.error.dateInvalid"]
  );
  assert.deepEqual(
    validateSlotRequest({ ...base, date: "2020-01-01", time: "09:00", doctor }),
    ["form.error.datePast"]
  );
});

test("validateSlotRequest respecte le délai de réservation minimal", () => {
  const now = nowInTimeZone("Africa/Casablanca");
  const result = validateSlotRequest({
    ...{ service, settings, occupied: [], blocked: [] },
    date: now.date,
    time: "01:00",
    doctor: { ...doctor, workingHours: { start: "00:00", end: "23:59" }, workingDays: [0, 1, 2, 3, 4, 5, 6], breaks: [] },
    settings: { ...settings, booking: { ...settings.booking, minNoticeMinutes: 120 } },
  });
  assert.deepEqual(result, ["form.error.slotUnavailable"]);
});

test("diffDays et zonedTimeToUtc", () => {
  assert.equal(diffDays("2026-10-12", "2026-10-14"), 2);
  assert.equal(diffDays("2026-10-14", "2026-10-12"), -2);
  const utc = zonedTimeToUtc("2026-10-19", "09:00", "Africa/Casablanca");
  assert.equal(utc.toISOString(), "2026-10-19T08:00:00.000Z"); // UTC+1
});

test("validation des coordonnées", () => {
  assert.ok(isValidPhone("0612345678"));
  assert.ok(isValidPhone("+212659349160"));
  assert.ok(isValidPhone("212659349160"));
  assert.ok(!isValidPhone("12345"));
  assert.ok(!isValidPhone("abc"));
  assert.equal(normalizePhone("06 12 34 56 78"), "+212612345678");
  assert.equal(normalizePhone("+212 659 349 160"), "+212659349160");
  assert.ok(isValidEmail("ilyassdr60@gmail.com"));
  assert.ok(!isValidEmail("pas-un-email"));
});

test("validateAppointmentInput détecte les erreurs (clés i18n)", () => {
  const good = {
    fullName: "Patient Test",
    phone: "0612345678",
    email: "patient@example.com",
    date: "2026-11-01",
    time: "09:30",
    serviceId: "svc1",
    note: "Note courte",
  };
  const ok = validateAppointmentInput(good, { maxAdvanceDays: 90 });
  assert.equal(ok.valid, true, JSON.stringify(ok.errors));
  assert.equal(ok.clean.name, "Patient Test");

  const empty = validateAppointmentInput({}, {});
  assert.equal(empty.valid, false);
  assert.equal(empty.errors.fullName, "form.error.nameRequired");
  assert.equal(empty.errors.phone, "form.error.phoneInvalid");
  assert.equal(empty.errors.serviceId, "form.error.serviceRequired");
  assert.equal(empty.errors.date, "form.error.dateRequired");
  assert.equal(empty.errors.time, "form.error.slotRequired");

  const tooFar = validateAppointmentInput({ ...good, date: "2027-12-01" }, { maxAdvanceDays: 90 });
  assert.equal(tooFar.errors.date, "form.error.dateTooFar");

  const badEmail = validateAppointmentInput({ ...good, email: "x@y" }, {});
  assert.equal(badEmail.errors.email, "form.error.emailInvalid");

  const longNote = validateAppointmentInput({ ...good, note: "a".repeat(500) }, {});
  assert.equal(longNote.errors.note, "form.error.noteTooLong");
});

test("validateContactInput", () => {
  const res = validateContactInput({ fullName: "A", email: "bad", message: "ok" });
  assert.equal(res.valid, false);
  assert.equal(res.errors.fullName, "form.error.nameRequired");
  assert.equal(res.errors.email, "form.error.emailInvalid");
  assert.equal(res.errors.message, "form.error.messageTooShort");
});

test("validateServiceInput / validateDoctorInput", () => {
  const svc = validateServiceInput({
    nameFr: "Détartrage",
    nameAr: "إزالة الجير",
    durationMinutes: 45,
    price: "",
    order: 2,
    active: true,
  });
  assert.equal(svc.valid, true, JSON.stringify(svc.errors));
  assert.equal(svc.clean.price, null);

  const badSvc = validateServiceInput({ durationMinutes: 2 });
  assert.equal(badSvc.errors.nameFr, "admin.services.nameRequired");
  assert.equal(badSvc.errors.durationMinutes, "admin.services.durationInvalid");

  const doc = validateDoctorInput({
    displayName: "Dr Test",
    workingDays: [1, 2, 3],
    workingHours: { start: "09:00", end: "17:00" },
    breaks: [{ start: "13:00", end: "14:00" }, { start: "bad", end: "x" }],
    unavailableDates: ["2026-01-01", "nope"],
    serviceIds: ["svc1"],
    active: true,
  });
  assert.equal(doc.valid, true, JSON.stringify(doc.errors));
  assert.equal(doc.clean.breaks.length, 1);
  assert.equal(doc.clean.unavailableDates.length, 1);

  const badDoc = validateDoctorInput({ workingHours: { start: "17:00", end: "09:00" } });
  assert.equal(badDoc.errors.displayName, "admin.doctors.nameRequired");
  assert.equal(badDoc.errors.workingHours, "admin.doctors.hoursInvalid");
});

test("pruneOrphanServiceIds retire les soins supprimés sans exclure le praticien", () => {
  const services = [{ id: "real-1" }, { id: "real-2" }];
  const doctors = [
    { id: "d1", serviceIds: ["real-1", "ghost"] },
    { id: "d2", serviceIds: ["ghost"] },
    { id: "d3", serviceIds: [] },
    { id: "d4" },
  ];
  const pruned = pruneOrphanServiceIds(doctors, services);

  assert.deepEqual(pruned[0].serviceIds, ["real-1"]);
  assert.deepEqual(pruned[1].serviceIds, []);
  // Aucun changement → même objet, aucune mutation des entrées.
  assert.equal(pruned[2], doctors[2]);
  assert.equal(pruned[3], doctors[3]);
  assert.deepEqual(doctors[0].serviceIds, ["real-1", "ghost"]);

  // « Tous les soins » (aucune affectation valide) : le praticien d2 revient
  // dans la sélection pour les autres soins — il n'est plus exclu partout.
  const filtered = pruned.filter((d) =>
    Array.isArray(d.serviceIds) && d.serviceIds.length
      ? d.serviceIds.includes("real-2")
      : true
  );
  assert.deepEqual(filtered.map((d) => d.id), ["d2", "d3", "d4"]);
});
