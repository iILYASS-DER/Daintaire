/**
 * Garde-fous des routes API : rôles, limitation de débit, réponses JSON.
 * Toutes les opérations protégées passent par ici — jamais de confiance
 * dans les données envoyées par le navigateur.
 */
import { isServerConfigured, verifyBearerToken } from "@/lib/server/firebase-admin";
import { ROLES, STAFF_ROLES } from "@/lib/constants";
import { msg } from "@/lib/messages";

export function json(data, status = 200) {
  return Response.json(data, { status });
}

export function jsonError(status, code, message, details) {
  return Response.json(
    { error: message, code, ...(details ? { details } : {}) },
    { status }
  );
}

/**
 * Mappe une erreur Firestore / gRPC sur une réponse JSON sûre.
 * Aucune trace de pile ni secret n'est jamais exposée : le message réel
 * est journalisé côté serveur, le client ne reçoit qu'un texte simple
 * (anglais, centralisé dans src/lib/messages.js).
 */
export function toHttpError(error) {
  // Erreurs métier explicites (ApiError, verifyBearerToken…).
  if (error?.status && error?.code) {
    // Messages des codes opérationnels connus → texte anglais canonique.
    const known = {
      server_not_configured: msg("error.serverNotConfigured"),
      firestore_rules_missing: msg("error.rulesMissing"),
    };
    const message = known[error.code] || error.message;
    if (error.status < 500 || known[error.code]) {
      return jsonError(error.status, error.code, message, error.details);
    }
  }

  const grpc = error?.code;
  const raw = String(error?.message || "");

  // Indice : code gRPC 7 = PERMISSION_DENIED, 9 = FAILED_PRECONDITION.
  if (grpc === 7 || /permission denied|insufficient permissions/i.test(raw)) {
    return jsonError(503, "firestore_rules_missing", msg("error.rulesMissing"));
  }
  if (
    grpc === 9 ||
    /requires an index|failed to preprocess query|no matching index/i.test(raw)
  ) {
    console.error(
      "[api] Firestore index manquant — déployez firestore.indexes.json :",
      raw
    );
    return jsonError(503, "index_missing", msg("error.indexMissing"));
  }
  if (grpc === 16 || /unauthenticated/i.test(raw)) {
    return jsonError(401, "unauthorized", msg("error.unauthorized"));
  }

  // Toute autre erreur >= 500 : journalisée, jamais exposée telle quelle.
  console.error("[api] erreur serveur :", error);
  return jsonError(500, "internal_error", msg("error.internal"));
}

/**
 * Vérifie le jeton Firebase ID puis le rôle de l'utilisateur.
 * @param {Request} request
 * @param {string[]} [roles] rôles autorisés (par défaut : admin + doctor)
 * @returns {Promise<{uid:string,email:string,role:string}>}
 */
export async function requireRole(request, roles = STAFF_ROLES) {
  const user = await verifyBearerToken(request.headers.get("authorization"));

  let role = user.role;
  if (!role && isServerConfigured()) {
    const { adminDb } = await import("@/lib/server/firebase-admin");
    const snapshot = await adminDb().collection("users").doc(user.uid).get();
    role = snapshot.exists ? snapshot.data()?.role || null : null;
  }

  if (!role || !roles.includes(role)) {
    const error = new Error(msg("error.unauthorized"));
    error.status = 403;
    error.code = "unauthorized";
    throw error;
  }

  return { ...user, role };
}

export async function requireAdmin(request) {
  return requireRole(request, [ROLES.ADMIN]);
}

/* ------------------------------------------------------- limitation de débit */

const buckets = new Map();

/**
 * Limitation simple côté serveur (mémoire de l'instance).
 * À compléter par un limitateur distribué si le trafic augmente.
 */
export function rateLimit(key, { limit = 5, windowMs = 10 * 60 * 1000 } = {}) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { ok: true, remaining: limit - bucket.count };
}

export function clientKey(request, suffix = "") {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "local";
  return `${ip}${suffix}`;
}

/** Nettoyage périodique des compteurs (évite une fuite mémoire). */
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}, 5 * 60 * 1000).unref?.();
