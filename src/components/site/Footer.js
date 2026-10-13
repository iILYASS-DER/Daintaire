"use client";

import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import Logo from "@/components/site/Logo";
import LanguageSwitcher from "@/components/site/LanguageSwitcher";
import DemoBadge from "@/components/ui/DemoBadge";
import { useLanguage } from "@/context/LanguageContext";
import { DAY_KEYS } from "@/lib/i18n";
import { useContent } from "@/lib/content";
import { container } from "@/lib/ui";

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

const NAV_LINKS = [
  { href: "/", key: "nav.home" },
  { href: "/about", key: "nav.about" },
  { href: "/services", key: "nav.services" },
  { href: "/appointment", key: "nav.appointment" },
  { href: "/contact", key: "nav.contact" },
  { href: "/track", key: "nav.track" },
];

export default function Footer() {
  const { t, lang } = useLanguage();
  const { data: settings, isDemo } = useContent("settings");
  const hours = settings?.openingHours || null;

  return (
    <footer className="border-t border-navy-100 bg-mist">
      <div className={`${container} grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4`}>
        {/* Marque */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-navy-500">
            {t("footer.about")}
          </p>
          {isDemo ? <DemoBadge className="mt-4" /> : null}
        </div>

        {/* Navigation */}
        <nav aria-label={t("footer.links")}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-navy-900">
            {t("footer.links")}
          </h2>
          <ul className="mt-4 space-y-2.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-navy-500 transition hover:text-brand-700"
                >
                  {t(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-navy-900">
            {t("footer.contact")}
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-navy-500">
            <li>
              <a
                href="tel:+212659349160"
                className="inline-flex items-center gap-2.5 transition hover:text-brand-700"
              >
                <Phone className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
                <span dir="ltr">+212 659 349 160</span>
              </a>
            </li>
            <li>
              <a
                href="mailto:ilyassdr60@gmail.com"
                className="inline-flex items-center gap-2.5 break-all transition hover:text-brand-700"
              >
                <Mail className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
                ilyassdr60@gmail.com
              </a>
            </li>
            <li className="inline-flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
              <span>{lang === "ar" ? settings?.addressAr || settings?.address : settings?.address}</span>
            </li>
          </ul>
        </div>

        {/* Horaires */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-navy-900">
            {t("footer.hours")}
          </h2>
          {hours ? (
            <dl className="mt-4 space-y-2 text-sm">
              {DAY_ORDER.map((day) => {
                const value = hours[day];
                return (
                  <div key={day} className="flex items-baseline justify-between gap-4">
                    <dt className="text-navy-500">{t(DAY_KEYS[day])}</dt>
                    <dd className="font-semibold text-navy-800" dir="ltr">
                      {value?.open && value?.close
                        ? `${value.open} – ${value.close}`
                        : t("contact.closed")}
                    </dd>
                  </div>
                );
              })}
            </dl>
          ) : (
            <p className="mt-4 flex items-start gap-2 text-sm text-navy-500">
              <Clock className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
              {t("footer.hoursMissing")}
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-navy-100">
        <div
          className={`${container} flex flex-col items-center justify-between gap-4 py-6 sm:flex-row`}
        >
          <p className="text-xs text-navy-400">
            © {new Date().getFullYear()} {t("brand.name")} — {t("footer.rights")}
          </p>

          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-xs font-semibold text-navy-500 transition hover:text-brand-700"
            >
              {t("footer.privacy")}
            </Link>
            <Link
              href="/admin"
              className="text-xs font-semibold text-navy-400 transition hover:text-brand-700"
            >
              {t("nav.admin")}
            </Link>
            <LanguageSwitcher size="sm" />
          </div>
        </div>
      </div>
    </footer>
  );
}
