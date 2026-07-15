"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { getProduct } from "@/lib/products";
import { formatMMK } from "@/lib/format";

export default function CartPage() {
  const { lines, removeLine, setQty } = useCart();
  const [draftQty, setDraftQty] = useState<number[]>([]);
  const [notes, setNotes] = useState("");

  const items = lines
    .map((line, index) => ({ line, index, product: getProduct(line.productId) }))
    .filter((item) => item.product);

  useEffect(() => {
    setDraftQty(lines.map((l) => l.qty));
  }, [lines]);

  const subtotal = items.reduce(
    (sum, { line, product }) => sum + (product ? product.price * line.qty : 0),
    0,
  );

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-xl font-bold">Your cart is empty</h1>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-brand">
          Continue shopping
        </Link>
      </div>
    );
  }

  function applyUpdates() {
    items.forEach(({ index }) => {
      if (draftQty[index] != null) setQty(index, Math.max(1, draftQty[index]));
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-xl font-bold">Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Mobile cards */}
          <ul className="divide-y divide-border border-y border-border sm:hidden">
            {items.map(({ line, index, product }) => (
              <li key={`${line.productId}-${line.color}-${line.size}`} className="flex gap-3 py-4">
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
                        {line.color} / {line.size}
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
                        onClick={() =>
                          setDraftQty((d) => {
                            const next = [...d];
                            next[index] = Math.max(1, (next[index] ?? line.qty) - 1);
                            return next;
                          })
                        }
                        className="flex h-8 w-8 items-center justify-center text-base text-foreground"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">
                        {draftQty[index] ?? line.qty}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() =>
                          setDraftQty((d) => {
                            const next = [...d];
                            next[index] = (next[index] ?? line.qty) + 1;
                            return next;
                          })
                        }
                        className="flex h-8 w-8 items-center justify-center text-base text-foreground"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-bold text-brand">
                      {formatMMK(product!.price * (draftQty[index] ?? line.qty))}
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
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Quantity</th>
                  <th className="px-4 py-3 font-semibold">Subtotal</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map(({ line, index, product }) => (
                  <tr key={`${line.productId}-${line.color}-${line.size}`}>
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
                            {line.color} / {line.size}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-foreground">{formatMMK(product!.price)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center rounded-[25px] border border-border">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() =>
                            setDraftQty((d) => {
                              const next = [...d];
                              next[index] = Math.max(1, (next[index] ?? line.qty) - 1);
                              return next;
                            })
                          }
                          className="flex h-9 w-9 items-center justify-center text-base text-foreground"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">
                          {draftQty[index] ?? line.qty}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() =>
                            setDraftQty((d) => {
                              const next = [...d];
                              next[index] = (next[index] ?? line.qty) + 1;
                              return next;
                            })
                          }
                          className="flex h-9 w-9 items-center justify-center text-base text-foreground"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-foreground">
                      {formatMMK(product!.price * (draftQty[index] ?? line.qty))}
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

          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <Link href="/" className="flex items-center gap-1 text-sm font-medium text-brand">
              <span aria-hidden>←</span> Continue shopping
            </Link>
            <button
              type="button"
              onClick={applyUpdates}
              className="flex items-center gap-1 text-sm font-medium text-brand"
            >
              <span aria-hidden>↻</span> Update cart
            </button>
          </div>

          <div className="mt-8">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide">Order notes (optional)</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Notes about your order, e.g. delivery instructions"
              className="w-full rounded-[25px] border border-border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="rounded-[25px] border border-border p-5">
          <h2 className="mb-4 text-lg font-bold">Cart Totals</h2>
          <div className="flex items-center justify-between border-b border-border pb-4 text-sm">
            <span className="text-muted">Subtotal</span>
            <span className="font-bold text-foreground">{formatMMK(subtotal)}</span>
          </div>
          <p className="mt-3 text-xs italic text-muted">Shipping &amp; taxes calculated at checkout</p>
          <Link
            href="/checkout"
            className="mt-4 block w-full rounded-[25px] bg-foreground py-3 text-center text-xs font-semibold uppercase tracking-widest text-white hover:bg-black"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
