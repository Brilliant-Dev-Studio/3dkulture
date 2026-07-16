"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useProducts } from "@/lib/use-products";
import { useI18n } from "@/lib/i18n";
import { ProductCard, ProductCardSkeleton } from "./product-card";

const PAGE_SIZE = 8;

export function ProductGrid() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const { products, loading } = useProducts(queryString);

  const [visible, setVisible] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [queryString]);

  const hasMore = visible < products.length;

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    window.setTimeout(() => {
      setVisible((v) => Math.min(v + PAGE_SIZE, products.length));
      setLoadingMore(false);
    }, 500);
  }, [hasMore, loadingMore, products.length]);

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

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: PAGE_SIZE }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <p className="py-16 text-center text-sm text-muted">{t("filter.noResults")}</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {products.slice(0, visible).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {loadingMore &&
          Array.from({ length: Math.min(PAGE_SIZE, products.length - visible) }).map((_, i) => (
            <ProductCardSkeleton key={`skeleton-${i}`} />
          ))}
      </div>
      {hasMore && <div ref={sentinelRef} className="h-1" />}
    </div>
  );
}
