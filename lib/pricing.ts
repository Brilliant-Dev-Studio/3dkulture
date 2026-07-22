import type { Product } from "./types";

export function getVariantPrice(product: Product, size: string): number {
  const sizePrice = product.sizePrices?.[size];
  return sizePrice != null ? sizePrice : product.price;
}

export function getDiscountValue(product: Product, size: string): number {
  const sizeDiscount = product.sizeDiscounts?.[size];
  return sizeDiscount != null ? sizeDiscount : product.discountValue;
}

export function getFinalPrice(product: Product, size: string): number {
  const base = getVariantPrice(product, size);
  const discountValue = getDiscountValue(product, size);
  if (!discountValue) return base;
  const discounted =
    product.discountType === "fixed" ? base - discountValue : base * (1 - discountValue / 100);
  return Math.max(0, Math.round(discounted));
}
