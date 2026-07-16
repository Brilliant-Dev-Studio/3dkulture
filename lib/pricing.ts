import type { Product } from "./types";

export function getVariantPrice(product: Product, size: string, material: string): number {
  const sizeDelta = product.sizePrices?.[size] ?? 0;
  const materialDelta = product.materialPrices?.[material] ?? 0;
  return product.price + sizeDelta + materialDelta;
}

export function getFinalPrice(product: Product, size: string, material: string): number {
  const base = getVariantPrice(product, size, material);
  if (!product.discountValue) return base;
  const discounted =
    product.discountType === "fixed" ? base - product.discountValue : base * (1 - product.discountValue / 100);
  return Math.max(0, Math.round(discounted));
}
