"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { HeroSlide } from "@/lib/types";
import { Container } from "./container";

const AUTO_ADVANCE_MS = 6000;

function SlideContent({ slide }: { slide: HeroSlide }) {
  return (
    <>
      {slide.badge && (
        <span className="rounded-md border border-white/30 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white sm:text-xs">
          {slide.badge}
        </span>
      )}
      <h1 className="max-w-xl text-xl font-semibold leading-tight text-white sm:text-6xl">{slide.title}</h1>
      {slide.subtitle && <p className="max-w-md text-xs tracking-wide text-white/75 sm:text-base">{slide.subtitle}</p>}
    </>
  );
}

export function Hero() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    fetch("/api/hero-slides")
      .then((r) => (r.ok ? r.json() : []))
      .then(setSlides)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = window.setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [slides.length]);

  if (!loading && slides.length === 0) return null;

  const slide = slides[active];

  return (
    <section className="bg-zinc-50 py-4 sm:py-6">
      <Container>
        <div className="relative min-h-48 overflow-hidden rounded-[20px] bg-foreground sm:min-h-105">
          {slide && (
            <Image
              key={slide.id}
              src={slide.image}
              alt=""
              fill
              priority
              sizes="(min-width: 1280px) 1280px, 100vw"
              unoptimized
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-br from-black/60 via-brand-dark/35 to-black/75" />

          <div className="relative flex h-full flex-col items-start justify-center gap-3 px-4 py-8 sm:gap-4 sm:px-10 sm:py-20">
            {slide &&
              (slide.linkUrl ? (
                <Link href={slide.linkUrl} className="contents">
                  <SlideContent slide={slide} />
                </Link>
              ) : (
                <SlideContent slide={slide} />
              ))}
          </div>

          {slides.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous slide"
                onClick={() => setActive((i) => (i - 1 + slides.length) % slides.length)}
                className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-md hover:bg-white/25 sm:left-4 sm:h-10 sm:w-10"
              >
                <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="m15 6-6 6 6 6" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Next slide"
                onClick={() => setActive((i) => (i + 1) % slides.length)}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-md hover:bg-white/25 sm:right-4 sm:h-10 sm:w-10"
              >
                <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </button>

              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 sm:bottom-6">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => setActive(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === active ? "w-6 bg-white" : "w-1.5 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </Container>
    </section>
  );
}
