"use client";

import Image from "next/image";
import { useI18n } from "@/lib/i18n";

export function Hero() {
  const { t } = useI18n();

  return (
    <section className="relative min-h-48 overflow-hidden bg-foreground sm:min-h-105">
      <Image
        src="https://images.unsplash.com/photo-1762089423685-60f5cef02cda?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGFuaW1lJTIwZmlndXJlc3xlbnwwfHwwfHx8MA%3D%3D"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-br from-black/60 via-brand-dark/35 to-black/75" />
      <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-center gap-3 px-4 py-8 sm:gap-4 sm:px-6 sm:py-20">
        <span className="border border-white/30 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white sm:text-xs">
          {t("hero.badge")}
        </span>
        <h1 className="max-w-xl text-xl font-semibold leading-tight text-white sm:whitespace-nowrap sm:text-6xl">
          {t("hero.title")}
        </h1>
        <p className="max-w-md text-xs tracking-wide text-white/75 sm:text-base">{t("hero.subtitle")}</p>
      </div>
    </section>
  );
}
