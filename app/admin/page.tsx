import Link from "next/link";
import { PRODUCTS } from "@/lib/products";
import { formatMMK } from "@/lib/format";

export default function AdminDashboardPage() {
  const productCount = new Set(PRODUCTS.map((p) => p.id.replace(/-\d+$/, ""))).size;

  const stats = [
    { label: "Products", value: productCount },
    { label: "Orders", value: 0 },
    { label: "Pending invoices", value: 0 },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <Link href="/admin/login" className="text-sm font-medium text-brand">
          Sign Out
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted">{s.label}</p>
            <p className="mt-1 text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 mt-8 text-sm font-bold uppercase tracking-wide">Products</h2>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {PRODUCTS.slice(0, 8).map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">{p.title}</td>
                <td className="px-4 py-3 text-muted">{p.category}</td>
                <td className="px-4 py-3 font-medium">{formatMMK(p.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted">
        Product/order management is read-only mock data for now — Prisma-backed CRUD not wired
        yet.
      </p>
    </div>
  );
}
