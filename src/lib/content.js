"use client";

/**
 * Accès aux contenus publics (soins, praticiens, paramètres du cabinet).
 *
 * Lecture via l'API publique `/api/content`, qui retourne exactement les
 * mêmes données que les services de réservation (repli démonstration inclus).
 * L'interface ne peut donc jamais proposer un contenu que le serveur
 * refuserait ensuite. Si le réseau est indisponible, on bascule sur les
 * données de démonstration marquées comme telles — le site reste présentable.
 */

import { useEffect, useRef, useState } from "react";
import { DEMO_DOCTORS, DEMO_SERVICES, DEMO_SETTINGS } from "@/lib/demo-data";

const TTL_MS = 2 * 60 * 1000;
const cache = new Map();

async function cached(key, loader) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.at < TTL_MS) return entry.value;
  const value = await loader();
  cache.set(key, { at: Date.now(), value });
  return value;
}

/** Invalide le cache (appelé après une écriture depuis l'administration). */
export function invalidateContent(...keys) {
  if (!keys.length) cache.clear();
  else keys.forEach((k) => cache.delete(k));
}

/** Appel JSON simple à l'API de contenu public. */
async function fetchContent(kind) {
  const res = await fetch(`/api/content?kind=${kind}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`content_${kind}_failed`);
  return res.json();
}

export async function loadServices({ includeInactive = false } = {}) {
  return cached(`services:${includeInactive}`, async () => {
    try {
      const { items } = await fetchContent("services");
      const list = includeInactive ? items : items.filter((s) => s.active !== false);
      if (!list.length) return { items: DEMO_SERVICES, isDemo: true };
      return { items: list, isDemo: list.some((s) => s.isDemo === true) };
    } catch {
      return { items: DEMO_SERVICES, isDemo: true, offline: true };
    }
  });
}

export async function loadDoctors({ includeInactive = false } = {}) {
  return cached(`doctors:${includeInactive}`, async () => {
    try {
      const { items } = await fetchContent("doctors");
      const list = includeInactive ? items : items.filter((d) => d.active !== false);
      if (!list.length) return { items: DEMO_DOCTORS, isDemo: true };
      return { items: list, isDemo: list.some((d) => d.isDemo === true) };
    } catch {
      return { items: DEMO_DOCTORS, isDemo: true, offline: true };
    }
  });
}

export async function loadSettings() {
  return cached("settings", async () => {
    try {
      const { item } = await fetchContent("settings");
      if (!item) return { item: DEMO_SETTINGS, isDemo: true };
      return { item, isDemo: item.isDemo === true };
    } catch {
      return { item: DEMO_SETTINGS, isDemo: true, offline: true };
    }
  });
}

const LOADERS = {
  services: loadServices,
  doctors: loadDoctors,
  settings: loadSettings,
};

/**
 * Hook : charge un contenu public une seule fois et gère les états
 * chargement / erreur / démonstration.
 */
export function useContent(kind, options = {}) {
  const loader = LOADERS[kind];
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const optionsKey = JSON.stringify(options);

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true }));
    loader(JSON.parse(optionsKey))
      .then((result) => {
        if (!alive) return;
        setState({
          data: kind === "settings" ? result.item : result.items,
          isDemo: result.isDemo,
          offline: result.offline,
          loading: false,
          error: null,
        });
      })
      .catch((error) => {
        if (!alive) return;
        setState({ data: null, loading: false, error });
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, optionsKey]);

  return state;
}

/** Référence stable pour éviter les boucles de rendu. */
export function useStableValue(value) {
  const ref = useRef(value);
  ref.current = value;
  return ref.current;
}
