"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Phone,
  Send,
  Stethoscope,
  UserRound,
} from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import Field from "@/components/ui/Field";
import Spinner from "@/components/ui/Spinner";
import Reveal from "@/components/ui/Reveal";
import DemoBadge from "@/components/ui/DemoBadge";
import { useLanguage } from "@/context/LanguageContext";
import { DAY_KEYS, localized } from "@/lib/i18n";
import { useContent } from "@/lib/content";
import { weekdayOf } from "@/lib/availability";
import { validateAppointmentInput } from "@/lib/validation";
import { apiFetch, i18nErrorMessage } from "@/lib/api";
import { card, container, input as inputClass, inputError, section } from "@/lib/ui";

const TOTAL_STEPS = 5;
const REQUEST_KEY_STORAGE = "cdi_request_key";

function makeRequestKey() {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* repli ci-dessous */
  }
  return `k-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function todayIso(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

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

const EMPTY_PATIENT = { fullName: "", phone: "", email: "", note: "" };

export default function BookingClient() {
  const { t, lang } = useLanguage();
  const searchParams = useSearchParams();
  const servicesState = useContent("services");
  const doctorsState = useContent("doctors");
  const settingsState = useContent("settings");

  const services = servicesState.data || [];
  const doctors = doctorsState.data || [];
  const settings = settingsState.data || null;

  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState("");
  const [doctorId, setDoctorId] = useState("any");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [patient, setPatient] = useState(EMPTY_PATIENT);
  const [errors, setErrors] = useState({});
  const [availability, setAvailability] = useState({ loading: false, slots: [], error: null });
  const [submit, setSubmit] = useState({ state: "idle", error: null, details: null, result: null });

  const startedAt = useRef(Date.now());
  const requestKey = useRef(null);
  if (requestKey.current === null) {
    requestKey.current = makeRequestKey();
  }

  // Le soin peut être pré-rempli depuis la page « Soins ».
  useEffect(() => {
    const preset = searchParams?.get("service");
    if (preset && services.some((s) => s.id === preset)) setServiceId(preset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const service = services.find((s) => s.id === serviceId) || null;
  const selectedDoctor = doctors.find((d) => d.id === doctorId) || null;

  /* --------------------------------------------------- disponibilités */
  const loadAvailability = useCallback(
    async (signal) => {
      // Validation stricte AVANT tout appel réseau : format AAAA-MM-JJ et
      // années raisonnables (le champ natif émet des valeurs à moitié
      // saisies pendant la frappe).
      if (!date) {
        setAvailability({ loading: false, slots: [], error: null, meta: null });
        return;
      }
      const year = Number(date.slice(0, 4));
      const thisYear = new Date().getFullYear();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || year < thisYear || year > thisYear + 2) {
        setAvailability({ loading: false, slots: [], error: t("form.error.dateInvalid"), meta: null });
        return;
      }

      setAvailability((a) => ({ ...a, loading: true, error: null }));
      try {
        const params = new URLSearchParams({ date });
        if (doctorId && doctorId !== "any") params.set("doctorId", doctorId);
        if (serviceId) params.set("serviceId", serviceId);
        const data = await apiFetch(`/api/availability?${params.toString()}`, {
          auth: false,
          signal,
        });
        if (signal?.aborted) return;
        if (data.validDate === false) {
          setAvailability({
            loading: false,
            slots: [],
            error: t("form.error.dateInvalid"),
            meta: data,
          });
        } else if (data.dateTooFar) {
          setAvailability({
            loading: false,
            slots: [],
            error: t("form.error.dateTooFar"),
            meta: data,
          });
        } else if (data.dateTooSoon) {
          setAvailability({
            loading: false,
            slots: [],
            error: t("form.error.datePast"),
            meta: data,
          });
        } else {
          setAvailability({ loading: false, slots: data.slots || [], error: null, meta: data });
        }
      } catch (error) {
        if (signal?.aborted || error?.name === "AbortError") return;
        setAvailability({ loading: false, slots: [], error: i18nErrorMessage(error, t) });
      }
    },
    [date, doctorId, serviceId, t]
  );

  // Anti-rebond (~400 ms) + nettoyage StrictMode : une seule requête par
  // changement, annulée si le composant se re-exécute ou change d'entrée.
  useEffect(() => {
    setTime("");
    if (!date) return undefined;
    const controller = new AbortController();
    const timer = setTimeout(() => loadAvailability(controller.signal), 400);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [loadAvailability, date]);

  /* ------------------------------------------------------------ étapes */
  function validateStep(current) {
    const next = {};
    if (current === 1 && !serviceId) next.serviceId = "form.error.serviceRequired";
    if (current === 2 && !doctorId) next.doctorId = "form.error.doctorRequired";
    if (current === 3) {
      if (!date) next.date = "form.error.dateRequired";
      else {
        const year = Number(date.slice(0, 4));
        const thisYear = new Date().getFullYear();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || year < thisYear || year > thisYear + 2) {
          next.date = "form.error.dateInvalid";
        } else if (!time) next.time = "form.error.slotRequired";
      }
    }
    if (current === 4) {
      const check = validateAppointmentInput(
        { ...patient, date: date || "", time: time || "", serviceId, doctorId },
        { requireEmail: false }
      );
      if (!check.valid) {
        // On n'affiche que les erreurs liées au patient à cette étape.
        for (const key of ["fullName", "phone", "email", "note"]) {
          if (check.errors[key]) next[key] = check.errors[key];
        }
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goNext() {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setErrors({});
    setStep((s) => Math.max(1, s - 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* --------------------------------------------------------- envoi */
  async function onSubmit(event) {
    event.preventDefault();
    // Aucun envoi possible tant que le récapitulatif (étape 5) n'est pas affiché.
    if (step < TOTAL_STEPS) return;
    if (submit.state === "sending") return;
    setSubmit({ state: "sending", error: null, details: null, result: null });
    try {
      const result = await apiFetch("/api/appointments", {
        method: "POST",
        auth: false,
        body: {
          serviceId,
          doctorId,
          date,
          time,
          ...patient,
          requestKey: requestKey.current,
          startedAt: startedAt.current,
        },
      });
      setSubmit({ state: "success", error: null, details: null, result });
    } catch (error) {
      const details = error.details || null;
      setSubmit({
        state: "error",
        error: i18nErrorMessage(error, t),
        details,
        result: null,
      });
      if (error.code === "slot_unavailable") {
        setStep(3);
        setTime("");
        loadAvailability();
      }
      if (error.details && error.details.fullName) setStep(4);
    }
  }

  function restart() {
    requestKey.current = makeRequestKey();
    startedAt.current = Date.now();
    setPatient(EMPTY_PATIENT);
    setTime("");
    setDate("");
    setErrors({});
    setSubmit({ state: "idle", error: null, details: null, result: null });
    setStep(1);
  }

  /* --------------------------------------------------------- rendu */
  const stepLabels = [1, 2, 3, 4, 5].map((n) => t(`booking.step${n}`));

  const quickDates = useMemo(() => {
    const out = [];
    for (let i = 1; i <= 10; i += 1) out.push(todayIso(i));
    return out;
  }, []);

  /**
   * Jour de fermeture du cabinet (horaires publiés) : les boutons de date
   * rapides sont désactivés pour éviter une recherche de créneau vouée à
   * l'échec. Le serveur reste l'autorité (il répond « aucun créneau »).
   */
  const isClosedDay = useCallback(
    (day) => {
      const hours = settings?.openingHours;
      if (!hours) return false;
      const weekday = weekdayOf(day);
      if (weekday === null) return false;
      const entry = hours[weekday];
      return !entry || !entry.open || !entry.close;
    },
    [settings]
  );

  if (submit.state === "success" && submit.result) {
    return <BookingSuccess result={submit.result} onRestart={restart} />;
  }

  return (
    <>
      <PageHero eyebrow={t("nav.appointment")} title={t("booking.title")} intro={t("booking.intro")}>
        <div className="mt-6 flex items-center justify-center gap-3 text-xs font-semibold text-navy-400">
          <span>{t("booking.step", { current: step, total: TOTAL_STEPS })}</span>
          {servicesState.isDemo || doctorsState.isDemo ? <DemoBadge /> : null}
        </div>
      </PageHero>

      <section className={section}>
        <div className={`${container} mx-auto max-w-3xl`}>
          {/* Barre d'étapes */}
          <ol className="mb-8 flex items-center gap-2 sm:gap-3" aria-label={t("booking.title")}>
            {stepLabels.map((label, index) => {
              const number = index + 1;
              const done = step > number;
              const active = step === number;
              return (
                <li key={label} className="flex flex-1 flex-col items-center gap-2">
                  <span
                    className={`grid size-9 place-items-center rounded-full text-xs font-black ring-2 transition ${
                      done
                        ? "bg-brand-600 text-white ring-brand-600"
                        : active
                          ? "bg-white text-brand-700 ring-brand-500"
                          : "bg-white text-navy-300 ring-navy-100"
                    }`}
                    aria-current={active ? "step" : undefined}
                  >
                    {done ? <Check className="size-4" strokeWidth={3} aria-hidden="true" /> : number}
                  </span>
                  <span
                    className={`hidden text-center text-[0.68rem] font-bold uppercase tracking-wide sm:block ${
                      active ? "text-brand-700" : "text-navy-400"
                    }`}
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>

          <form
            onSubmit={onSubmit}
            noValidate
            className={`${card} p-6 sm:p-8`}
            aria-live="polite"
          >
            {/* --------------------------------------------- Étape 1 */}
            {step === 1 ? (
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-navy-900">
                  <Stethoscope className="size-5 text-brand-600" aria-hidden="true" />
                  {t("booking.chooseService")}
                </h2>

                {servicesState.loading ? (
                  <div className="mt-5 grid gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-20 animate-pulse rounded-2xl bg-navy-100/70" />
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 grid gap-3">
                    {services.map((item) => {
                      const active = item.id === serviceId;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setServiceId(item.id);
                            setErrors({});
                          }}
                          className={`flex items-center justify-between gap-4 rounded-2xl border p-4 text-start transition ${
                            active
                              ? "border-brand-500 bg-brand-50 ring-2 ring-brand-200"
                              : "border-navy-100 bg-white hover:border-brand-200 hover:bg-brand-50/50"
                          }`}
                          aria-pressed={active}
                        >
                          <span className="min-w-0">
                            <span className="block text-sm font-bold text-navy-900">
                              {localized(item, "name", lang, item.nameFr || "")}
                            </span>
                            {item.durationMinutes ? (
                              <span className="mt-1 flex items-center gap-1.5 text-xs text-navy-400">
                                <Clock className="size-3.5" aria-hidden="true" />
                                {t("services.durationValue", { value: item.durationMinutes })}
                              </span>
                            ) : null}
                          </span>
                          <span
                            className={`grid size-6 shrink-0 place-items-center rounded-full ring-1 ${
                              active ? "bg-brand-600 text-white ring-brand-600" : "ring-navy-200"
                            }`}
                            aria-hidden="true"
                          >
                            {active ? <Check className="size-3.5" strokeWidth={3} /> : null}
                          </span>
                        </button>
                      );
                    })}
                    {!services.length ? (
                      <p className="text-sm text-navy-500">{t("services.empty")}</p>
                    ) : null}
                  </div>
                )}

                {errors.serviceId ? (
                  <p role="alert" className="mt-4 flex items-center gap-1.5 text-xs font-medium text-red-600">
                    <AlertCircle className="size-3.5" aria-hidden="true" />
                    {t(errors.serviceId)}
                  </p>
                ) : null}
              </div>
            ) : null}

            {/* --------------------------------------------- Étape 2 */}
            {step === 2 ? (
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-navy-900">
                  <UserRound className="size-5 text-brand-600" aria-hidden="true" />
                  {t("booking.chooseDoctor")}
                </h2>

                <div className="mt-5 grid gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDoctorId("any");
                      setErrors({});
                    }}
                    className={`flex items-center justify-between gap-4 rounded-2xl border p-4 text-start transition ${
                      doctorId === "any"
                        ? "border-brand-500 bg-brand-50 ring-2 ring-brand-200"
                        : "border-navy-100 bg-white hover:border-brand-200"
                    }`}
                    aria-pressed={doctorId === "any"}
                  >
                    <span>
                      <span className="block text-sm font-bold text-navy-900">
                        {t("booking.anyDoctor")}
                      </span>
                      <span className="mt-1 block text-xs text-navy-400">
                        {t("booking.anyDoctorDesc")}
                      </span>
                    </span>
                    <span
                      className={`grid size-6 shrink-0 place-items-center rounded-full ring-1 ${
                        doctorId === "any"
                          ? "bg-brand-600 text-white ring-brand-600"
                          : "ring-navy-200"
                      }`}
                      aria-hidden="true"
                    >
                      {doctorId === "any" ? <Check className="size-3.5" strokeWidth={3} /> : null}
                    </span>
                  </button>

                  {doctors.map((item) => {
                    const active = item.id === doctorId;
                    const initials = (item.displayName || "?")
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join("")
                      .toUpperCase();
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setDoctorId(item.id);
                          setErrors({});
                        }}
                        className={`flex items-center gap-4 rounded-2xl border p-4 text-start transition ${
                          active
                            ? "border-brand-500 bg-brand-50 ring-2 ring-brand-200"
                            : "border-navy-100 bg-white hover:border-brand-200"
                        }`}
                        aria-pressed={active}
                      >
                        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-navy-900 text-sm font-bold text-white">
                          {initials}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-navy-900">
                              {item.displayName}
                            </span>
                            {item.isDemo ? <DemoBadge /> : null}
                          </span>
                          {localized(item, "bio", lang, "") ? (
                            <span className="mt-1 line-clamp-2 block text-xs text-navy-400">
                              {localized(item, "bio", lang, "")}
                            </span>
                          ) : null}
                        </span>
                        <span
                          className={`grid size-6 shrink-0 place-items-center rounded-full ring-1 ${
                            active ? "bg-brand-600 text-white ring-brand-600" : "ring-navy-200"
                          }`}
                          aria-hidden="true"
                        >
                          {active ? <Check className="size-3.5" strokeWidth={3} /> : null}
                        </span>
                      </button>
                    );
                  })}
                  {!doctors.length && !doctorsState.loading ? (
                    <p className="text-sm text-navy-500">{t("home.doctors.empty")}</p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {/* --------------------------------------------- Étape 3 */}
            {step === 3 ? (
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-navy-900">
                  <CalendarDays className="size-5 text-brand-600" aria-hidden="true" />
                  {t("booking.chooseDate")}
                </h2>

                <div className="mt-5">
                  <Field
                    id="booking-date"
                    label={t("common.date")}
                    error={errors.date && t(errors.date)}
                    required
                  >
                    {({ invalid }) => (
                      <input
                        id="booking-date"
                        type="date"
                        dir="ltr"
                        min={todayIso(1)}
                        max={todayIso(90)}
                        value={date}
                        onChange={(e) => {
                          setDate(e.target.value);
                          setErrors({});
                        }}
                        className={`${inputClass} ${invalid ? inputError : ""}`}
                      />
                    )}
                  </Field>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {quickDates.map((day) => {
                      const closed = isClosedDay(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          disabled={closed}
                          aria-label={
                            closed
                              ? `${formatDate(day, lang)} — ${t("contact.closed")}`
                              : undefined
                          }
                          onClick={() => {
                            setDate(day);
                            setErrors({});
                          }}
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                            closed
                              ? "cursor-not-allowed border-navy-100 bg-navy-50 text-navy-300 line-through"
                              : date === day
                                ? "border-brand-500 bg-brand-600 text-white"
                                : "border-navy-100 bg-white text-navy-600 hover:border-brand-300 hover:text-brand-700"
                          }`}
                        >
                          {formatDate(day, lang).split(" ").slice(0, 2).join(" ")}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {date ? (
                  <div className="mt-7">
                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-navy-900">
                      <Clock className="size-4 text-brand-600" aria-hidden="true" />
                      {t("booking.chooseSlot")}
                    </h3>

                    {availability.loading ? (
                      <p className="mt-4 flex items-center gap-3 text-sm text-navy-500">
                        <Spinner className="size-4" />
                        {t("booking.availabilityLoading")}
                      </p>
                    ) : availability.error ? (
                      <p role="alert" className="mt-4 flex items-center gap-2 text-sm font-medium text-red-600">
                        <AlertCircle className="size-4" aria-hidden="true" />
                        {availability.error}
                      </p>
                    ) : availability.slots.length ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {availability.slots.map((slot) => {
                          const active = slot.time === time;
                          return (
                            <button
                              key={slot.time}
                              type="button"
                              dir="ltr"
                              onClick={() => {
                                setTime(slot.time);
                                setErrors({});
                              }}
                              aria-pressed={active}
                              className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
                                active
                                  ? "border-brand-500 bg-brand-600 text-white shadow-lift"
                                  : "border-navy-100 bg-white text-navy-700 hover:border-brand-300 hover:bg-brand-50"
                              }`}
                            >
                              {slot.time}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-4 flex items-center gap-2 text-sm text-navy-500">
                        <AlertCircle className="size-4 text-navy-400" aria-hidden="true" />
                        {t("booking.noSlot")}
                      </p>
                    )}
                  </div>
                ) : null}

                {errors.time ? (
                  <p role="alert" className="mt-4 flex items-center gap-1.5 text-xs font-medium text-red-600">
                    <AlertCircle className="size-3.5" aria-hidden="true" />
                    {t(errors.time)}
                  </p>
                ) : null}
              </div>
            ) : null}

            {/* --------------------------------------------- Étape 4 */}
            {step === 4 ? (
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-navy-900">
                  <UserRound className="size-5 text-brand-600" aria-hidden="true" />
                  {t("booking.yourInfo")}
                </h2>

                <div className="mt-5 space-y-5">
                  <Field
                    id="booking-name"
                    label={t("form.name")}
                    error={errors.fullName && t(errors.fullName)}
                    required
                  >
                    {({ invalid }) => (
                      <input
                        id="booking-name"
                        type="text"
                        autoComplete="name"
                        className={`${inputClass} ${invalid ? inputError : ""}`}
                        value={patient.fullName}
                        onChange={(e) => {
                          setPatient((p) => ({ ...p, fullName: e.target.value }));
                          setErrors((x) => ({ ...x, fullName: undefined }));
                        }}
                      />
                    )}
                  </Field>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      id="booking-phone"
                      label={t("form.phone")}
                      error={errors.phone && t(errors.phone)}
                      hint="06 12 34 56 78"
                      required
                    >
                      {({ invalid }) => (
                        <input
                          id="booking-phone"
                          type="tel"
                          dir="ltr"
                          autoComplete="tel"
                          className={`${inputClass} ${invalid ? inputError : ""}`}
                          value={patient.phone}
                          onChange={(e) => {
                            setPatient((p) => ({ ...p, phone: e.target.value }));
                            setErrors((x) => ({ ...x, phone: undefined }));
                          }}
                        />
                      )}
                    </Field>

                    <Field
                      id="booking-email"
                      label={`${t("form.email")} (${t("common.optional")})`}
                      error={errors.email && t(errors.email)}
                    >
                      {({ invalid }) => (
                        <input
                          id="booking-email"
                          type="email"
                          dir="ltr"
                          autoComplete="email"
                          className={`${inputClass} ${invalid ? inputError : ""}`}
                          value={patient.email}
                          onChange={(e) => {
                            setPatient((p) => ({ ...p, email: e.target.value }));
                            setErrors((x) => ({ ...x, email: undefined }));
                          }}
                        />
                      )}
                    </Field>
                  </div>

                  <Field
                    id="booking-note"
                    label={t("booking.noteLabel")}
                    error={errors.note && t(errors.note)}
                  >
                    {({ invalid }) => (
                      <textarea
                        id="booking-note"
                        rows={4}
                        placeholder={t("booking.notePlaceholder")}
                        className={`${inputClass} resize-y ${invalid ? inputError : ""}`}
                        value={patient.note}
                        onChange={(e) => {
                          setPatient((p) => ({ ...p, note: e.target.value }));
                          setErrors((x) => ({ ...x, note: undefined }));
                        }}
                      />
                    )}
                  </Field>
                </div>
              </div>
            ) : null}

            {/* --------------------------------------------- Étape 5 */}
            {step === 5 ? (
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-navy-900">
                  <CheckCircle2 className="size-5 text-brand-600" aria-hidden="true" />
                  {t("booking.review")}
                </h2>

                <dl className="mt-5 divide-y divide-navy-50 rounded-2xl border border-navy-100 bg-mist/60">
                  <ReviewRow
                    label={t("booking.reviewService")}
                    value={
                      service
                        ? localized(service, "name", lang, service.nameFr || "")
                        : "—"
                    }
                  />
                  <ReviewRow
                    label={t("booking.reviewDoctor")}
                    value={
                      doctorId === "any" || !selectedDoctor
                        ? t("booking.anyDoctor")
                        : selectedDoctor.displayName
                    }
                  />
                  <ReviewRow
                    label={t("booking.reviewDate")}
                    value={
                      <>
                        {formatDate(date, lang)} <span dir="ltr">{time}</span>
                      </>
                    }
                  />
                  <ReviewRow label={t("booking.reviewPatient")} value={patient.fullName} />
                  <ReviewRow
                    label={t("booking.reviewContact")}
                    value={
                      <>
                        <span dir="ltr">{patient.phone}</span>
                        {patient.email ? (
                          <span className="block text-xs text-navy-400" dir="ltr">
                            {patient.email}
                          </span>
                        ) : null}
                      </>
                    }
                  />
                  {patient.note ? (
                    <ReviewRow label={t("booking.reviewNote")} value={patient.note} />
                  ) : null}
                </dl>

                <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-xs leading-relaxed text-amber-800 ring-1 ring-amber-200">
                  {t("booking.successText")}
                </p>
              </div>
            ) : null}

            {/* --------------------------------------- erreurs serveur */}
            {submit.state === "error" ? (
              <p
                role="alert"
                className="mt-5 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>
                  {submit.error}
                  {submit.details?.time ? (
                    <span className="mt-1 block text-xs">{t(submit.details.time)}</span>
                  ) : null}
                </span>
              </p>
            ) : null}

            {/* -------------------------------------------- navigation */}
            <div className="mt-7 flex items-center justify-between gap-3">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white px-5 py-3 text-sm font-bold text-navy-700 transition hover:border-brand-300 hover:text-brand-700"
                >
                  <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
                  {t("common.previous")}
                </button>
              ) : (
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 rounded-full px-3 py-3 text-sm font-semibold text-navy-400 transition hover:text-brand-700"
                >
                  <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
                  {t("nav.services")}
                </Link>
              )}

              {step < TOTAL_STEPS ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-lift transition hover:bg-brand-700"
                >
                  {t("common.next")}
                  <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
                </button>
              ) : (
                <button
                  // type="button" volontaire : le bouton occupe la même place que
                  // « Suivant » et React le met à jour sur place. Avec type="submit",
                  // le clic réel déclencherait l'envoi du formulaire AVANT que
                  // l'utilisateur n'ait pu vérifier son récapitulatif (étape 5).
                  type="button"
                  onClick={onSubmit}
                  disabled={submit.state === "sending"}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-lift transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submit.state === "sending" ? (
                    <Spinner className="size-4 border-white/40 border-t-white" />
                  ) : (
                    <Send className="size-4 rtl:-scale-x-100" aria-hidden="true" />
                  )}
                  {submit.state === "sending" ? t("booking.sending") : t("booking.send")}
                </button>
              )}
            </div>
          </form>

          <p className="mt-6 text-center text-xs text-navy-400">
            {servicesState.isDemo || doctorsState.isDemo ? t("booking.demoNotice") : null}
          </p>
        </div>
      </section>
    </>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3.5">
      <dt className="text-sm text-navy-500">{label}</dt>
      <dd className="max-w-[60%] text-end text-sm font-semibold text-navy-900">{value}</dd>
    </div>
  );
}

function BookingSuccess({ result, onRestart }) {
  const { t, lang } = useLanguage();

  return (
    <section className={section}>
      <Reveal>
        <div className={`${container} mx-auto max-w-2xl`}>
          <div className={`${card} overflow-hidden text-center`}>
            <div className="bg-gradient-to-b from-brand-50 to-white px-6 pb-2 pt-10">
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand-600 text-white shadow-lift">
                <CheckCircle2 className="size-8" aria-hidden="true" />
              </span>
              <h1 className="mt-5 text-2xl font-bold text-navy-900 sm:text-3xl">
                {t("booking.successTitle")}
              </h1>
              <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 ring-1 ring-amber-200">
                <Clock className="size-3.5" aria-hidden="true" />
                {t("booking.pendingBadge")}
              </span>
            </div>

            <div className="px-6 py-8 text-start sm:px-10">
              <p className="text-sm leading-relaxed text-navy-500">{t("booking.successText")}</p>

              <div className="mt-6 rounded-3xl border border-brand-100 bg-brand-50 p-6 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                  {t("booking.referenceLabel")}
                </span>
                <p className="mt-2 font-mono text-3xl font-black tracking-[0.15em] text-navy-900" dir="ltr">
                  {result.reference}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-brand-700">
                  {t("booking.referenceHelp")}
                </p>
              </div>

              <dl className="mt-6 space-y-2.5 text-sm">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-navy-500">{t("booking.reviewDate")}</dt>
                  <dd className="font-semibold text-navy-900">
                    {formatDate(result.date, lang)}{" "}
                    <span dir="ltr">{result.start}</span>
                  </dd>
                </div>
                {result.doctorName ? (
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-navy-500">{t("common.doctor")}</dt>
                    <dd className="font-semibold text-navy-900">{result.doctorName}</dd>
                  </div>
                ) : null}
              </dl>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <a
                  href="tel:+212659349160"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-navy-900 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-navy-800"
                >
                  <Phone className="size-4" aria-hidden="true" />
                  {t("booking.callUs")}
                </a>
                <Link
                  href="/track"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-navy-200 bg-white px-6 py-3.5 text-sm font-bold text-navy-800 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                >
                  {t("nav.track")}
                  <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={onRestart}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                >
                  {t("booking.newRequest")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
