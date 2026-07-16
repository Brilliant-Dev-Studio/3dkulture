"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { formatMMK } from "@/lib/format";
import { Skeleton } from "@/components/skeleton";
import type { Order } from "@/lib/types";

const STATUSES: Order["status"][] = ["pending", "confirmed", "shipped", "completed"];

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  confirmed: "bg-blue-50 text-blue-700 ring-blue-200",
  shipped: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      }}
      aria-label="Copy"
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted hover:bg-zinc-100 hover:text-foreground"
    >
      {copied ? (
        <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="m5 13 4 4L19 7" />
        </svg>
      ) : (
        <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <rect x="9" y="9" width="12" height="12" rx="2" />
          <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </svg>
      )}
    </button>
  );
}

function StatusStepper({
  status,
  onChange,
}: {
  status: Order["status"];
  onChange: (s: Order["status"]) => void;
}) {
  const currentIndex = STATUSES.indexOf(status);
  return (
    <div className="scroll-thin flex items-center gap-1.5 overflow-x-auto rounded-md border border-border bg-white p-1">
      {STATUSES.map((s, i) => {
        const active = s === status;
        const passed = i <= currentIndex;
        return (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={`shrink-0 rounded px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
              active
                ? "bg-foreground text-white"
                : passed
                  ? "text-foreground hover:bg-zinc-100"
                  : "text-muted hover:bg-zinc-100"
            }`}
          >
            {s}
          </button>
        );
      })}
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6M10 14 21 3" />
    </svg>
  );
}

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [params.id]);

  async function setStatus(id: string, status: Order["status"]) {
    const updated = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).then((r) => r.json());
    setOrder(updated);
  }

  if (!loading && !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <p className="text-muted">Order not found.</p>
        <Link href="/admin/orders" className="mt-4 inline-block text-sm font-medium text-brand">
          ← Back to orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-4 w-32" />
        <div className="mb-6 mt-4 flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-64" />
        </div>
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div className="rounded-md border border-border bg-white p-5">
              <Skeleton className="mb-4 h-4 w-16" />
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-14 w-14 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-border bg-white p-5">
              <Skeleton className="mb-4 h-4 w-32" />
              <Skeleton className="h-56 w-full" />
            </div>
          </div>
          <div className="rounded-md border border-border bg-white p-5 xl:self-start">
            <Skeleton className="mb-4 h-4 w-24" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isPdf = order.invoiceName?.toLowerCase().endsWith(".pdf");
  const totalUnits = order.items.reduce((n, i) => n + i.qty, 0);
  const totalProfit = order.items.reduce((s, i) => s + (i.price - i.costPrice) * i.qty, 0);

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/admin/orders"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-brand"
      >
        ← Back to orders
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="break-all font-mono text-lg font-bold sm:text-xl">{order.id}</h1>
            <CopyButton value={order.id} />
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${STATUS_STYLE[order.status]}`}
            >
              {order.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">
            Placed {new Date(order.createdAt).toLocaleString()} · {totalUnits} item{totalUnits === 1 ? "" : "s"}
          </p>
        </div>

        <StatusStepper status={order.status} onChange={(s) => setStatus(order.id, s)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="overflow-hidden rounded-md border border-border bg-white">
            <div className="border-b border-border px-5 py-3">
              <h2 className="text-sm font-bold uppercase tracking-wide">Items</h2>
            </div>
            {/* Mobile cards */}
            <ul className="divide-y divide-border sm:hidden">
              {order.items.map((item, i) => (
                <li key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                    <Image src={item.image} alt={item.title} fill sizes="56px" unoptimized className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{item.title}</p>
                    <p className="text-xs italic text-muted">
                      {[item.color, item.size, item.material].filter(Boolean).join(" / ")}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatMMK(item.price)} × {item.qty}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-medium">{formatMMK(item.price * item.qty)}</p>
                </li>
              ))}
            </ul>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-full text-left text-sm">
                <thead className="text-xs uppercase text-muted">
                  <tr>
                    <th className="px-5 py-2 font-semibold">Product</th>
                    <th className="px-5 py-2 font-semibold">Unit Price</th>
                    <th className="px-5 py-2 font-semibold">Qty</th>
                    <th className="px-5 py-2 text-right font-semibold">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {order.items.map((item, i) => (
                    <tr key={i}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                            <Image src={item.image} alt={item.title} fill sizes="56px" unoptimized className="object-cover" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{item.title}</p>
                            <p className="text-xs italic text-muted">
                              {[item.color, item.size, item.material].filter(Boolean).join(" / ")}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted">{formatMMK(item.price)}</td>
                      <td className="px-5 py-3 text-muted">×{item.qty}</td>
                      <td className="px-5 py-3 text-right font-medium">{formatMMK(item.price * item.qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-1.5 border-t border-border bg-zinc-50 px-5 py-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Profit</span>
                <span className="font-medium text-emerald-600">{formatMMK(totalProfit)}</span>
              </div>
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-brand">{formatMMK(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide">Payment Invoice</h2>
              {order.invoiceDataUrl && (
                <a
                  href={order.invoiceDataUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
                >
                  Open full size <ExternalIcon />
                </a>
              )}
            </div>
            {order.invoiceDataUrl ? (
              isPdf ? (
                <a
                  href={order.invoiceDataUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-md border border-border p-4 text-sm font-medium text-brand hover:bg-zinc-50"
                >
                  📄 {order.invoiceName}
                </a>
              ) : (
                <a href={order.invoiceDataUrl} target="_blank" rel="noopener noreferrer">
                  <div className="relative h-72 w-full overflow-hidden rounded-md bg-zinc-100">
                    <Image src={order.invoiceDataUrl} alt="Payment invoice" fill unoptimized className="object-contain" />
                  </div>
                </a>
              )
            ) : (
              <p className="text-sm text-muted">No invoice uploaded.</p>
            )}
          </div>
        </div>

        <div className="space-y-6 xl:self-start">
          <div className="rounded-md border border-border bg-white p-5">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide">Customer</h2>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-bold text-foreground">
                {order.customerFullName ? order.customerFullName.trim()[0]?.toUpperCase() : "?"}
              </div>
              <p className="font-semibold text-foreground">{order.customerFullName || "—"}</p>
            </div>

            <div className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
              <a
                href={`tel:${order.customerPhone}`}
                className="flex items-center gap-2 text-foreground hover:text-brand"
              >
                <PhoneIcon />
                {order.customerPhone || "—"}
              </a>
              <div className="flex items-start gap-2 text-foreground">
                <PinIcon />
                <span>{order.customerAddress || "—"}</span>
              </div>
            </div>

            {order.notes && (
              <div className="mt-4 border-t border-border pt-4 text-sm">
                <p className="text-xs text-muted">Notes</p>
                <p className="mt-1 text-foreground">{order.notes}</p>
              </div>
            )}
          </div>

          <Link
            href={`/admin/orders/${order.id}/invoice`}
            target="_blank"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-foreground py-3 text-xs font-semibold uppercase tracking-widest text-white hover:bg-black"
          >
            Generate Invoice
          </Link>
        </div>
      </div>
    </div>
  );
}
