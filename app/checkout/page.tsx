"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useProducts } from "@/lib/use-products";
import { formatMMK } from "@/lib/format";
import { getFinalPrice } from "@/lib/pricing";
import { InvoiceDropzone } from "@/components/invoice-dropzone";
import { useI18n } from "@/lib/i18n";
import { Skeleton } from "@/components/skeleton";
import { Container } from "@/components/container";
import { useTownships } from "@/lib/use-townships";
import { useCities } from "@/lib/use-cities";
import { useRegions } from "@/lib/use-regions";
import { DropdownSelect } from "@/components/dropdown-select";

const fieldClass =
  "w-full rounded-[25px] border border-border py-2.5 pl-10 pr-3 text-sm outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/10";
const labelClass = "mb-1.5 block text-xs font-semibold text-muted";
const cardClass = "rounded-[25px] border border-border bg-white p-6";

type PaymentMethod = {
  id: string;
  name: string;
  logo?: string;
  qr?: string;
  accounts?: { bank: string; number: string }[];
};

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "kbzpay", name: "KBZPay", logo: "/payments/kbzpay.png", qr: "/paymentQrs/kbzPay.jpg" },
  { id: "wavepay", name: "WavePay", logo: "/payments/wavepay.jpg", qr: "/paymentQrs/wavePay.jpg" },
  { id: "uabpay", name: "UABPay", logo: "/payments/uabpay.jpg", qr: "/paymentQrs/uabPay.jpg" },
  {
    id: "banktransfer",
    name: "Bank Transfer",
    accounts: [
      { bank: "KBZ Special", number: "29913799920282301" },
      { bank: "AYA", number: "20027850932" },
    ],
  },
];

function BankIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path d="M3 10 12 4l9 6M4 10v9M8 10v9M12 10v9M16 10v9M20 10v9M2 21h20" />
    </svg>
  );
}

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
  const { t } = useI18n();
  const steps = [t("checkout.stepCart"), t("checkout.stepShipping"), t("checkout.stepPayment")];
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

async function uploadInvoice(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/invoice-upload", { method: "POST", body: form });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? "Invoice upload failed.");
  return body.url as string;
}

