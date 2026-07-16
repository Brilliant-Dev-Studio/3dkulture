"use client";

import { useEffect, useState } from "react";
import type { Product } from "./types";

export function useProducts(queryString?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products${queryString ? `?${queryString}` : ""}`)
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [queryString]);

  return { products, loading };
}
