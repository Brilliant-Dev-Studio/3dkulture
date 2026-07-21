"use client";

import { useEffect, useState } from "react";
import type { Product } from "./types";

export type BestSellingProduct = Product & { soldQty: number };

export function useBestSellingProducts(limit = 8) {
  const [products, setProducts] = useState<BestSellingProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/best-selling?limit=${limit}`)
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [limit]);

  return { products, loading };
}
