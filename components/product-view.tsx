"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useI18n } from "@/lib/i18n";
import { formatMMK } from "@/lib/format";
import { getVariantPrice, getFinalPrice, getDiscountValue } from "@/lib/pricing";
import { getStock } from "@/lib/stock";
import { ProductGallery } from "@/components/product-gallery";
import { T } from "@/components/t";
import { useColors } from "@/lib/use-colors";
import type { Product } from "@/lib/types";

export function ProductView({ product }: { product: Product }) {
  const { addLine } = useCart();
  const colorSwatches = useColors();
  const swatchByName = new Map(colorSwatches.map((c) => [c.name, c.hex]));
  const { t } = useI18n();
  const router = useRouter();
  const colors = Array.from(new Set(product.colors));
  const [color, setColor] = useState(colors[0] ?? "");
  const [size, setSize] = useState(product.sizes[0] ?? "");
  const material = product.materials.join(", ");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const allColorImages = Object.values(product.colorImages).flat();
  const galleryImages = Array.from(new Set([...product.images, ...allColorImages]));
  const focusSrc = color ? product.colorImages[color]?.[0] : undefined;
  const unitPrice = getVariantPrice(product, size);
  const finalPrice = getFinalPrice(product, size);
  const hasDiscount = getDiscountValue(product, size) > 0;
  const effectiveStock = getStock(product, color);
  const outOfStock = !product.isPreorder && effectiveStock <= 0;

  function addToCart() {
    addLine({ productId: product.id, color, size, material, qty });
  }

  return (
    <div className="grid min-w-0 gap-6 sm:grid-cols-2 sm:gap-10">
      <ProductGallery images={galleryImages} alt={product.title} focusSrc={focusSrc} />

      <div className="min-w-0 sm:sticky sm:top-24 sm:self-start">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">{product.category}</span>
          {product.isPreorder && (
            <span className="rounded-md bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
              {t("product.preorder")}
            </span>
          )}
        </div>
        <h1 className="mt-2 text-2xl font-semibold leading-snug text-foreground sm:text-3xl">{product.title}</h1>
        {hasDiscount ? (
          <div className="mt-3">
            <p className="text-3xl font-bold text-brand sm:text-4xl">{formatMMK(finalPrice)}</p>
            <p className="mt-1 text-sm text-muted line-through sm:text-base">{formatMMK(unitPrice)}</p>
          </div>
        ) : (
          <p className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">{formatMMK(finalPrice)}</p>
        )}
        {product.description && (
          <div className="mt-4">
            <p
              className={`min-w-0 wrap-break-word text-sm leading-6 tracking-wide text-muted ${
                descExpanded ? "" : "line-clamp-3"
              }`}
            >
              {product.description}
            </p>
            <button
              type="button"
              onClick={() => setDescExpanded((v) => !v)}
              className="mt-1 text-xs font-semibold text-brand"
            >
              {descExpanded ? t("product.seeLess") : t("product.seeMore")}
            </button>
          </div>
        )}

        {product.isPreorder ? (
          <div className="mt-4 rounded-2xl border border-dashed border-brand bg-brand/5 py-3 text-center text-sm text-brand">
            {product.preorderNote || t("product.preorderNotice")}
          </div>
        ) : effectiveStock <= 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-brand bg-brand/5 py-3 text-center text-sm font-medium text-brand">
            {t("product.outOfStock")}
          </div>
        ) : (
          effectiveStock <= product.lowStockThreshold && (
            <div className="mt-4 rounded-2xl border border-dashed border-brand bg-brand/5 py-3 text-center text-sm text-brand">
              {t("product.lowStockPrefix")} <span className="font-bold">{effectiveStock}</span>{" "}
              {t("product.lowStockSuffix")}
            </div>
          )
        )}

        <div className="mt-6 space-y-6 border-t border-border pt-6">
          {colors.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">
                {t("product.color")}: <span className="text-foreground">{color}</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => {
                  const colorOutOfStock = !product.isPreorder && getStock(product, c) <= 0;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => !colorOutOfStock && setColor(c)}
                      disabled={colorOutOfStock}
                      aria-label={colorOutOfStock ? `${c} (${t("product.outOfStock")})` : c}
                      title={colorOutOfStock ? `${c} — ${t("product.outOfStock")}` : c}
                      className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-shadow ${
                        colorOutOfStock
                          ? "cursor-not-allowed opacity-30"
                          : c === color
                            ? "ring-2 ring-foreground ring-offset-1"
                            : "hover:ring-2 hover:ring-border hover:ring-offset-1"
                      }`}
                    >
                      <span
                        className="h-full w-full rounded-full border border-black/10"
                        style={{ backgroundColor: swatchByName.get(c) ?? "#d4d4d4" }}
                      />
                      {colorOutOfStock && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="h-[1.5px] w-7 rotate-45 bg-foreground/70" />
                        </span>
                      )}
                    </button>
                  );
                })}
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
                    className={`min-w-11 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      s === size
                        ? "border-2 border-foreground font-semibold text-foreground"
                        : "border-border text-foreground hover:border-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.materials.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-muted">
                {t("product.material")}: <span className="font-semibold text-foreground">{material}</span>
              </h3>
            </div>
          )}

          <div className="flex items-stretch gap-3 pt-1">
            <div className="flex items-center rounded-full border border-border">
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
              disabled={outOfStock}
              onClick={() => {
                addToCart();
                setAdded(true);
                window.setTimeout(() => setAdded(false), 1500);
              }}
              className="flex-1 rounded-full border border-brand text-[11px] font-semibold uppercase tracking-widest text-brand transition-colors hover:bg-brand hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-brand"
            >
              {added ? t("product.addedToCart") : t("product.addToCart")}
            </button>
          </div>

          <button
            type="button"
            disabled={outOfStock}
            onClick={() => {
              addToCart();
              router.push("/checkout");
            }}
            className="w-full rounded-full bg-brand py-4 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-brand"
          >
            {product.isPreorder ? t("product.preorderNow") : t("product.buyNow")}
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-border px-4 py-3 text-center text-sm text-muted">
          <T k="product.needHelp" />
        </div>
      </div>
    </div>
  );
}
