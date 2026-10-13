/**
 * Empreinte des coordonnées de contact.
 *
 * Utilisée pour vérifier qu'un visiteur possède bien une référence de
 * demande (consultation d'état) sans stocker de numéro de téléphone dans
 * une collection publiquement lisible.
 */
import { createHash } from "node:crypto";

const SALT =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  "cabinet-dentaire-ilyass";

/** SHA-256 salé — irréversible, non réutilisable comme identifiant. */
export function phoneFingerprint(phone) {
  const normalized = String(phone || "").replace(/[^\d]/g, "");
  return createHash("sha256").update(`${SALT}:${normalized}`).digest("hex");
}
