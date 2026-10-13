"use client";
import { useLanguage } from "@/context/LanguageContext";

/** Lien d'évitement (accessibilité) — traduit selon la langue active. */
export default function SkipLink() {
  const { t } = useLanguage();
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-[100] focus:rounded-full focus:bg-navy-900 focus:px-5 focus:py-3 focus:text-white"
    >
      {t("nav.skipToContent")}
    </a>
  );
}
