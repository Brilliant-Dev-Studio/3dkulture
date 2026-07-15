"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { getProduct } from "@/lib/products";
import { formatMMK } from "@/lib/format";
import { InvoiceDropzone } from "@/components/invoice-dropzone";

const fieldClass =
  "w-full rounded-[25px] border border-border py-2.5 pl-10 pr-3 text-sm outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/10";
const labelClass = "mb-1.5 block text-xs font-semibold text-muted";
const cardClass = "rounded-[25px] border border-border bg-white p-6";

function StepBadge({ n }: { n: number }) {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-white">
      {n}
    </span>
  );
}

function FieldIcon({ path }: { path: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path d={path} />
    </svg>
  );
}

function Stepper() {
  const steps = ["Cart", "Shipping", "Payment"];
  return (
    <div className="mb-8 flex items-center justify-center gap-2 sm:gap-4">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                i === 0 ? "bg-emerald-500 text-white" : i === 1 ? "bg-brand text-white" : "bg-zinc-200 text-muted"
              }`}
            >
              {i === 0 ? "✓" : i + 1}
            </span>
            <span className={`text-xs font-medium ${i <= 1 ? "text-foreground" : "text-muted"}`}>{step}</span>
          </div>
          {i < steps.length - 1 && <span className="h-px w-6 bg-border sm:w-10" />}
        </div>
      ))}
    </div>
  );
}

export default function CheckoutPage() {
  const { lines, clear } = useCart();
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [placed, setPlaced] = useState(false);

  const items = lines
    .map((line) => ({ line, product: getProduct(line.productId) }))
    .filter((item) => item.product);
  const subtotal = items.reduce(
    (sum, { line, product }) => sum + (product ? product.price * line.qty : 0),
    0,
  );

  if (placed) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center sm:px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl text-emerald-500">
          ✓
        </div>
        <h1 className="mt-5 text-2xl font-bold">Order placed</h1>
        <p className="mt-2 text-sm text-muted">
          Thanks — we&apos;ll confirm your order once payment is verified.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-[25px] bg-foreground px-6 py-2.5 text-sm font-bold text-white hover:bg-black"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-xl font-bold">Nothing to check out</h1>
        <p className="mt-2 text-sm text-muted">Your cart is empty.</p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-brand">
          Continue shopping
        </Link>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // NOTE: invoice upload is stubbed locally — S3 wiring is deferred (see PROJECT_STRUCTURE.md).
    clear();
    setPlaced(true);
  }

  return (
    <div className="min-h-full bg-zinc-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link
          href="/cart"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-brand"
        >
          <span aria-hidden>←</span> Back to cart
        </Link>

        <h1 className="sr-only">Checkout</h1>
        <Stepper />

        <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
          <div className="order-2 space-y-6 lg:order-1 lg:col-span-2">
            <div className={cardClass}>
              <div className="mb-5 flex items-center gap-3">
                <StepBadge n={1} />
                <h2 className="text-sm font-bold uppercase tracking-wide">Shipping Details</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelClass} htmlFor="fullName">
                    Full name
                  </label>
                  <div className="relative">
                    <FieldIcon path="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                    <input id="fullName" required placeholder="Aung Aung" className={fieldClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass} htmlFor="phone">
                    Phone number
                  </label>
                  <div className="relative">
                    <FieldIcon path="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
                    <input id="phone" required placeholder="09xxxxxxxxx" className={fieldClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass} htmlFor="address">
                    Delivery address
                  </label>
                  <div className="relative">
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <textarea
                      id="address"
                      required
                      rows={3}
                      placeholder="House no, street, township, city"
                      className={`${fieldClass} pt-2.5`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <div className="mb-2 flex items-center gap-3">
                <StepBadge n={2} />
                <h2 className="text-sm font-bold uppercase tracking-wide">Payment Invoice</h2>
              </div>
              <p className="ml-9 text-xs text-muted">
                Upload your bank transfer invoice/receipt. Stored locally for now — S3 upload
                wiring is deferred.
              </p>
              <div className="mt-4">
                <InvoiceDropzone file={invoiceFile} onChange={setInvoiceFile} />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-[25px] bg-brand py-3.5 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-brand-dark"
            >
              Place Order
            </button>

            <p className="flex items-center justify-center gap-1.5 text-xs text-muted">
              <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              Your information is safe with us
            </p>
          </div>

          <div className={`${cardClass} order-1 lg:order-2 lg:sticky lg:top-24 lg:self-start`}>
            <h2 className="mb-4 text-lg font-bold">Order Summary</h2>
            <ul className="scroll-thin max-h-80 space-y-4 overflow-y-auto pr-1">
              {items.map(({ line, product }) => (
                <li key={`${line.productId}-${line.color}-${line.size}`} className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                    <Image
                      src={product!.images[0]}
                      alt={product!.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-white">
                      {line.qty}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col justify-center">
                    <p className="text-sm font-medium text-foreground">{product!.title}</p>
                    <p className="text-xs italic text-muted">
                      {line.color} / {line.size}
                    </p>
                  </div>
                  <p className="self-center text-sm font-medium text-foreground">
                    {formatMMK(product!.price * line.qty)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span>{formatMMK(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Shipping</span>
                <span>Calculated after order</span>
              </div>
            </div>
            <div className="mt-3 flex justify-between border-t border-border pt-3 text-lg font-bold">
              <span>Total</span>
              <span className="text-brand">{formatMMK(subtotal)}</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
