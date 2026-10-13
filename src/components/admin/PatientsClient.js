"use client";

import { useState } from "react";
import { Eye, EyeOff, Search, UserRound } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { useLanguage } from "@/context/LanguageContext";
import { apiFetch } from "@/lib/api";
import { input as inputClass } from "@/lib/ui";
import {
  AdminPageHeader,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  Panel,
  useAdminData,
} from "@/components/admin/shared";

function maskPhone(phone) {
  if (!phone) return "—";
  const digits = String(phone).replace(/[^\d]/g, "");
  if (digits.length < 5) return "•••";
  return `+${digits.slice(0, 3)} ${"•".repeat(Math.max(3, digits.length - 6))} ${digits.slice(-3)}`;
}

function maskEmail(email) {
  if (!email) return "—";
  const [local, domain] = String(email).split("@");
  if (!domain) return "•••";
  return `${local.slice(0, 2)}${"•".repeat(Math.max(2, local.length - 2))}@${domain}`;
}

export default function PatientsClient() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [revealed, setRevealed] = useState({});

  const { data, loading, error, reload } = useAdminData(
    async (signal) =>
      apiFetch(`/api/admin/patients?search=${encodeURIComponent(search)}`, { signal }),
    [search]
  );

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock error={error} onRetry={reload} />;

  const patients = data?.patients || [];

  return (
    <>
      <AdminPageHeader title={t("admin.patients.title")} subtitle={t("admin.patients.privacyNote")} />

      <Panel className="mb-6">
        <div className="relative">
          <Search
            className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-navy-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.patients.searchPlaceholder")}
            aria-label={t("common.search")}
            className={`${inputClass} ps-9`}
          />
        </div>
      </Panel>

      {patients.length ? (
        <div className="overflow-x-auto rounded-3xl border border-navy-100 bg-white shadow-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-navy-100 bg-mist/70 text-start text-xs font-bold uppercase tracking-wide text-navy-500">
                <th className="px-5 py-3 text-start">{t("admin.patients.column")}</th>
                <th className="px-5 py-3 text-start">{t("common.phone")}</th>
                <th className="px-5 py-3 text-start">{t("common.email")}</th>
                <th className="px-5 py-3 text-start">{t("admin.patients.appointments")}</th>
                <th className="px-5 py-3 text-start">{t("admin.patients.lastVisit")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {patients.map((patient) => {
                const open = Boolean(revealed[patient.id]);
                return (
                  <tr key={patient.id} className="hover:bg-mist/40">
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-2 font-semibold text-navy-900">
                        <span className="grid size-8 place-items-center rounded-full bg-brand-50 text-brand-600">
                          <UserRound className="size-4" aria-hidden="true" />
                        </span>
                        {patient.name}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-2">
                        <span dir="ltr" className="font-medium text-navy-700">
                          {open ? patient.phone || "—" : maskPhone(patient.phone)}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setRevealed((r) => ({ ...r, [patient.id]: !open }))
                          }
                          aria-label={open ? t("common.close") : t("admin.patients.reveal")}
                          className="text-navy-300 transition hover:text-brand-600"
                        >
                          {open ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-navy-600" dir="ltr">
                      {open ? patient.email || "—" : maskEmail(patient.email)}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-navy-800">
                      {patient.appointments}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-2 text-navy-600">
                        {patient.lastDate}
                        {patient.lastStatus ? (
                          <StatusBadge status={patient.lastStatus} />
                        ) : null}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          text={search ? t("common.empty") : t("admin.patients.empty")}
          icon={UserRound}
        />
      )}

      <p className="mt-4 text-xs leading-relaxed text-navy-400">
        {t("admin.patients.privacyNote")}
      </p>
    </>
  );
}
