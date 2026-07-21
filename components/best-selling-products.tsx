"use client";

import { useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { useBestSellingProducts } from "@/lib/use-best-selling-products";
import { ProductCard, ProductCardSkeleton } from "./product-card";
import { Container } from "./container";

const CARD_WIDTH =
  "w-[calc(50%-0.5rem)] sm:w-[calc(25%-0.75rem)] lg:w-[calc(20%-0.8rem)] xl:w-[calc(16.666%-0.834rem)]";

export function BestSellingProducts() {
  const { t } = useI18n();
  const { products, loading } = useBestSellingProducts(10);
  const trackRef = useRef<HTMLDivElement>(null);

  if (!loading && products.length === 0) return null;

  function scrollBy(delta: number) {
    trackRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <Container as="section" className="pt-12">
      <div className="rounded-[20px] border border-border bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <svg aria-hidden viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="currentColor">
                <path d="M12 2c.3 3.4-1 5.6-3 7.6-2.2 2.2-3 4.3-3 6.6a6 6 0 0 0 12 0c0-1.7-.6-2.9-1.6-4.2-.2 1.6-.9 2.6-1.8 3.3.4-2-.1-3.6-1.4-5.1-.9-1-1.4-2.3-1.2-4.1-.4.4-.7.9-1 1.4-.6-1.7-.1-3.6 1-5.5Z" />
              </svg>
            </span>
            <div>
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">{t("home.bestSelling")}</h2>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand">{t("home.bestSellingTag")}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden gap-2 sm:flex">
              <button
                type="button"
                aria-label="Scroll left"
                onClick={() => scrollBy(-320)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-brand hover:text-brand"
              >
                <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="m15 6-6 6 6 6" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Scroll right"
                onClick={() => scrollBy(320)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-brand hover:text-brand"
              >
                <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </button>
            </div>

            <a
              href="/#all-products"
              className="shrink-0 rounded-full border border-brand px-4 py-2 text-xs font-bold uppercase tracking-wide text-brand transition-colors hover:bg-brand hover:text-white"
            >
              {t("home.shopAll")}
            </a>
          </div>
        </div>

        <div
          ref={trackRef}
          className="scroll-thin mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
        >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`shrink-0 snap-start ${CARD_WIDTH}`}>
                  <ProductCardSkeleton />
                </div>
              ))
            : products.map((product, i) => (
                <div key={product.id} className={`shrink-0 snap-start ${CARD_WIDTH}`}>
                  <ProductCard
                    product={product}
                    rank={i + 1}
                    soldLabel={product.soldQty > 0 ? `${product.soldQty}+ ${t("product.soldSuffix")}` : undefined}
                  />
                </div>
              ))}
        </div>
      </div>
    </Container>
  );
}
