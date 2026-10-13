"use client";

import Image from "next/image";
import { useState } from "react";
import { ToothMark } from "@/components/site/Logo";

/**
 * Image avec repli : si l'asset demandé est introuvable (ou si une image
 * distante échoue), on affiche un visuel local de secours plutôt qu'un
 * rectangle vide.
 */
export default function ImageWithFallback({
  src,
  alt,
  fallbackSrc = "/images/clinic-equipment.jpg",
  className = "",
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  fill = false,
  objectPosition,
}) {
  const [current, setCurrent] = useState(src || fallbackSrc);
  const [failed, setFailed] = useState(false);

  const on_error = () => {
    if (current !== fallbackSrc && !failed) {
      setFailed(true);
      setCurrent(fallbackSrc);
    }
  };

  if (!current) {
    return (
      <div
        className={`grid place-items-center bg-gradient-to-br from-brand-50 to-navy-100 text-brand-400 ${className}`}
        role="img"
        aria-label={alt}
      >
        <ToothMark className="size-10" />
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={current}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onError={on_error}
        className={className}
        style={objectPosition ? { objectPosition } : undefined}
      />
    );
  }

  return (
    <Image
      src={current}
      alt={alt}
      width={1600}
      height={1067}
      sizes={sizes}
      priority={priority}
      onError={on_error}
      className={className}
      style={objectPosition ? { objectPosition } : undefined}
    />
  );
}
