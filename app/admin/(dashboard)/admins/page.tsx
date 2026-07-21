"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminSession } from "@/lib/use-admin-session";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Skeleton } from "@/components/skeleton";
import { roleLabel } from "@/lib/roles";

const fieldClass =
  "w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition-colors focus:border-brand";

type AdminUserRow = { id: string; email: string; role: "admin" | "super_admin"; createdAt: string };

function CreateAdminForm({ onCreated }: { onCreated: (u: AdminUserRow) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "super_admin">("admin");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await fetch("/api/admin-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to create admin.");
      return;
    }
    const created = await res.json();
    onCreated(created);
    setEmail("");
    setPassword("");
    setRole("admin");
  }

  return (
    <form onSubmit={onSubmit} className="rounded-md border border-border bg-white p-5">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide">Add Admin</h2>
      <div className="grid gap-3 sm:grid-cols-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className={`${fieldClass} sm:col-span-2`}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 8 chars)"
          required
          minLength={8}
          className={fieldClass}
        />
        <select value={role} onChange={(e) => setRole(e.target.value as typeof role)} className={fieldClass}>
          <option value="admin">Admin</option>
          <option value="super_admin">Owner</option>
        </select>
      </div>
      {error && <p className="mt-2 text-sm text-brand">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="mt-4 rounded-md bg-brand px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {submitting ? "Creating…" : "Create Admin"}
      </button>
    </form>
  );
}

function ResetPasswordRow({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-xs font-medium text-brand hover:underline">
        Reset password
      </button>
    );
  }

  async function submit() {
    if (password.length < 8) {
      setError("Min 8 characters.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/admin-users/${userId}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed.");
      return;
    }
    setDone(true);
    window.setTimeout(() => {
      setOpen(false);
      setDone(false);
      setPassword("");
    }, 1200);
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password"
        className="w-32 rounded-md border border-border px-2 py-1 text-xs outline-none focus:border-brand"
      />
      <button
        type="button"
        onClick={submit}
        disabled={submitting}
        className="rounded-md bg-foreground px-2 py-1 text-xs font-semibold text-white disabled:opacity-60"
      >
        {done ? "✓" : "Set"}
      </button>
      <button type="button" onClick={() => setOpen(false)} aria-label="Cancel" className="text-xs text-muted">
        ✕
      </button>
      {error && <span className="text-xs text-brand">{error}</span>}
    </div>
  );
}

export default function AdminAdminsPage() {
  const router = useRouter();
  const { email: currentEmail, role, loading: sessionLoading } = useAdminSession();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; email: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionLoading) return;
    if (role !== "super_admin") {
      router.replace("/admin");
      return;
    }
    fetch("/api/admin-users")
      .then((r) => (r.ok ? r.json() : []))
      .then(setUsers)
      .finally(() => setLoading(false));
  }, [sessionLoading, role, router]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleteError(null);
    const res = await fetch(`/api/admin-users/${pendingDelete.id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setDeleteError(body.error ?? "Failed to remove admin.");
      setPendingDelete(null);
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== pendingDelete.id));
    setPendingDelete(null);
  }

  if (sessionLoading || role !== "super_admin") return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-xl font-bold">Admins</h1>

      <div className="mb-6">
        <CreateAdminForm onCreated={(u) => setUsers((prev) => [...prev, u])} />
      </div>

      {deleteError && <p className="mb-3 text-sm text-brand">{deleteError}</p>}

      <div className="overflow-hidden rounded-md border border-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Created</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading &&
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-40" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                </tr>
              ))}
            {!loading &&
              users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {u.email}
                    {u.email === currentEmail && <span className="ml-2 text-xs text-muted">(you)</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        u.role === "super_admin" ? "bg-brand/10 text-brand" : "bg-zinc-100 text-muted"
                      }`}
                    >
                      {roleLabel(u.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ResetPasswordRow userId={u.id} />
                      {u.email !== currentEmail && (
                        <button
                          type="button"
                          onClick={() => setPendingDelete({ id: u.id, email: u.email })}
                          className="text-xs font-medium text-muted hover:text-brand"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  No admins yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Remove this admin?"
        description={pendingDelete ? `${pendingDelete.email} will lose access immediately.` : undefined}
        confirmLabel="Remove"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
