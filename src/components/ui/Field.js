"use client";

import { AlertCircle } from "lucide-react";
import { errorText, label as labelClass } from "@/lib/ui";

/**
 * Champ de formulaire accessible : label, contrôle, message d'erreur relié
 * via aria-describedby.
 */
export default function Field({ id, label, error, hint, required, children }) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required ? (
          <span className="ms-1 text-brand-600" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {typeof children === "function"
        ? children({ "aria-describedby": describedBy || undefined, invalid: Boolean(error) })
        : children}
      {hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-navy-400">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className={errorText}>
          <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
