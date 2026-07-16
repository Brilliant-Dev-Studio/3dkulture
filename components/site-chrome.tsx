"use client";

import { usePathname } from "next/navigation";
import { LocaleProvider } from "@/lib/i18n";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <LocaleProvider>
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </LocaleProvider>
  );
}