export default function CheckoutPage() {
  const { t, locale } = useI18n();
  const { lines, clear } = useCart();
  const { products, loading } = useProducts();
  const { townships } = useTownships();
  const { cities } = useCities();
  const { regions } = useRegions();
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [township, setTownship] = useState("");
  const citiesInRegion = regions.length === 0 ? cities : cities.filter((c) => c.region === region);
  const townshipsInCity = cities.length === 0 ? townships : townships.filter((tw) => tw.city === city);
  const localize = (name: string, nameMy: string) => (locale === "my" && nameMy ? nameMy : name);
  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_METHODS[0].id);
  const selectedPaymentMethod = PAYMENT_METHODS.find((m) => m.id === paymentMethod);
  const [qrOpen, setQrOpen] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  function copyNumber(number: string) {
    navigator.clipboard.writeText(number);
    setCopiedNumber(number);
    window.setTimeout(() => setCopiedNumber((cur) => (cur === number ? null : cur)), 1500);
  }
  const [placed, setPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [townshipError, setTownshipError] = useState<string | null>(null);

  const items = lines
    .map((line) => ({ line, product: products.find((p) => p.id === line.productId) }))
    .filter((item) => item.product);
  const hasPreorderItem = items.some(({ product }) => product!.isPreorder);
  const subtotal = items.reduce(
    (sum, { line, product }) =>
      sum + (product ? getFinalPrice(product, line.size) * line.qty : 0),
    0,
  );
  const total = subtotal;

  if (placed) {
    return (
      <Container size="xl" className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl text-emerald-500">
          ✓
        </div>
        <h1 className="mt-5 text-2xl font-bold">{t("checkout.orderPlaced")}</h1>
        <p className="mt-2 text-sm text-muted">{t("checkout.thanks")}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {placedOrderId && (
            <Link
              href={`/order/${placedOrderId}/invoice`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-[25px] border border-brand px-6 py-2.5 text-sm font-bold text-brand hover:bg-brand hover:text-white"
            >
              {t("checkout.downloadInvoice")}
            </Link>
          )}
          <Link
            href="/"
            className="rounded-[25px] bg-foreground px-6 py-2.5 text-sm font-bold text-white hover:bg-black"
          >
            {t("cart.continueShopping")}
          </Link>
        </div>
      </Container>
    );
  }

  if (loading && lines.length > 0) {
    return (
      <Container className="py-8">
        <Skeleton className="mb-4 h-4 w-24" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className={cardClass}>
              <Skeleton className="mb-4 h-4 w-32" />
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </div>
          <div className={cardClass}>
            <Skeleton className="mb-4 h-4 w-28" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container size="xl" className="py-20 text-center">
        <h1 className="text-xl font-bold">{t("checkout.emptyTitle")}</h1>
        <p className="mt-2 text-sm text-muted">{t("checkout.emptyBody")}</p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-brand">
          {t("cart.continueShopping")}
        </Link>
      </Container>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!township) {
      setTownshipError(t("checkout.selectTownship"));
      return;
    }
    setTownshipError(null);
    setInvoiceError(null);
    setSubmitting(true);
    let invoiceUrl: string | null = null;
    try {
      if (invoiceFile) invoiceUrl = await uploadInvoice(invoiceFile);
    } catch (err) {
      setInvoiceError(err instanceof Error ? err.message : "Invoice upload failed.");
      setSubmitting(false);
      return;
    }
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: { fullName, phone, address },
        region,
        city,
        township,
        items: items.map(({ line, product }) => ({
          productId: line.productId,
          title: product!.title,
          image: product!.images[0],
          color: line.color,
          size: line.size,
          material: line.material,
          qty: line.qty,
          price: getFinalPrice(product!, line.size),
        })),
        total,
        paymentMethod,
        invoiceDataUrl: invoiceUrl,
        invoiceName: invoiceFile?.name ?? null,
      }),
    });
    setSubmitting(false);
    if (!res.ok) return;
    const placedOrder = await res.json();
    clear();
    setPlacedOrderId(placedOrder.id);
    setPlaced(true);
    window.open(`/order/${placedOrder.id}/invoice?download=1`, "_blank");
  }

  return (
    <div className="min-h-full bg-zinc-50">
      <Container className="py-8">
        <Link
          href="/cart"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-brand"
        >
          <span aria-hidden>←</span> {t("checkout.backToCart")}
        </Link>

        <h1 className="sr-only">Checkout</h1>
        <Stepper />

        <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
          <div className="order-2 space-y-6 lg:order-1 lg:col-span-2">
            <div className={cardClass}>
              <div className="mb-5 flex items-center gap-3">
                <StepBadge n={1} />
                <h2 className="text-sm font-bold uppercase tracking-wide">{t("checkout.shippingDetails")}</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelClass} htmlFor="fullName">
                    {t("checkout.fullName")}
                  </label>
                  <div className="relative">
                    <FieldIcon path="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                    <input
                      id="fullName"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Aung Aung"
                      className={fieldClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass} htmlFor="phone">
                    {t("checkout.phone")}
                  </label>
                  <div className="relative">
                    <FieldIcon path="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
                    <input
                      id="phone"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="09xxxxxxxxx"
                      className={fieldClass}
                    />
                  </div>
                </div>
                <div
                  className={`grid gap-4 ${
                    regions.length > 0 ? "sm:grid-cols-3" : cities.length > 0 ? "sm:grid-cols-2" : ""
                  }`}
                >
                  {regions.length > 0 && (
                    <div>
                      <label className={labelClass}>{t("checkout.region")}</label>
                      <DropdownSelect
                        value={region}
                        onChange={(v) => {
                          setRegion(v);
                          setCity("");
                          setTownship("");
                          setTownshipError(null);
                        }}
                        placeholder={t("checkout.selectRegion")}
                        className="rounded-[25px] border border-border py-2.5 pl-4 pr-3 text-sm transition-all hover:border-foreground"
                        icon={
                          <svg
                            aria-hidden
                            viewBox="0 0 24 24"
                            className="h-4 w-4 shrink-0 text-muted"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                          >
                            <path d="M3 6h18M3 12h18M3 18h18" />
                          </svg>
                        }
                        options={regions.map((r) => ({ value: r.name, label: localize(r.name, r.nameMy) }))}
                      />
                    </div>
                  )}

                  {cities.length > 0 && (
                    <div>
                      <label className={labelClass}>{t("checkout.city")}</label>
                      <DropdownSelect
                        value={city}
                        onChange={(v) => {
                          setCity(v);
                          setTownship("");
                          setTownshipError(null);
                        }}
                        placeholder={
                          regions.length === 0 || region ? t("checkout.selectCity") : t("checkout.selectRegionFirst")
                        }
                        className="rounded-[25px] border border-border py-2.5 pl-4 pr-3 text-sm transition-all hover:border-foreground"
                        icon={
                          <svg
                            aria-hidden
                            viewBox="0 0 24 24"
                            className="h-4 w-4 shrink-0 text-muted"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                          >
                            <path d="M3 21h18M6 21V8l6-4 6 4v13M10 21v-6h4v6" />
                          </svg>
                        }
                        options={citiesInRegion.map((c) => ({ value: c.name, label: localize(c.name, c.nameMy) }))}
                      />
                    </div>
                  )}

                  <div>
                    <label className={labelClass}>{t("checkout.township")}</label>
                    <DropdownSelect
                      value={township}
                      onChange={(v) => {
                        setTownship(v);
                        setTownshipError(null);
                      }}
                      placeholder={
                        cities.length === 0 || city ? t("checkout.selectTownship") : t("checkout.selectCityFirst")
                      }
                      className={`rounded-[25px] border py-2.5 pl-4 pr-3 text-sm transition-all hover:border-foreground ${
                        townshipError ? "border-brand" : "border-border"
                      }`}
                      icon={
                        <svg
                          aria-hidden
                          viewBox="0 0 24 24"
                          className="h-4 w-4 shrink-0 text-muted"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0Z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      }
                      options={townshipsInCity.map((tw) => ({ value: tw.name, label: localize(tw.name, tw.nameMy) }))}
                    />
                    {townshipError && <p className="mt-1.5 text-xs text-brand">{townshipError}</p>}
                  </div>
                </div>
                <div>
                  <label className={labelClass} htmlFor="address">
                    {t("checkout.address")}
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
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House no, street, ward"
                      className={`${fieldClass} pt-2.5`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <div className="mb-2 flex items-center gap-3">
                <StepBadge n={2} />
                <h2 className="text-sm font-bold uppercase tracking-wide">{t("checkout.paymentMethod")}</h2>
              </div>
              <p className="ml-9 text-xs text-muted">{t("checkout.paymentMethodNote")}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex flex-col items-center gap-2 rounded-2xl border p-3 transition-colors ${
                      paymentMethod === method.id
                        ? "border-2 border-brand bg-brand/5"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    <div className="relative flex h-10 w-full items-center justify-center">
                      {method.logo ? (
                        <Image src={method.logo} alt={method.name} fill sizes="120px" className="object-contain" />
                      ) : (
                        <BankIcon />
                      )}
                    </div>
                    <span className="text-xs font-semibold text-foreground">{method.name}</span>
                  </button>
                ))}
              </div>

              {selectedPaymentMethod && selectedPaymentMethod.qr && (
                <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-brand bg-brand/5 p-4 text-center">
                  <p className="text-xs font-semibold text-brand">
                    {t("checkout.scanToPay")} {selectedPaymentMethod.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => setQrOpen(true)}
                    className="relative h-48 w-48 cursor-zoom-in overflow-hidden rounded-xl bg-white"
                    aria-label={t("checkout.viewFullQr")}
                  >
                    <Image
                      src={selectedPaymentMethod.qr}
                      alt={`${selectedPaymentMethod.name} QR`}
                      fill
                      sizes="192px"
                      className="object-contain"
                    />
                  </button>
                  <p className="text-xs text-muted">{t("checkout.paymentAccountNote")}</p>
                </div>
              )}

              {selectedPaymentMethod && selectedPaymentMethod.accounts && (
                <div className="mt-4 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-brand bg-brand/5 p-4 text-center">
                  <p className="text-xs font-semibold text-brand">{t("checkout.transferTo")}</p>
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    {selectedPaymentMethod.accounts.map((acc) => (
                      <div key={acc.number} className="flex flex-col items-center gap-1.5">
                        <p className="text-sm font-bold text-foreground">{acc.bank}</p>
                        <div className="flex items-center gap-1 rounded-full border border-border bg-white pl-4 pr-1.5 py-1.5">
                          <span className="font-mono text-sm text-foreground">{acc.number}</span>
                          <button
                            type="button"
                            onClick={() => copyNumber(acc.number)}
                            aria-label={`${t("checkout.copy")} ${acc.number}`}
                            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                              copiedNumber === acc.number
                                ? "bg-emerald-500 text-white"
                                : "bg-brand text-white hover:bg-brand-dark"
                            }`}
                          >
                            {copiedNumber === acc.number ? (
                              <>
                                <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                  <path d="M20 6 9 17l-5-5" />
                                </svg>
                                {t("checkout.copied")}
                              </>
                            ) : (
                              <>
                                <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                                  <rect x="9" y="9" width="12" height="12" rx="2" />
                                  <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
                                </svg>
                                {t("checkout.copy")}
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted">{t("checkout.paymentAccountNote")}</p>
                </div>
              )}
            </div>

            <div className={cardClass}>
              <div className="mb-2 flex items-center gap-3">
                <StepBadge n={3} />
                <h2 className="text-sm font-bold uppercase tracking-wide">{t("checkout.paymentInvoice")}</h2>
              </div>
              <p className="ml-9 text-xs text-muted">{t("checkout.paymentInvoiceNote")}</p>
              <div className="mt-4">
                <InvoiceDropzone file={invoiceFile} onChange={setInvoiceFile} />
                {invoiceError && <p className="mt-2 text-xs text-brand">{invoiceError}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-[25px] bg-brand py-3.5 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
            >
              {submitting ? t("checkout.placingOrder") : t("checkout.placeOrder")}
            </button>

            <p className="flex items-center justify-center gap-1.5 text-xs text-muted">
              <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              {t("checkout.secureNote")}
            </p>
          </div>

          <div className={`${cardClass} order-1 lg:order-2 lg:sticky lg:top-24 lg:self-start`}>
            <h2 className="mb-4 text-lg font-bold">{t("checkout.orderSummary")}</h2>
            <ul className="scroll-thin max-h-80 space-y-4 overflow-y-auto pr-1">
              {items.map(({ line, product }) => (
                <li key={`${line.productId}-${line.color}-${line.size}-${line.material}`} className="flex gap-3">
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
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-foreground">{product!.title}</p>
                      {product!.isPreorder && (
                        <span className="rounded-md bg-brand/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
                          {t("product.preorder")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs italic text-muted">
                      {[line.color, line.size, line.material].filter(Boolean).join(" / ")}
                    </p>
                  </div>
                  <p className="self-center text-sm font-medium text-foreground">
                    {formatMMK(getFinalPrice(product!, line.size) * line.qty)}
                  </p>
                </li>
              ))}
            </ul>

            {hasPreorderItem && (
              <p className="mt-4 rounded-2xl border border-dashed border-brand bg-brand/5 px-3 py-2.5 text-center text-xs text-brand">
                {t("checkout.preorderNotice")}
              </p>
            )}

            <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between text-muted">
                <span>{t("cart.subtotal")}</span>
                <span>{formatMMK(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>{t("checkout.shipping")}</span>
                <span className="text-right">{t("checkout.shippingDependsOnProvider")}</span>
              </div>
            </div>
            <div className="mt-3 flex justify-between border-t border-border pt-3 text-lg font-bold">
              <span>{t("checkout.total")}</span>
              <span className="text-brand">{formatMMK(total)}</span>
            </div>
          </div>
        </form>
      </Container>

      {qrOpen && selectedPaymentMethod && selectedPaymentMethod.qr && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/80 p-6"
          onClick={() => setQrOpen(false)}
        >
          <button
            type="button"
            onClick={() => setQrOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>

          <div className="relative h-[70vmin] w-[70vmin] max-h-105 max-w-105" onClick={(e) => e.stopPropagation()}>
            <Image
              src={selectedPaymentMethod.qr}
              alt={`${selectedPaymentMethod.name} QR`}
              fill
              sizes="420px"
              className="rounded-xl object-contain"
            />
          </div>

          <a
            href={selectedPaymentMethod.qr}
            download={`${selectedPaymentMethod.name}-QR.jpg`}
            onClick={(e) => e.stopPropagation()}
            className="rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
          >
            {t("checkout.saveImage")}
          </a>
        </div>
      )}
    </div>
  );
}
