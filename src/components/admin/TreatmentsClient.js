"use client";

import { useState } from "react";
import {
  AlertCircle,
  CalendarPlus,
  CheckCircle2,
  ClipboardList,
  Plus,
  Trash2,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import Spinner from "@/components/ui/Spinner";
import { useLanguage } from "@/context/LanguageContext";
import { apiFetch, i18nErrorMessage } from "@/lib/api";
import { input as inputClass, label as labelClass, subtleText } from "@/lib/ui";
import {
  AdminPageHeader,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  Panel,
  useAdminData,
  useFlash,
} from "@/components/admin/shared";

const EMPTY_PLAN = { title: "", patientName: "", patientPhone: "", patientEmail: "", internalNote: "" };
const EMPTY_SESSION = {
  number: 1,
  date: "",
  time: "09:00",
  serviceId: "",
  doctorId: "",
  status: "planned",
  note: "",
};

export default function TreatmentsClient() {
  const { t } = useLanguage();
  const { flash, show } = useFlash();

  // Soins et praticiens via les API admin (données réelles) : les formulaires
  // de plan de soin ne doivent référencer que des identifiants existants.
  const servicesState = useAdminData(async (signal) =>
    apiFetch("/api/admin/services", { signal })
  );
  const doctorsState = useAdminData(async (signal) =>
    apiFetch("/api/admin/doctors", { signal })
  );

  const { data, loading, error, reload } = useAdminData(async (signal) =>
    apiFetch("/api/admin/treatments", { signal })
  );

  const [selected, setSelected] = useState(null);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [planDraft, setPlanDraft] = useState(EMPTY_PLAN);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [sessionDraft, setSessionDraft] = useState(EMPTY_SESSION);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState(null);
  const [rescheduling, setRescheduling] = useState(null);
  const [rescheduleDraft, setRescheduleDraft] = useState({ date: "", time: "09:00", status: "scheduled" });

  const plans = data?.plans || [];
  const sessions = data?.sessions || [];
  const services = servicesState.data?.services || [];
  const doctors = doctorsState.data?.doctors || [];

  const activePlan = plans.find((p) => p.id === selected) || null;
  const planSessions = sessions
    .filter((s) => s.planId === selected)
    .sort((a, b) => (a.number || 0) - (b.number || 0));

  async function run(kind, body, messageKey) {
    setBusy(true);
    setFormError(null);
    try {
      await apiFetch("/api/admin/treatments", { method: "POST", body: { kind, ...body } });
      show(t(messageKey));
      reload();
      return true;
    } catch (err) {
      const detail = Object.values(err.details || {})[0];
      setFormError(detail ? t(detail) : i18nErrorMessage(err, t));
      return false;
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock error={error} onRetry={reload} />;

  return (
    <>
      <AdminPageHeader
        title={t("admin.treatments.title")}
        subtitle={t("admin.treatments.noMedicalNote")}
        actions={
          <button
            type="button"
            onClick={() => {
              setShowPlanForm((v) => !v);
              setFormError(null);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            <Plus className="size-4" aria-hidden="true" />
            {t("admin.treatments.newPlan")}
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

      {showPlanForm ? (
        <Panel className="mb-6">
          <h2 className="mb-4 text-lg font-bold text-navy-900">{t("admin.treatments.newPlan")}</h2>
          <form
            noValidate
            className="grid gap-4 lg:grid-cols-2"
            onSubmit={async (event) => {
              event.preventDefault();
              const ok = await run("plan.create", { input: planDraft }, "admin.treatments.planSaved");
              if (ok) {
                setPlanDraft(EMPTY_PLAN);
                setShowPlanForm(false);
              }
            }}
          >
            <label className={labelClass}>
              {t("admin.treatments.planLabel")}
              <input
                type="text"
                value={planDraft.title}
                onChange={(e) => setPlanDraft({ ...planDraft, title: e.target.value })}
                placeholder={t("admin.treatments.planLabelPlaceholder")}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className={labelClass}>
              {t("admin.treatments.patientName")}
              <input
                type="text"
                value={planDraft.patientName}
                onChange={(e) => setPlanDraft({ ...planDraft, patientName: e.target.value })}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className={labelClass}>
              {t("admin.treatments.patientContact")}
              <input
                type="tel"
                dir="ltr"
                value={planDraft.patientPhone}
                onChange={(e) => setPlanDraft({ ...planDraft, patientPhone: e.target.value })}
                placeholder="06 12 34 56 78"
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className={labelClass}>
              {t("common.email")} ({t("common.optional")})
              <input
                type="email"
                dir="ltr"
                value={planDraft.patientEmail}
                onChange={(e) => setPlanDraft({ ...planDraft, patientEmail: e.target.value })}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className={`${labelClass} lg:col-span-2`}>
              {t("admin.treatments.planNote")}
              <textarea
                rows={3}
                value={planDraft.internalNote}
                onChange={(e) => setPlanDraft({ ...planDraft, internalNote: e.target.value })}
                className={`${inputClass} mt-1 resize-y`}
              />
            </label>
            <div className="flex gap-3 lg:col-span-2">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
              >
                {busy ? <Spinner className="size-4 border-white/40 border-t-white" /> : null}
                {t("common.create")}
              </button>
              <button
                type="button"
                onClick={() => setShowPlanForm(false)}
                className="rounded-full px-5 py-3 text-sm font-bold text-navy-400 hover:text-navy-700"
              >
                {t("admin.form.cancel")}
              </button>
            </div>
          </form>
        </Panel>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_1fr]">
        {/* Liste des plans */}
        <Panel>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-navy-900">
            {t("admin.treatments.planLabel")}
          </h2>
          {plans.length ? (
            <ul className="space-y-2">
              {plans.map((plan) => {
                const done = sessions.filter(
                  (s) => s.planId === plan.id && s.status === "completed"
                ).length;
                const total = sessions.filter((s) => s.planId === plan.id).length;
                const active = plan.id === selected;
                return (
                  <li key={plan.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(plan.id);
                        setShowSessionForm(false);
                      }}
                      className={`w-full rounded-2xl border px-4 py-3 text-start transition ${
                        active
                          ? "border-brand-500 bg-brand-50 ring-1 ring-brand-200"
                          : "border-navy-100 bg-white hover:border-brand-200"
                      }`}
                    >
                      <span className="block truncate text-sm font-bold text-navy-900">
                        {plan.title}
                      </span>
                      <span className="mt-1 block text-xs text-navy-500">
                        {plan.patientName} · {t("admin.treatments.progress")}: {done}/{total}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState text={t("admin.treatments.empty")} icon={ClipboardList} />
          )}
        </Panel>

        {/* Détail du plan */}
        <div className="space-y-4">
          {!activePlan ? (
            <EmptyState text={t("admin.treatments.selectPlan")} icon={ClipboardList} />
          ) : (
            <>
              <Panel>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-navy-900">{activePlan.title}</h2>
                    <p className="mt-1 text-sm text-navy-500">
                      {activePlan.patientName} ·{" "}
                      <span dir="ltr">{activePlan.patientPhone}</span>
                      {activePlan.patientEmail ? (
                        <span dir="ltr"> · {activePlan.patientEmail}</span>
                      ) : null}
                    </p>
                    {activePlan.internalNote ? (
                      <p className={`${subtleText} mt-2 rounded-xl bg-mist px-3 py-2`}>
                        {activePlan.internalNote}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSessionForm((v) => !v);
                        setFormError(null);
                        setSessionDraft((d) => ({
                          ...EMPTY_SESSION,
                          number: planSessions.length + 1,
                          serviceId: services[0]?.id || "",
                          doctorId: doctors[0]?.id || "",
                        }));
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-navy-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-navy-800"
                    >
                      <CalendarPlus className="size-3.5" aria-hidden="true" />
                      {t("admin.treatments.addSession")}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={async () => {
                        if (!window.confirm(t("admin.services.confirmDelete"))) return;
                        await run(
                          "plan.delete",
                          { id: activePlan.id },
                          "admin.treatments.planDeleted"
                        );
                        setSelected(null);
                      }}
                      className="grid size-9 place-items-center rounded-xl border border-navy-100 text-navy-400 transition hover:border-red-200 hover:text-red-600 disabled:opacity-60"
                      aria-label={t("common.delete")}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </Panel>

              {showSessionForm ? (
                <Panel>
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-navy-900">
                    {t("admin.treatments.addSession")}
                  </h3>
                  <form
                    noValidate
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    onSubmit={async (event) => {
                      event.preventDefault();
                      const ok = await run(
                        "session.save",
                        { planId: activePlan.id, input: sessionDraft },
                        "admin.treatments.sessionSaved"
                      );
                      if (ok) {
                        setShowSessionForm(false);
                        setSessionDraft(EMPTY_SESSION);
                      }
                    }}
                  >
                    <label className={labelClass}>
                      {t("admin.treatments.sessionNumber")}
                      <input
                        type="number"
                        min={1}
                        value={sessionDraft.number}
                        onChange={(e) =>
                          setSessionDraft({ ...sessionDraft, number: e.target.value })
                        }
                        className={`${inputClass} mt-1`}
                      />
                    </label>
                    <label className={labelClass}>
                      {t("common.date")}
                      <input
                        type="date"
                        dir="ltr"
                        value={sessionDraft.date}
                        onChange={(e) =>
                          setSessionDraft({ ...sessionDraft, date: e.target.value })
                        }
                        className={`${inputClass} mt-1`}
                      />
                    </label>
                    <label className={labelClass}>
                      {t("common.time")}
                      <input
                        type="time"
                        dir="ltr"
                        value={sessionDraft.time}
                        onChange={(e) =>
                          setSessionDraft({ ...sessionDraft, time: e.target.value })
                        }
                        className={`${inputClass} mt-1`}
                      />
                    </label>
                    <label className={labelClass}>
                      {t("common.service")}
                      <select
                        value={sessionDraft.serviceId}
                        onChange={(e) =>
                          setSessionDraft({ ...sessionDraft, serviceId: e.target.value })
                        }
                        className={`${inputClass} mt-1`}
                      >
                        {services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.nameFr}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className={labelClass}>
                      {t("common.doctor")}
                      <select
                        value={sessionDraft.doctorId}
                        onChange={(e) =>
                          setSessionDraft({ ...sessionDraft, doctorId: e.target.value })
                        }
                        className={`${inputClass} mt-1`}
                      >
                        {doctors.map((doctor) => (
                          <option key={doctor.id} value={doctor.id}>
                            {doctor.displayName}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className={labelClass}>
                      {t("common.status")}
                      <select
                        value={sessionDraft.status}
                        onChange={(e) =>
                          setSessionDraft({ ...sessionDraft, status: e.target.value })
                        }
                        className={`${inputClass} mt-1`}
                      >
                        <option value="planned">{t("status.planned")}</option>
                        <option value="scheduled">{t("status.scheduled")}</option>
                      </select>
                    </label>
                    <label className={`${labelClass} sm:col-span-2 lg:col-span-3`}>
                      {t("common.notes")}
                      <textarea
                        rows={2}
                        value={sessionDraft.note}
                        onChange={(e) =>
                          setSessionDraft({ ...sessionDraft, note: e.target.value })
                        }
                        className={`${inputClass} mt-1 resize-y`}
                      />
                    </label>
                    <div className="flex gap-3 sm:col-span-2 lg:col-span-3">
                      <button
                        type="submit"
                        disabled={busy}
                        className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
                      >
                        {busy ? <Spinner className="size-4 border-white/40 border-t-white" /> : null}
                        {t("common.save")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowSessionForm(false)}
                        className="rounded-full px-5 py-3 text-sm font-bold text-navy-400 hover:text-navy-700"
                      >
                        {t("admin.form.cancel")}
                      </button>
                    </div>
                  </form>
                </Panel>
              ) : null}

              <Panel>
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-navy-900">
                  {t("admin.treatments.sessions")}
                </h3>
                {planSessions.length ? (
                  <ul className="divide-y divide-navy-50">
                    {planSessions.map((session) => (
                      <li key={session.id} className="py-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-navy-900">
                              {t("admin.treatments.sessionNumber")} {session.number} ·{" "}
                              <span dir="ltr">
                                {session.date} {session.status === "scheduled" ? session.time : ""}
                              </span>
                            </p>
                            <p className="mt-0.5 text-xs text-navy-500">
                              {services.find((s) => s.id === session.serviceId)?.nameFr || ""} ·{" "}
                              {doctors.find((d) => d.id === session.doctorId)?.displayName || "—"}
                            </p>
                            {session.note ? (
                              <p className="mt-1 text-xs text-navy-400">{session.note}</p>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={session.status} />
                            <button
                              type="button"
                              onClick={() => {
                                setRescheduling(
                                  rescheduling === session.id ? null : session.id
                                );
                                setRescheduleDraft({
                                  date: session.date || "",
                                  time: session.time || "09:00",
                                  status:
                                    session.status === "planned" ? "scheduled" : session.status,
                                });
                              }}
                              className="rounded-full border border-navy-200 bg-white px-3 py-1.5 text-xs font-bold text-navy-600 transition hover:border-brand-300 hover:text-brand-700"
                            >
                              {t("admin.treatments.reschedule")}
                            </button>
                            {session.status !== "completed" ? (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  run(
                                    "session.status",
                                    { id: session.id, status: "completed" },
                                    "common.success"
                                  )
                                }
                                className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-bold text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-60"
                              >
                                <CheckCircle2 className="size-3.5" aria-hidden="true" />
                                {t("admin.treatments.markCompleted")}
                              </button>
                            ) : null}
                            {session.status === "planned" || session.status === "scheduled" ? (
                              <>
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() =>
                                    run(
                                      "session.status",
                                      { id: session.id, status: "missed" },
                                      "common.success"
                                    )
                                  }
                                  className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                                >
                                  {t("admin.treatments.markMissed")}
                                </button>
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() =>
                                    run(
                                      "session.status",
                                      { id: session.id, status: "cancelled" },
                                      "common.success"
                                    )
                                  }
                                  className="rounded-full border border-navy-200 bg-white px-3 py-1.5 text-xs font-bold text-navy-500 transition hover:bg-navy-50 disabled:opacity-60"
                                >
                                  {t("admin.treatments.markCancelled")}
                                </button>
                              </>
                            ) : null}
                          </div>
                        </div>

                        {/* Report explicite de la séance */}
                        {rescheduling === session.id ? (
                          <form
                            noValidate
                            className="mt-3 flex flex-wrap items-end gap-3 rounded-2xl bg-mist p-4"
                            onSubmit={async (event) => {
                              event.preventDefault();
                              await run(
                                "session.save",
                                {
                                  planId: activePlan.id,
                                  input: {
                                    id: session.id,
                                    number: session.number,
                                    date: rescheduleDraft.date,
                                    time: rescheduleDraft.time,
                                    serviceId: session.serviceId,
                                    doctorId: session.doctorId,
                                    status: rescheduleDraft.status,
                                    note: session.note || "",
                                  },
                                },
                                "admin.treatments.sessionSaved"
                              );
                              setRescheduling(null);
                            }}
                          >
                            <label className="text-xs font-bold text-navy-600">
                              {t("common.date")}
                              <input
                                type="date"
                                dir="ltr"
                                value={rescheduleDraft.date}
                                onChange={(e) =>
                                  setRescheduleDraft((d) => ({ ...d, date: e.target.value }))
                                }
                                className={`${inputClass} mt-1`}
                              />
                            </label>
                            <label className="text-xs font-bold text-navy-600">
                              {t("common.time")}
                              <input
                                type="time"
                                dir="ltr"
                                value={rescheduleDraft.time}
                                onChange={(e) =>
                                  setRescheduleDraft((d) => ({ ...d, time: e.target.value }))
                                }
                                className={`${inputClass} mt-1`}
                              />
                            </label>
                            <label className="text-xs font-bold text-navy-600">
                              {t("common.status")}
                              <select
                                value={rescheduleDraft.status}
                                onChange={(e) =>
                                  setRescheduleDraft((d) => ({ ...d, status: e.target.value }))
                                }
                                className={`${inputClass} mt-1`}
                              >
                                <option value="planned">{t("status.planned")}</option>
                                <option value="scheduled">{t("status.scheduled")}</option>
                              </select>
                            </label>
                            <button
                              type="submit"
                              disabled={busy}
                              className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-navy-800 disabled:opacity-60"
                            >
                              {busy ? (
                                <Spinner className="size-3.5 border-white/40 border-t-white" />
                              ) : null}
                              {t("common.save")}
                            </button>
                            <button
                              type="button"
                              onClick={() => setRescheduling(null)}
                              className="rounded-full px-4 py-2.5 text-xs font-bold text-navy-400 hover:text-navy-700"
                            >
                              {t("common.cancel")}
                            </button>
                          </form>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-navy-500">{t("common.empty")}</p>
                )}
              </Panel>
            </>
          )}
        </div>
      </div>
    </>
  );
}
