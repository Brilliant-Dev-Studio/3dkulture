"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import { useAdminStore } from "@/lib/admin-store";
import { formatMMK } from "@/lib/format";
import { downloadCsv } from "@/lib/csv";
import { Skeleton } from "@/components/skeleton";
import type { Order } from "@/lib/types";

function ExportCsvButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-muted hover:border-brand hover:text-brand"
    >
      <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M12 3v12m0 0-4-4m4 4 4-4" />
        <path d="M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
      </svg>
      Export CSV
    </button>
  );
}

function lastNDays(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d;
  });
}

function daysInMonth(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const count = new Date(year, month, 0).getDate();
  return Array.from({ length: count }, (_, i) => new Date(year, month - 1, i + 1));
}

function monthKeyOf(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export default function AdminDashboardHomePage() {
  const { products, loading: productsLoading } = useAdminStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [month, setMonth] = useState("all");

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then(setOrders)
      .finally(() => setOrdersLoading(false));
  }, []);

  const dataLoading = productsLoading || ordersLoading;

  const availableMonths = Array.from(new Set(orders.map((o) => monthKeyOf(o.createdAt)))).sort((a, b) =>
    b.localeCompare(a),
  );

  const filteredOrders = month === "all" ? orders : orders.filter((o) => monthKeyOf(o.createdAt) === month);

  const revenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const profit = filteredOrders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + (i.price - i.costPrice) * i.qty, 0),
    0,
  );
  const pending = filteredOrders.filter((o) => o.status === "pending").length;

  const stats = [
    { label: "Products", value: products.length },
    { label: "Orders", value: filteredOrders.length },
    { label: "Revenue", value: formatMMK(revenue) },
    { label: "Profit", value: formatMMK(profit) },
    { label: "Pending Invoices", value: pending },
  ];

  const categoryMap = new Map(products.map((p) => [p.id, p.category]));
  const revenueByCategory = new Map<string, number>();
  for (const o of filteredOrders) {
    for (const item of o.items) {
      const category = categoryMap.get(item.productId) ?? "Other";
      revenueByCategory.set(category, (revenueByCategory.get(category) ?? 0) + item.price * item.qty);
    }
  }
  const categoryData = Array.from(revenueByCategory, ([category, total]) => ({ category, total })).sort(
    (a, b) => b.total - a.total,
  );

  const days = month === "all" ? lastNDays(14) : daysInMonth(month);
  const trendData = days.map((d) => {
    const key = d.toDateString();
    const dayOrders = filteredOrders.filter((o) => new Date(o.createdAt).toDateString() === key);
    return {
      date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      orders: dayOrders.length,
    };
  });

  const productRevenue = new Map<string, { title: string; revenue: number; profit: number; units: number }>();
  for (const o of filteredOrders) {
    for (const item of o.items) {
      const entry = productRevenue.get(item.productId) ?? { title: item.title, revenue: 0, profit: 0, units: 0 };
      entry.revenue += item.price * item.qty;
      entry.profit += (item.price - item.costPrice) * item.qty;
      entry.units += item.qty;
      productRevenue.set(item.productId, entry);
    }
  }
  const topProducts = Array.from(productRevenue.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const lowStockProducts = products
    .filter((p) => p.stock <= p.lowStockThreshold)
    .sort((a, b) => a.stock - b.stock);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-md border border-border px-3 py-1.5 text-sm outline-none focus:border-brand"
          >
            <option value="all">All time</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </select>
          <ExportCsvButton
            onClick={() =>
              downloadCsv(`orders-${month}.csv`, [
                ["Order ID", "Customer", "Phone", "Address", "Status", "Date", "Items", "Total", "Profit"],
                ...filteredOrders.map((o) => [
                  o.id,
                  o.customerFullName,
                  o.customerPhone,
                  o.customerAddress,
                  o.status,
                  new Date(o.createdAt).toLocaleDateString(),
                  o.items.reduce((n, i) => n + i.qty, 0),
                  o.total,
                  o.items.reduce((s, i) => s + (i.price - i.costPrice) * i.qty, 0),
                ]),
              ])
            }
          />
          <Link href="/admin/products/new" className="text-sm font-medium text-brand">
            + Create Product
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {dataLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-md border border-border bg-white p-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-2 h-7 w-16" />
              </div>
            ))
          : stats.map((s) => (
              <div key={s.label} className="rounded-md border border-border bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-muted">{s.label}</p>
                <p className="mt-1 text-2xl font-bold">{s.value}</p>
              </div>
            ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-md border border-border bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide">Revenue by Category</h2>
            {categoryData.length > 0 && (
              <ExportCsvButton
                onClick={() =>
                  downloadCsv(`revenue-by-category-${month}.csv`, [
                    ["Category", "Revenue"],
                    ...categoryData.map((c) => [c.category, c.total]),
                  ])
                }
              />
            )}
          </div>
          {dataLoading ? (
            <Skeleton className="h-65 w-full" />
          ) : categoryData.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">No order data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryData}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip formatter={(v) => formatMMK(Number(v))} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="total" fill="var(--brand)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-md border border-border bg-white p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide">
            Orders {month === "all" ? "(Last 14 Days)" : `(${monthLabel(month)})`}
          </h2>
          {dataLoading ? (
            <Skeleton className="h-65 w-full" />
          ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} interval={1} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} width={30} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Line type="monotone" dataKey="orders" stroke="var(--brand)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-md border border-border bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide">Top Products</h2>
          {topProducts.length > 0 && (
            <ExportCsvButton
              onClick={() =>
                downloadCsv(`top-products-${month}.csv`, [
                  ["Product", "Units Sold", "Revenue", "Profit"],
                  ...topProducts.map((p) => [p.title, p.units, p.revenue, p.profit]),
                ])
              }
            />
          )}
        </div>
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-muted">
            <tr>
              <th className="py-2 font-semibold">Product</th>
              <th className="py-2 font-semibold">Units Sold</th>
              <th className="py-2 font-semibold">Revenue</th>
              <th className="py-2 font-semibold">Profit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {dataLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  <td className="py-2">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="py-2">
                    <Skeleton className="h-4 w-8" />
                  </td>
                  <td className="py-2">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="py-2">
                    <Skeleton className="h-4 w-16" />
                  </td>
                </tr>
              ))}
            {!dataLoading && topProducts.map((p) => (
              <tr key={p.title}>
                <td className="py-2 font-medium text-foreground">{p.title}</td>
                <td className="py-2 text-muted">{p.units}</td>
                <td className="py-2 font-medium">{formatMMK(p.revenue)}</td>
                <td className="py-2 font-medium text-emerald-600">{formatMMK(p.profit)}</td>
              </tr>
            ))}
            {!dataLoading && topProducts.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-muted">
                  No sales yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-md border border-border bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide">Low Stock</h2>
          {!productsLoading && lowStockProducts.length > 0 && (
            <ExportCsvButton
              onClick={() =>
                downloadCsv("low-stock.csv", [
                  ["Product", "Stock", "Threshold"],
                  ...lowStockProducts.map((p) => [p.title, p.stock, p.lowStockThreshold]),
                ])
              }
            />
          )}
        </div>
        <ul className="divide-y divide-border">
          {productsLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <li key={`skeleton-${i}`} className="flex items-center justify-between py-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </li>
            ))}
          {!productsLoading &&
            lowStockProducts.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                <Link href={`/admin/products/${p.id}/edit`} className="font-medium text-foreground hover:text-brand">
                  {p.title}
                </Link>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    p.stock <= 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {p.stock <= 0 ? "Out of stock" : `${p.stock} left`}
                </span>
              </li>
            ))}
          {!productsLoading && lowStockProducts.length === 0 && (
            <li className="py-8 text-center text-sm text-muted">All products are well stocked.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
