"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useFilterDrawer } from "@/lib/filter-drawer-context";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { count } = useCart();
  const { setOpen: setFilterOpen } = useFilterDrawer();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const hasFilters = ["category", "color", "size", "priceMin", "priceMax"].some(
    (k) => searchParams.getAll(k).length,
  );

  function pushQuery(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) params.set("q", value.trim());
    else params.delete("q");
    router.push(`/?${params.toString()}`);
  }

  useEffect(() => {
    if (query === (searchParams.get("q") ?? "")) return;
    const timeout = window.setTimeout(() => pushQuery(query), 300);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    pushQuery(query);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-4 py-3 sm:px-6">
        <Link href="/" className="shrink-0">
          <Image src="/logo.png" alt="3D Kulture" width={200} height={195} className="h-14 w-auto" priority />
        </Link>

        <form onSubmit={onSubmit} className="order-3 w-full sm:order-2 sm:max-w-md sm:flex-1">
          <div className="flex items-center gap-2 rounded-full border border-border bg-zinc-50 px-4 py-2.5 transition-colors focus-within:border-brand focus-within:bg-white">
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-4 w-4 shrink-0 text-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              placeholder="Search products"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="shrink-0 text-muted hover:text-brand"
              >
                ✕
              </button>
            )}
          </div>
        </form>

        <div className="order-2 ml-auto flex items-center gap-4 sm:order-3">
          {pathname === "/" && (
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              aria-label="Open filters"
              className="relative flex items-center sm:hidden"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path d="M4 6h16M7 12h10M10 18h4" />
              </svg>
              {hasFilters && (
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-brand" />
              )}
            </button>
          )}
          <Link href="/cart" className="relative flex items-center gap-1 text-sm font-medium">
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <circle cx="9" cy="21" r="1.5" />
              <circle cx="19" cy="21" r="1.5" />
              <path d="M2.5 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 8H6" />
            </svg>
            {mounted && count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
