"use client";

import Link from "next/link";
import { CalendarDays, Phone } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { container } from "@/lib/ui";

/** Bandeau d'appel à l'action réutilisé en bas des pages. */
export default function CTABand({
  title,
  text,
  primaryLabel,
  primaryHref = "/appointment",
  secondaryLabel,
  secondaryHref = "/contact",
}) {
  const { t } = useLanguage();

  return (
    <section className="relative isolate overflow-hidden bg-navy-900">
      <div className="bg-dotted absolute inset-0 opacity-20" aria-hidden="true" />
      <div
        className="absolute -end-24 -top-24 size-72 rounded-full bg-brand-500/25 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -start-16 size-80 rounded-full bg-aqua/20 blur-3xl"
        aria-hidden="true"
      />

      <div className={`${container} relative flex flex-col gap-8 py-14 sm:py-16 lg:flex-row lg:items-center lg:justify-between`}>
        <div className="max-w-2xl">
          <h2 className="text-balance text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            {title || t("home.contact.title")}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-navy-200">
            {text || t("home.contact.text")}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
          <Link
            href={primaryHref}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-navy-900 transition hover:bg-brand-50"
          >
            <CalendarDays className="size-4" aria-hidden="true" />
            {primaryLabel || t("nav.appointment")}
          </Link>
          <a
            href="tel:+212659349160"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3.5 text-sm font-bold text-white transition hover:border-white hover:bg-white/10"
          >
            <Phone className="size-4" aria-hidden="true" />
            {secondaryLabel || t("home.contact.call")}
          </a>
        </div>
      </div>
    </section>
  );
}
