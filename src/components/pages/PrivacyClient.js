"use client";

import { Mail, ShieldCheck } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import Reveal from "@/components/ui/Reveal";
import { useLanguage } from "@/context/LanguageContext";
import { card, container, section } from "@/lib/ui";

const SECTIONS = [1, 2, 3, 4, 5, 6];

export default function PrivacyClient() {
  const { t } = useLanguage();

  return (
    <>
      <PageHero
        eyebrow={t("nav.privacy")}
        title={t("privacy.title")}
        intro={t("privacy.updated")}
      />

      <section className={section}>
        <div className={`${container} mx-auto max-w-3xl`}>
          <div className="mb-8 flex items-start gap-3 rounded-3xl border border-brand-100 bg-brand-50 p-5 text-sm leading-relaxed text-brand-800">
            <ShieldCheck className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <p>{t("privacy.contactTitle")}</p>
          </div>

          <div className="space-y-6">
            {SECTIONS.map((index) => (
              <Reveal key={index} delay={index * 40}>
                <article className={`${card} p-6 sm:p-7`}>
                  <h2 className="flex items-center gap-3 text-lg font-bold text-navy-900">
                    <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-brand-50 text-sm font-black text-brand-700 ring-1 ring-brand-100">
                      {index}
                    </span>
                    {t(`privacy.s${index}Title`)}
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-navy-500 sm:text-base">
                    {t(`privacy.s${index}Text`)}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>

          <a
            href="mailto:ilyassdr60@gmail.com"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white px-6 py-3.5 text-sm font-bold text-navy-800 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
          >
            <Mail className="size-4" aria-hidden="true" />
            ilyassdr60@gmail.com
          </a>
        </div>
      </section>
    </>
  );
}
