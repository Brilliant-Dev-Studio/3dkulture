"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/skeleton";
import { InvoiceDocument } from "@/components/invoice-document";
import { downloadInvoiceAsImage } from "@/lib/download-invoice";
import type { Order } from "@/lib/types";

export default function AdminOrderInvoicePage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [params.id]);

  function download() {
    if (!invoiceRef.current || !order) return;
    downloadInvoiceAsImage(invoiceRef.current, `invoice-${order.id}.png`);
  }

  if (!loading && !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-muted">Order not found.</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen overflow-x-auto bg-zinc-100 py-8">
        <div className="mx-auto min-h-[297mm] w-[210mm] max-w-full bg-white p-[15mm] shadow-sm">
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
    <div className="min-h-screen overflow-x-auto bg-zinc-100 py-8 print:bg-white print:py-0">
      <style>{`@page { size: A4; margin: 0; }`}</style>

      <div className="mx-auto mb-4 flex w-[210mm] max-w-full items-center justify-between px-4 print:hidden">
        <Link href={`/admin/orders/${order.id}`} className="text-sm font-medium text-muted hover:text-brand">
          ← Back to order
        </Link>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md border border-border px-4 py-2 text-xs font-semibold uppercase tracking-widest text-foreground hover:border-foreground"
          >
            Print
          </button>
          <button
            type="button"
            onClick={download}
            className="rounded-md bg-brand px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-brand-dark"
          >
            Download Invoice
          </button>
        </div>
      </div>

      <div
        ref={invoiceRef}
        className="mx-auto min-h-[297mm] w-[210mm] max-w-full bg-white p-[15mm] shadow-sm print:min-h-0 print:shadow-none"
      >
        <InvoiceDocument order={order} />
      </div>
    </div>
  );
}
