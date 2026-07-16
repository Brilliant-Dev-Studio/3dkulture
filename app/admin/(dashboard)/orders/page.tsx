"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatMMK } from "@/lib/format";
import { Skeleton } from "@/components/skeleton";
import type { Order } from "@/lib/types";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-blue-50 text-blue-700",
  shipped: "bg-indigo-50 text-indigo-700",
  completed: "bg-emerald-50 text-emerald-700",
};

const PAGE_SIZE = 15;

function EyeIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function InvoiceIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M6 2h9l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" />
      <path d="M15 2v5h5" />
      <path d="M8 13h8M8 17h5" />
    </svg>
  );
}

const STATUS_FILTERS = ["all", "pending", "confirmed", "shipped", "completed"] as const;

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={`h-4 w-4 ${spinning ? "animate-spin" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />
    </svg>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>("all");

  function loadOrders() {
    return fetch("/api/orders")
      .then((r) => r.json())
      .then(setOrders);
  }

  useEffect(() => {
    loadOrders().finally(() => setLoading(false));
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }

  const q = query.trim().toLowerCase();
  const filtered = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (
      q &&
      !o.id.toLowerCase().includes(q) &&
      !o.customerFullName.toLowerCase().includes(q) &&
      !o.customerPhone.toLowerCase().includes(q)
    )
      return false;
    return true;
  });
  const filtering = q.length > 0 || statusFilter !== "all";

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function updateFilter<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(1);
    };
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Orders</h1>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Refresh orders"
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:border-brand hover:text-brand disabled:opacity-60"
        >
          <RefreshIcon spinning={refreshing} />
          Refresh
        </button>
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
            placeholder="Search order ID, customer, phone…"
            className="w-full rounded-md border border-border py-2 pl-9 pr-3 text-sm outline-none focus:border-brand"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => updateFilter(setStatusFilter)(e.target.value as typeof statusFilter)}
          className="rounded-md border border-border px-3 py-2 text-sm capitalize outline-none focus:border-brand sm:w-44"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s === "all" ? "All statuses" : s}
            </option>
          ))}
        </select>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-3 sm:hidden">
        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <li key={`skeleton-${i}`} className="rounded-md border border-border bg-white p-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="mt-2 h-4 w-32" />
              <div className="mt-2 flex items-center justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </li>
          ))}
        {pageItems.map((o) => (
          <li key={o.id}>
            <Link
              href={`/admin/orders/${o.id}`}
              className="block rounded-md border border-border bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-brand">{o.id}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLE[o.status]}`}>
                  {o.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-foreground">{o.customerFullName || "—"}</p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted">{o.items.reduce((n, i) => n + i.qty, 0)} items</span>
                <span className="font-semibold">{formatMMK(o.total)}</span>
              </div>
              <p className="mt-1 text-xs text-muted">{new Date(o.createdAt).toLocaleDateString()}</p>
            </Link>
            <div className="mt-2 flex gap-2">
              <Link
                href={`/admin/orders/${o.id}`}
                aria-label="View order"
                className="flex flex-1 items-center justify-center rounded-md border border-border py-2 text-foreground hover:border-brand hover:text-brand"
              >
                <EyeIcon />
              </Link>
              <Link
                href={`/admin/orders/${o.id}/invoice`}
                target="_blank"
                aria-label="Generate invoice"
                className="flex flex-1 items-center justify-center rounded-md border border-border py-2 text-foreground hover:border-brand hover:text-brand"
              >
                <InvoiceIcon />
              </Link>
            </div>
          </li>
        ))}
        {!loading && filtered.length === 0 && (
          <li className="rounded-md border border-border bg-white py-8 text-center text-muted">
            {filtering ? "No orders match your filters." : "No orders yet."}
          </li>
        )}
      </ul>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-md border border-border bg-white sm:block">
        <table className="w-full min-w-160 text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Items</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-28" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-6" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </td>
                </tr>
              ))}
            {pageItems.map((o) => (
              <tr key={o.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-medium text-brand hover:underline">
                    {o.id}
                  </Link>
                </td>
                <td className="px-4 py-3 text-foreground">{o.customerFullName || "—"}</td>
                <td className="px-4 py-3 text-muted">{o.items.reduce((n, i) => n + i.qty, 0)}</td>
                <td className="px-4 py-3 font-medium">{formatMMK(o.total)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLE[o.status]}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      aria-label="View order"
                      title="View"
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted hover:border-brand hover:text-brand"
                    >
                      <EyeIcon />
                    </Link>
                    <Link
                      href={`/admin/orders/${o.id}/invoice`}
                      target="_blank"
                      aria-label="Generate invoice"
                      title="Generate Invoice"
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted hover:border-brand hover:text-brand"
                    >
                      <InvoiceIcon />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted">
                  {filtering ? "No orders match your filters." : "No orders yet."}
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
    </div>
  );
}
