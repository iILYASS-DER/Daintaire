/**
 * Accès aux données côté serveur.
 *
 * Deux modes :
 *  1. Privé  — Firebase Admin SDK configuré (droits étendus, opérations
 *     administratives, validation définitive des rendez-vous).
 *  2. Public — SDK client utilisé côté serveur : les règles Firestore
 *     restent appliquées. Cela permet la réservation publique et la lecture
 *     des contenus publiés sans compte de service.
 *
 * L'API est volontairement la même dans les deux cas.
 */
import {
  collection as clientCollection,
  doc as clientDoc,
  getDoc as clientGetDoc,
  getDocs as clientGetDocs,
  limit as clientLimit,
  orderBy as clientOrderBy,
  query as clientQuery,
  serverTimestamp as clientServerTimestamp,
  Timestamp as ClientTimestamp,
  where as clientWhere,
  writeBatch as clientWriteBatch,
} from "firebase/firestore";
import { FieldValue as AdminFieldValue, Timestamp as AdminTimestamp } from "firebase-admin/firestore";
import { db as clientDb } from "@/lib/firebase";
import { adminDb, isServerConfigured } from "@/lib/server/firebase-admin";
import { COLLECTIONS, DEFAULT_TIMEZONE } from "@/lib/constants";
import { DEMO_DOCTORS, DEMO_SERVICES, DEMO_SETTINGS } from "@/lib/demo-data";

export const privileged = () => isServerConfigured();

function database() {
  return privileged() ? adminDb() : clientDb;
}

/* ------------------------------------------------------------ références */

export function fsDoc(path) {
  return privileged()
    ? database().doc(path)
    : clientDoc(clientDb, ...path.split("/"));
}

export function fsCollection(path) {
  return privileged()
    ? database().collection(path)
    : clientCollection(clientDb, path);
}

/**
 * @param {string} path  chemin de collection
 * @param {{wheres?:Array, orders?:Array, limit?:number}} options
 */
export function fsQuery(path, { wheres = [], orders = [], limit: max } = {}) {
  if (privileged()) {
    let q = database().collection(path);
    wheres.forEach((w) => {
      q = q.where(w.field, w.op || "==", w.value);
    });
    orders.forEach((o) => {
      q = q.orderBy(o.field, o.dir || "asc");
    });
    if (max) q = q.limit(max);
    return q;
  }

  const clauses = [
    ...wheres.map((w) => clientWhere(w.field, w.op || "==", w.value)),
    ...orders.map((o) => clientOrderBy(o.field, o.dir || "asc")),
    ...(max ? [clientLimit(max)] : []),
  ];
  return clientQuery(clientCollection(clientDb, path), ...clauses);
}

export async function getSnap(target) {
  return privileged()
    ? target.get()
    : target instanceof Object && typeof target.get === "function"
      ? target.get()
      : clientGetDoc(target);
}

export async function fetchDoc(target) {
  const snap = privileged()
    ? await target.get()
    : await clientGetDoc(target);
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
}

export async function fetchCollection(target) {
  const snap = privileged() ? await target.get() : await clientGetDocs(target);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function runTransaction(worker) {
  if (privileged()) {
    return database().runTransaction((tx) => worker(tx));
  }
  const { runTransaction } = await import("firebase/firestore");
  return runTransaction(clientDb, (tx) => worker(tx));
}

export function writeBatch() {
  return privileged() ? database().batch() : clientWriteBatch(clientDb);
}

export function srvTs() {
  return privileged() ? AdminFieldValue.serverTimestamp() : clientServerTimestamp();
}

export function tsFromDate(date) {
  return privileged() ? AdminTimestamp.fromDate(date) : ClientTimestamp.fromDate(date);
}

export function newRef(path) {
  return privileged() ? database().collection(path).doc() : clientDoc(clientCollection(clientDb, path));
}

/* ------------------------------------------------------ conversions JSON */

/** Transforme les Timestamps (et objets imbriqués) en chaînes ISO. */
export function toJsonSafe(value) {
  if (value === null || value === undefined) return value;
  if (typeof value.toDate === "function" && typeof value.seconds === "number") {
    return value.toDate().toISOString();
  }
  if (Array.isArray(value)) return value.map(toJsonSafe);
  if (typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = toJsonSafe(v);
    return out;
  }
  return value;
}

/* ------------------------------------------------------------ lectures */

let cache = new Map();

async function cached(key, ttlMs, loader) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.at < ttlMs) return entry.value;
  const value = await loader();
  cache.set(key, { at: Date.now(), value });
  return value;
}

