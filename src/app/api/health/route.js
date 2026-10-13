import { NextResponse } from "next/server";

/**
 * Diagnostics de santé — GET /api/health
 *
 * Route volontairement autonome : elle n'importe AUCUN module partagé des
 * autres routes (ni store, ni guard, ni firebase) en statique. Chaque test
 * est exécuté en import dynamique dans un try/catch, afin que cette route
 * réponde toujours un JSON exploitable, même si une couche serveur casse
 * (c'est précisément le rôle de ce point de mesure : localiser la couche
 * défaillante d'un déploiement sans accès aux journaux).
 *
 * Aucun secret n'est exposé : uniquement des booléens de présence et des
 * messages d'erreur tronqués/assainis.
 */

export const dynamic = "force-dynamic";

const MAX_ERROR_LEN = 300;

function safeError(error) {
  const raw = String((error && (error.stack || error.message)) || error);
  return raw
    .replace(/[A-Za-z0-9_-]{40,}/g, "[redacted]") // clés, jetons, empreintes
    .slice(0, MAX_ERROR_LEN);
}

async function runStep(steps, name, fn) {
  const startedAt = Date.now();
  try {
    steps[name] = { ok: true, ms: Date.now() - startedAt, ...(await fn()) };
  } catch (error) {
    steps[name] = { ok: false, ms: Date.now() - startedAt, error: safeError(error) };
  }
  return steps[name];
}

function serviceAccountKeyState() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw || !raw.trim()) return { present: false };
  const trimmed = raw.trim();
  if (trimmed === "undefined" || trimmed === "null") {
    return { present: true, validJson: false, note: "literal-placeholder" };
  }
  try {
    const parsed = JSON.parse(trimmed);
    return {
      present: true,
      validJson: true,
      hasProjectId: Boolean(parsed && parsed.project_id),
      hasPrivateKey: Boolean(parsed && parsed.private_key),
    };
  } catch {
    return { present: true, validJson: false };
  }
}

export async function GET() {
  const steps = {};

  await runStep(steps, "runtime", async () => ({
    node: process.version,
    vercelEnv: process.env.VERCEL_ENV || null,
    vercelRegion: process.env.VERCEL_REGION || null,
  }));

  await runStep(steps, "env", async () => ({
    nextPublicApiKey: Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    nextPublicProjectId: Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    serviceAccount: serviceAccountKeyState(),
    googleApplicationCredentials: Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS),
    firestoreEmulatorHost: Boolean(process.env.FIRESTORE_EMULATOR_HOST),
  }));

  await runStep(steps, "firebaseClient", async () => {
    const mod = await import("@/lib/firebase");
    return { configured: Boolean(mod.isFirebaseConfigured) };
  });

  await runStep(steps, "firebaseAdminSdk", async () => {
    const mod = await import("@/lib/server/firebase-admin");
    const initError = mod.getServerInitializationError();
    return {
      configured: mod.isServerConfigured(),
      initializationError: initError ? safeError(initError) : null,
    };
  });

  const storeStep = await runStep(steps, "firestoreRead", async () => {
    const store = await import("@/lib/server/store");
    const [services, doctors] = await Promise.all([
      store.listServices({ activeOnly: false }),
      store.listDoctors({ activeOnly: false }),
    ]);
    return {
      privileged: store.privileged(),
      services: services.length,
      doctors: doctors.length,
    };
  });

  const allOk = Object.values(steps).every((step) => step.ok);
  const status = allOk ? (storeStep.ok ? "ok" : "degraded") : "error";

  return NextResponse.json(
    { status, steps },
    { status: allOk ? 200 : 503, headers: { "cache-control": "no-store" } }
  );
}
