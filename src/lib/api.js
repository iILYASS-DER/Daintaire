"use client";

import { auth } from "@/lib/firebase";

/**
 * Petit client HTTP pour les routes API de l'application.
 * Attache automatiquement le jeton Firebase ID de l'utilisateur connecté.
 */
export async function apiFetch(
  path,
  { method = "GET", body, auth: withAuth = true, signal } = {}
) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (withAuth && auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      headers.Authorization = `Bearer ${token}`;
    } catch {
      /* le serveur renverra 401 si le jeton est nécessaire */
    }
  }

  let response;
  try {
    response = await fetch(path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    const err = new Error("network");
    err.code = "network";
    err.cause = error;
    throw err;
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const err = new Error(data?.error || `HTTP ${response.status}`);
    err.status = response.status;
    err.code = data?.code || `http_${response.status}`;
    err.details = data?.details;
    throw err;
  }

  return data;
}

/** Traduit les codes d'erreur serveur en clés i18n (repli : message serveur). */
export function i18nErrorMessage(error, t) {
  if (!error) return t("common.error");
  if (error.code === "network") return t("common.networkError");
  const map = {
    slot_unavailable: "form.error.slotUnavailable",
    rate_limited: "form.error.rateLimited",
    invalid_payload: "form.error.invalid",
    invalid_date: "error.invalidDate",
    date_past: "error.datePast",
    date_too_far: "error.dateTooFar",
    doctor_not_found: "error.doctorNotFound",
    service_not_found: "error.serviceNotFound",
    server_not_configured: "admin.serverNotConfigured",
    firestore_rules_missing: "error.rulesMissing",
    index_missing: "error.indexMissing",
    internal_error: "error.internal",
    unauthorized: "admin.unauthorized",
  };
  const key = map[error.code];
  if (key) return t(key);
  if (error.code === "not_found") return t("track.notFound");
  return error.message || t("common.error");
}
