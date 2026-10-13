"use client";

import { useCallback, useEffect, useState } from "react";
import { Inbox } from "lucide-react";
import { i18nErrorMessage } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

/** Titre de page de l'espace staff. */
export function AdminPageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-2 text-sm text-navy-500">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

/** État vide standardisé. */
export function EmptyState({ text, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-navy-200 bg-white/60 px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-navy-50 text-navy-400">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <p className="text-sm text-navy-500">{text}</p>
    </div>
  );
}

/** Carte de l'espace staff. */
export function Panel({ children, className = "" }) {
  return (
    <div className={`rounded-3xl border border-navy-100 bg-white p-5 shadow-card sm:p-6 ${className}`}>
      {children}
    </div>
  );
}

export function LoadingBlock({ label }) {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-3 rounded-3xl border border-navy-100 bg-white p-6 text-sm text-navy-500">
      <span className="inline-block size-5 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600" aria-hidden="true" />
      {label || t("common.loading")}
    </div>
  );
}

export function ErrorBlock({ error, onRetry }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
      <p>{typeof error === "string" ? error : i18nErrorMessage(error, t)}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="self-start rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
        >
          {t("common.retry")}
        </button>
      ) : null}
    </div>
  );
}

/**
 * Chargement de données d'administration avec états chargement / erreur.
 * @param {(signal: AbortSignal) => Promise<any>} loader
 * @param {any[]} deps
 */
export function useAdminData(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((v) => v + 1), []);

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.resolve(loader(controller.signal))
      .then((data) => {
        if (alive) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (alive && !controller.signal.aborted) {
          setState({ data: null, loading: false, error });
        }
      });
    return () => {
      alive = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { ...state, reload };
}

/** Message de succès temporaire. */
export function useFlash() {
  const [flash, setFlash] = useState(null);
  const show = useCallback((message) => {
    setFlash(message);
    if (message) {
      setTimeout(() => setFlash((current) => (current === message ? null : current)), 4000);
    }
  }, []);
  const node = flash ? (
    <p
      role="status"
      className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
    >
      {flash}
    </p>
  ) : null;
  return { flash, show, node };
}
