/** Marque visuelle du cabinet (SVG, sans dépendance externe). */

export function ToothMark({ className = "", title }) {
  return (
    <svg
      viewBox="0 0 24 24"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={className}
      fill="none"
    >
      <path
        d="M6 6.5C6 4.5 8 3.5 12 3.5C16 3.5 18 4.5 18 6.5C18 9 17.2 10.5 16.8 13C16.5 15 16.3 17.5 16.3 19C16.3 20.7 15.2 21.5 14.2 21.5C13.1 21.5 12.7 20.2 12.4 18.4C12.2 17 12.1 15.5 12 15.5C11.9 15.5 11.8 17 11.6 18.4C11.3 20.2 10.9 21.5 9.8 21.5C8.8 21.5 7.7 20.7 7.7 19C7.7 17.5 7.5 15 7.2 13C6.8 10.5 6 9 6 6.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function Logo({ className = "", compact = false }) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-navy-900 text-white shadow-soft">
        <ToothMark className="size-6" />
      </span>
      {!compact && (
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-[0.98rem] font-bold tracking-tight text-navy-900">
            Cabinet Dentaire Ilyass
          </span>
          <span className="truncate text-[0.72rem] font-medium text-navy-400">
            Tiflet · Hay Andalos
          </span>
        </span>
      )}
    </span>
  );
}
