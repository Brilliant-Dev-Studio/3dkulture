"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useProducts } from "@/lib/use-products";
import { formatMMK } from "@/lib/format";
import { getFinalPrice } from "@/lib/pricing";
import { useI18n } from "@/lib/i18n";
import { Skeleton } from "@/components/skeleton";
import { Container } from "@/components/container";

export default function CartPage() {
  const { t } = useI18n();
  const { lines, removeLine, setQty } = useCart();
  const { products, loading } = useProducts();
  const [notes, setNotes] = useState("");

  const items = lines
    .map((line, index) => ({ line, index, product: products.find((p) => p.id === line.productId) }))
    .filter((item) => item.product);

  const subtotal = items.reduce(
    (sum, { line, product }) =>
      sum + (product ? getFinalPrice(product, line.size) * line.qty : 0),
    0,
  );

  if (loading && lines.length > 0) {
    return (
      <Container className="py-8">
        <Skeleton className="mb-6 h-6 w-24" />
        <div className="space-y-3">
          {lines.map((_, i) => (
            <div key={i} className="flex gap-4 rounded-md border border-border p-4">
              <Skeleton className="h-20 w-20 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container size="3xl" className="py-16 text-center">
        <h1 className="text-xl font-bold">{t("cart.empty")}</h1>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-brand">
          {t("cart.continueShopping")}
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <h1 className="mb-6 text-xl font-bold">{t("cart.title")}</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Mobile cards */}
          <ul className="divide-y divide-border border-y border-border sm:hidden">
            {items.map(({ line, index, product }) => (
              <li key={`${line.productId}-${line.color}-${line.size}-${line.material}`} className="flex gap-3 py-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-zinc-100">
                  <Image
                    src={product!.images[0]}
                    alt={product!.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">{product!.title}</p>
                      <p className="text-xs italic text-muted">
                        {[line.color, line.size, line.material].filter(Boolean).join(" / ")}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="Remove item"
                      onClick={() => removeLine(index)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border text-muted"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center rounded-[25px] border border-border">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => setQty(index, Math.max(1, line.qty - 1))}
                        className="flex h-8 w-8 items-center justify-center text-base text-foreground"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{line.qty}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => setQty(index, line.qty + 1)}
                        className="flex h-8 w-8 items-center justify-center text-base text-foreground"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-bold text-brand">
                      {formatMMK(getFinalPrice(product!, line.size) * line.qty)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">{t("cart.product")}</th>
                  <th className="px-4 py-3 font-semibold">{t("cart.price")}</th>
                  <th className="px-4 py-3 font-semibold">{t("cart.quantity")}</th>
                  <th className="px-4 py-3 font-semibold">{t("cart.subtotal")}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map(({ line, index, product }) => (
                  <tr key={`${line.productId}-${line.color}-${line.size}-${line.material}`}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-zinc-100">
                          <Image
                            src={product!.images[0]}
                            alt={product!.title}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{product!.title}</p>
                          <p className="text-xs italic text-muted">
                            {[line.color, line.size, line.material].filter(Boolean).join(" / ")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-foreground">
                      {formatMMK(getFinalPrice(product!, line.size))}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center rounded-[25px] border border-border">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => setQty(index, Math.max(1, line.qty - 1))}
                          className="flex h-9 w-9 items-center justify-center text-base text-foreground"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">{line.qty}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => setQty(index, line.qty + 1)}
                          className="flex h-9 w-9 items-center justify-center text-base text-foreground"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-foreground">
                      {formatMMK(getFinalPrice(product!, line.size) * line.qty)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        aria-label="Remove item"
                        onClick={() => removeLine(index)}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted hover:border-brand hover:text-brand"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <Link href="/" className="flex items-center gap-1 text-sm font-medium text-brand">
              <span aria-hidden>←</span> {t("cart.continueShopping")}
            </Link>
          </div>

          <div className="mt-8">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide">{t("cart.orderNotes")}</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder={t("cart.orderNotesPlaceholder")}
              className="w-full rounded-[25px] border border-border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="rounded-[25px] border border-border p-5">
          <h2 className="mb-4 text-lg font-bold">{t("cart.cartTotals")}</h2>
          <div className="flex items-center justify-between border-b border-border pb-4 text-sm">
            <span className="text-muted">{t("cart.subtotal")}</span>
            <span className="font-bold text-foreground">{formatMMK(subtotal)}</span>
          </div>
          <p className="mt-3 text-xs italic text-muted">{t("cart.shippingNote")}</p>
          <Link
            href="/checkout"
            className="mt-4 block w-full rounded-[25px] bg-foreground py-3 text-center text-xs font-semibold uppercase tracking-widest text-white hover:bg-black"
          >
            {t("cart.proceedToCheckout")}
          </Link>
        </div>
      </div>
    </Container>
  );
}
