"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Category, ColorSwatch, Product } from "./types";

type AdminStoreValue = {
  products: Product[];
  categories: Category[];
  colors: ColorSwatch[];
  sizes: string[];
  materials: string[];
  loading: boolean;
  addProduct: (product: Omit<Product, "id">) => Promise<Product>;
  updateProduct: (id: string, product: Omit<Product, "id">) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  addCategory: (name: string, parentId?: string | null) => Promise<Category>;
  removeCategory: (name: string) => Promise<void>;
  addColor: (name: string, hex: string) => Promise<ColorSwatch>;
  removeColor: (name: string) => Promise<void>;
  addSize: (name: string) => Promise<void>;
  removeSize: (name: string) => Promise<void>;
  addMaterial: (name: string) => Promise<void>;
  removeMaterial: (name: string) => Promise<void>;
};

const AdminStoreContext = createContext<AdminStoreValue | null>(null);

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Request failed");
  return res.json();
}

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<ColorSwatch[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => json<Product[]>(r)),
      fetch("/api/categories").then((r) => json<Category[]>(r)),
      fetch("/api/colors").then((r) => json<ColorSwatch[]>(r)),
      fetch("/api/sizes").then((r) => json<string[]>(r)),
      fetch("/api/materials").then((r) => json<string[]>(r)),
    ])
      .then(([p, c, co, s, m]) => {
        setProducts(p);
        setCategories(c);
        setColors(co);
        setSizes(s);
        setMaterials(m);
      })
      .finally(() => setLoading(false));
  }, []);

  const value: AdminStoreValue = {
    products,
    categories,
    colors,
    sizes,
    materials,
    loading,
    addProduct: async (product) => {
      const created = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      }).then((r) => json<Product>(r));
      setProducts((prev) => [created, ...prev]);
      return created;
    },
    updateProduct: async (id, product) => {
      const updated = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      }).then((r) => json<Product>(r));
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    },
    removeProduct: async (id) => {
      await fetch(`/api/products/${id}`, { method: "DELETE" }).then((r) => json(r));
      setProducts((prev) => prev.filter((p) => p.id !== id));
    },
    addCategory: async (name, parentId = null) => {
      const created = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, parentId }),
      }).then((r) => json<Category>(r));
      setCategories((prev) => [...prev, created]);
      return created;
    },
    removeCategory: async (name) => {
      await fetch(`/api/categories/${encodeURIComponent(name)}`, { method: "DELETE" }).then((r) => json(r));
      const fresh = await fetch("/api/categories").then((r) => json<Category[]>(r));
      setCategories(fresh);
    },
    addColor: async (name, hex) => {
      const created = await fetch("/api/colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, hex }),
      }).then((r) => json<ColorSwatch>(r));
      setColors((prev) => (prev.some((c) => c.name === name) ? prev : [...prev, created]));
      return created;
    },
    removeColor: async (name) => {
      await fetch(`/api/colors/${encodeURIComponent(name)}`, { method: "DELETE" }).then((r) => json(r));
      setColors((prev) => prev.filter((c) => c.name !== name));
    },
    addSize: async (name) => {
      await fetch("/api/sizes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      }).then((r) => json(r));
      setSizes((prev) => (prev.includes(name) ? prev : [...prev, name]));
    },
    removeSize: async (name) => {
      await fetch(`/api/sizes/${encodeURIComponent(name)}`, { method: "DELETE" }).then((r) => json(r));
      setSizes((prev) => prev.filter((s) => s !== name));
    },
    addMaterial: async (name) => {
      await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      }).then((r) => json(r));
      setMaterials((prev) => (prev.includes(name) ? prev : [...prev, name]));
    },
    removeMaterial: async (name) => {
      await fetch(`/api/materials/${encodeURIComponent(name)}`, { method: "DELETE" }).then((r) => json(r));
      setMaterials((prev) => prev.filter((m) => m !== name));
    },
  };

  return <AdminStoreContext.Provider value={value}>{children}</AdminStoreContext.Provider>;
}

export function useAdminStore() {
  const ctx = useContext(AdminStoreContext);
  if (!ctx) throw new Error("useAdminStore must be used within AdminStoreProvider");
  return ctx;
}
