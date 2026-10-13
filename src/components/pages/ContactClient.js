"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import Field from "@/components/ui/Field";
import Spinner from "@/components/ui/Spinner";
import DemoBadge from "@/components/ui/DemoBadge";
import CTABand from "@/components/site/CTABand";
import { useLanguage } from "@/context/LanguageContext";
import { DAY_KEYS } from "@/lib/i18n";
import { useContent } from "@/lib/content";
import { validateContactInput } from "@/lib/validation";
import { apiFetch, i18nErrorMessage } from "@/lib/api";
import { card, container, input as inputClass, inputError, section } from "@/lib/ui";

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Hay+Andalos+Tiflet+Maroc";

const SUBJECT_OPTIONS = [
  "contact.subjectOption1",
  "contact.subjectOption2",
  "contact.subjectOption3",
  "contact.subjectOption4",
];

const EMPTY = { name: "", email: "", phone: "", subject: "", message: "", website: "" };

export default function ContactClient() {
  const { t } = useLanguage();
  const settings = useContent("settings");
  const hours = settings.data?.openingHours || null;

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ state: "idle", error: null });
  const startedAt = useRef(Date.now());

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const set = (key) => (event) => {
    const value = event.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined, form: undefined }));
  };

  async function onSubmit(event) {
    event.preventDefault();
    if (status.state === "sending") return;

    const validation = validateContactInput({ ...form, fullName: form.name });
    const clientErrors = { ...validation.errors };
    if (!form.subject.trim()) clientErrors.subject = "form.error.invalid";
    if (Object.keys(clientErrors).length) {
      // On n'affiche que les erreurs du champ « nom » sous son propre label.
      setErrors({
        name: clientErrors.fullName,
        email: clientErrors.email,
        phone: clientErrors.phone,
        subject: clientErrors.subject,
        message: clientErrors.message,
      });
      setStatus({ state: "idle", error: null });
      return;
    }

    setStatus({ state: "sending", error: null });
    try {
      await apiFetch("/api/contact", {
        method: "POST",
        body: { ...form, consent: true, startedAt: startedAt.current },
        auth: false,
      });
      setForm(EMPTY);
      setErrors({});
      startedAt.current = Date.now();
      setStatus({ state: "success", error: null });
    } catch (error) {
      setStatus({ state: "error", error: i18nErrorMessage(error, t) });
    }
  }

  const contactCards = [
    {
      key: "contact.callUs",
      Icon: Phone,
      href: "tel:+212659349160",
      value: "+212 659 349 160",
      external: false,
    },
    {
      key: "contact.emailUs",
      Icon: Mail,
      href: "mailto:ilyassdr60@gmail.com",
      value: "ilyassdr60@gmail.com",
      external: false,
    },
    {
      key: "contact.addressUs",
      Icon: MapPin,
      href: MAPS_URL,
      value: settings.data?.address || t("brand.city"),
      external: true,
    },
  ];

  return (
    <>
      <PageHero eyebrow={t("brand.city")} title={t("contact.title")} intro={t("contact.intro")} />

      {/* --------------------------------------------------- Coordonnées */}
      <section className={section} aria-labelledby="contact-info">
        <div className={container}>
          <h2 id="contact-info" className="sr-only">
            {t("contact.title")}
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {contactCards.map(({ key, Icon, href, value, external }, index) => (
              <Reveal key={key} delay={index * 80}>
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={`${card} group flex h-full flex-col items-start gap-4 p-6 hover:-translate-y-1 hover:border-brand-200 hover:shadow-soft`}
                >
                  <span className="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-bold uppercase tracking-wider text-navy-900">
                    {t(key)}
                  </span>
                  <span className="text-sm font-medium text-navy-500 transition group-hover:text-brand-700" dir="ltr">
                    {value}
                  </span>
                </a>
              </Reveal>
            ))}
          </div>

          {/* Carte + horaires */}
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <Reveal>
              <div className={`${card} h-full overflow-hidden`}>
                <div className="relative aspect-[16/8] bg-navy-900">
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 30% 40%, rgb(37 99 235 / 0.55), transparent 55%), radial-gradient(circle at 75% 65%, rgb(45 212 191 / 0.45), transparent 50%)",
                    }}
                    aria-hidden="true"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                    <MapPin className="size-6 text-white" aria-hidden="true" />
                    <p className="text-sm font-bold text-white">
                      {settings.data?.address || t("brand.city")}
                    </p>
                    <a
                      href={MAPS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-navy-900 transition hover:bg-brand-50"
                    >
                      {t("contact.mapLink")}
                    </a>
                  </div>
                </div>
                <p className="px-6 py-4 text-xs text-navy-400">{t("contact.mapAlt")}</p>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className={`${card} h-full p-6 sm:p-7`}>
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-navy-900">
                  <Clock className="size-4 text-brand-600" aria-hidden="true" />
                  {t("contact.hoursUs")}
                  {settings.isDemo ? <DemoBadge className="ms-auto" /> : null}
                </h3>
                {hours ? (
                  <dl className="mt-5 space-y-2.5 text-sm">
                    {DAY_ORDER.map((day) => {
                      const value = hours[day];
                      return (
                        <div
                          key={day}
                          className="flex items-baseline justify-between gap-4 border-b border-navy-50 pb-2 last:border-0"
                        >
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
                  <p className="mt-4 text-sm text-navy-500">{t("contact.hoursMissing")}</p>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ Formulaire */}
      <section className="bg-mist" aria-labelledby="contact-form-title">
        <div className={`${container} grid gap-10 lg:grid-cols-2 lg:items-start`}>
          <Reveal>
            <SectionHeading
              id="contact-form-title"
              eyebrow={t("nav.contact")}
              title={t("contact.formTitle")}
              subtitle={t("contact.formIntro")}
            />
            <ul className="mt-8 space-y-3 text-sm text-navy-500">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
                {t("hero.point2")}
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
                {t("hero.point1")}
              </li>
            </ul>
          </Reveal>

          <Reveal delay={100}>
            <form onSubmit={onSubmit} noValidate className={`${card} space-y-5 p-6 sm:p-8`}>
              {/* Pot de miel anti-robots (invisible, jamais rempli par un humain) */}
              <div className="sr-only" aria-hidden="true">
                <label htmlFor="contact-website">Website</label>
                <input
                  id="contact-website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={set("website")}
                />
              </div>

              <Field id="contact-name" label={t("form.name")} error={errors.name && t(errors.name)} required>
                {({ invalid }) => (
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    className={`${inputClass} ${invalid ? inputError : ""}`}
                    value={form.name}
                    onChange={set("name")}
                  />
                )}
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="contact-email" label={t("form.email")} error={errors.email && t(errors.email)} required>
                  {({ invalid }) => (
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      dir="ltr"
                      className={`${inputClass} ${invalid ? inputError : ""}`}
                      value={form.email}
                      onChange={set("email")}
                    />
                  )}
                </Field>
                <Field id="contact-phone" label={t("form.phone")} error={errors.phone && t(errors.phone)} hint="06 12 34 56 78">
                  {({ invalid }) => (
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      dir="ltr"
                      className={`${inputClass} ${invalid ? inputError : ""}`}
                      value={form.phone}
                      onChange={set("phone")}
                    />
                  )}
                </Field>
              </div>

              <Field id="contact-subject" label={t("contact.subject")} error={errors.subject && t(errors.subject)} required>
                {({ invalid }) => (
                  <select
                    id="contact-subject"
                    name="subject"
                    className={`${inputClass} ${invalid ? inputError : ""}`}
                    value={form.subject}
                    onChange={set("subject")}
                  >
                    <option value="">{t("common.none")}</option>
                    {SUBJECT_OPTIONS.map((key) => (
                      <option key={key} value={t(key)}>
                        {t(key)}
                      </option>
                    ))}
                  </select>
                )}
              </Field>

              <Field
                id="contact-message"
                label={t("contact.message")}
                error={errors.message && t(errors.message)}
                required
              >
                {({ invalid }) => (
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    placeholder={t("contact.messagePlaceholder")}
                    className={`${inputClass} resize-y ${invalid ? inputError : ""}`}
                    value={form.message}
                    onChange={set("message")}
                  />
                )}
              </Field>

              {errors.form || status.error ? (
                <p role="alert" className={`${card} flex items-center gap-2 border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600`}>
                  <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                  {status.error || t(errors.form)}
                </p>
              ) : null}

              {status.state === "success" ? (
                <p role="status" className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
                  <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
                  {t("contact.success")}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={status.state === "sending"}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-7 py-4 text-sm font-bold text-white shadow-lift transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {status.state === "sending" ? (
                  <Spinner className="size-4 border-white/40 border-t-white" />
                ) : (
                  <Send className="size-4 rtl:-scale-x-100" aria-hidden="true" />
                )}
                {status.state === "sending" ? t("common.loading") : t("contact.send")}
              </button>
            </form>
          </Reveal>
        </div>
      </section>

      <CTABand />
    </>
  );
}
