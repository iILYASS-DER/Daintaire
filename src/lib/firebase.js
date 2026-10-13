/**
 * Initialisation unique du SDK Firebase côté client (et utilise par le
 * serveur pour les opérations publiques lorsque le compte de service n'est
 * pas configuré).
 *
 * Toutes les valeurs proviennent des variables d'environnement NEXT_PUBLIC_*
 * définies dans .env.local (voir .env.local.example).
 */
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

function getFirebaseApp() {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error(
      "Configuration Firebase manquante : vérifiez .env.local (NEXT_PUBLIC_FIREBASE_*)."
    );
  }
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export const app = getFirebaseApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

/**
 * Mode émulateur LOCAL (optionnel, jamais actif en production) :
 *   NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
 *   NEXT_PUBLIC_FIREBASE_EMULATOR_HOST=127.0.0.1:8085
 * Permet de tester le site et l'espace admin sans toucher au vrai projet.
 */
const authEmulator = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST;
if (authEmulator) {
  connectAuthEmulator(auth, `http://${authEmulator}`, { disableWarnings: true });
}
const firestoreEmulator = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST;
if (firestoreEmulator) {
  connectFirestoreEmulator(db, firestoreEmulator);
}

/** Vrai quand la configuration pointe vers le projet attendu. */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);
