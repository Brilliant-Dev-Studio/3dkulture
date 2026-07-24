"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFilterDrawer } from "@/lib/filter-drawer-context";
import { useFilterOptions } from "@/lib/use-filter-options";
import { useI18n } from "@/lib/i18n";
import { AccordionSection } from "./accordion";
import type { Category } from "@/lib/types";

function useFilterParam(key: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const values = searchParams.getAll(key);

  function toggle(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const all = params.getAll(key);
    params.delete(key);
    const next = all.includes(value) ? all.filter((v) => v !== value) : [...all, value];
    next.forEach((v) => params.append(key, v));
    router.push(`/?${params.toString()}`, { scroll: false });
  }

  return { values, toggle };
}

function CategoryFilterGroup({ title, categories }: { title: string; categories: Category[] }) {
  const { values, toggle } = useFilterParam("category");
  const mains = categories.filter((c) => !c.parentId);
  const subsOf = (main: Category) => categories.filter((c) => c.parentId === main.id);

  return (
    <AccordionSection title={title}>
      <ul className="scroll-thin max-h-64 space-y-3 overflow-y-auto pr-1">
        {mains.map((main) => {
          const subs = subsOf(main);
          return (
            <li key={main.id}>
              <span className="block text-sm font-medium text-foreground">{main.name}</span>
              {subs.length > 0 && (
                <ul className="mt-1.5 space-y-1.5 pl-6">
                  {subs.map((sub) => {
                    const selected = values.includes(sub.name);
                    return (
                      <li key={sub.id}>
                        <button
                          type="button"
                          onClick={() => toggle(sub.name)}
                          aria-pressed={selected}
                          className={`text-sm transition-colors ${
                            selected ? "font-semibold text-foreground" : "text-muted hover:text-foreground"
                          }`}
                        >
                          {sub.name}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </AccordionSection>
  );
}

function PriceInput({
  value,
  onChange,
  onCommit,
  step = 1000,
}: {
  value: number;
  onChange: (v: number) => void;
  onCommit: (v: number) => void;
  step?: number;
}) {
  function stepBy(delta: number) {
    const next = value + delta;
    onChange(next);
    onCommit(next);
  }

  return (
    <div className="relative flex-1">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">K</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onBlur={() => onCommit(value)}
        className="no-spinner w-full rounded-xl border border-border py-2 pl-6 pr-6 text-sm"
      />
      <div className="absolute right-1 top-1/2 flex -translate-y-1/2 flex-col">
        <button
          type="button"
          tabIndex={-1}
          aria-label="Increase"
          onClick={() => stepBy(step)}
          className="flex h-3.5 w-4 items-center justify-center text-muted hover:text-foreground"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth={3}>
            <path d="m6 15 6-6 6 6" />
          </svg>
        </button>
        <button
          type="button"
          tabIndex={-1}
          aria-label="Decrease"
          onClick={() => stepBy(-step)}
          className="flex h-3.5 w-4 items-center justify-center text-muted hover:text-foreground"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth={3}>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function PriceRangeFilter({ minPrice, maxPrice }: { minPrice: number; maxPrice: number }) {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlMin = Number(searchParams.get("priceMin") ?? minPrice);
  const urlMax = Number(searchParams.get("priceMax") ?? maxPrice);

  const [min, setMin] = useState(urlMin);
  const [max, setMax] = useState(urlMax);

  useEffect(() => {
    setMin(urlMin);
    setMax(urlMax);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minPrice, maxPrice]);

  function commit(nextMin: number, nextMax: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextMin <= minPrice) params.delete("priceMin");
    else params.set("priceMin", String(nextMin));
    if (nextMax >= maxPrice) params.delete("priceMax");
    else params.set("priceMax", String(nextMax));
    router.push(`/?${params.toString()}`, { scroll: false });
  }

  const minPct = maxPrice > minPrice ? ((min - minPrice) / (maxPrice - minPrice)) * 100 : 0;
  const maxPct = maxPrice > minPrice ? ((max - minPrice) / (maxPrice - minPrice)) * 100 : 100;

  return (
    <AccordionSection title={t("filter.price")}>
      <div className="flex items-center gap-2">
        <PriceInput
          value={min}
          onChange={setMin}
          onCommit={(v) => commit(Math.max(minPrice, Math.min(v, max)), max)}
        />
        <span className="text-muted">–</span>
        <PriceInput
          value={max}
          onChange={setMax}
          onCommit={(v) => commit(min, Math.min(maxPrice, Math.max(v, min)))}
        />
      </div>

      <div className="mt-4 flex justify-between text-sm text-foreground">
        <span>K{min.toLocaleString("en-US")}</span>
        <span>K{max.toLocaleString("en-US")}</span>
      </div>

      <div className="range-slider relative mt-2 h-[18px]">
        <div className="absolute top-1/2 h-[2px] w-full -translate-y-1/2 rounded-full bg-zinc-300" />
        <div
          className="absolute top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-foreground"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
        />
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          step={1000}
          value={min}
          onChange={(e) => setMin(Math.min(Number(e.target.value), max))}
          onMouseUp={() => commit(min, max)}
          onTouchEnd={() => commit(min, max)}
        />
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          step={1000}
          value={max}
          onChange={(e) => setMax(Math.max(Number(e.target.value), min))}
          onMouseUp={() => commit(min, max)}
          onTouchEnd={() => commit(min, max)}
          className="z-10"
        />
      </div>
    </AccordionSection>
  );
}

function FilterFields({
  categories,
  minPrice,
  maxPrice,
}: {
  categories: Category[];
  minPrice: number;
  maxPrice: number;
}) {
  const { t } = useI18n();
  return (
    <>
      <PriceRangeFilter minPrice={minPrice} maxPrice={maxPrice} />
      <CategoryFilterGroup title={t("filter.category")} categories={categories} />
    </>
  );
}

export function FilterSidebar() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { open: mobileOpen, setOpen: setMobileOpen } = useFilterDrawer();
  const { categories, minPrice, maxPrice } = useFilterOptions();
  const hasFilters = ["category", "priceMin", "priceMax"].some((k) => searchParams.getAll(k).length);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("priceMin");
    params.delete("priceMax");
    router.push(`/?${params.toString()}`, { scroll: false });
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 sm:block">
        <div className="scroll-thin sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-[20px] border border-border bg-white p-5">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-lg font-medium">{t("filter.title")}</h2>
            {hasFilters && (
              <button type="button" onClick={clearAll} className="text-xs font-medium text-brand">
                {t("filter.clearAll")}
              </button>
            )}
          </div>
          <FilterFields categories={categories} minPrice={minPrice} maxPrice={maxPrice} />
        </div>
      </aside>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 sm:hidden ${mobileOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!mobileOpen}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`scroll-thin absolute inset-y-0 left-0 flex w-[85%] max-w-xs flex-col bg-white shadow-xl transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-lg font-medium">{t("filter.title")}</h2>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close filters"
              className="p-1"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
          <div className="scroll-thin flex-1 overflow-y-auto px-4">
            <FilterFields categories={categories} minPrice={minPrice} maxPrice={maxPrice} />
          </div>
          <div className="border-t border-border p-4">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="w-full rounded-full bg-brand py-3 text-sm font-bold text-white"
            >
              {t("filter.showResults")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
