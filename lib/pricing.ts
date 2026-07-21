import type { Product } from "./types";

export function getVariantPrice(product: Product, size: string, material: string): number {
  const sizePrice = product.sizePrices?.[size];
  const base = sizePrice != null ? sizePrice : product.price;
  const materialDelta = product.materialPrices?.[material] ?? 0;
  return base + materialDelta;
}

export function getDiscountValue(product: Product, size: string): number {
  const sizeDiscount = product.sizeDiscounts?.[size];
  return sizeDiscount != null ? sizeDiscount : product.discountValue;
}

export function getFinalPrice(product: Product, size: string, material: string): number {
  const base = getVariantPrice(product, size, material);
  const discountValue = getDiscountValue(product, size);
  if (!discountValue) return base;
  const discounted =
    product.discountType === "fixed" ? base - discountValue : base * (1 - discountValue / 100);
  return Math.max(0, Math.round(discounted));
}
