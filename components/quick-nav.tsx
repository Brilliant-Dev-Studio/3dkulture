"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Category } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { Container } from "./container";

function PrinterIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

function FigureIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="7" r="3.2" />
      <path d="M5 21c0-4.2 3.1-7.5 7-7.5s7 3.3 7 7.5" />
    </svg>
  );
}

function PaletteIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M12 2a10 10 0 1 0 0 20c1.4 0 2-.9 2-1.9 0-.5-.2-.9-.5-1.3-.3-.4-.5-.8-.5-1.3 0-.9.8-1.7 1.7-1.7H16a3.3 3.3 0 0 0 3.3-3.3C19.3 6.6 16 2 12 2Z" />
      <circle cx="7.5" cy="11" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="9.8" cy="7" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="14.2" cy="7" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function MaskIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M3 8.5C3 5.5 7 3.5 12 3.5s9 2 9 5c0 5.2-2.8 9.5-9 9.5S3 13.7 3 8.5Z" />
      <circle cx="8.7" cy="9.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15.3" cy="9.5" r="1.1" fill="currentColor" stroke="none" />
      <path d="M9 13.5c1.8 1.4 4.2 1.4 6 0" />
    </svg>
  );
}

function CubeIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M21 8v8a1 1 0 0 1-.5.87l-8 4.6a1 1 0 0 1-1 0l-8-4.6A1 1 0 0 1 3 16V8a1 1 0 0 1 .5-.87l8-4.6a1 1 0 0 1 1 0l8 4.6a1 1 0 0 1 .5.87Z" />
      <path d="m3.5 7.5 8.5 4.9 8.5-4.9M12 12.4V21.5" />
    </svg>
  );
}

const ICON_RULES: [RegExp, () => React.JSX.Element][] = [
  [/print/i, PrinterIcon],
  [/figure|action|toy|model/i, FigureIcon],
  [/art|paint|craft/i, PaletteIcon],
  [/cosplay|prop|costume|mask/i, MaskIcon],
];

function iconFor(name: string) {
  const rule = ICON_RULES.find(([re]) => re.test(name));
  const Icon = rule ? rule[1] : CubeIcon;
  return <Icon />;
}

export function QuickNav() {
  const { t } = useI18n();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  const mains = categories.filter((c) => !c.parentId).slice(0, 4);
  if (mains.length === 0) return null;

  return (
    <Container className="py-4 sm:py-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {mains.map((c) => (
          <Link
            key={c.id}
            href={`/?category=${encodeURIComponent(c.name)}`}
            className="group flex items-center gap-3 rounded-[20px] border border-border bg-white px-4 py-4 transition-colors hover:border-brand"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
              {iconFor(c.name)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-foreground">{c.name}</span>
              <span className="block text-xs text-muted">{t("home.shopNow")}</span>
            </span>
          </Link>
        ))}
      </div>
    </Container>
  );
}
