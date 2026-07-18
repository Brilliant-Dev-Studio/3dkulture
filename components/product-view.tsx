"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useI18n } from "@/lib/i18n";
import { formatMMK } from "@/lib/format";
import { getVariantPrice, getFinalPrice } from "@/lib/pricing";
import { ProductGallery } from "@/components/product-gallery";
import { T } from "@/components/t";
import type { Product } from "@/lib/types";

export function ProductView({ product }: { product: Product }) {
  const { addLine } = useCart();
  const { t } = useI18n();
  const router = useRouter();
  const [color, setColor] = useState(product.colors[0] ?? "");
  const [size, setSize] = useState(product.sizes[0] ?? "");
  const [material, setMaterial] = useState(product.materials[0] ?? "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const extraImages = [
    ...((color && product.colorImages[color]) || []),
    ...((material && product.materialImages[material]) || []),
  ];
  const galleryImages = Array.from(new Set([...extraImages, ...product.images]));
  const unitPrice = getVariantPrice(product, size, material);
  const finalPrice = getFinalPrice(product, size, material);
  const hasDiscount = product.discountValue > 0;
  const discountLabel =
    product.discountType === "fixed" ? `-${formatMMK(product.discountValue)}` : `-${product.discountValue}%`;

  function addToCart() {
    addLine({ productId: product.id, color, size, material, qty });
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 sm:gap-10">
      <ProductGallery key={`${color}-${material}`} images={galleryImages} alt={product.title} />

      <div className="sm:sticky sm:top-24 sm:self-start">
        <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">{product.category}</span>
        <h1 className="mt-2 text-3xl font-semibold leading-snug text-foreground">{product.title}</h1>
        {hasDiscount ? (
          <div className="mt-3 flex items-center gap-3">
            <p className="text-3xl font-semibold text-brand">{formatMMK(finalPrice)}</p>
            <p className="text-lg text-muted line-through">{formatMMK(unitPrice)}</p>
            <span className="rounded bg-brand px-2 py-1 text-xs font-bold text-white">{discountLabel}</span>
          </div>
        ) : (
          <p className="mt-3 text-3xl font-semibold text-foreground">{formatMMK(finalPrice)}</p>
        )}
        <p className="mt-4 text-sm leading-6 tracking-wide text-muted">{product.description}</p>

        {product.stock <= 0 ? (
          <div className="mt-4 rounded-md border border-dashed border-brand bg-brand/5 py-3 text-center text-sm font-medium text-brand">
            {t("product.outOfStock")}
          </div>
        ) : (
          product.stock <= product.lowStockThreshold && (
            <div className="mt-4 rounded-md border border-dashed border-brand bg-brand/5 py-3 text-center text-sm text-brand">
              {t("product.lowStockPrefix")} <span className="font-bold">{product.stock}</span>{" "}
              {t("product.lowStockSuffix")}
            </div>
          )
        )}

        <div className="mt-6 space-y-6 border-t border-border pt-6">
          {product.colors.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">
                {t("product.color")}: <span className="text-foreground">{color}</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                      c === color
                        ? "border-2 border-foreground font-semibold text-foreground"
                        : "border-border text-foreground hover:border-foreground"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.sizes.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">
                {t("product.size")}: <span className="text-foreground">{size}</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`min-w-11 rounded-md border px-2 py-1.5 text-xs transition-colors ${
                      s === size
                        ? "border-2 border-foreground font-semibold text-foreground"
                        : "border-border text-foreground hover:border-foreground"
                    }`}
                  >
                    {s}
                    {product.sizePrices[s] ? ` (+${formatMMK(product.sizePrices[s])})` : ""}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.materials.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">
                {t("product.material")}: <span className="text-foreground">{material}</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.materials.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMaterial(m)}
                    className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                      m === material
                        ? "border-2 border-foreground font-semibold text-foreground"
                        : "border-border text-foreground hover:border-foreground"
                    }`}
                  >
                    {m}
                    {product.materialPrices[m] ? ` (+${formatMMK(product.materialPrices[m])})` : ""}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-stretch gap-3 pt-1">
            <div className="flex items-center rounded-md border border-border">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-12 w-10 items-center justify-center text-lg font-medium text-foreground"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-semibold">{qty}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQty((q) => q + 1)}
                className="flex h-12 w-10 items-center justify-center text-lg font-medium text-foreground"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                addToCart();
                setAdded(true);
                window.setTimeout(() => setAdded(false), 1500);
              }}
              className="flex-1 rounded-md bg-brand text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-brand-dark"
            >
              {added ? t("product.addedToCart") : t("product.addToCart")}
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              addToCart();
              router.push("/checkout");
            }}
            className="w-full rounded-md bg-foreground py-3 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-black"
          >
            {t("product.buyNow")}
          </button>
        </div>

        <div className="mt-4 rounded-md border border-border px-4 py-3 text-center text-sm text-muted">
          <T k="product.needHelp" />
        </div>
      </div>
    </div>
  );
}
