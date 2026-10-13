/** Génération de numéros de référence patient (jamais d'ID Firestore). */

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans O/0, I/1

function randomToken(length = 6) {
  const bytes = new Uint8Array(length);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

/** Ex. « CDI-4KQ9ZT » — lisible au téléphone, non lié à un document. */
export function generateReference() {
  return `CDI-${randomToken(6)}`;
}

export function isValidReference(value) {
  return typeof value === "string" && /^CDI-[A-Z0-9]{6}$/.test(value.trim().toUpperCase());
}

export function normalizeReference(value) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

/** Identifiant de demande côté client (anti double-envoi). */
export function sanitizeRequestKey(value) {
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 40);
  return cleaned.length >= 8 ? cleaned : null;
}
