"use client";

import { useLanguage } from "@/context/LanguageContext";

/** Petit badge « Démo » apposé sur les contenus non encore validés. */
export default function DemoBadge({ className = "" }) {
  const { t } = useLanguage();
  return (
    <span
      title={t("common.demoBadge")}
      className={`inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wide text-amber-700 ring-1 ring-amber-200 ${className}`}
    >
      {t("common.demo")}
    </span>
  );
}