/**
 * Lecture publique tolérante :
 *  - si les règles Firestore refusent encore l'accès (non déployées), ou
 *  - si la collection est encore vide (aucun contenu publié),
 * on retombe sur les contenus de démonstration plutôt que d'afficher une
 * erreur — le site et l'API restent ainsi cohérents (mêmes identifiants
 * demo-* que le navigateur). Jamais utilisé pour les écritures ni par
 * l'administration, qui voient la réalité de la base.
 */
async function readWithFallback(loader, fallback) {
  try {
    const value = await loader();
    const empty =
      value === null ||
      (Array.isArray(value) && value.length === 0);
    return empty ? fallback() : value;
  } catch (error) {
    const { isPermissionDenied } = await import("@/lib/server/firebase-errors");
    if (!privileged() && isPermissionDenied(error)) return fallback();
    throw error;
  }
}

export function invalidateCache(prefix) {
  if (!prefix) cache.clear();
  else for (const key of [...cache.keys()]) if (key.startsWith(prefix)) cache.delete(key);
}

export async function getSettings() {
  return cached("settings", 30_000, async () =>
    readWithFallback(
      () => fetchDoc(fsDoc(`${COLLECTIONS.CLINIC_SETTINGS}/main`)),
      () => ({ ...DEMO_SETTINGS, isDemo: true })
    )
  );
}

export async function listDoctors({ activeOnly = true } = {}) {
  return cached(`doctors:${activeOnly}`, 30_000, async () => {
    const items = await readWithFallback(
      () => fetchCollection(fsCollection(COLLECTIONS.DOCTORS)),
      () => DEMO_DOCTORS.map((d) => ({ ...d, isDemo: true }))
    );
    const filtered = activeOnly ? items.filter((d) => d.active !== false) : items;
    return filtered.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  });
}

export async function listServices({ activeOnly = true } = {}) {
  return cached(`services:${activeOnly}`, 30_000, async () => {
    const items = await readWithFallback(
      () => fetchCollection(fsCollection(COLLECTIONS.SERVICES)),
      () => DEMO_SERVICES.map((s) => ({ ...s, isDemo: true }))
    );
    const filtered = activeOnly ? items.filter((s) => s.active !== false) : items;
    return filtered.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  });
}

export async function getDoctor(id) {
  if (!id) return null;
  const doctors = await listDoctors({ activeOnly: false });
  return doctors.find((d) => d.id === id) || null;
}

export async function getService(id) {
  if (!id) return null;
  const services = await listServices({ activeOnly: false });
  return services.find((s) => s.id === id) || null;
}

/** Verrous de créneaux pour une date (source publique de disponibilité). */
export async function listLocksForDate(date) {
  const { flattenLockRows } = await import("@/lib/server/slots");
  const rows = await readWithFallback(
    () =>
      fetchCollection(
        fsQuery(COLLECTIONS.SLOT_LOCKS, { wheres: [{ field: "date", value: date }] })
      ),
    () => []
  );
  return flattenLockRows(
    rows.map((row) => ({
      id: row.id,
      doctorId: row.doctorId,
      date: row.date,
      intervals: row.intervals || [],
    }))
  );
}

/** Créneaux bloqués (congés, fermetures exceptionnelles). */
export async function listBlockedForDate(date) {
  const rows = await readWithFallback(
    () =>
      fetchCollection(
        fsQuery(COLLECTIONS.BLOCKED_SLOTS, { wheres: [{ field: "date", value: date }] })
      ),
    () => []
  );
  return rows.map((row) => ({
    id: row.id,
    doctorId: row.doctorId || null,
    date: row.date,
    start: row.start,
    end: row.end,
    reason: row.reason || "",
  }));
}

/**
 * Créneaux occupés pour une date, actifs maintenant (les verrous expirés
 * sont ignorés : une demande non traitée laisse la place au bout du délai).
 */
export async function listActiveOccupiedForDate(date, { nowMs = Date.now() } = {}) {
  const locks = await listLocksForDate(date);
  return locks.filter((lock) => lock.expiresAtMs === null || lock.expiresAtMs > nowMs);
}

export function defaultTimeZone() {
  return process.env.NEXT_PUBLIC_TIMEZONE || DEFAULT_TIMEZONE;
}
