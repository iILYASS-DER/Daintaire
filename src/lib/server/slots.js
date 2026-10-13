/**
 * Gestion des verrous de créneaux (« slotLocks »).
 *
 * Un document par praticien et par jour contient les intervalles occupés.
 * Le verrouillage atomique se fait en lisant/écrivant CE document unique
 * dans une transaction : deux demandes simultanées sur le même créneau ne
 * peuvent pas toutes les deux réussir, quel que soit le mode (Admin ou
 * SDK client sous règles de sécurité).
 *
 * Les verrous ne contiennent aucune donnée patient : ils sont lisibles
 * publiquement pour calculer les disponibilités.
 */

const SAFE = /[^a-zA-Z0-9_-]/g;

export function lockDocId(doctorId, date) {
  return `${String(doctorId).replace(SAFE, "_")}_${date}`;
}

/** Aucun intervalle actif ne chevauche [start, end). */
export function findConflict(intervals = [], start, end, nowMs = Date.now()) {
  const s = toMin(start);
  const e = toMin(end);
  if (s === null || e === null) return null;

  return (
    intervals.find((interval) => {
      if (!interval) return false;
      if (interval.expiresAtMs != null && interval.expiresAtMs <= nowMs) return false;
      const is = toMin(interval.start);
      const ie = toMin(interval.end);
      if (is === null || ie === null) return false;
      return s < ie && is < e;
    }) || null
  );
}

/** Supprime les intervalles expirés (nettoyage paresseux). */
export function dropExpired(intervals = [], nowMs = Date.now()) {
  return intervals.filter(
    (interval) => !(interval.expiresAtMs != null && interval.expiresAtMs <= nowMs)
  );
}

/**
 * Ajoute un intervalle (écriture monotone : on n'en retire jamais ici).
 * Le nettoyage des intervalles expirés est réservé aux opérations
 * administratives privilegiées — cela garantit que chaque écriture publique
 * n'ajoute qu'une seule entrée (contrainte simple à vérifier en règles).
 */
export function addInterval(intervals = [], interval) {
  const next = [...(intervals || []), interval];
  return next;
}

/** Retire l'intervalle qui référence un rendez-vous / une séance donné. */
export function removeInterval(intervals = [], refId) {
  return (intervals || []).filter(
    (interval) => interval.refId !== refId && interval.appointmentId !== refId
  );
}

export function flattenLockRows(rows = []) {
  const out = [];
  rows.forEach((row) => {
    (row.intervals || []).forEach((interval) => {
      out.push({
        doctorId: row.doctorId,
        date: row.date,
        start: interval.start,
        end: interval.end,
        kind: interval.kind || "appointment",
        refId: interval.refId || null,
        expiresAtMs: interval.expiresAtMs ?? null,
        lockId: row.id,
      });
    });
  });
  return out;
}

function toMin(time) {
  if (typeof time !== "string") return null;
  const m = /^(\d{2}):(\d{2})$/.exec(time);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}
