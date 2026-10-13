"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  CalendarCheck2,
  ClipboardList,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldAlert,
  Stethoscope,
  Users,
  UserRound,
  X,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { apiFetch, i18nErrorMessage } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/site/LanguageSwitcher";
import Logo from "@/components/site/Logo";
import Spinner from "@/components/ui/Spinner";
import { container } from "@/lib/ui";

const NAV_ITEMS = [
  { href: "/admin", key: "admin.overview", Icon: LayoutDashboard, exact: true },
  { href: "/admin/appointments", key: "admin.appointments", Icon: CalendarCheck2 },
  { href: "/admin/doctors", key: "admin.doctors.title", Icon: Stethoscope, adminOnly: true },
  { href: "/admin/services", key: "admin.services.title", Icon: FlaskConical, adminOnly: true },
  { href: "/admin/patients", key: "admin.patients.title", Icon: Users },
  { href: "/admin/treatments", key: "admin.treatments.title", Icon: ClipboardList },
  { href: "/admin/settings", key: "admin.settings.title", Icon: Settings, adminOnly: true },
];

/**
 * Coquille de l'espace staff : garde d'authentification, barre latérale et
 * zone de contenu. Aucune donnée n'est affichée avant vérification du rôle.
 */
export default function AdminShell({ children }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [state, setState] = useState("loading"); // loading | anonymous | denied | ready | unconfigured
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState(null);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    let alive = true;
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      if (!alive) return;
      if (!nextUser) {
        setUser(null);
        setRole(null);
        setState("anonymous");
        return;
      }
      setUser(nextUser);
      try {
        const me = await apiFetch("/api/me");
        if (!alive) return;
        setRole(me.role);
        setState(me.role === "admin" || me.role === "doctor" ? "ready" : "denied");
      } catch (err) {
        if (!alive) return;
        setError(i18nErrorMessage(err, t));
        setState(err.status === 503 ? "unconfigured" : "denied");
      }
    });
    return () => {
      alive = false;
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Un membre déjà connecté n'a pas besoin de la page de connexion.
  useEffect(() => {
    if (isLoginPage && state === "ready") router.replace("/admin");
  }, [isLoginPage, state, router]);

  useEffect(() => {
    if (!isLoginPage && state === "anonymous") router.replace("/admin/login");
  }, [isLoginPage, state, router]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut(auth);
    } catch {
      /* déconnexion locale déjà faite */
    }
    setUser(null);
    setRole(null);
    setState("anonymous");
    router.replace("/admin/login");
  }, [router]);

  const visibleItems = useMemo(
    () => NAV_ITEMS.filter((item) => !item.adminOnly || role === "admin"),
    [role]
  );

  /* ------------------------------------------------------- page connexion */
  if (isLoginPage) {
    if (state === "ready") {
      return (
        <div className="grid min-h-screen place-items-center bg-mist">
          <Spinner label={t("common.loading")} />
        </div>
      );
    }
    return <div id="main-content">{children}</div>;
  }

  /* ------------------------------------------------------------ chargement */
  if (state === "loading") {
    return (
      <div className="grid min-h-screen place-items-center bg-mist">
        <Spinner label={t("common.loading")} />
      </div>
    );
  }

  /* ------------------------------------------------------------ anonyme */
  if (state === "anonymous") {
    return (
      <div className="grid min-h-screen place-items-center bg-mist px-4">
        <div className="w-full max-w-md rounded-3xl border border-navy-100 bg-white p-8 text-center shadow-card">
          <Spinner label={t("common.loading")} />
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------ accès refusé */
  if (state === "denied" || state === "unconfigured") {
    return (
      <div className="grid min-h-screen place-items-center bg-mist px-4">
        <div className="w-full max-w-md rounded-3xl border border-navy-100 bg-white p-8 text-center shadow-card">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
            <ShieldAlert className="size-6" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-xl font-bold text-navy-900">
            {state === "unconfigured" ? t("admin.serverNotConfigured") : t("admin.unauthorized")}
          </h1>
          {error ? <p className="mt-3 text-sm text-navy-500">{error}</p> : null}
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-navy-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-navy-800"
            >
              <LogOut className="size-4" aria-hidden="true" />
              {t("admin.signOut")}
            </button>
            <Link
              href="/"
              className="text-sm font-semibold text-brand-700 transition hover:text-brand-800"
            >
              {t("nav.home")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------- prêt */
  const nav = (
    <nav aria-label={t("admin.dashboard")} className="flex flex-1 flex-col gap-1">
      {visibleItems.map(({ href, key, Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              active
                ? "bg-brand-600 text-white shadow-soft"
                : "text-navy-600 hover:bg-white hover:text-brand-700"
            }`}
          >
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );

  const sidebarFooter = (
    <div className="mt-6 space-y-3 border-t border-navy-100 pt-5">
      <div className="flex items-center gap-3 px-2">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-navy-900 text-xs font-bold uppercase text-white">
          <UserRound className="size-4" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-xs font-bold text-navy-800">
            {user?.email || "—"}
          </span>
          <span className="block text-[0.68rem] font-semibold uppercase tracking-wide text-brand-600">
            {role}
          </span>
        </span>
      </div>
      <LanguageSwitcher size="sm" className="w-full justify-center" />
      <button
        type="button"
        onClick={handleSignOut}
        className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold text-navy-500 transition hover:bg-red-50 hover:text-red-600"
      >
        <LogOut className="size-4" aria-hidden="true" />
        {t("admin.signOut")}
      </button>
      <Link
        href="/"
        className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold text-navy-400 transition hover:text-brand-700"
      >
        {t("nav.home")}
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-mist">
      {/* Barre latérale (desktop) */}
      <aside className="fixed inset-y-0 inset-s-0 z-40 hidden w-72 flex-col border-e border-navy-100 bg-white/95 p-5 backdrop-blur lg:flex">
        <Link href="/" aria-label={t("brand.name")}>
          <Logo />
        </Link>
        <p className="mt-4 rounded-xl bg-brand-50 px-3 py-2 text-[0.7rem] font-bold uppercase tracking-wider text-brand-700 ring-1 ring-brand-100">
          {t("admin.dashboard")}
        </p>
        <div className="mt-5 flex flex-1 flex-col">{nav}</div>
        {sidebarFooter}
      </aside>

      {/* Barre mobile */}
      <header className="sticky top-0 z-40 border-b border-navy-100 bg-white/95 backdrop-blur lg:hidden">
        <div className={`${container} flex h-16 items-center justify-between gap-3`}>
          <Link href="/admin" aria-label={t("admin.dashboard")}>
            <Logo compact />
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher size="sm" />
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? t("nav.closeMenu") : t("nav.menu")}
              className="grid size-10 place-items-center rounded-xl border border-navy-100 text-navy-700"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {menuOpen ? (
          <div className="border-t border-navy-100 bg-white px-4 py-4">
            {nav}
            {sidebarFooter}
          </div>
        ) : null}
      </header>

      <main id="main-content" className="lg:ps-72">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
