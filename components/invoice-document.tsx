import Image from "next/image";
import { formatMMK } from "@/lib/format";
import type { Order } from "@/lib/types";

export function InvoiceDocument({ order }: { order: Order }) {
  const itemsSubtotal = order.items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <>
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
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Delivery Location</p>
          {order.township && <p className="mt-1 font-medium text-foreground">{order.township}</p>}
          {order.city && <p className="text-muted">{order.city}</p>}
          {order.region && <p className="text-muted">{order.region}</p>}
          {!order.township && !order.city && !order.region && <p className="mt-1 text-muted">—</p>}
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
        <div className="w-56 space-y-1.5 text-sm">
          <div className="flex justify-between text-muted">
            <span>Subtotal</span>
            <span>{formatMMK(itemsSubtotal)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Delivery{order.township ? ` (${order.township})` : ""}</span>
            <span>Depends on provider</span>
          </div>
          <div className="flex justify-between border-t border-border pt-1.5 font-bold text-base">
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
    </>
  );
}
