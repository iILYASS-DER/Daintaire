import { container, eyebrow, lead } from "@/lib/ui";

/**
 * En-tête des pages intérieures : bandeau clair, titre et introduction.
 */
export default function PageHero({ eyebrow: eyebrowText, title, intro, children }) {
  return (
    <section className="relative overflow-hidden border-b border-navy-100 bg-gradient-to-b from-brand-50/70 via-white to-white">
      <div className="bg-dotted bg-grid-fade pointer-events-none absolute inset-x-0 top-0 h-56 opacity-60" aria-hidden="true" />
      <div className={`${container} relative py-14 sm:py-16 lg:py-20`}>
        {eyebrowText ? (
          <div className="flex justify-center">
            <span className={eyebrow}>{eyebrowText}</span>
          </div>
        ) : null}
        <h1 className="mx-auto mt-5 max-w-3xl text-balance text-center text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {intro ? <p className={`${lead} mx-auto text-center`}>{intro}</p> : null}
        {children}
      </div>
    </section>
  );
}
