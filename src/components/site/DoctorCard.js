"use client";

import ImageWithFallback from "@/components/ui/ImageWithFallback";
import DemoBadge from "@/components/ui/DemoBadge";
import { useLanguage } from "@/context/LanguageContext";
import { localized } from "@/lib/i18n";
import { chip, subtleText } from "@/lib/ui";

function initialsOf(name = "") {
  const cleaned = name.replace(/\b(doctor|dr|docteur|prof)\b\.?/gi, " ").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (!parts.length) return "CD";
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export default function DoctorCard({ doctor, services = [] }) {
  const { lang, t } = useLanguage();
  const name = doctor.displayName || "";
  const bio = localized(doctor, "bio", lang, "");
  const isDemo = doctor.isDemo === true;

  const doctorServices = (Array.isArray(doctor.serviceIds) ? doctor.serviceIds : [])
    .map((id) => services.find((s) => s.id === id))
    .filter(Boolean)
    .slice(0, 4);

  return (
    <article className="flex h-full flex-col rounded-3xl border border-navy-100 bg-white p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-soft sm:p-7">
      <div className="flex items-start gap-4">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl">
          {doctor.photoUrl ? (
            <ImageWithFallback
              src={doctor.photoUrl}
              alt={name}
              fill
              sizes="64px"
              className="object-cover"
              fallbackSrc="/images/clinic-equipment.jpg"
            />
          ) : (
            <div
              className="grid size-full place-items-center bg-gradient-to-br from-brand-500 to-navy-900 text-lg font-bold text-white"
              aria-hidden="true"
            >
              {initialsOf(name)}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-navy-900">{name}</h3>
            {isDemo ? <DemoBadge /> : null}
          </div>
          {doctor.active === false ? (
            <span className="mt-1 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-[0.7rem] font-semibold text-slate-500">
              {t("common.inactive")}
            </span>
          ) : null}
        </div>
      </div>

      {bio ? <p className={`${subtleText} mt-4`}>{bio}</p> : null}

      {doctorServices.length ? (
        <div className="mt-5">
          <p className="text-[0.7rem] font-bold uppercase tracking-wider text-navy-300">
            {t("home.doctors.services")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {doctorServices.map((s) => (
              <span key={s.id} className={chip}>
                {localized(s, "name", lang, "")}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
