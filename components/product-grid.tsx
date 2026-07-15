"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PRODUCTS, MIN_PRICE, MAX_PRICE } from "@/lib/products";
import { ProductCard, ProductCardSkeleton } from "./product-card";

const PAGE_SIZE = 8;

export function ProductGrid() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.toLowerCase() ?? "";
  const categories = searchParams.getAll("category");
  const colors = searchParams.getAll("color");
  const sizes = searchParams.getAll("size");
  const priceMin = Number(searchParams.get("priceMin") ?? MIN_PRICE);
  const priceMax = Number(searchParams.get("priceMax") ?? MAX_PRICE);

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (q && !p.title.toLowerCase().includes(q)) return false;
      if (categories.length && !categories.includes(p.category)) return false;
      if (colors.length && !p.colors.some((c) => colors.includes(c))) return false;
      if (sizes.length && !p.sizes.some((s) => sizes.includes(s))) return false;
      if (p.price < priceMin || p.price > priceMax) return false;
      return true;
    });
  }, [q, categories, colors, sizes, priceMin, priceMax]);

  const [visible, setVisible] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [q, categories.join(","), colors.join(","), sizes.join(","), priceMin, priceMax]);

  const hasMore = visible < filtered.length;

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    window.setTimeout(() => {
      setVisible((v) => Math.min(v + PAGE_SIZE, filtered.length));
      setLoadingMore(false);
    }, 500);
  }, [hasMore, loadingMore, filtered.length]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  if (filtered.length === 0) {
    return <p className="py-16 text-center text-sm text-muted">No products match your search.</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.slice(0, visible).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {loadingMore &&
          Array.from({ length: Math.min(PAGE_SIZE, filtered.length - visible) }).map((_, i) => (
            <ProductCardSkeleton key={`skeleton-${i}`} />
          ))}
      </div>
      {hasMore && <div ref={sentinelRef} className="h-1" />}
    </div>
  );
}
