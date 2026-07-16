"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAdminStore } from "@/lib/admin-store";
import { formatMMK } from "@/lib/format";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Skeleton } from "@/components/skeleton";

const PAGE_SIZE = 15;

function EditIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16ZM10 11v6M14 11v6" />
    </svg>
  );
}

function StockBadge({ stock, threshold }: { stock: number; threshold: number }) {
  if (stock <= 0) {
    return (
      <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">Out of stock</span>
    );
  }
  if (stock <= threshold) {
    return (
      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">{stock} left</span>
    );
  }
  return <span className="text-muted">{stock}</span>;
}

const STOCK_FILTERS = [
  { value: "all", label: "All stock" },
  { value: "in", label: "In stock" },
  { value: "low", label: "Low stock" },
  { value: "out", label: "Out of stock" },
] as const;

export default function AdminProductsPage() {
  const { products, removeProduct, loading } = useAdminStore();
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState<(typeof STOCK_FILTERS)[number]["value"]>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [pendingBulkDelete, setPendingBulkDelete] = useState(false);

  const categoryOptions = Array.from(new Set(products.map((p) => p.category))).sort();

  const q = query.trim().toLowerCase();
  const filtered = products.filter((p) => {
    if (q && !p.title.toLowerCase().includes(q)) return false;
    if (category !== "all" && p.category !== category) return false;
    if (stockFilter === "in" && p.stock <= p.lowStockThreshold) return false;
    if (stockFilter === "low" && !(p.stock > 0 && p.stock <= p.lowStockThreshold)) return false;
    if (stockFilter === "out" && p.stock > 0) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const filtering = q.length > 0 || category !== "all" || stockFilter !== "all";

  function updateFilter<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(1);
    };
  }

  function confirmDelete() {
    if (pendingDelete) removeProduct(pendingDelete.id);
    setPendingDelete(null);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const pageIds = pageItems.map((p) => p.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));

  function toggleSelectAllOnPage() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  }

  async function confirmBulkDelete() {
    setBulkDeleting(true);
    await Promise.all(Array.from(selectedIds).map((id) => removeProduct(id)));
    setBulkDeleting(false);
    setSelectedIds(new Set());
    setPendingBulkDelete(false);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-md bg-brand px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-brand-dark"
        >
          + Create Product
        </Link>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={query}
            onChange={(e) => updateFilter(setQuery)(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-md border border-border py-2 pl-9 pr-3 text-sm outline-none focus:border-brand"
          />
        </div>
        <select
          value={category}
          onChange={(e) => updateFilter(setCategory)(e.target.value)}
          className="rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-brand sm:w-48"
        >
          <option value="all">All categories</option>
          {categoryOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={stockFilter}
          onChange={(e) => updateFilter(setStockFilter)(e.target.value as typeof stockFilter)}
          className="rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-brand sm:w-40"
        >
          {STOCK_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-md border border-brand/30 bg-brand/5 px-4 py-2.5">
          <span className="text-sm font-medium text-foreground">{selectedIds.size} selected</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-xs font-medium text-muted hover:text-foreground"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setPendingBulkDelete(true)}
              className="flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark"
            >
              <TrashIcon />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Mobile cards */}
      <ul className="space-y-3 sm:hidden">
        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <li key={`skeleton-${i}`} className="rounded-md border border-border bg-white p-3">
              <div className="flex gap-3">
                <Skeleton className="h-16 w-16 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            </li>
          ))}
        {pageItems.map((p) => (
          <li key={p.id} className="rounded-md border border-border bg-white p-3">
            <div className="flex gap-3">
              <input
                type="checkbox"
                checked={selectedIds.has(p.id)}
                onChange={() => toggleSelect(p.id)}
                aria-label={`Select ${p.title}`}
                className="mt-1 h-4 w-4 shrink-0 accent-brand"
              />
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                <Image src={p.images[0]} alt={p.title} fill sizes="64px" unoptimized className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{p.title}</p>
                <p className="text-xs text-muted">{p.category}</p>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-sm font-semibold">{formatMMK(p.price)}</p>
                  <StockBadge stock={p.stock} threshold={p.lowStockThreshold} />
                </div>
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-2 border-t border-border pt-3">
              <Link
                href={`/admin/products/${p.id}/edit`}
                aria-label={`Edit ${p.title}`}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted"
              >
                <EditIcon />
              </Link>
              <button
                type="button"
                onClick={() => setPendingDelete({ id: p.id, title: p.title })}
                aria-label={`Remove ${p.title}`}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted"
              >
                <TrashIcon />
              </button>
            </div>
          </li>
        ))}
        {!loading && filtered.length === 0 && (
          <li className="rounded-md border border-border bg-white py-8 text-center text-muted">
            {filtering ? "No products match your filters." : "No products yet."}
          </li>
        )}
      </ul>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-md border border-border bg-white sm:block">
        <table className="w-full min-w-160 text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase text-muted">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  onChange={toggleSelectAllOnPage}
                  aria-label="Select all on page"
                  className="h-4 w-4 accent-brand"
                />
              </th>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-4" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 shrink-0" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-6" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </td>
                </tr>
              ))}
            {pageItems.map((p) => (
              <tr key={p.id} className={selectedIds.has(p.id) ? "bg-brand/5" : undefined}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(p.id)}
                    onChange={() => toggleSelect(p.id)}
                    aria-label={`Select ${p.title}`}
                    className="h-4 w-4 accent-brand"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                      <Image src={p.images[0]} alt={p.title} fill sizes="48px" unoptimized className="object-cover" />
                    </div>
                    <span className="font-medium text-foreground">{p.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">{p.category}</td>
                <td className="px-4 py-3 font-medium">{formatMMK(p.price)}</td>
                <td className="px-4 py-3">
                  <StockBadge stock={p.stock} threshold={p.lowStockThreshold} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      aria-label={`Edit ${p.title}`}
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted hover:border-foreground hover:text-foreground"
                    >
                      <EditIcon />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPendingDelete({ id: p.id, title: p.title })}
                      aria-label={`Remove ${p.title}`}
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted hover:border-brand hover:text-brand"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  {filtering ? "No products match your filters." : "No products yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-md border border-border px-3 py-1.5 font-medium disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-muted">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-md border border-border px-3 py-1.5 font-medium disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this product?"
        description={pendingDelete ? `"${pendingDelete.title}" will be removed permanently.` : undefined}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <ConfirmDialog
        open={pendingBulkDelete}
        title={`Delete ${selectedIds.size} product${selectedIds.size === 1 ? "" : "s"}?`}
        description="This will remove them permanently."
        confirmLabel={bulkDeleting ? "Deleting…" : "Delete"}
        onConfirm={confirmBulkDelete}
        onCancel={() => setPendingBulkDelete(false)}
      />
    </div>
  );
}
