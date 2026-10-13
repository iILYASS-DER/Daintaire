"use client";

import { useEffect } from "react";
import { getApps } from "firebase/app";

/**
 * Firebase Analytics : initialisé uniquement côté navigateur et uniquement
 * si le SDK le prend en charge. Il ne doit jamais bloquer le rendu serveur.
 */
export default function Analytics() {
  useEffect(() => {
    const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;
    if (!measurementId || typeof window === "undefined") return;

    let cancelled = false;

    (async () => {
      try {
        const { getAnalytics, isSupported, logEvent } = await import(
          "firebase/analytics"
        );
        if (cancelled || !(await isSupported())) return;
        const app = getApps()[0];
        if (!app) return;
        const analytics = getAnalytics(app);
        logEvent(analytics, "page_view", {
          page_path: window.location.pathname,
        });
      } catch {
        // Analytics est optionnel : toute erreur est ignorée silencieusement.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
