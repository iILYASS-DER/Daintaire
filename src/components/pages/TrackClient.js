"use client";

import { useState } from "react";
import { AlertCircle, CalendarDays, ClipboardList, Search } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import Field from "@/components/ui/Field";
import Spinner from "@/components/ui/Spinner";
import StatusBadge from "@/components/ui/StatusBadge";
import Reveal from "@/components/ui/Reveal";
import { useLanguage } from "@/context/LanguageContext";
import { apiFetch, i18nErrorMessage } from "@/lib/api";
import { card, container, input as inputClass, inputError, section } from "@/lib/ui";

function formatDate(date, lang) {
  if (!date) return "";
  try {
    return new Intl.DateTimeFormat(lang === "ar" ? "ar-MA" : "fr-MA", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(`${date}T12:00:00`));
  } catch {
    return date;
  }
}

export default function TrackClient() {
  const { t, lang } = useLanguage();
  const [reference, setReference] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ state: "idle", error: null, data: null });

  async function onSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!reference.trim()) nextErrors.reference = "form.error.invalid";
    if (!phone.trim()) nextErrors.phone = "form.error.phoneInvalid";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setStatus({ state: "loading", error: null, data: null });
    try {
      const data = await apiFetch("/api/appointments/status", {
        method: "POST",
        body: { reference: reference.trim(), phone: phone.trim() },
        auth: false,
      });
      setStatus({ state: "success", error: null, data });
    } catch (error) {
      setStatus({ state: "error", error: i18nErrorMessage(error, t), data: null });
    }
  }

  const result = status.data;

  return (
    <>
      <PageHero eyebrow={t("nav.track")} title={t("track.title")} intro={t("track.intro")} />

      <section className={section}>
        <div className={`${container} grid gap-10 lg:grid-cols-2 lg:items-start`}>
          <Reveal>
            <form onSubmit={onSubmit} noValidate className={`${card} space-y-5 p-6 sm:p-8`}>
              <h2 className="flex items-center gap-2 text-lg font-bold text-navy-900">
                <ClipboardList className="size-5 text-brand-600" aria-hidden="true" />
                {t("track.check")}
              </h2>

              <Field
                id="track-reference"
                label={t("track.reference")}
                error={errors.reference && t(errors.reference)}
                hint={t("track.referencePlaceholder")}
                required
              >
                {({ invalid }) => (
                  <input
                    id="track-reference"
                    type="text"
                    dir="ltr"
                    placeholder="CDI-XXXXXX"
                    autoComplete="off"
                    className={`${inputClass} font-mono uppercase tracking-widest ${
                      invalid ? inputError : ""
                    }`}
                    value={reference}
                    onChange={(e) => {
                      setReference(e.target.value);
                      setErrors((x) => ({ ...x, reference: undefined }));
                    }}
                  />
                )}
              </Field>

              <Field
                id="track-phone"
                label={t("form.phone")}
                error={errors.phone && t(errors.phone)}
                hint={t("track.hint")}
                required
              >
                {({ invalid }) => (
                  <input
                    id="track-phone"
                    type="tel"
                    dir="ltr"
                    placeholder="06 12 34 56 78"
                    autoComplete="tel"
                    className={`${inputClass} ${invalid ? inputError : ""}`}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setErrors((x) => ({ ...x, phone: undefined }));
                    }}
                  />
                )}
              </Field>

              {status.state === "error" ? (
                <p role="alert" className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
                  <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                  {status.error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={status.state === "loading"}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-7 py-4 text-sm font-bold text-white shadow-lift transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status.state === "loading" ? (
                  <Spinner className="size-4 border-white/40 border-t-white" />
                ) : (
                  <Search className="size-4 rtl:-scale-x-100" aria-hidden="true" />
                )}
                {t("track.check")}
              </button>
            </form>
          </Reveal>

          <Reveal delay={100}>
            {result ? (
              <div className={`${card} p-6 sm:p-8`} aria-live="polite">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-navy-900">{t("track.resultTitle")}</h2>
                  <StatusBadge status={result.status} />
                </div>

                <dl className="mt-6 space-y-3 text-sm">
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-navy-500">{t("track.reference")}</dt>
                    <dd className="font-mono font-bold text-navy-900" dir="ltr">
                      {result.reference}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-navy-500">{t("common.service")}</dt>
                    <dd className="font-semibold text-navy-800">
                      {lang === "ar" ? result.serviceNameAr || result.serviceNameFr : result.serviceNameFr}
                    </dd>
                  </div>
                  {result.doctorName ? (
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="text-navy-500">{t("common.doctor")}</dt>
                      <dd className="font-semibold text-navy-800">{result.doctorName}</dd>
                    </div>
                  ) : null}
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-navy-500">{t("booking.reviewDate")}</dt>
                    <dd className="font-semibold text-navy-800">
                      {formatDate(result.date, lang)}{" "}
                      <span dir="ltr">{result.start}</span>
                    </dd>
                  </div>
                </dl>

                <p className="mt-6 rounded-2xl bg-brand-50 p-4 text-sm leading-relaxed text-brand-800 ring-1 ring-brand-100">
                  {t(`track.next${result.status.charAt(0).toUpperCase()}${result.status.slice(1)}`) ||
                    t("track.nextStep")}
                </p>
              </div>
            ) : (
              <div className={`${card} flex h-full flex-col items-center justify-center gap-4 p-10 text-center`}>
                <span className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                  <CalendarDays className="size-6" aria-hidden="true" />
                </span>
                <p className="max-w-sm text-sm leading-relaxed text-navy-500">
                  {t("track.intro")}
                </p>
              </div>
            )}
          </Reveal>
        </div>
      </section>
    </>
  );
}
