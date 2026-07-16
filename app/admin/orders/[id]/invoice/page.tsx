"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatMMK } from "@/lib/format";
import { Skeleton } from "@/components/skeleton";
import type { Order } from "@/lib/types";

export default function AdminOrderInvoicePage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (!loading && !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-muted">Order not found.</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-zinc-100 py-8">
        <div className="mx-auto max-w-3xl bg-white p-10 shadow-sm">
          <div className="flex items-start justify-between border-b border-border pb-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <div className="space-y-2 text-right">
              <Skeleton className="ml-auto h-4 w-20" />
              <Skeleton className="ml-auto h-3 w-24" />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
          <div className="mt-8 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 py-8 print:bg-white print:py-0">
      <div className="mx-auto mb-4 flex max-w-3xl items-center justify-between px-4 print:hidden">
        <Link href={`/admin/orders/${order.id}`} className="text-sm font-medium text-muted hover:text-brand">
          ← Back to order
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-md bg-brand px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-brand-dark"
        >
          Print / Save PDF
        </button>
      </div>

      <div className="mx-auto max-w-3xl bg-white p-10 shadow-sm print:shadow-none">
        <div className="flex items-start justify-between border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="3D Kulture" width={200} height={195} className="h-12 w-auto" unoptimized />
            <div>
              <h1 className="text-2xl font-bold text-foreground">3DKulture</h1>
              <p className="mt-1 text-xs text-muted">3D Printed Figures &amp; Collectibles</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold uppercase tracking-wide text-foreground">Invoice</h2>
            <p className="mt-1 text-xs text-muted">{order.id}</p>
            <p className="text-xs text-muted">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Bill To</p>
            <p className="mt-1 font-medium text-foreground">{order.customerFullName || "—"}</p>
            <p className="text-muted">{order.customerPhone || "—"}</p>
            <p className="text-muted">{order.customerAddress || "—"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Status</p>
            <p className="mt-1 font-medium capitalize text-foreground">{order.status}</p>
          </div>
        </div>

        <table className="mt-8 w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted">
            <tr>
              <th className="py-2 font-semibold">Item</th>
              <th className="py-2 font-semibold">Qty</th>
              <th className="py-2 text-right font-semibold">Unit Price</th>
              <th className="py-2 text-right font-semibold">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {order.items.map((item, i) => (
              <tr key={i}>
                <td className="py-3">
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-xs italic text-muted">
                    {[item.color, item.size, item.material].filter(Boolean).join(" / ")}
                  </p>
                </td>
                <td className="py-3">{item.qty}</td>
                <td className="py-3 text-right">{formatMMK(item.price)}</td>
                <td className="py-3 text-right font-medium">{formatMMK(item.price * item.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end border-t border-border pt-4">
          <div className="w-48 space-y-1 text-sm">
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-brand">{formatMMK(order.total)}</span>
            </div>
          </div>
        </div>

        {order.notes && (
          <div className="mt-6 border-t border-border pt-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Notes</p>
            <p className="mt-1 text-foreground">{order.notes}</p>
          </div>
        )}

        <p className="mt-10 text-center text-xs text-muted">Thank you for your order.</p>
      </div>
    </div>
  );
}
