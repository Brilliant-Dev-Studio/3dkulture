"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { formatMMK } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  const [imgIndex, setImgIndex] = useState(0);
  const count = product.images.length;
  const hasDiscount = product.discountValue > 0;
  const discountedPrice = Math.max(
    0,
    Math.round(
      product.discountType === "fixed"
        ? product.price - product.discountValue
        : product.price * (1 - product.discountValue / 100),
    ),
  );
  const discountLabel =
    product.discountType === "fixed" ? `-${formatMMK(product.discountValue)}` : `-${product.discountValue}%`;

  function go(delta: number, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setImgIndex((i) => (i + delta + count) % count);
  }

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-zinc-100 transition-shadow duration-300 group-hover:shadow-lg">
        <Image
          src={product.images[imgIndex]}
          alt={product.title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {hasDiscount && (
          <span className="absolute left-2 top-2 rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
            {discountLabel}
          </span>
        )}

        <button
          type="button"
          aria-label="Previous image"
          onClick={(e) => go(-1, e)}
          className="absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/25 text-white opacity-100 shadow-sm backdrop-blur-md transition-opacity hover:bg-white/40 sm:opacity-0 sm:group-hover:opacity-100"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="m15 6-6 6 6 6" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Next image"
          onClick={(e) => go(1, e)}
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/25 text-white opacity-100 shadow-sm backdrop-blur-md transition-opacity hover:bg-white/40 sm:opacity-0 sm:group-hover:opacity-100"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="m9 6 6 6-6 6" />
          </svg>
        </button>

        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
          {product.images.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${i === imgIndex ? "bg-brand" : "bg-white/70"}`}
            />
          ))}
        </div>
      </div>

      <div className="pt-3.5">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
          {product.category}
        </p>
        <p className="mt-1 text-sm text-foreground transition-colors group-hover:text-brand">
          {product.title}
        </p>
        {hasDiscount ? (
          <p className="mt-1 flex items-center gap-1.5">
            <span className="text-base font-semibold text-brand">{formatMMK(discountedPrice)}</span>
            <span className="text-xs text-muted line-through">{formatMMK(product.price)}</span>
          </p>
        ) : (
          <p className="mt-1 text-base font-semibold text-foreground">{formatMMK(product.price)}</p>
        )}
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square rounded-xl bg-zinc-200" />
      <div className="pt-3 space-y-2">
        <div className="h-4 w-1/3 rounded bg-zinc-200" />
        <div className="h-4 w-3/4 rounded bg-zinc-200" />
        <div className="h-3 w-1/2 rounded bg-zinc-200" />
      </div>
    </div>
  );
}
