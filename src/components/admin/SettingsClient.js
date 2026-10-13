"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Database, Save } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import DemoBadge from "@/components/ui/DemoBadge";
import { useLanguage } from "@/context/LanguageContext";
import { DAY_KEYS } from "@/lib/i18n";
import { apiFetch, i18nErrorMessage } from "@/lib/api";
import { input as inputClass, label as labelClass } from "@/lib/ui";
import {
  AdminPageHeader,
  ErrorBlock,
  LoadingBlock,
  Panel,
  useAdminData,
  useFlash,
} from "@/components/admin/shared";

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

const EMPTY = {
  clinicName: "",
  phone: "",
  email: "",
  address: "",
  addressAr: "",
  mapQuery: "",
  timeZone: "Africa/Casablanca",
  defaultLanguage: "fr",
  openingHours: {},
  booking: {
    pendingHoldHours: 48,
    maxAdvanceDays: 90,
    slotStepMinutes: 30,
    minNoticeMinutes: 60,
  },
  isDemo: false,
};

export default function SettingsClient() {
  const { t } = useLanguage();
  const { flash, show } = useFlash();
  const { data, loading, error, reload } = useAdminData(async (signal) =>
    apiFetch("/api/admin/settings", { signal })
  );

  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState(null);
  const [seedResult, setSeedResult] = useState(null);

  useEffect(() => {
    if (data?.settings) {
      setDraft({
        ...EMPTY,
        ...data.settings,
        booking: { ...EMPTY.booking, ...(data.settings.booking || {}) },
        openingHours: data.settings.openingHours || {},
      });
    }
  }, [data]);

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setFormError(null);
    try {
      await apiFetch("/api/admin/settings", { method: "POST", body: draft });
      show(t("admin.settings.saved"));
      reload();
    } catch (err) {
      const detail = Object.values(err.details || {})[0];
      setFormError(detail ? t(detail) : i18nErrorMessage(err, t));
    } finally {
      setBusy(false);
    }
  }

  async function seed() {
    setBusy(true);
    setFormError(null);
    try {
      const result = await apiFetch("/api/admin/seed", { method: "POST", body: {} });
      setSeedResult(result.created);
      show(t("admin.settings.seedDone"));
      reload();
    } catch (err) {
      setFormError(i18nErrorMessage(err, t));
    } finally {
      setBusy(false);
    }
  }

  if (loading || !draft) return <LoadingBlock />;
  if (error) return <ErrorBlock error={error} onRetry={reload} />;

  const setHour = (day, field, value) => {
    const current = draft.openingHours?.[day] || { open: "", close: "" };
    const next = { ...current, [field]: value };
    setDraft({
      ...draft,
      openingHours: {
        ...draft.openingHours,
        [day]: next.open || next.close ? next : null,
      },
    });
  };

  return (
    <>
      <AdminPageHeader
        title={t("admin.settings.title")}
        subtitle={t("admin.section")}
        actions={
          draft.isDemo ? <DemoBadge className="ms-2" /> : null
        }
      />

      {flash}
      {formError ? (
        <p
          role="alert"
          className="mb-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {formError}
        </p>
      ) : null}

      <form onSubmit={save} noValidate className="space-y-6">
        {/* Informations du cabinet */}
        <Panel>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-navy-900">
            {t("admin.settings.clinicInfo")}
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <label className={labelClass}>
              {t("brand.name")}
              <input
                type="text"
                value={draft.clinicName}
                onChange={(e) => setDraft({ ...draft, clinicName: e.target.value })}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className={labelClass}>
              {t("common.phone")}
              <input
                type="tel"
                dir="ltr"
                value={draft.phone}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className={labelClass}>
              {t("common.email")}
              <input
                type="email"
                dir="ltr"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className={labelClass}>
              {t("common.address")}
              <input
                type="text"
                value={draft.address}
                onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className={labelClass} dir="rtl">
              {t("common.address")} (AR)
              <input
                type="text"
                value={draft.addressAr}
                onChange={(e) => setDraft({ ...draft, addressAr: e.target.value })}
                className={`${inputClass} mt-1 text-end`}
              />
            </label>
            <label className={labelClass}>
              Fuseau horaire de recherche Google Maps
              <input
                type="text"
                dir="ltr"
                value={draft.mapQuery}
                onChange={(e) => setDraft({ ...draft, mapQuery: e.target.value })}
                placeholder="Hay Andalos Tiflet Maroc"
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className={labelClass}>
              {t("admin.settings.timezone")}
              <input
                type="text"
                dir="ltr"
                value={draft.timeZone}
                onChange={(e) => setDraft({ ...draft, timeZone: e.target.value })}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className={labelClass}>
              {t("admin.settings.language")}
              <select
                value={draft.defaultLanguage}
                onChange={(e) => setDraft({ ...draft, defaultLanguage: e.target.value })}
                className={`${inputClass} mt-1`}
              >
                <option value="fr">{t("lang.fr")}</option>
                <option value="ar">{t("lang.ar")}</option>
              </select>
              <span className="mt-1 block text-xs font-normal text-navy-400">
                {t("admin.settings.defaultLanguageHelp")}
              </span>
            </label>
          </div>
        </Panel>

        {/* Horaires */}
        <Panel>
          <h2 className="mb-1 text-sm font-bold uppercase tracking-wider text-navy-900">
            {t("admin.settings.hours")}
          </h2>
          <p className="mb-4 text-xs text-navy-400">{t("admin.settings.hoursHelp")}</p>
          <div className="space-y-2">
            {DAY_ORDER.map((day) => {
              const value = draft.openingHours?.[day] || { open: "", close: "" };
              const closed = !value.open && !value.close;
              return (
                <div
                  key={day}
                  className="flex flex-wrap items-center gap-3 rounded-2xl border border-navy-50 bg-mist/50 px-4 py-2.5"
                >
                  <span className="w-24 text-sm font-semibold text-navy-700">
                    {t(DAY_KEYS[day])}
                  </span>
                  <input
                    type="time"
                    dir="ltr"
                    value={value.open || ""}
                    onChange={(e) => setHour(day, "open", e.target.value)}
                    aria-label={`${t(DAY_KEYS[day])} ${t("admin.open")}`}
                    className={`${inputClass} w-auto`}
                  />
                  <span className="text-navy-400">→</span>
                  <input
                    type="time"
                    dir="ltr"
                    value={value.close || ""}
                    onChange={(e) => setHour(day, "close", e.target.value)}
                    aria-label={`${t(DAY_KEYS[day])} ${t("admin.closed")}`}
                    className={`${inputClass} w-auto`}
                  />
                  <label className="ms-auto flex items-center gap-2 text-xs font-semibold text-navy-500">
                    <input
                      type="checkbox"
                      checked={closed}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          openingHours: {
                            ...draft.openingHours,
                            [day]: e.target.checked
                              ? null
                              : { open: "09:00", close: "18:00" },
                          },
                        })
                      }
                      className="size-4 rounded border-navy-300 text-brand-600 focus:ring-brand-500"
                    />
                    {t("admin.closed")}
                  </label>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Politique de réservation */}
        <Panel>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-navy-900">
            {t("admin.settings.bookingPolicy")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className={labelClass}>
              {t("admin.settings.holdHours")}
              <input
                type="number"
                min={1}
                max={720}
                value={draft.booking.pendingHoldHours}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    booking: { ...draft.booking, pendingHoldHours: e.target.value },
                  })
                }
                className={`${inputClass} mt-1`}
              />
              <span className="mt-1 block text-xs font-normal text-navy-400">
                {t("admin.settings.holdHelp")}
              </span>
            </label>
            <label className={labelClass}>
              {t("admin.settings.maxDays")}
              <input
                type="number"
                min={1}
                max={365}
                value={draft.booking.maxAdvanceDays}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    booking: { ...draft.booking, maxAdvanceDays: e.target.value },
                  })
                }
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className={labelClass}>
              {t("admin.settings.slotStep")}
              <input
                type="number"
                min={5}
                max={240}
                step={5}
                value={draft.booking.slotStepMinutes}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    booking: { ...draft.booking, slotStepMinutes: e.target.value },
                  })
                }
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className={labelClass}>
              Délai minimum avant rendez-vous (min)
              <input
                type="number"
                min={0}
                max={1440}
                value={draft.booking.minNoticeMinutes}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    booking: { ...draft.booking, minNoticeMinutes: e.target.value },
                  })
                }
                className={`${inputClass} mt-1`}
              />
            </label>
          </div>
        </Panel>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-sm font-bold text-white shadow-lift transition hover:bg-brand-700 disabled:opacity-60"
          >
            {busy ? <Spinner className="size-4 border-white/40 border-t-white" /> : (
              <Save className="size-4" aria-hidden="true" />
            )}
            {t("admin.form.save")}
          </button>
        </div>
      </form>

      {/* Données de démonstration */}
      <Panel className="mt-6">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-navy-900">
          <Database className="size-4 text-brand-600" aria-hidden="true" />
          {t("admin.settings.seed")}
        </h2>
        <p className="mt-2 text-sm text-navy-500">{t("admin.settings.seedHelp")}</p>
        <button
          type="button"
          disabled={busy}
          onClick={seed}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white px-5 py-3 text-sm font-bold text-navy-800 transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-60"
        >
          {busy ? <Spinner className="size-4" /> : <Database className="size-4" aria-hidden="true" />}
          {t("admin.settings.seed")}
        </button>
        {seedResult ? (
          <p className="mt-3 text-xs text-emerald-600" dir="ltr">
            {JSON.stringify(seedResult)}
          </p>
        ) : null}
      </Panel>
    </>
  );
}
