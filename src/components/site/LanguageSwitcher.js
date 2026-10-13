"use client";

import { useLanguage } from "@/context/LanguageContext";
import { LANGUAGES } from "@/lib/i18n";

/**
 * Sélecteur de langue FR / AR — visible dans l'en-tête et le pied de page.
 */
export default function LanguageSwitcher({ className = "", size = "md" }) {
  const { lang, setLanguage, t } = useLanguage();

  const sizing =
    size === "sm"
      ? "text-[0.7rem] p-0.5 gap-0.5"
      : "text-xs p-1 gap-1";

  return (
    <div
      className={`inline-flex items-center rounded-full border border-navy-100 bg-white ${sizing} ${className}`}
      role="group"
      aria-label={t("lang.switch")}
    >
      {LANGUAGES.map((item) => {
        const active = item.code === lang;
        return (
          <button
            key={item.code}
            type="button"
            onClick={() => setLanguage(item.code)}
            aria-pressed={active}
            lang={item.htmlLang}
            className={`rounded-full font-semibold tracking-wide transition-colors ${
              size === "sm" ? "px-2 py-1" : "px-3 py-1.5"
            } ${
              active
                ? "bg-navy-900 text-white shadow-sm"
                : "text-navy-500 hover:bg-brand-50 hover:text-brand-700"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
