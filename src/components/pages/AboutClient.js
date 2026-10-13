"use client";

import Link from "next/link";
import { ArrowRight, HeartHandshake, ShieldCheck, Sparkles, Users } from "lucide-react";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import PageHero from "@/components/ui/PageHero";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import DoctorCard from "@/components/site/DoctorCard";
import CTABand from "@/components/site/CTABand";
import DemoBadge from "@/components/ui/DemoBadge";
import { useLanguage } from "@/context/LanguageContext";
import { useContent } from "@/lib/content";
import { card, container, section } from "@/lib/ui";

const VALUES = [
  { key: "value1", Icon: HeartHandshake },
  { key: "value2", Icon: ShieldCheck },
  { key: "value3", Icon: Sparkles },
  { key: "value4", Icon: Users },
];

const PILLARS = [
  { key: "env", image: "/images/clinic-interior-1.jpg" },
  { key: "care", image: "/images/consultation-xray.jpg" },
];

export default function AboutClient() {
  const { t } = useLanguage();
  const doctors = useContent("doctors");
  const services = useContent("services");

  return (
    <>
      <PageHero
        eyebrow={t("brand.city")}
        title={t("about.title")}
        intro={t("about.intro")}
      />

      {/* --------------------------------------------------- Piliers */}
      <section className={section} aria-labelledby="about-pillars">
        <div className={container}>
          <div className="grid gap-8 lg:grid-cols-2">
            {PILLARS.map((pillar, index) => (
              <Reveal key={pillar.key} delay={index * 100}>
                <article className={`${card} h-full overflow-hidden`}>
                  <div className="relative aspect-[16/9] bg-navy-50">
                    <ImageWithFallback
                      src={pillar.image}
                      alt={t(`about.${pillar.key}Title`)}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6 sm:p-8">
                    <h2
                      id={index === 0 ? "about-pillars" : undefined}
                      className="text-xl font-bold text-navy-900 sm:text-2xl"
                    >
                      {t(`about.${pillar.key}Title`)}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-navy-500 sm:text-base">
                      {t(`about.${pillar.key}Text`)}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- Valeurs */}
      <section className="bg-mist" aria-labelledby="about-values">
        <div className={container}>
          <Reveal>
            <SectionHeading
              id="about-values"
              eyebrow={t("nav.about")}
              title={t("about.valuesTitle")}
              align="center"
            />
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ key, Icon }, index) => (
              <Reveal key={key} delay={index * 80}>
                <div className={`${card} h-full p-6`}>
                  <span className="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-base font-bold text-navy-900">
                    {t(`about.${key}`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-500">
                    {t(`about.${key}Text`)}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ Équipe */}
      <section className={section} aria-labelledby="about-team">
        <div className={container}>
          <Reveal>
            <SectionHeading
              id="about-team"
              eyebrow={t("about.docsTitle")}
              title={t("home.doctors.title")}
              subtitle={t("about.docsText")}
            />
          </Reveal>

          <div className="mt-6 flex items-center gap-3">
            {doctors.isDemo ? <DemoBadge /> : null}
            <p className="text-xs text-navy-400">{t("about.docsDemo")}</p>
          </div>

          {doctors.loading ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="aspect-[16/10] animate-pulse rounded-3xl bg-navy-100/70" />
              <div className="aspect-[16/10] animate-pulse rounded-3xl bg-navy-100/70" />
            </div>
          ) : (doctors.data || []).length ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {(doctors.data || []).map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} services={services.data || []} />
              ))}
            </div>
          ) : (
            <p className="mt-8 text-sm text-navy-500">{t("home.doctors.empty")}</p>
          )}

          <div className="mt-10">
            <Link
              href="/appointment"
              className="inline-flex items-center gap-2 text-sm font-bold text-brand-700 transition hover:text-brand-800"
            >
              {t("nav.appointment")}
              <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <CTABand />
    </>
  );
}
