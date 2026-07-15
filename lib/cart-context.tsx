"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartLine } from "./types";

type CartContextValue = {
  lines: CartLine[];
  addLine: (line: CartLine) => void;
  removeLine: (index: number) => void;
  setQty: (index: number, qty: number) => void;
  clear: () => void;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "3dkulture:cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      addLine: (line) =>
        setLines((prev) => {
          const existing = prev.findIndex(
            (l) => l.productId === line.productId && l.color === line.color && l.size === line.size,
          );
          if (existing >= 0) {
            const next = [...prev];
            next[existing] = { ...next[existing], qty: next[existing].qty + line.qty };
            return next;
          }
          return [...prev, line];
        }),
      removeLine: (index) => setLines((prev) => prev.filter((_, i) => i !== index)),
      setQty: (index, qty) =>
        setLines((prev) => prev.map((l, i) => (i === index ? { ...l, qty } : l))),
      clear: () => setLines([]),
      count: lines.reduce((sum, l) => sum + l.qty, 0),
    }),
    [lines],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
