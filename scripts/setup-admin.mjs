/**
 * Création du PREMIER administrateur (à exécuter UNE SEULE FOIS).
 *
 *   npm run setup:admin -- --email=admin@cabinet.ma --password='MotDePasseFort'
 *
 * Prérequis : variable d'environnement privée FIREBASE_SERVICE_ACCOUNT_KEY
 * (chaîne JSON du compte de service) déjà présente dans .env.local.
 * En mode émulateur (FIRESTORE_EMULATOR_HOST défini), aucun compte de
 * service n'est nécessaire.
 *
 * Le script :
 *   1. crée (ou met à jour) l'utilisateur dans Firebase Authentication ;
 *   2. définit la revendication personnalisée role=admin ;
 *   3. écrit le document users/{uid} avec le rôle admin.
 *
 * Aucune inscription n'est possible depuis le site : c'est la seule voie
 * pour obtenir un compte administrateur.
 */
import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

/* -------------------------------------------------- variables d'environnement */
function loadEnvLocal(file) {
  if (!existsSync(file)) return;
  const content = readFileSync(file, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
    if (!match) continue;
    const key = match[1];
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal(resolve(root, ".env.local"));

function argValue(name) {
  const argv = process.argv.slice(2);
  const index = argv.indexOf(`--${name}`);
  if (index !== -1 && argv[index + 1]) return argv[index + 1];
  const inline = argv.find((a) => a.startsWith(`--${name}=`));
  return inline ? inline.split("=").slice(1).join("=") : null;
}

async function main() {
  // 1) Arguments d'abord : message d'aide immédiat, sans toucher à Firebase.
  const email = (argValue("email") || "").trim();
  const password = argValue("password") || "";

  if (!email || !email.includes("@")) {
    console.error("✖ Indiquez un e-mail : npm run setup:admin -- --email=… --password=…");
    process.exit(1);
  }
  if (!password || password.length < 8) {
    console.error("✖ Le mot de passe doit contenir au moins 8 caractères.");
    process.exit(1);
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
  const useEmulator = Boolean(emulatorHost);

  let serviceAccount = null;
  if (useEmulator) {
    console.log(`• Mode émulateur Firestore : ${emulatorHost} (aucun compte de service requis).`);
  } else {
    if (!raw || !raw.trim() || raw.trim() === "undefined") {
      console.error(
        "✖ FIREBASE_SERVICE_ACCOUNT_KEY est absente.\n" +
          "  Ajoutez la chaîne JSON du compte de service dans .env.local puis relancez."
      );
      process.exit(1);
    }
    try {
      serviceAccount = JSON.parse(raw);
      // Clé copiée-collée : les retours à la ligne peuvent rester « \n ».
      if (serviceAccount?.private_key?.includes("\\n")) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
      }
    } catch {
      console.error("✖ FIREBASE_SERVICE_ACCOUNT_KEY n'est pas un JSON valide.");
      process.exit(1);
    }
  }

  const { initializeApp, getApps, cert } = await import("firebase-admin/app");
  const { getAuth } = await import("firebase-admin/auth");
  const { getFirestore, FieldValue } = await import("firebase-admin/firestore");

  const app =
    getApps()[0] ||
    (useEmulator
      ? initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-cabinet-dentaire" })
      : initializeApp({ credential: cert(serviceAccount) }));
  const auth = getAuth(app);
  const db = getFirestore(app);

  let uid;
  try {
    const user = await auth.getUserByEmail(email);
    uid = user.uid;
    await auth.updateUser(uid, { password });
    console.log(`• Utilisateur existant : ${email} (${uid}) — mot de passe mis à jour.`);
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      const created = await auth.createUser({ email, password, emailVerified: true });
      uid = created.uid;
      console.log(`✔ Utilisateur créé : ${email} (${uid})`);
    } else {
      throw error;
    }
  }

  await auth.setCustomUserClaims(uid, { role: "admin" });
  await db.collection("users").doc(uid).set(
    {
      email,
      role: "admin",
      active: true,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  console.log("✔ Rôle admin attribué (claim + document users/" + uid + ").");
  console.log("→ Connectez-vous sur /admin/login puis rechargez la session (déconnexion/reconnexion).");
}

main().catch((error) => {
  console.error("✖ Échec :", error.message || error);
  process.exit(1);
});
