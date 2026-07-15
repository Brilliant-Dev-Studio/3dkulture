"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("center");

  return (
    <div className="min-w-0">
      <div
        className="relative aspect-square w-full max-w-[605px] cursor-zoom-in overflow-hidden bg-zinc-100"
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

      <div className="mt-3 flex gap-2">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setActive(i)}
            className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
              i === active ? "border-brand" : "border-border"
            }`}
            aria-label={`Show image ${i + 1}`}
          >
            <Image src={src} alt="" fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
