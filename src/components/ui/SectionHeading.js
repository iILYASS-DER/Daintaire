import { eyebrow, heading, lead } from "@/lib/ui";

/** Titre de section : sur-titre, titre, sous-titre. */
export default function SectionHeading({
  eyebrow: eyebrowText,
  title,
  subtitle,
  align = "start",
  className = "",
  id,
}) {
  const alignment =
    align === "center" ? "mx-auto items-center text-center" : "items-start";

  return (
    <div className={`flex flex-col ${alignment} ${className}`}>
      {eyebrowText ? <span className={eyebrow}>{eyebrowText}</span> : null}
      <h2 id={id} className={`${heading} mt-5`}>
        {title}
      </h2>
      {subtitle ? <p className={`${lead} ${align === "center" ? "mx-auto" : ""}`}>{subtitle}</p> : null}
    </div>
  );
}
