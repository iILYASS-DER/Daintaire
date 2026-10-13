"use client";

import { useState } from "react";
import { AlertCircle, Clock, Pencil, Plus, Trash2, X } from "lucide-react";
import DemoBadge from "@/components/ui/DemoBadge";
import Spinner from "@/components/ui/Spinner";
import { useLanguage } from "@/context/LanguageContext";
import { DAY_KEYS } from "@/lib/i18n";
import { apiFetch, i18nErrorMessage } from "@/lib/api";
import { input as inputClass, label as labelClass } from "@/lib/ui";
import {
  AdminPageHeader,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  Panel,
  useAdminData,
  useFlash,
} from "@/components/admin/shared";

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

const EMPTY = {
  id: "",
  displayName: "",
  bioFr: "",
  bioAr: "",
  photoUrl: "",
  serviceIds: [],
  workingDays: [0, 1, 2, 3, 4, 5, 6],
  workingHours: { start: "09:00", end: "18:00" },
  breaks: [],
  unavailableDates: [],
  timeZone: "Africa/Casablanca",
  active: true,
  order: 0,
};

export default function DoctorsClient() {
  const { t } = useLanguage();
  const { flash, show } = useFlash();

  // Liste des soins depuis l'API admin (données réelles) : le formulaire
  // ne doit jamais proposer des soins de démonstration qui seraient ensuite
  // enregistrés comme identifiants inexistants dans Firestore.
  const servicesState = useAdminData(async (signal) =>
    apiFetch("/api/admin/services", { signal })
  );
  const { data, loading, error, reload } = useAdminData(async (signal) =>
    apiFetch("/api/admin/doctors", { signal })
  );
  const [editing, setEditing] = useState(null); // null | objet
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState(null);

  const doctors = data?.doctors || [];
  const services = servicesState.data?.services || [];

  async function save() {
    setBusy(true);
    setFormError(null);
    try {
      const payload = { ...editing };
      if (!payload.id) delete payload.id;
      await apiFetch("/api/admin/doctors", { method: "POST", body: payload });
      show(t("admin.doctors.saved"));
      setEditing(null);
      reload();
    } catch (err) {
      const detail = Object.values(err.details || {})[0];
      setFormError(detail ? t(detail) : i18nErrorMessage(err, t));
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!window.confirm(t("admin.doctors.confirmDelete"))) return;
    setBusy(true);
    try {
      await apiFetch(`/api/admin/doctors?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      show(t("admin.doctors.deleted"));
      reload();
    } catch (err) {
      setFormError(i18nErrorMessage(err, t));
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(doctor) {
    setBusy(true);
    try {
      await apiFetch("/api/admin/doctors", {
        method: "POST",
        body: { ...toForm(doctor), active: doctor.active === false },
      });
      show(t("admin.doctors.saved"));
      reload();
    } catch (err) {
      setFormError(i18nErrorMessage(err, t));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock error={error} onRetry={reload} />;

  return (
    <>
      <AdminPageHeader
        title={t("admin.doctors.title")}
        subtitle={t("admin.section")}
        actions={
          <button
            type="button"
            onClick={() => {
              setEditing({ ...EMPTY });
              setFormError(null);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            <Plus className="size-4" aria-hidden="true" />
            {t("admin.doctors.add")}
          </button>
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

      {editing ? (
        <Panel className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-navy-900">
              {editing.id ? t("admin.doctors.edit") : t("admin.doctors.add")}
            </h2>
            <button
              type="button"
              onClick={() => setEditing(null)}
              aria-label={t("common.close")}
              className="grid size-9 place-items-center rounded-xl text-navy-400 hover:bg-navy-50"
            >
              <X className="size-4" />
            </button>
          </div>

          <DoctorForm
            value={editing}
            onChange={setEditing}
            services={services}
            busy={busy}
            onSave={save}
            onCancel={() => setEditing(null)}
            t={t}
          />
        </Panel>
      ) : null}

      {doctors.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {doctors.map((doctor) => (
            <Panel key={doctor.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold text-navy-900">{doctor.displayName}</h2>
                    {doctor.isDemo ? <DemoBadge /> : null}
                    {doctor.active === false ? (
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[0.68rem] font-bold text-slate-500">
                        {t("common.inactive")}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-navy-500">
                    <Clock className="size-3.5" aria-hidden="true" />
                    <span dir="ltr">
                      {doctor.workingHours?.start} – {doctor.workingHours?.end}
                    </span>
                    · {(doctor.workingDays || []).map((d) => t(DAY_KEYS[d])).join(", ")}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(toForm(doctor));
                      setFormError(null);
                    }}
                    className="grid size-9 place-items-center rounded-xl border border-navy-100 text-navy-500 transition hover:border-brand-300 hover:text-brand-700"
                    aria-label={t("common.edit")}
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => remove(doctor.id)}
                    className="grid size-9 place-items-center rounded-xl border border-navy-100 text-navy-400 transition hover:border-red-200 hover:text-red-600 disabled:opacity-60"
                    aria-label={t("common.delete")}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {(doctor.serviceIds || []).map((id) => {
                  const service = services.find((s) => s.id === id);
                  return service ? (
                    <span
                      key={id}
                      className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-navy-600"
                    >
                      {service.nameFr}
                    </span>
                  ) : null;
                })}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => toggleActive(doctor)}
                  className="ms-auto rounded-full border border-navy-200 px-4 py-1.5 text-xs font-bold text-navy-600 transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-60"
                >
                  {doctor.active === false
                    ? t("admin.doctors.activate")
                    : t("admin.doctors.deactivate")}
                </button>
              </div>
            </Panel>
          ))}
        </div>
      ) : (
        <EmptyState text={t("admin.doctors.empty")} />
      )}
    </>
  );
}

/** Normalise un praticien reçu de l'API vers le brouillon du formulaire. */
function toForm(doctor) {
  return {
    id: doctor.id,
    displayName: doctor.displayName || "",
    bioFr: doctor.bioFr || "",
    bioAr: doctor.bioAr || "",
    photoUrl: doctor.photoUrl || "",
    serviceIds: Array.isArray(doctor.serviceIds) ? [...doctor.serviceIds] : [],
    workingDays: Array.isArray(doctor.workingDays)
      ? [...doctor.workingDays]
      : [0, 1, 2, 3, 4, 5, 6],
    workingHours: {
      start: doctor.workingHours?.start || "09:00",
      end: doctor.workingHours?.end || "18:00",
    },
    breaks: Array.isArray(doctor.breaks)
      ? doctor.breaks.map((b) => ({ start: b.start, end: b.end }))
      : [],
    unavailableDates: Array.isArray(doctor.unavailableDates)
      ? [...doctor.unavailableDates]
      : [],
    timeZone: doctor.timeZone || "Africa/Casablanca",
    active: doctor.active !== false,
    order: doctor.order ?? 0,
    isDemo: doctor.isDemo === true,
  };
}

function DoctorForm({ value, onChange, services, busy, onSave, onCancel, t }) {
  const [localError, setLocalError] = useState(null);
  const set = (patch) => onChange({ ...value, ...patch });

  function validate() {
    if (!value.displayName.trim() || value.displayName.trim().length < 2) {
      setLocalError(t("admin.doctors.nameRequired"));
      return false;
    }
    if (!value.workingHours.start || !value.workingHours.end) {
      setLocalError(t("admin.doctors.hoursInvalid"));
      return false;
    }
    setLocalError(null);
    return true;
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (validate()) onSave();
      }}
      className="space-y-5"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <label className={labelClass}>
          {t("admin.doctors.displayName")}
          <input
            type="text"
            value={value.displayName}
            onChange={(e) => set({ displayName: e.target.value })}
            placeholder={t("admin.doctors.displayNamePlaceholder")}
            className={`${inputClass} mt-1`}
          />
        </label>

        <label className={labelClass}>
          {t("admin.doctors.photoUrl")}
          <input
            type="text"
            dir="ltr"
            value={value.photoUrl}
            onChange={(e) => set({ photoUrl: e.target.value })}
            placeholder="/images/dentist-exam.jpg"
            className={`${inputClass} mt-1`}
          />
          <span className="mt-1 block text-xs font-normal text-navy-400">
            {t("admin.doctors.photoHelp")}
          </span>
        </label>

        <label className={labelClass}>
          {t("admin.doctors.bio")}
          <textarea
            rows={3}
            value={value.bioFr}
            onChange={(e) => set({ bioFr: e.target.value })}
            placeholder={t("admin.doctors.bioPlaceholder")}
            className={`${inputClass} mt-1 resize-y`}
          />
        </label>

        <label className={labelClass} dir="rtl">
          {t("admin.doctors.bio")} (AR)
          <textarea
            rows={3}
            value={value.bioAr}
            onChange={(e) => set({ bioAr: e.target.value })}
            className={`${inputClass} mt-1 resize-y`}
          />
        </label>
      </div>

      {/* Jours ouvrés */}
      <fieldset>
        <legend className={labelClass}>{t("admin.doctors.workingDays")}</legend>
        <div className="flex flex-wrap gap-2">
          {DAY_ORDER.map((day) => {
            const active = value.workingDays.includes(day);
            return (
              <button
                key={day}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  set({
                    workingDays: active
                      ? value.workingDays.filter((d) => d !== day)
                      : [...value.workingDays, day].sort(),
                  })
                }
                className={`rounded-full border px-4 py-2 text-xs font-bold transition ${
                  active
                    ? "border-brand-500 bg-brand-600 text-white"
                    : "border-navy-200 bg-white text-navy-500 hover:border-brand-300"
                }`}
              >
                {t(DAY_KEYS[day])}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className={labelClass}>
          {t("admin.doctors.hours")}
          <input
            type="time"
            dir="ltr"
            value={value.workingHours.start}
            onChange={(e) =>
              set({ workingHours: { ...value.workingHours, start: e.target.value } })
            }
            className={`${inputClass} mt-1`}
          />
        </label>
        <label className={labelClass}>
          {t("admin.open")} → {t("admin.closed")}
          <input
            type="time"
            dir="ltr"
            value={value.workingHours.end}
            onChange={(e) =>
              set({ workingHours: { ...value.workingHours, end: e.target.value } })
            }
            className={`${inputClass} mt-1`}
          />
        </label>
        <label className={labelClass}>
          {t("admin.doctors.timezone")}
          <input
            type="text"
            dir="ltr"
            value={value.timeZone}
            onChange={(e) => set({ timeZone: e.target.value })}
            className={`${inputClass} mt-1`}
          />
        </label>
      </div>

      {/* Pauses */}
      <fieldset>
        <legend className={labelClass}>{t("admin.doctors.breaks")}</legend>
        <div className="space-y-2">
          {value.breaks.map((brk, index) => (
            <div key={index} className="flex flex-wrap items-center gap-2">
              <input
                type="time"
                dir="ltr"
                value={brk.start}
                onChange={(e) => {
                  const breaks = [...value.breaks];
                  breaks[index] = { ...brk, start: e.target.value };
                  set({ breaks });
                }}
                className={`${inputClass} w-auto`}
              />
              <span className="text-navy-400">→</span>
              <input
                type="time"
                dir="ltr"
                value={brk.end}
                onChange={(e) => {
                  const breaks = [...value.breaks];
                  breaks[index] = { ...brk, end: e.target.value };
                  set({ breaks });
                }}
                className={`${inputClass} w-auto`}
              />
              <button
                type="button"
                onClick={() =>
                  set({ breaks: value.breaks.filter((_, i) => i !== index) })
                }
                className="text-xs font-bold text-red-500 hover:underline"
              >
                {t("common.delete")}
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => set({ breaks: [...value.breaks, { start: "13:00", end: "14:00" }] })}
            className="inline-flex items-center gap-1.5 rounded-full border border-navy-200 px-4 py-2 text-xs font-bold text-navy-600 transition hover:border-brand-300 hover:text-brand-700"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            {t("admin.doctors.addBreak")}
          </button>
        </div>
      </fieldset>

      {/* Dates indisponibles */}
      <label className={labelClass}>
        {t("admin.doctors.unavailableDates")}
        <input
          type="text"
          dir="ltr"
          value={value.unavailableDates.join(", ")}
          onChange={(e) =>
            set({
              unavailableDates: e.target.value
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean),
            })
          }
          placeholder="2026-11-01, 2026-12-25"
          className={`${inputClass} mt-1`}
        />
        <span className="mt-1 block text-xs font-normal text-navy-400">
          {t("admin.doctors.unavailableHelp")}
        </span>
      </label>

      {/* Soins */}
      <fieldset>
        <legend className={labelClass}>{t("admin.doctors.services")}</legend>
        <div className="flex flex-wrap gap-2">
          {services.map((service) => {
            const active = value.serviceIds.includes(service.id);
            return (
              <button
                key={service.id}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  set({
                    serviceIds: active
                      ? value.serviceIds.filter((id) => id !== service.id)
                      : [...value.serviceIds, service.id],
                  })
                }
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-200"
                    : "border-navy-200 bg-white text-navy-500 hover:border-brand-300"
                }`}
              >
                {service.nameFr}
              </button>
            );
          })}
          {!services.length ? (
            <span className="text-xs text-navy-400">{t("services.empty")}</span>
          ) : null}
        </div>
      </fieldset>

      {localError ? (
        <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
          <AlertCircle className="size-3.5" aria-hidden="true" />
          {localError}
        </p>
      ) : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {busy ? <Spinner className="size-4 border-white/40 border-t-white" /> : null}
          {t("admin.form.save")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-5 py-3 text-sm font-bold text-navy-400 hover:text-navy-700"
        >
          {t("admin.form.cancel")}
        </button>
      </div>
    </form>
  );
}
