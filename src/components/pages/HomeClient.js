"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  CalendarDays,
  Check,
  ClipboardList,
  FileText,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import ServiceCard from "@/components/site/ServiceCard";
import DoctorCard from "@/components/site/DoctorCard";
import CTABand from "@/components/site/CTABand";
import DemoBadge from "@/components/ui/DemoBadge";
import { useLanguage } from "@/context/LanguageContext";
import { DAY_KEYS } from "@/lib/i18n";
import { useContent } from "@/lib/content";
import { card, container, section } from "@/lib/ui";

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

const BENEFITS = [
  { key: "home.benefit1", Icon: CalendarDays },
  { key: "home.benefit2", Icon: UserCheck },
  { key: "home.benefit3", Icon: Users },
  { key: "home.benefit4", Icon: ClipboardList },
  { key: "home.benefit5", Icon: FileText },
  { key: "home.benefit6", Icon: ShieldCheck },
];

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-3xl bg-navy-100/70 ${className}`} />;
}

export default function HomeClient() {
  const { t } = useLanguage();
  const services = useContent("services");
  const doctors = useContent("doctors");
  const settings = useContent("settings");

  const serviceItems = (services.data || []).slice(0, 6);
  const doctorItems = doctors.data || [];
  const hours = settings.data?.openingHours || null;
  const isDemoContent = services.isDemo || doctors.isDemo || settings.isDemo;

  return (
    <>
      {/* ---------------------------------------------------------- HERO */}
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-brand-50/80 via-white to-white">
        <div className="bg-dotted bg-grid-fade pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-70" aria-hidden="true" />
        <div
          className="absolute -end-32 top-10 -z-10 size-[26rem] rounded-full bg-brand-200/40 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -start-40 bottom-0 -z-10 size-[22rem] rounded-full bg-aqua/25 blur-3xl"
          aria-hidden="true"
        />

        <div className={`${container} grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-24`}>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white px-4 py-2 text-xs font-bold text-brand-700 shadow-sm">
              <MapPin className="size-3.5" aria-hidden="true" />
              {t("hero.badge")}
            </span>

            <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.1] tracking-tight text-navy-900 sm:text-5xl lg:text-[3.4rem]">
              {t("hero.title1")}{" "}
              <span className="bg-gradient-to-r from-brand-600 to-aqua bg-clip-text text-transparent">
                {t("hero.titleHighlight")}
              </span>{" "}
              {t("hero.title2")}
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-navy-500 sm:text-lg">
              {t("hero.description")}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/appointment" className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-7 py-4 text-sm font-bold text-white shadow-lift transition hover:bg-brand-700">
                <CalendarDays className="size-4" aria-hidden="true" />
                {t("hero.ctaPrimary")}
              </Link>
              <Link href="/services" className="inline-flex items-center justify-center gap-2 rounded-full border border-navy-200 bg-white px-7 py-4 text-sm font-bold text-navy-800 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700">
                {t("hero.ctaSecondary")}
                <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
              </Link>
            </div>

            <ul className="mt-9 grid gap-3 sm:grid-cols-1">
              {["hero.point1", "hero.point2", "hero.point3"].map((key) => (
                <li key={key} className="flex items-start gap-3 text-sm text-navy-600">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700">
                    <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                  </span>
                  {t(key)}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={120} className="relative">
            <div className="relative mx-auto max-w-xl">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border border-white/60 shadow-[0_40px_80px_-40px_rgb(11_37_69/0.45)] sm:aspect-[4/3] lg:aspect-[4/5]">
                <ImageWithFallback
                  src="/images/hero-dentist-patient.jpg"
                  alt={t("hero.imageAlt")}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                  objectPosition="center 35%"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-900/35 via-transparent to-transparent"
                  aria-hidden="true"
                />
              </div>

              <div className="absolute -bottom-6 start-2 max-w-[16rem] rounded-3xl border border-navy-100 bg-white/95 p-5 shadow-soft backdrop-blur sm:start-6">
                <div className="flex items-center gap-2 text-brand-600">
                  <CalendarCheck2 className="size-4" aria-hidden="true" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {t("hero.cardTitle")}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">
                  {t("hero.cardText")}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------- SERVICES */}
      <section className={section} aria-labelledby="home-services">
        <div className={container}>
          <Reveal>
            <SectionHeading
              id="home-services"
              eyebrow={t("home.services.eyebrow")}
              title={t("home.services.title")}
              subtitle={t("home.services.subtitle")}
              align="center"
            />
          </Reveal>

          {services.loading ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/5]" />
              ))}
            </div>
          ) : (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {serviceItems.map((service, index) => (
                <Reveal key={service.id} delay={(index % 3) * 90}>
                  <ServiceCard service={service} index={index} />
                </Reveal>
              ))}
            </div>
          )}

          <div className="mt-10 flex flex-col items-center gap-4">
            <Link href="/services" className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white px-6 py-3.5 text-sm font-bold text-navy-800 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700">
              {t("common.viewMore")}
              <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
            </Link>
            {isDemoContent ? (
              <p className="text-center text-xs text-navy-400">{t("booking.demoNotice")}</p>
            ) : null}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- ABOUT */}
      <section className="relative overflow-hidden bg-mist" aria-labelledby="home-about">
        <div className={`${container} grid items-center gap-12 lg:grid-cols-2 lg:gap-16`}>
          <Reveal className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-soft">
              <ImageWithFallback
                src="/images/clinic-interior-1.jpg"
                alt={t("home.about.imageAlt")}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -end-4 hidden aspect-[4/3] w-1/2 overflow-hidden rounded-3xl border-4 border-white shadow-soft sm:block lg:-end-10">
              <ImageWithFallback
                src="/images/clinic-interior-2.jpg"
                alt={t("home.about.imageAlt")}
                fill
                sizes="25vw"
                className="object-cover"
              />
            </div>
          </Reveal>

          <Reveal delay={100} className="py-4">
            <SectionHeading
              id="home-about"
              eyebrow={t("home.about.eyebrow")}
              title={t("home.about.title")}
            />
            <div className="mt-6 space-y-4">
              <p className="text-base leading-relaxed text-navy-500">{t("home.about.text1")}</p>
              <p className="text-base leading-relaxed text-navy-500">{t("home.about.text2")}</p>
            </div>
            <Link href="/about" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-brand-700 transition hover:text-brand-800">
              {t("home.about.link")}
              <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
            </Link>

            <dl className="mt-9 grid gap-4 sm:grid-cols-3">
              {["home.step1.title", "home.step3.title", "home.benefit4.title"].map((key, i) => (
                <div key={key} className={`${card} p-4`}>
                  <dt className="text-[0.7rem] font-bold uppercase tracking-wider text-brand-600">
                    0{i + 1}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-navy-800">{t(key)}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* -------------------------------------------------------- BENEFITS */}
      <section className={section} aria-labelledby="home-benefits">
        <div className={container}>
          <Reveal>
            <SectionHeading
              id="home-benefits"
              eyebrow={t("home.benefits.eyebrow")}
              title={t("home.benefits.title")}
              align="center"
            />
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map(({ key, Icon }, index) => (
              <Reveal key={key} delay={(index % 3) * 80}>
                <div className={`${card} h-full p-6 transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-soft sm:p-7`}>
                  <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-base font-bold text-navy-900">
                    {t(`${key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-500">
                    {t(`${key}.text`)}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- STEPS */}
      <section className="relative overflow-hidden bg-navy-900" aria-labelledby="home-steps">
        <div className="bg-dotted absolute inset-0 opacity-20" aria-hidden="true" />
        <div className={`${container} relative py-16 sm:py-20`}>
          <Reveal>
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-brand-200 ring-1 ring-white/15">
                {t("home.steps.eyebrow")}
              </span>
              <h2 id="home-steps" className="mt-5 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {t("home.steps.title")}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-navy-200">
                {t("home.steps.subtitle")}
              </p>
            </div>
          </Reveal>

          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((step, index) => (
              <Reveal
                as="li"
                key={step}
                delay={index * 90}
                className="relative h-full rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <span className="grid size-10 place-items-center rounded-2xl bg-brand-500 text-sm font-black text-white">
                  {step}
                </span>
                <h3 className="mt-4 text-base font-bold text-white">
                  {t(`home.step${step}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-200">
                  {t(`home.step${step}.text`)}
                </p>
              </Reveal>
            ))}
          </ol>

          <div className="mt-10 flex justify-center">
            <Link href="/appointment" className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-navy-900 transition hover:bg-brand-50">
              <CalendarDays className="size-4" aria-hidden="true" />
              {t("nav.appointment")}
            </Link>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- DOCTORS */}
      <section className={section} aria-labelledby="home-doctors">
        <div className={container}>
          <Reveal>
            <SectionHeading
              id="home-doctors"
              eyebrow={t("home.doctors.eyebrow")}
              title={t("home.doctors.title")}
              subtitle={t("home.doctors.subtitle")}
              align="center"
            />
          </Reveal>

          {doctors.loading ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[16/9]" />
              ))}
            </div>
          ) : doctorItems.length ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {doctorItems.slice(0, 4).map((doctor, index) => (
                <Reveal key={doctor.id} delay={index * 90}>
                  <DoctorCard doctor={doctor} services={services.data || []} />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="mt-10 text-center text-sm text-navy-500">{t("home.doctors.empty")}</p>
          )}
        </div>
      </section>

      {/* --------------------------------------------------------- CONTACT */}
      <section className="bg-mist" aria-labelledby="home-contact">
        <div className={`${container} grid gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:items-center`}>
          <Reveal>
            <SectionHeading
              id="home-contact"
              eyebrow={t("home.contact.eyebrow")}
              title={t("home.contact.title")}
              subtitle={t("home.contact.text")}
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="tel:+212659349160" className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-navy-800">
                <Phone className="size-4" aria-hidden="true" />
                {t("home.contact.call")}
              </a>
              <a href="mailto:ilyassdr60@gmail.com" className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white px-6 py-3.5 text-sm font-bold text-navy-800 transition hover:border-brand-300 hover:text-brand-700">
                <Mail className="size-4" aria-hidden="true" />
                {t("home.contact.write")}
              </a>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className={`${card} overflow-hidden`}>
              <div className="relative aspect-[16/8] bg-navy-50">
                <ImageWithFallback
                  src="/images/clinic-equipment.jpg"
                  alt={t("contact.mapAlt")}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-navy-900/35" aria-hidden="true" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <MapPin className="size-6 text-white" aria-hidden="true" />
                  <p className="text-sm font-bold text-white">{settings.data?.address}</p>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Hay+Andalos+Tiflet+Maroc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-navy-900 transition hover:bg-brand-50"
                  >
                    {t("contact.mapLink")}
                    <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
                  </a>
                </div>
              </div>

              <div className="p-6">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-navy-900">
                  <CalendarDays className="size-4 text-brand-600" aria-hidden="true" />
                  {t("home.contact.hoursTitle")}
                  {settings.isDemo ? <DemoBadge className="ms-auto" /> : null}
                </h3>
                {hours ? (
                  <dl className="mt-4 space-y-2 text-sm">
                    {DAY_ORDER.map((day) => {
                      const value = hours[day];
                      return (
                        <div key={day} className="flex items-baseline justify-between gap-4">
                          <dt className="text-navy-500">{t(DAY_KEYS[day])}</dt>
                          <dd className="font-semibold text-navy-800" dir="ltr">
                            {value?.open && value?.close
                              ? `${value.open} – ${value.close}`
                              : t("contact.closed")}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                ) : (
                  <p className="mt-4 text-sm text-navy-500">{t("home.contact.hoursMissing")}</p>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <CTABand />
    </>
  );
}
