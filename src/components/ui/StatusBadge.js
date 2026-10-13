"use client";

import { useLanguage } from "@/context/LanguageContext";

const STYLES = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rejected: "bg-red-50 text-red-600 ring-red-200",
  cancelled: "bg-slate-100 text-slate-500 ring-slate-200",
  expired: "bg-orange-50 text-orange-600 ring-orange-200",
  completed: "bg-brand-50 text-brand-700 ring-brand-200",
  missed: "bg-rose-50 text-rose-600 ring-rose-200",
  planned: "bg-indigo-50 text-indigo-600 ring-indigo-200",
  scheduled: "bg-sky-50 text-sky-700 ring-sky-200",
};

export default function StatusBadge({ status, className = "" }) {
  const { t } = useLanguage();
  const key = `status.${status}`;
  const label = t(key);
  const style = STYLES[status] || "bg-slate-100 text-slate-600 ring-slate-200";
  const known = label !== key;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ${
        known ? style : "bg-slate-100 text-slate-600 ring-slate-200"
      } ${className}`}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
      {known ? label : status}
    </span>
  );
}
