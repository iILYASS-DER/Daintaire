"use client";

import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

/** Page 404 bilingue (aucun mélange de langues : tout passe par t()). */
export default function NotFoundClient() {
  const { t } = useLanguage();

  return (
    <section className="relative isolate overflow-hidden bg-white">
      <div
        className="bg-dotted bg-grid-fade pointer-events-none absolute inset-x-0 top-0 h-72 opacity-60"
        aria-hidden="true"
      />
      <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center gap-6 px-4 py-20 text-center">
        <span className="text-7xl font-black tracking-tight text-brand-600 sm:text-8xl">404</span>
        <h1 className="text-balance text-2xl font-bold text-navy-900 sm:text-3xl">
          {t("notFound.title")}
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-navy-500">{t("notFound.text")}</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 text-sm font-bold text-white shadow-lift transition hover:bg-brand-700"
          >
            <Home className="size-4" aria-hidden="true" />
            {t("notFound.home")}
          </Link>
          <Link
            href="/appointment"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-navy-200 bg-white px-7 py-3.5 text-sm font-bold text-navy-800 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
          >
            <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
            {t("nav.appointment")}
          </Link>
        </div>
      </div>
    </section>
  );
}
