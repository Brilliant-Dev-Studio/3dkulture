"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES, COLORS, SIZES, MIN_PRICE, MAX_PRICE } from "@/lib/products";
import { useFilterDrawer } from "@/lib/filter-drawer-context";
import { AccordionSection } from "./accordion";

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
    router.push(`/?${params.toString()}`);
  }

  return { values, toggle };
}

function FilterGroup({
  title,
  paramKey,
  options,
}: {
  title: string;
  paramKey: string;
  options: string[];
}) {
  const { values, toggle } = useFilterParam(paramKey);

  return (
    <AccordionSection title={title}>
      <ul className="scroll-thin max-h-44 space-y-2 overflow-y-auto pr-1">
        {options.map((option) => (
          <li key={option}>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={values.includes(option)}
                onChange={() => toggle(option)}
                className="h-4 w-4 shrink-0 accent-brand"
              />
              <span className={values.includes(option) ? "font-semibold" : ""}>{option}</span>
            </label>
          </li>
        ))}
      </ul>
    </AccordionSection>
  );
}

function PriceRangeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlMin = Number(searchParams.get("priceMin") ?? MIN_PRICE);
  const urlMax = Number(searchParams.get("priceMax") ?? MAX_PRICE);

  const [min, setMin] = useState(urlMin);
  const [max, setMax] = useState(urlMax);

  function commit(nextMin: number, nextMax: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextMin <= MIN_PRICE) params.delete("priceMin");
    else params.set("priceMin", String(nextMin));
    if (nextMax >= MAX_PRICE) params.delete("priceMax");
    else params.set("priceMax", String(nextMax));
    router.push(`/?${params.toString()}`);
  }

  const minPct = ((min - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;
  const maxPct = ((max - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;

  return (
    <AccordionSection title="Price">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
            K
          </span>
          <input
            type="number"
            value={min}
            min={MIN_PRICE}
            max={max}
            onChange={(e) => setMin(Number(e.target.value))}
            onBlur={() => commit(Math.max(MIN_PRICE, Math.min(min, max)), max)}
            className="w-full rounded border border-border py-2 pl-6 pr-2 text-sm"
          />
        </div>
        <span className="text-muted">–</span>
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
            K
          </span>
          <input
            type="number"
            value={max}
            min={min}
            max={MAX_PRICE}
            onChange={(e) => setMax(Number(e.target.value))}
            onBlur={() => commit(min, Math.min(MAX_PRICE, Math.max(max, min)))}
            className="w-full rounded border border-border py-2 pl-6 pr-2 text-sm"
          />
        </div>
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
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={1000}
          value={min}
          onChange={(e) => setMin(Math.min(Number(e.target.value), max))}
          onMouseUp={() => commit(min, max)}
          onTouchEnd={() => commit(min, max)}
        />
        <input
          type="range"
          min={MIN_PRICE}
          max={MAX_PRICE}
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

function FilterFields() {
  return (
    <>
      <PriceRangeFilter />
      <FilterGroup title="Category" paramKey="category" options={CATEGORIES} />
      <FilterGroup title="Color" paramKey="color" options={COLORS} />
      <FilterGroup title="Size" paramKey="size" options={SIZES} />
    </>
  );
}

export function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { open: mobileOpen, setOpen: setMobileOpen } = useFilterDrawer();
  const hasFilters = ["category", "color", "size", "priceMin", "priceMax"].some(
    (k) => searchParams.getAll(k).length,
  );

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("color");
    params.delete("size");
    params.delete("priceMin");
    params.delete("priceMax");
    router.push(`/?${params.toString()}`);
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 sm:block">
        <div className="scroll-thin sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-lg font-medium">Filters</h2>
            {hasFilters && (
              <button type="button" onClick={clearAll} className="text-xs font-medium text-brand">
                Clear all
              </button>
            )}
          </div>
          <FilterFields />
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
            <h2 className="text-lg font-medium">Filters</h2>
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
            <FilterFields />
          </div>
          <div className="border-t border-border p-4">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="w-full rounded-full bg-brand py-3 text-sm font-bold text-white"
            >
              Show results
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
