"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarDays, Menu, X, ClipboardCheck, Phone } from "lucide-react";
import Logo from "@/components/site/Logo";
import LanguageSwitcher from "@/components/site/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";

const NAV_ITEMS = [
  { href: "/", key: "nav.home" },
  { href: "/about", key: "nav.about" },
  { href: "/services", key: "nav.services" },
  { href: "/contact", key: "nav.contact" },
];

export default function Header() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Referme le menu à chaque changement de page.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-navy-100/80 bg-white/90 shadow-[0_6px_24px_-18px_rgb(11_37_69/0.5)] backdrop-blur-md"
          : "border-b border-transparent bg-white/70 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label={t("brand.name")} className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label={t("nav.mainNav")}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                isActive(item.href)
                  ? "bg-brand-50 text-brand-700"
                  : "text-navy-600 hover:bg-navy-50 hover:text-navy-900"
              }`}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher className="hidden sm:inline-flex" />
          <Link
            href="/appointment"
            className="hidden items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lift transition hover:bg-brand-700 sm:inline-flex"
          >
            <CalendarDays className="size-4" aria-hidden="true" />
            {t("nav.appointment")}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t("nav.closeMenu") : t("nav.menu")}
            className="grid size-11 place-items-center rounded-2xl border border-navy-100 bg-white text-navy-800 transition hover:bg-brand-50 lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      <div
        id="mobile-menu"
        hidden={!open}
        className="border-t border-navy-100 bg-white lg:hidden"
      >
        <nav
          className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6"
          aria-label={t("nav.mobileNav")}
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`rounded-2xl px-4 py-3 text-base font-semibold transition ${
                isActive(item.href)
                  ? "bg-brand-50 text-brand-700"
                  : "text-navy-700 hover:bg-navy-50"
              }`}
            >
              {t(item.key)}
            </Link>
          ))}
          <Link
            href="/track"
            className="rounded-2xl px-4 py-3 text-base font-semibold text-navy-700 transition hover:bg-navy-50"
          >
            <ClipboardCheck className="me-2 inline size-4" aria-hidden="true" />
            {t("nav.track")}
          </Link>
          <div className="mt-2 flex items-center justify-between gap-3 border-t border-navy-100 px-4 pt-4">
            <LanguageSwitcher />
            <a
              href="tel:+212659349160"
              className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Phone className="size-4" aria-hidden="true" />
              {t("common.phone")}
            </a>
          </div>
          <Link
            href="/appointment"
            className="mt-3 flex items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lift"
          >
            <CalendarDays className="size-4" aria-hidden="true" />
            {t("nav.appointment")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
