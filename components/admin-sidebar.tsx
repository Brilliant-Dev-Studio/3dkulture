"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAdminSession } from "@/lib/use-admin-session";

const NAV = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: "M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z",
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: "M20 7 12 3 4 7m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: "M4 6h16M4 12h10M4 18h6",
  },
  {
    href: "/admin/attributes",
    label: "Attributes",
    icon: "M12 2 3 7l9 5 9-5-9-5ZM3 17l9 5 9-5M3 12l9 5 9-5",
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: "M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm9 0v5h5M9 13h6M9 17h6M9 9h2",
  },
  {
    href: "/admin/delivery",
    label: "Delivery Fees",
    icon: "M3 16V6a1 1 0 0 1 1-1h9v11M3 16h13M3 16a2 2 0 1 0 4 0M13 16a2 2 0 1 0 4 0M13 8h4l3 3v5h-2M17 8v5h5",
  },
  {
    href: "/admin/hero",
    label: "Hero Slides",
    icon: "M3 4h18v13H3z M7 20h10 M8 8l3 3-3 3 M16 8l-3 3 3 3",
  },
  {
    href: "/admin/admins",
    label: "Admins",
    icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 3.13a4 4 0 0 1 0 7.75M16 3.13a4 4 0 0 1 0 7.75",
    superAdminOnly: true,
  },
  {
    href: "/admin/activity",
    label: "Activity Log",
    icon: "M3 3v18h18M7 14l3-3 3 3 5-6",
    superAdminOnly: true,
  },
  {
    href: "/admin/account",
    label: "Account",
    icon: "M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-8 9a8 8 0 0 1 16 0",
  },
];

function SignOutButton({ className }: { className: string }) {
  const router = useRouter();

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button type="button" onClick={signOut} className={className}>
      <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
      </svg>
      Sign Out
    </button>
  );
}

export function AdminMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { isSuperAdmin } = useAdminSession();
  const nav = NAV.filter((item) => !item.superAdminOnly || isSuperAdmin);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-white px-4 py-3 sm:hidden">
        <Link href="/admin">
          <Image src="/logo.png" alt="3D Kulture" width={90} height={88} className="h-7 w-auto" />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      <div
        className={`fixed inset-0 z-50 sm:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />
        <div
          className={`absolute inset-y-0 left-0 flex w-[80%] max-w-xs flex-col bg-white transition-transform duration-300 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            <Image src="/logo.png" alt="3D Kulture" width={100} height={98} className="h-8 w-auto" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="flex h-8 w-8 items-center justify-center text-muted"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {nav.map((item) => {
              const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    active ? "bg-brand/10 text-brand" : "text-foreground hover:bg-zinc-50"
                  }`}
                >
                  <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path d={item.icon} />
                  </svg>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border p-3">
            <SignOutButton className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-zinc-50 hover:text-brand" />
          </div>
        </div>
      </div>
    </>
  );
}

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-20 hidden h-16 items-center border-b border-border bg-white px-6 sm:flex">
      <Link href="/admin">
        <Image src="/logo.png" alt="3D Kulture" width={120} height={117} className="h-9 w-auto" />
      </Link>
    </header>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { isSuperAdmin } = useAdminSession();
  const nav = NAV.filter((item) => !item.superAdminOnly || isSuperAdmin);

  return (
    <aside className="hidden w-56 shrink-0 border-r border-border bg-white sm:block">
      <div className="sticky top-0 flex h-screen flex-col">
        <Link href="/admin" className="flex h-16 items-center border-b border-border px-5">
          <span className="text-xs font-bold uppercase tracking-widest text-muted">Admin</span>
        </Link>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {nav.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-brand/10 text-brand" : "text-foreground hover:bg-zinc-50"
                }`}
              >
                <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <SignOutButton className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-zinc-50 hover:text-brand" />
        </div>
      </div>
    </aside>
  );
}
