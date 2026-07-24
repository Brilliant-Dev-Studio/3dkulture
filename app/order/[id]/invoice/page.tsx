"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/skeleton";
import { InvoiceDocument } from "@/components/invoice-document";
import { downloadInvoiceAsImage } from "@/lib/download-invoice";
import type { Order } from "@/lib/types";

export default function OrderInvoicePage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const autoDownload = searchParams.get("download") === "1";
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/orders/${params.id}/public`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [params.id]);

  function download() {
    if (!invoiceRef.current || !order) return;
    downloadInvoiceAsImage(invoiceRef.current, `invoice-${order.id}.png`);
  }

  useEffect(() => {
    if (!autoDownload || !order || !invoiceRef.current) return;
    const timeout = window.setTimeout(() => download(), 400);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDownload, order]);

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
    <div className="min-h-screen overflow-x-auto bg-zinc-100 py-8">
      <div className="mx-auto mb-4 flex w-[210mm] max-w-full items-center justify-between px-4">
        <Link href="/" className="text-sm font-medium text-muted hover:text-brand">
          ← Back to shop
        </Link>
        <button
          type="button"
          onClick={download}
          className="rounded-md bg-brand px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-brand-dark"
        >
          Download Invoice
        </button>
      </div>

      <div
        ref={invoiceRef}
        className="mx-auto min-h-[297mm] w-[210mm] max-w-full bg-white p-[15mm] shadow-sm"
      >
        <InvoiceDocument order={order} />
      </div>
    </div>
  );
}
