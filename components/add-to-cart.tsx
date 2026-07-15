"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/types";

export function AddToCart({ product }: { product: Product }) {
  const { addLine } = useCart();
  const router = useRouter();
  const [color, setColor] = useState(product.colors[0]);
  const [size, setSize] = useState(product.sizes[0]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">
          Color: <span className="text-foreground">{color}</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {product.colors.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                c === color
                  ? "border-2 border-foreground font-semibold text-foreground"
                  : "border-border text-foreground hover:border-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">
          Size: <span className="text-foreground">{size}</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className={`min-w-11 rounded-md border px-2 py-1.5 text-xs transition-colors ${
                s === size
                  ? "border-2 border-foreground font-semibold text-foreground"
                  : "border-border text-foreground hover:border-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-stretch gap-3 pt-1">
        <div className="flex items-center rounded-md border border-border">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-12 w-10 items-center justify-center text-lg font-medium text-foreground"
          >
            −
          </button>
          <span className="w-6 text-center text-sm font-semibold">{qty}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => q + 1)}
            className="flex h-12 w-10 items-center justify-center text-lg font-medium text-foreground"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            addLine({ productId: product.id, color, size, qty });
            setAdded(true);
            window.setTimeout(() => setAdded(false), 1500);
          }}
          className="flex-1 rounded-md bg-brand text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-brand-dark"
        >
          {added ? "Added to Cart" : "Add to Cart"}
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          addLine({ productId: product.id, color, size, qty });
          router.push("/checkout");
        }}
        className="w-full rounded-md bg-foreground py-3 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-black"
      >
        Buy Now
      </button>
    </div>
  );
}
