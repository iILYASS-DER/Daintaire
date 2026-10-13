/** Détection des erreurs Firebase côté serveur. */

import { msg } from "@/lib/messages";

/**
 * Vrai si Firestore refuse la lecture/écriture (règles non déployées…).
 * Le SDK Admin renvoie un code gRPC numérique (7 = PERMISSION_DENIED) ;
 * le SDK client un code texte (« permission-denied »).
 */
export function isPermissionDenied(error) {
  const code = error?.code;
  const message = String(error?.message || "");
  return (
    code === 7 ||
    code === "permission-denied" ||
    code === "firestore/permission-denied" ||
    /insufficient permissions|permission denied|permission-denied/i.test(message)
  );
}

/** Message serveur (anglais) renvoyé quand les règles Firestore bloquent. */
export const RULES_MISSING_MESSAGE = msg("error.rulesMissing");
