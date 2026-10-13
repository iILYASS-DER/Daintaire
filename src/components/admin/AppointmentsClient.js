"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarClock,
  Check,
  CheckCircle2,
  ClipboardList,
  Phone,
  Search,
  UserCog,
  X,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import Spinner from "@/components/ui/Spinner";
import DemoBadge from "@/components/ui/DemoBadge";
import { useLanguage } from "@/context/LanguageContext";
import { APPOINTMENT_STATUSES } from "@/lib/constants";
import { apiFetch, i18nErrorMessage } from "@/lib/api";
import { input as inputClass, subtleText } from "@/lib/ui";
import {
  AdminPageHeader,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  Panel,
  useAdminData,
  useFlash,
} from "@/components/admin/shared";

const STATUS_TONE = {
  pending: "border-l-amber-400",
  confirmed: "border-l-emerald-400",
  rejected: "border-l-red-400",
  cancelled: "border-l-slate-300",
  expired: "border-l-orange-400",
  completed: "border-l-brand-400",
  missed: "border-l-rose-400",
};

function formatDate(date, lang) {
  if (!date) return "";
  try {
    return new Intl.DateTimeFormat(lang === "ar" ? "ar-MA" : "fr-MA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(`${date}T12:00:00`));
  } catch {
    return date;
  }
}

export default function AppointmentsClient() {
  const { t, lang } = useLanguage();
  const { flash, show } = useFlash();

  const [filters, setFilters] = useState({
    status: "",
    search: "",
    doctorId: "",
    from: "",
    to: "",
  });
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params.toString();
  }, [filters]);

  const { data, loading, error: loadError, reload } = useAdminData(
    async (signal) => apiFetch(`/api/admin/appointments?${query}`, { signal }),
    [query]
  );

  // Liste des praticiens depuis l'API admin (données réelles, sans repli
  // démonstration) pour les filtres et la reprogrammation.
  const doctorsData = useAdminData(async (signal) =>
    apiFetch("/api/admin/doctors", { signal })
  );

  const appointments = data?.appointments || [];
  const doctors = doctorsData.data?.doctors || [];

  async function runAction(id, action, payload, messageKey) {
    setBusyId(id);
    setError(null);
    try {
      await apiFetch("/api/admin/appointments", {
        method: "POST",
        body: { id, action, payload },
      });
      show(t(messageKey));
      reload();
    } catch (err) {
      const details = err.details || {};
      const detailKey = Object.values(details)[0];
      setError(detailKey ? t(detailKey) : i18nErrorMessage(err, t));
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <LoadingBlock />;
  if (loadError) return <ErrorBlock error={loadError} onRetry={reload} />;

  return (
    <>
      <AdminPageHeader title={t("admin.appt.title")} subtitle={t("admin.section")} />

      {/* Filtres */}
      <Panel className="mb-6">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search
              className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-navy-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              placeholder={t("admin.appt.searchPlaceholder")}
              aria-label={t("common.search")}
              className={`${inputClass} ps-9`}
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            aria-label={t("admin.appt.filterStatus")}
            className={inputClass}
          >
            <option value="">{t("status.any")}</option>
            {APPOINTMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {t(`status.${status}`)}
              </option>
            ))}
          </select>

          <select
            value={filters.doctorId}
            onChange={(e) => setFilters((f) => ({ ...f, doctorId: e.target.value }))}
            aria-label={t("admin.appt.filterDoctor")}
            className={inputClass}
          >
            <option value="">{t("common.all")}</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.displayName}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={filters.from}
            onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
            aria-label={t("admin.appt.filterDate")}
            dir="ltr"
            className={inputClass}
          />
        </div>
        {(filters.search || filters.status || filters.doctorId || filters.from) && (
          <button
            type="button"
            onClick={() => setFilters({ status: "", search: "", doctorId: "", from: "", to: "" })}
            className="mt-3 text-xs font-semibold text-brand-700 hover:underline"
          >
            {t("common.all")}
          </button>
        )}
      </Panel>

      {flash}
      {error ? (
        <p
          role="alert"
          className="mb-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}

      {appointments.length ? (
        <ul className="space-y-4">
          {appointments.map((item) => (
            <li key={item.id}>
              <AppointmentRow
                item={item}
                lang={lang}
                doctors={doctors}
                busy={busyId === item.id}
                expanded={expanded === item.id}
                onToggle={() => setExpanded((current) => (current === item.id ? null : item.id))}
                onAction={runAction}
                t={t}
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState text={t("admin.appt.empty")} icon={ClipboardList} />
      )}
    </>
  );
}

function AppointmentRow({
  item,
  lang,
  doctors,
  busy,
  expanded,
  onToggle,
  onAction,
  t,
}) {
  const [mode, setMode] = useState(null); // 'reschedule' | 'notes'
  const [draft, setDraft] = useState({
    date: item.date,
    time: item.start,
    doctorId: item.doctorId,
    internalNotes: item.internalNotes || "",
  });
  const [formError, setFormError] = useState(null);

  const status = item.status;
  const isPending = status === "pending";
  const isOpen = status === "pending" || status === "confirmed";

  async function submitDraft() {
    setFormError(null);
    if (mode === "notes") {
      await onAction(item.id, "notes", { internalNotes: draft.internalNotes }, "admin.appt.updated");
      setMode(null);
      return;
    }
    if (!draft.date || !draft.time) {
      setFormError(t("form.error.dateRequired"));
      return;
    }
    await onAction(item.id, mode === "assign" ? "assign" : "reschedule", {
      date: draft.date,
      time: draft.time,
      doctorId: draft.doctorId,
    }, "admin.appt.updated");
    setMode(null);
  }

  return (
    <article
      className={`overflow-hidden rounded-3xl border border-navy-100 border-s-4 bg-white shadow-card ${STATUS_TONE[status] || "border-l-navy-200"}`}
    >
      <div className="flex flex-wrap items-start gap-4 p-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-navy-900">{item.patientName}</h2>
            <StatusBadge status={status} />
            {item.isDemo ? <DemoBadge /> : null}
          </div>
          <p className="mt-1 text-sm text-navy-500">
            {formatDate(item.date, lang)}{" "}
            <span dir="ltr" className="font-semibold text-navy-700">
              {item.start} – {item.end}
            </span>{" "}
            · {item.doctorName} · {item.serviceNameFr}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-navy-400">
            <span className="font-mono" dir="ltr">
              {t("admin.appt.reference")}: {item.reference}
            </span>
            <a
              href={`tel:${String(item.patientPhone || "").replace(/\s/g, "")}`}
              className="inline-flex items-center gap-1 text-brand-700 hover:underline"
              dir="ltr"
            >
              <Phone className="size-3" aria-hidden="true" />
              {item.patientPhone}
            </a>
            {item.patientEmail ? (
              <span dir="ltr">{item.patientEmail}</span>
            ) : null}
          </p>
          {item.note ? (
            <p className={`${subtleText} mt-2 rounded-xl bg-mist px-3 py-2`}>{item.note}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isPending ? (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => onAction(item.id, "approve", {}, "admin.appt.approved")}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
              >
                {busy ? <Spinner className="size-3.5 border-white/40 border-t-white" /> : <Check className="size-3.5" />}
                {t("admin.appt.approve")}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => onAction(item.id, "reject", {}, "admin.appt.rejected")}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
              >
                <X className="size-3.5" aria-hidden="true" />
                {t("admin.appt.reject")}
              </button>
            </>
          ) : null}

          {status === "confirmed" ? (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => onAction(item.id, "complete", {}, "admin.appt.updated")}
                className="inline-flex items-center gap-1.5 rounded-full border border-navy-200 bg-white px-4 py-2 text-xs font-bold text-navy-700 transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-60"
              >
                <CheckCircle2 className="size-3.5" aria-hidden="true" />
                {t("admin.appt.complete")}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => onAction(item.id, "cancel", {}, "admin.appt.updated")}
                className="inline-flex items-center gap-1.5 rounded-full border border-navy-200 bg-white px-4 py-2 text-xs font-bold text-navy-500 transition hover:border-red-200 hover:text-red-600 disabled:opacity-60"
              >
                {t("admin.appt.cancel")}
              </button>
            </>
          ) : null}

          {isOpen ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "reschedule" ? null : "reschedule");
                  setFormError(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-navy-200 bg-white px-4 py-2 text-xs font-bold text-navy-700 transition hover:border-brand-300 hover:text-brand-700"
              >
                <CalendarClock className="size-3.5" aria-hidden="true" />
                {t("admin.appt.reschedule")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "assign" ? null : "assign");
                  setFormError(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-navy-200 bg-white px-4 py-2 text-xs font-bold text-navy-700 transition hover:border-brand-300 hover:text-brand-700"
              >
                <UserCog className="size-3.5" aria-hidden="true" />
                {t("admin.appt.reassign")}
              </button>
            </>
          ) : null}

          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            className="rounded-full px-3 py-2 text-xs font-bold text-navy-400 transition hover:text-brand-700"
          >
            {expanded ? t("common.close") : t("admin.appt.note")}
          </button>
        </div>
      </div>

      {/* Détails dépliables */}
      {expanded ? (
        <div className="border-t border-navy-50 bg-mist/50 px-5 py-4">
          <dl className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="font-bold uppercase tracking-wide text-navy-400">
                {t("admin.appt.created")}
              </dt>
              <dd className="mt-1 text-navy-700">
                {item.createdAtMs
                  ? new Date(item.createdAtMs).toLocaleString(lang === "ar" ? "ar-MA" : "fr-MA")
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="font-bold uppercase tracking-wide text-navy-400">
                {t("common.duration")}
              </dt>
              <dd className="mt-1 text-navy-700">{item.durationMinutes} min</dd>
            </div>
            <div>
              <dt className="font-bold uppercase tracking-wide text-navy-400">
                {t("admin.appt.internalNotes")}
              </dt>
              <dd className="mt-1 text-navy-700">{item.internalNotes || "—"}</dd>
            </div>
          </dl>

          {Array.isArray(item.statusHistory) && item.statusHistory.length ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {item.statusHistory.slice(-6).map((entry, index) => (
                <li
                  key={`${entry.status}-${index}`}
                  className="rounded-full bg-white px-3 py-1 text-[0.68rem] font-semibold text-navy-500 ring-1 ring-navy-100"
                >
                  {t(`status.${entry.status}`)} · {new Date(entry.at).toLocaleTimeString("fr-MA")}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {/* Formulaire de report / réaffectation / notes */}
      {mode ? (
        <div className="border-t border-navy-50 bg-white px-5 py-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {mode !== "notes" ? (
              <>
                <label className="text-xs font-bold text-navy-600">
                  {t("common.date")}
                  <input
                    type="date"
                    dir="ltr"
                    value={draft.date}
                    onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
                    className={`${inputClass} mt-1`}
                  />
                </label>
                <label className="text-xs font-bold text-navy-600">
                  {t("common.time")}
                  <input
                    type="time"
                    dir="ltr"
                    value={draft.time}
                    onChange={(e) => setDraft((d) => ({ ...d, time: e.target.value }))}
                    className={`${inputClass} mt-1`}
                  />
                </label>
                <label className="text-xs font-bold text-navy-600">
                  {t("common.doctor")}
                  <select
                    value={draft.doctorId}
                    onChange={(e) => setDraft((d) => ({ ...d, doctorId: e.target.value }))}
                    className={`${inputClass} mt-1`}
                  >
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.displayName}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            ) : (
              <label className="text-xs font-bold text-navy-600 sm:col-span-3">
                {t("admin.appt.internalNotes")}
                <textarea
                  rows={3}
                  value={draft.internalNotes}
                  placeholder={t("admin.appt.notesPlaceholder")}
                  onChange={(e) => setDraft((d) => ({ ...d, internalNotes: e.target.value }))}
                  className={`${inputClass} mt-1 resize-y`}
                />
              </label>
            )}
          </div>

          {formError ? (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
              <AlertCircle className="size-3.5" aria-hidden="true" />
              {formError}
            </p>
          ) : null}

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => submitDraft()}
              className="inline-flex items-center gap-1.5 rounded-full bg-navy-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-navy-800 disabled:opacity-60"
            >
              {busy ? <Spinner className="size-3.5 border-white/40 border-t-white" /> : null}
              {t("common.save")}
            </button>
            <button
              type="button"
              onClick={() => setMode(null)}
              className="rounded-full px-4 py-2 text-xs font-bold text-navy-400 hover:text-navy-700"
            >
              {t("common.cancel")}
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
