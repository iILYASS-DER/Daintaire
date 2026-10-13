/**
 * Initialisation de Firebase Admin SDK — SERVEUR UNIQUEMENT.
 *
 * ⚠️ Ce module ne doit jamais être importé depuis un composant client.
 * Les identifiants privés proviennent exclusivement de variables
 * d'environnement côté serveur :
 *
 *   FIREBASE_SERVICE_ACCOUNT_KEY   chaîne JSON du compte de service
 *   (ou GOOGLE_APPLICATION_CREDENTIALS / ADC en environnement GCP)
 *
 * Si aucune donnée d'identification n'est fournie, `isServerConfigured()`
 * renvoie false et les routes protégées répondent 503 avec un message
 * explicite — aucune donnée n'est inventée ni exposée.
 */
import { getApps, initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { msg } from "@/lib/messages";

let appInstance = null;
let initializationError = null;
let initialized = false;

function parseServiceAccount(raw) {
  const trimmed = raw.trim();
  const candidates = [trimmed];
  // Certains hébergeurs échappent les guillemets lors du stockage en env.
  if (trimmed.startsWith('"') || trimmed.startsWith('\\"')) {
    candidates.push(trimmed.replace(/\\"/g, '"'));
  }
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && parsed.project_id && parsed.private_key) {
        // Clé copiée-collée : les retours à la ligne restent échappés « \n ».
        if (parsed.private_key.includes("\\n")) {
          parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
        }
        return parsed;
      }
    } catch {
      /* on essaie le candidat suivant */
    }
  }
  return null;
}

function init() {
  if (initialized) return;
  initialized = true;
  try {
    const existing = getApps();
    if (existing.length) {
      appInstance = existing[0];
      return;
    }

    // Émulateur Firestore/Auth : aucun compte de service requis, les données
    // restent isolées de la production. Sert à tester les règles et les flux.
    const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
    if (emulatorHost) {
      const projectId =
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-cabinet-dentaire";
      appInstance = initializeApp({ projectId });
      return;
    }

    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (raw && raw.trim() && raw.trim() !== "undefined") {
      const serviceAccount = parseServiceAccount(raw);
      if (!serviceAccount) {
        throw new Error(
          "FIREBASE_SERVICE_ACCOUNT_KEY is not a valid service account JSON string."
        );
      }
      appInstance = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
      return;
    }

    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      appInstance = initializeApp({ credential: applicationDefault() });
      return;
    }

    initializationError = new Error("no-credentials");
  } catch (error) {
    initializationError = error;
    appInstance = null;
  }
}

/** Vrai si le serveur dispose des privilèges Admin (compte de service). */
export function isServerConfigured() {
  init();
  return Boolean(appInstance);
}

export function getServerInitializationError() {
  init();
  return initializationError;
}

export function getAdminApp() {
  init();
  if (!appInstance) throw initializationError || new Error("server-not-configured");
  return appInstance;
}

export function adminDb() {
  return getFirestore(getAdminApp());
}

export function adminAuth() {
  return getAuth(getAdminApp());
}

/**
 * Vérifie un jeton Firebase ID reçu dans l'en-tête Authorization.
 * @returns {Promise<{uid:string, email:string, role:string|null}>}
 */
export async function verifyBearerToken(authorizationHeader) {
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    const error = new Error(msg("error.unauthorized"));
    error.status = 401;
    error.code = "unauthorized";
    throw error;
  }
  const token = authorizationHeader.slice(7).trim();
  if (!token) {
    const error = new Error(msg("error.unauthorized"));
    error.status = 401;
    error.code = "unauthorized";
    throw error;
  }
  if (!isServerConfigured()) {
    const error = new Error(msg("error.serverNotConfigured"));
    error.status = 503;
    error.code = "server_not_configured";
    throw error;
  }
  try {
    const decoded = await adminAuth().verifyIdToken(token, true);
    return {
      uid: decoded.uid,
      email: decoded.email || "",
      role: decoded.role || null,
    };
  } catch (cause) {
    const error = new Error(msg("error.unauthorized"));
    error.status = 401;
    error.code = "unauthorized";
    error.cause = cause;
    throw error;
  }
}
