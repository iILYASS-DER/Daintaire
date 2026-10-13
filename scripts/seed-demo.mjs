/**
 * Chargement des données de démonstration (sans compte administrateur).
 *
 *   npm run seed
 *
 * Crée UNIQUEMENT les documents manquants (services, praticiens, paramètres
 * du cabinet) avec les identifiants demo-* que l'interface utilise déjà.
 * Aucune donnée existante n'est écrasée. Nécessite simplement la variable
 * privée FIREBASE_SERVICE_ACCOUNT_KEY (ou FIRESTORE_EMULATOR_HOST).
 *
 * Note : ce n'est pas obligatoire — l'API et le site retombent
 * automatiquement sur les mêmes données de démonstration tant que les
 * collections restent vides.
 */
import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;

if (!emulatorHost && !process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  console.error(
    "✖ FIREBASE_SERVICE_ACCOUNT_KEY est absente dans .env.local.\n" +
      "  Ajoutez la chaîne JSON du compte de service, puis relancez."
  );
  process.exit(1);
}

const { initializeApp, getApps, cert } = await import("firebase-admin/app");
const { getFirestore, FieldValue } = await import("firebase-admin/firestore");

let serviceAccount = null;
if (!emulatorHost && process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  if (serviceAccount?.private_key?.includes("\\n")) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
  }
}

const app =
  getApps()[0] ||
  (emulatorHost
    ? initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-cabinet-dentaire",
      })
    : initializeApp({ credential: cert(serviceAccount) }));
const db = getFirestore(app);

const { DEMO_DOCTORS, DEMO_SERVICES, DEMO_SETTINGS } = await import(
  "../src/lib/demo-data.js"
);

const ts = FieldValue.serverTimestamp();
const created = { services: 0, doctors: 0, settings: false };

const servicesSnap = await db.collection("services").get();
if (servicesSnap.empty) {
  for (const service of DEMO_SERVICES) {
    const { id, ...data } = service;
    await db.collection("services").doc(id).set({
      ...data,
      createdAt: ts,
      updatedAt: ts,
    });
    created.services += 1;
  }
}

const doctorsSnap = await db.collection("doctors").get();
if (doctorsSnap.empty) {
  for (const doctor of DEMO_DOCTORS) {
    const { id, ...data } = doctor;
    await db.collection("doctors").doc(id).set({
      ...data,
      createdAt: ts,
      updatedAt: ts,
    });
    created.doctors += 1;
  }
}

const settingsSnap = await db.collection("clinicSettings").doc("main").get();
if (!settingsSnap.exists) {
  const { id, ...data } = DEMO_SETTINGS;
  await db.collection("clinicSettings").doc("main").set(
    { ...data, createdAt: ts, updatedAt: ts },
    { merge: true }
  );
  created.settings = true;
}

console.log(
  `✔ Données de démonstration : ${created.services} soin(s), ${created.doctors} praticien(s), paramètres ${
    created.settings ? "créés" : "déjà présents"
  }.`
);
process.exit(0);
