"use client";

import { useState } from "react";
import { AlertCircle, Pencil, Plus, Trash2, X } from "lucide-react";
import DemoBadge from "@/components/ui/DemoBadge";
import Spinner from "@/components/ui/Spinner";
import { useLanguage } from "@/context/LanguageContext";
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

/** Images réellement présentes dans /public/images (aucune URL inventée). */
const IMAGE_OPTIONS = [
  "/images/service-consultation.jpg",
  "/images/service-cleaning.jpg",
  "/images/service-treatment.jpg",
  "/images/service-orthodontics.jpg",
  "/images/service-crown.jpg",
  "/images/service-implant.jpg",
  "/images/service-root-canal.jpg",
  "/images/service-emergency.jpg",
  "/images/dentist-exam.jpg",
  "/images/clinic-equipment.jpg",
];

const EMPTY = {
  nameFr: "",
  nameAr: "",
  descFr: "",
  descAr: "",
  durationMinutes: 30,
  price: "",
  image: "",
  order: 0,
  active: true,
};

export default function ServicesClient() {
  const { t } = useLanguage();
  const { flash, show } = useFlash();
  const { data, loading, error, reload } = useAdminData(async (signal) =>
    apiFetch("/api/admin/services", { signal })
  );

  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState(null);

  const services = data?.services || [];

  async function save() {
    setBusy(true);
    setFormError(null);
    try {
      const payload = { ...editing };
      if (!payload.id) delete payload.id;
      await apiFetch("/api/admin/services", { method: "POST", body: payload });
      show(t("admin.services.saved"));
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
    if (!window.confirm(t("admin.services.confirmDelete"))) return;
    setBusy(true);
    try {
      await apiFetch(`/api/admin/services?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      show(t("admin.services.deleted"));
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
        title={t("admin.services.title")}
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
            {t("admin.services.add")}
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
              {editing.id ? t("admin.services.edit") : t("admin.services.add")}
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

          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              save();
            }}
            className="space-y-4"
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <label className={labelClass}>
                {t("admin.services.nameFr")} *
                <input
                  type="text"
                  value={editing.nameFr}
                  onChange={(e) => setEditing({ ...editing, nameFr: e.target.value })}
                  className={`${inputClass} mt-1`}
                />
              </label>
              <label className={labelClass} dir="rtl">
                {t("admin.services.nameAr")} *
                <input
                  type="text"
                  value={editing.nameAr}
                  onChange={(e) => setEditing({ ...editing, nameAr: e.target.value })}
                  className={`${inputClass} mt-1 text-end`}
                />
              </label>
              <label className={labelClass}>
                {t("admin.services.descFr")}
                <textarea
                  rows={3}
                  value={editing.descFr}
                  onChange={(e) => setEditing({ ...editing, descFr: e.target.value })}
                  className={`${inputClass} mt-1 resize-y`}
                />
              </label>
              <label className={labelClass} dir="rtl">
                {t("admin.services.descAr")}
                <textarea
                  rows={3}
                  value={editing.descAr}
                  onChange={(e) => setEditing({ ...editing, descAr: e.target.value })}
                  className={`${inputClass} mt-1 resize-y text-end`}
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className={labelClass}>
                {t("admin.services.durationMin")}
                <input
                  type="number"
                  min={5}
                  max={480}
                  step={5}
                  value={editing.durationMinutes}
                  onChange={(e) =>
                    setEditing({ ...editing, durationMinutes: e.target.value })
                  }
                  className={`${inputClass} mt-1`}
                />
              </label>
              <label className={labelClass}>
                {t("admin.services.price")}
                <input
                  type="number"
                  min={0}
                  value={editing.price}
                  onChange={(e) => setEditing({ ...editing, price: e.target.value })}
                  className={`${inputClass} mt-1`}
                />
                <span className="mt-1 block text-xs font-normal text-navy-400">
                  {t("admin.services.priceHelp")}
                </span>
              </label>
              <label className={labelClass}>
                {t("admin.services.order")}
                <input
                  type="number"
                  value={editing.order}
                  onChange={(e) => setEditing({ ...editing, order: e.target.value })}
                  className={`${inputClass} mt-1`}
                />
              </label>
            </div>

            <label className={labelClass}>
              {t("admin.services.image")}
              <select
                value={editing.image}
                onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                className={`${inputClass} mt-1`}
              >
                <option value="">—</option>
                {IMAGE_OPTIONS.map((path) => (
                  <option key={path} value={path}>
                    {path}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 text-sm font-semibold text-navy-700">
              <input
                type="checkbox"
                checked={editing.active !== false}
                onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                className="size-4 rounded border-navy-300 text-brand-600 focus:ring-brand-500"
              />
              {t("common.active")}
            </label>

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
                onClick={() => setEditing(null)}
                className="rounded-full px-5 py-3 text-sm font-bold text-navy-400 hover:text-navy-700"
              >
                {t("admin.form.cancel")}
              </button>
            </div>
          </form>
        </Panel>
      ) : null}

      {services.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {services.map((service) => (
            <Panel key={service.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold text-navy-900">{service.nameFr}</h2>
                    {service.isDemo ? <DemoBadge /> : null}
                    {service.active === false ? (
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[0.68rem] font-bold text-slate-500">
                        {t("common.inactive")}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-navy-500" dir="rtl">
                    {service.nameAr}
                  </p>
                  <p className="mt-2 text-sm text-navy-500">
                    {service.durationMinutes} {t("common.minutes")} ·{" "}
                    {service.price === null || service.price === undefined
                      ? t("services.priceOnRequest")
                      : `${service.price} MAD`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing({
                        ...EMPTY,
                        ...service,
                        price: service.price ?? "",
                      });
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
                    onClick={() => remove(service.id)}
                    className="grid size-9 place-items-center rounded-xl border border-navy-100 text-navy-400 transition hover:border-red-200 hover:text-red-600 disabled:opacity-60"
                    aria-label={t("common.delete")}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      ) : (
        <EmptyState text={t("admin.services.empty")} />
      )}
    </>
  );
}
