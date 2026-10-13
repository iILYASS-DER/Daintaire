"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import DemoBadge from "@/components/ui/DemoBadge";
import { useLanguage } from "@/context/LanguageContext";
import { localized } from "@/lib/i18n";
import { chip, subtleText } from "@/lib/ui";

export default function ServiceCard({ service, index = 0 }) {
  const { lang, t } = useLanguage();
  const name = localized(service, "name", lang, service.nameFr || "");
  const description = localized(service, "desc", lang, "");
  const isDemo = service.isDemo === true;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-navy-100 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-soft">
      <div className="relative aspect-[16/10] overflow-hidden bg-navy-50">
        <ImageWithFallback
          src={service.image || "/images/clinic-equipment.jpg"}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/60 to-transparent"
          aria-hidden="true"
        />
        {isDemo ? <DemoBadge className="absolute start-3 top-3 shadow-sm" /> : null}
        {service.durationMinutes ? (
          <span className="absolute bottom-3 start-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-navy-700 shadow-sm backdrop-blur">
            <Clock className="size-3.5 text-brand-600" aria-hidden="true" />
            {t("services.durationValue", { value: service.durationMinutes })}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-bold text-navy-900">{name}</h3>
        {description ? <p className={`${subtleText} mt-2`}>{description}</p> : null}

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <span className="block text-[0.68rem] font-bold uppercase tracking-wider text-navy-300">
              {t("common.price")}
            </span>
            <span className="text-sm font-bold text-navy-800">
              {service.price === null || service.price === undefined
                ? t("services.priceOnRequest")
                : `${service.price} MAD`}
            </span>
          </div>
          <Link
            href={`/appointment?service=${encodeURIComponent(service.id)}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-2.5 text-xs font-bold text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white"
          >
            {t("services.bookThis")}
            <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ServiceChip({ service, lang }) {
  return <span className={chip}>{localized(service, "name", lang, "")}</span>;
}
