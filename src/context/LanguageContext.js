"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { LANGUAGES, isLanguage, translate } from "@/lib/i18n";

const STORAGE_KEY = "cdi_language";

const LanguageContext = createContext({
  lang: "fr",
  dir: "ltr",
  locale: "fr-MA",
  setLanguage: () => {},
  t: (key, vars) => translate(key, "fr", vars),
});

/**
 * Fournit la langue courante (FR / AR), la direction du texte et la
 * fonction de traduction. La préférence est conservée dans localStorage
 * puis réappliquée à chaque visite.
 */
export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState("fr");

  // Au premier rendu côté client, on restaure la langue sauvegardée.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (isLanguage(saved)) setLangState(saved);
    } catch {
      /* stockage indisponible : on garde le français */
    }
  }, []);

  // On synchronise lang / dir sur la balise <html>.
  useEffect(() => {
    const info = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
    document.documentElement.lang = info.htmlLang;
    document.documentElement.dir = info.dir;
  }, [lang]);

  const setLanguage = useCallback((code) => {
    if (!isLanguage(code)) return;
    setLangState(code);
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* ignoré */
    }
  }, []);

  const t = useCallback(
    (key, vars) => translate(key, lang, vars),
    [lang]
  );

  const value = useMemo(() => {
    const info = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
    return {
      lang,
      dir: info.dir,
      locale: info.intl,
      setLanguage,
      t,
    };
  }, [lang, setLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

/** Raccourci : const { t } = useT(); */
export function useT() {
  return useContext(LanguageContext).t;
}
