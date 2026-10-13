"use client";

import Link from "next/link";
import {
  CalendarCheck2,
  CalendarDays,
  ClipboardList,
  Stethoscope,
  UserRound,
  Users,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { useLanguage } from "@/context/LanguageContext";
import { apiFetch } from "@/lib/api";
import {
  AdminPageHeader,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  Panel,
  useAdminData,
} from "@/components/admin/shared";

function Kpi({ icon: Icon, label, value, tone = "brand" }) {
  const tones = {
    brand: "bg-brand-50 text-brand-600 ring-brand-100",
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
    navy: "bg-navy-50 text-navy-600 ring-navy-100",
    aqua: "bg-aqua/15 text-teal-600 ring-teal-100",
  };
  return (
    <div className="rounded-3xl border border-navy-100 bg-white p-5 shadow-card">
      <span className={`grid size-11 place-items-center rounded-2xl ring-1 ${tones[tone]}`}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <p className="mt-4 text-3xl font-black tracking-tight text-navy-900">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-navy-400">{label}</p>
    </div>
  );
}

export default function OverviewClient() {
  const { t } = useLanguage();
  const { data, loading, error, reload } = useAdminData(async (signal) =>
    apiFetch("/api/admin/overview", { signal })
  );

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock error={error} onRetry={reload} />;

  const overview = data?.overview || {};

  const kpis = [
    { key: "admin.kpi.pending", value: overview.pending, Icon: ClipboardList, tone: "amber" },
    { key: "admin.kpi.confirmed", value: overview.confirmed, Icon: CalendarCheck2, tone: "brand" },
    { key: "admin.kpi.today", value: overview.today, Icon: CalendarDays, tone: "navy" },
    { key: "admin.kpi.doctors", value: overview.activeDoctors, Icon: Stethoscope, tone: "aqua" },
    { key: "admin.kpi.sessions", value: overview.upcomingSessions, Icon: UserRound, tone: "brand" },
    { key: "admin.kpi.patients", value: overview.patients, Icon: Users, tone: "navy" },
  ];

  return (
    <>
      <AdminPageHeader
        title={t("admin.overview")}
        subtitle={t("admin.section")}
        actions={
          <>
            <Link
              href="/admin/appointments"
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
            >
              {t("admin.overview.goAppointments")}
            </Link>
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white px-5 py-2.5 text-sm font-bold text-navy-800 transition hover:border-brand-300 hover:text-brand-700"
            >
              {t("admin.settings.seed")}
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map(({ key, value, Icon, tone }) => (
          <Kpi key={key} label={t(key)} value={value ?? 0} icon={Icon} tone={tone} />
        ))}
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        {/* Planning du jour */}
        <Panel>
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-navy-900">
            <CalendarDays className="size-4 text-brand-600" aria-hidden="true" />
            {t("admin.overview.todayTitle")}
          </h2>
          <div className="mt-4 space-y-3">
            {(overview.todayAppointments || []).length ? (
              overview.todayAppointments.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-navy-50 bg-mist/60 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-navy-900">{item.patientName}</p>
                    <p className="truncate text-xs text-navy-500">
                      <span dir="ltr">{`${item.start} – ${item.end}`}</span> · {item.doctorName}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))
            ) : (
              <p className="text-sm text-navy-500">{t("admin.overview.emptyToday")}</p>
            )}
          </div>
        </Panel>

        {/* Demandes en attente */}
        <Panel>
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-navy-900">
            <ClipboardList className="size-4 text-amber-600" aria-hidden="true" />
            {t("admin.overview.pendingTitle")}
          </h2>
          <div className="mt-4 space-y-3">
            {(overview.pendingAppointments || []).length ? (
              overview.pendingAppointments.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-navy-50 bg-mist/60 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-navy-900">{item.patientName}</p>
                    <p className="truncate text-xs text-navy-500">
                      {item.date} <span dir="ltr">{item.start}</span> · {item.serviceNameFr}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))
            ) : (
              <p className="text-sm text-navy-500">{t("admin.overview.noPending")}</p>
            )}
          </div>
        </Panel>

        {/* Séances planifiées */}
        <Panel className="lg:col-span-2">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-navy-900">
            <UserRound className="size-4 text-teal-600" aria-hidden="true" />
            {t("admin.overview.sessionsTitle")}
          </h2>
          <div className="mt-4">
            {(overview.upcomingSessionList || []).length ? (
              <ul className="divide-y divide-navy-50">
                {overview.upcomingSessionList.map((session) => (
                  <li
                    key={session.id}
                    className="flex items-center justify-between gap-3 py-3 text-sm"
                  >
                    <span className="min-w-0 truncate font-semibold text-navy-800">
                      {session.patientName}
                      <span className="ms-2 text-xs font-normal text-navy-400">
                        {session.title || ""}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3 text-xs text-navy-500">
                      <span dir="ltr">
                        {session.date} {session.time}
                      </span>
                      <StatusBadge status={session.status} />
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-navy-500">{t("admin.overview.noSessions")}</p>
            )}
          </div>
        </Panel>
      </div>

      {!data?.recent?.length ? (
        <div className="mt-6">
          <EmptyState text={t("common.empty")} />
        </div>
      ) : null}
    </>
  );
}
