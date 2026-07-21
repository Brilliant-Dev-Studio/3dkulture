"use client";

import { useEffect, useState } from "react";
import type { Category, Product } from "./types";

export function useFilterOptions() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
    fetch("/api/products")
      .then((r) => r.json())
      .then((products: Product[]) => {
        if (products.length === 0) return;
        setMinPrice(Math.min(...products.map((p) => p.price)));
        setMaxPrice(Math.max(...products.map((p) => p.price)));
      });
  }, []);

  return { categories, minPrice, maxPrice };
}
