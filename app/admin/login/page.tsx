"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // NOTE: stub only — real admin auth wiring (Prisma + sessions) is not built yet.
    const form = new FormData(e.currentTarget);
    if (!form.get("email") || !form.get("password")) {
      setError("Enter email and password.");
      return;
    }
    router.push("/admin");
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 sm:px-6">
      <h1 className="text-2xl font-semibold text-foreground">Admin Login</h1>
      <p className="mt-1 text-sm text-muted">3D Kulture management console</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="w-full rounded-[25px] border border-border px-4 py-2.5 text-sm outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/10"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Password"
          className="w-full rounded-[25px] border border-border px-4 py-2.5 text-sm outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/10"
        />
        {error && <p className="text-sm text-brand">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-[25px] bg-brand py-3 text-xs font-semibold uppercase tracking-widest text-white hover:bg-brand-dark"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
