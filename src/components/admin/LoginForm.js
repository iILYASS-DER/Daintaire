"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, KeyRound, LogIn } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/site/LanguageSwitcher";
import Logo from "@/components/site/Logo";
import Field from "@/components/ui/Field";
import Spinner from "@/components/ui/Spinner";
import { input as inputClass, inputError } from "@/lib/ui";

/**
 * Connexion à l'espace staff.
 * Aucune inscription publique : le premier administrateur est créé une fois
 * via `npm run setup:admin` (voir README).
 */
export default function LoginForm() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    if (busy) return;
    if (!email.trim() || !password) {
      setError(t("admin.loginError"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // La redirection est gérée par AdminShell dès l'état « prêt ».
    } catch (err) {
      const code = err?.code || "";
      if (
        code.includes("invalid-credential") ||
        code.includes("wrong-password") ||
        code.includes("user-not-found") ||
        code.includes("invalid-email")
      ) {
        setError(t("admin.loginError"));
      } else if (code.includes("too-many-requests")) {
        setError(t("form.error.rateLimited"));
      } else {
        setError(t("common.networkError"));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative isolate flex min-h-screen flex-col bg-mist">
      <div
        className="bg-dotted bg-grid-fade pointer-events-none absolute inset-x-0 top-0 h-72 opacity-60"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" aria-label={t("brand.name")}>
            <Logo />
          </Link>
          <LanguageSwitcher size="sm" />
        </div>

        <div className="rounded-3xl border border-navy-100 bg-white p-7 shadow-card sm:p-8">
          <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
            <KeyRound className="size-5" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-2xl font-bold text-navy-900">{t("admin.loginTitle")}</h1>
          <p className="mt-2 text-sm leading-relaxed text-navy-500">
            {t("admin.loginSubtitle")}
          </p>

          <form onSubmit={onSubmit} noValidate className="mt-7 space-y-5">
            <Field id="login-email" label={t("admin.email")} required>
              {({ invalid }) => (
                <input
                  id="login-email"
                  type="email"
                  dir="ltr"
                  autoComplete="username"
                  className={`${inputClass} ${invalid ? inputError : ""}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              )}
            </Field>

            <Field id="login-password" label={t("admin.password")} required>
              {({ invalid }) => (
                <input
                  id="login-password"
                  type="password"
                  dir="ltr"
                  autoComplete="current-password"
                  className={`${inputClass} ${invalid ? inputError : ""}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}
            </Field>

            {error ? (
              <p
                role="alert"
                className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600"
              >
                <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-7 py-4 text-sm font-bold text-white shadow-lift transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <Spinner className="size-4 border-white/40 border-t-white" />
              ) : (
                <LogIn className="size-4 rtl:-scale-x-100" aria-hidden="true" />
              )}
              {busy ? t("admin.signingIn") : t("admin.signIn")}
            </button>
          </form>

          <p className="mt-6 rounded-2xl bg-mist p-4 text-xs leading-relaxed text-navy-500">
            {t("admin.noAccount")}
          </p>
        </div>

        <Link
          href="/"
          className="mt-6 text-center text-sm font-semibold text-brand-700 transition hover:text-brand-800"
        >
          {t("nav.home")}
        </Link>
      </div>
    </div>
  );
}
