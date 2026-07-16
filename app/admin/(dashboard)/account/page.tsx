"use client";

import { useState } from "react";
import { useAdminSession } from "@/lib/use-admin-session";

const fieldClass =
  "w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition-colors focus:border-brand";
const labelClass = "mb-1.5 block text-xs font-semibold text-muted";
const cardClass = "rounded-md border border-border bg-white p-6";

export default function AdminAccountPage() {
  const { email, role } = useAdminSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match.");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to change password.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSuccess(true);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <h1 className="mb-1 text-xl font-bold">Account</h1>
      <p className="mb-6 text-sm text-muted">
        {email} <span className="capitalize text-xs text-muted">· {role?.replace("_", " ")}</span>
      </p>

      <form onSubmit={onSubmit} className={`${cardClass} space-y-4`}>
        <h2 className="text-sm font-bold uppercase tracking-wide">Change Password</h2>

        <div>
          <label className={labelClass} htmlFor="currentPassword">
            Current Password
          </label>
          <input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className={fieldClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="newPassword">
            New Password
          </label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            className={fieldClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="confirmPassword">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className={fieldClass}
          />
        </div>

        {error && <p className="text-sm text-brand">{error}</p>}
        {success && <p className="text-sm text-emerald-600">Password updated.</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-brand py-2.5 text-xs font-semibold uppercase tracking-widest text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {submitting ? "Updating…" : "Update Password"}
        </button>
      </form>
    </div>
  );
}
