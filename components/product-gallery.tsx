"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export function ProductGallery({
  images,
  alt,
  focusSrc,
}: {
  images: string[];
  alt: string;
  focusSrc?: string;
}) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("center");
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!focusSrc) return;
    const idx = images.indexOf(focusSrc);
    if (idx >= 0) setActive(idx);
  }, [focusSrc, images]);

  useEffect(() => {
    thumbRefs.current[active]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [active]);

  return (
    <div className="min-w-0">
      <div
        className="relative aspect-square w-full max-w-[605px] cursor-zoom-in overflow-hidden rounded-[20px] bg-zinc-100"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          setOrigin(`${x}% ${y}%`);
        }}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
      >
        <Image
          src={images[active]}
          alt={alt}
          fill
          sizes="(min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-200"
          style={{
            transform: zoomed ? "scale(1.8)" : "scale(1)",
            transformOrigin: origin,
          }}
          priority
        />
      </div>

      <div className="scroll-thin mt-3 flex gap-1.5 overflow-x-auto pb-1">
        {images.map((src, i) => (
          <button
            key={src}
            ref={(el) => {
              thumbRefs.current[i] = el;
            }}
            type="button"
            onClick={() => setActive(i)}
            className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition-colors sm:h-14 sm:w-14 ${
              i === active ? "border-brand" : "border-border"
            }`}
            aria-label={`Show image ${i + 1}`}
          >
            <Image src={src} alt="" fill sizes="56px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
