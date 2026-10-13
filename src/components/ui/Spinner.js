"use client";

/** Indicateur de chargement accessible. */
export default function Spinner({ className = "", label }) {
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center gap-3">
      <span
        className={`inline-block size-5 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600 ${className}`}
        aria-hidden="true"
      />
      {label ? <span className="text-sm font-medium text-navy-500">{label}</span> : null}
    </span>
  );
}
