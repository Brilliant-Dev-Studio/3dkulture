"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminSession } from "@/lib/use-admin-session";
import { Skeleton } from "@/components/skeleton";

type ActivityEntry = {
  id: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string | null;
  targetLabel: string | null;
  meta: Record<string, unknown>;
  createdAt: string;
};

const ACTION_LABEL: Record<string, string> = {
  login: "signed in",
  "product.create": "created product",
  "product.update": "updated product",
  "product.delete": "deleted product",
  "order.status_change": "changed order status",
  "category.create_main": "created category",
  "category.create_sub": "created sub-category",
  "category.delete": "deleted category",
  "admin.create": "created admin",
  "admin.delete": "removed admin",
  "admin.reset_password": "reset password for",
  "account.change_password": "changed their password",
};

const ACTION_COLOR: Record<string, string> = {
  login: "bg-zinc-100 text-muted",
  "product.create": "bg-emerald-50 text-emerald-700",
  "product.update": "bg-blue-50 text-blue-700",
  "product.delete": "bg-red-50 text-red-700",
  "order.status_change": "bg-indigo-50 text-indigo-700",
  "category.create_main": "bg-emerald-50 text-emerald-700",
  "category.create_sub": "bg-emerald-50 text-emerald-700",
  "category.delete": "bg-red-50 text-red-700",
  "admin.create": "bg-emerald-50 text-emerald-700",
  "admin.delete": "bg-red-50 text-red-700",
  "admin.reset_password": "bg-amber-50 text-amber-700",
  "account.change_password": "bg-amber-50 text-amber-700",
};

const ACTIONS = Object.keys(ACTION_LABEL);

export default function AdminActivityPage() {
  const router = useRouter();
  const { role, loading: sessionLoading } = useAdminSession();
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (sessionLoading) return;
    if (role !== "super_admin") {
      router.replace("/admin");
      return;
    }
    fetch("/api/activity-log")
      .then((r) => (r.ok ? r.json() : []))
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [sessionLoading, role, router]);

  if (sessionLoading || role !== "super_admin") return null;

  const q = query.trim().toLowerCase();
  const filtered = entries.filter((e) => {
    if (actionFilter !== "all" && e.action !== actionFilter) return false;
    if (q && !e.actorEmail.toLowerCase().includes(q) && !(e.targetLabel ?? "").toLowerCase().includes(q))
      return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-1 text-xl font-bold">Activity Log</h1>
      <p className="mb-6 text-sm text-muted">Recent admin actions across the console.</p>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search admin or target…"
            className="w-full rounded-md border border-border py-2 pl-9 pr-3 text-sm outline-none focus:border-brand"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-brand sm:w-56"
        >
          <option value="all">All actions</option>
          {ACTIONS.map((a) => (
            <option key={a} value={a}>
              {ACTION_LABEL[a]}
            </option>
          ))}
        </select>
      </div>

      <ul className="divide-y divide-border rounded-md border border-border bg-white">
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <li key={`skeleton-${i}`} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-4 w-64" />
            </li>
          ))}
        {!loading &&
          filtered.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 px-4 py-3 text-sm">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ACTION_COLOR[e.action] ?? "bg-zinc-100 text-muted"}`}
              >
                {ACTION_LABEL[e.action] ?? e.action}
              </span>
              <span className="font-medium text-foreground">{e.actorEmail}</span>
              {e.targetLabel && (
                <>
                  <span className="text-muted">→</span>
                  <span className="text-foreground">{e.targetLabel}</span>
                </>
              )}
              {e.action === "order.status_change" && typeof e.meta?.status === "string" && (
                <span className="text-muted">to {e.meta.status}</span>
              )}
              <span className="ml-auto text-xs text-muted">{new Date(e.createdAt).toLocaleString()}</span>
            </li>
          ))}
        {!loading && filtered.length === 0 && (
          <li className="px-4 py-8 text-center text-muted">No activity recorded yet.</li>
        )}
      </ul>
    </div>
  );
}
