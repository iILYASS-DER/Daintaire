/**
 * Garde commune à toutes les routes /api/admin/*.
 * - vérifie le jeton Firebase ID et le rôle (staff ou admin) ;
 * - refuse proprement si le compte de service n'est pas configuré.
 */
import { ROLES, STAFF_ROLES } from "@/lib/constants";
import { ApiError } from "@/lib/server/booking";
import { requireRole, toHttpError } from "@/lib/server/guard";
import { isServerConfigured } from "@/lib/server/firebase-admin";
import { msg } from "@/lib/messages";

function ensureConfigured() {
  if (!isServerConfigured()) {
    throw new ApiError(
      503,
      "server_not_configured",
      msg("error.serverNotConfigured")
    );
  }
}

/** Équipe autorisée (admin ou doctor) — données de suivi des patients. */
export async function guardStaff(request) {
  ensureConfigured();
  return requireRole(request, STAFF_ROLES);
}

/** Réservé à l'administrateur — paramètres et contenus du cabinet. */
export async function guardAdmin(request) {
  ensureConfigured();
  return requireRole(request, [ROLES.ADMIN]);
}

/** Réponse standardisée quand le serveur n'est pas configuré. */
export function notConfigured() {
  return toHttpError(
    new ApiError(503, "server_not_configured", msg("error.serverNotConfigured"))
  );
}
