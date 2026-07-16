"use client";

import { useEffect, useState } from "react";

export function useAdminSession() {
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<"admin" | "super_admin" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.authenticated) {
          setEmail(data.email);
          setRole(data.role);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return { email, role, isSuperAdmin: role === "super_admin", loading };
}
