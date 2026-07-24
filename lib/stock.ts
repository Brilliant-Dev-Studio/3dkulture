import type { Product } from "./types";

export function getStock(product: Product, color: string): number {
  const colorStock = product.colorStock?.[color];
  return colorStock != null ? colorStock : product.stock;
}
