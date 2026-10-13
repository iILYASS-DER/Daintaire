"use client";

import Link from "next/link";
import { CalendarDays, Info } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import Reveal from "@/components/ui/Reveal";
import ServiceCard from "@/components/site/ServiceCard";
import CTABand from "@/components/site/CTABand";
import DemoBadge from "@/components/ui/DemoBadge";
import { useLanguage } from "@/context/LanguageContext";
import { useContent } from "@/lib/content";
import { container, section } from "@/lib/ui";

export default function ServicesClient() {
  const { t } = useLanguage();
  const services = useContent("services");
  const items = services.data || [];

  return (
    <>
      <PageHero eyebrow={t("nav.services")} title={t("services.title")} intro={t("services.intro")}>
        <div className="mt-7 flex flex-col items-center gap-3">
          <Link
            href="/appointment"
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 text-sm font-bold text-white shadow-lift transition hover:bg-brand-700"
          >
            <CalendarDays className="size-4" aria-hidden="true" />
            {t("nav.appointment")}
          </Link>
          {services.isDemo ? <DemoBadge /> : null}
        </div>
      </PageHero>

      <section className={section} aria-labelledby="services-list">
        <div className={container}>
          <h2 id="services-list" className="sr-only">
            {t("services.title")}
          </h2>

          {services.loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] animate-pulse rounded-3xl bg-navy-100/70" />
              ))}
            </div>
          ) : items.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((service, index) => (
                <Reveal key={service.id} delay={(index % 3) * 80}>
                  <ServiceCard service={service} index={index} />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-navy-500">{t("services.empty")}</p>
          )}

          {services.isDemo ? (
            <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-navy-400">
              <Info className="size-3.5 shrink-0" aria-hidden="true" />
              {t("services.demoNote")}
            </p>
          ) : null}
        </div>
      </section>

      <CTABand />
    </>
  );
}
