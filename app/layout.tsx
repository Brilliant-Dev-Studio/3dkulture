import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Suspense } from "react";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { FilterDrawerProvider } from "@/lib/filter-drawer-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const yatiSans = localFont({
  src: "../public/Yati font/Variation/Yati Sans Variation.ttf",
  variable: "--font-yati",
  weight: "100 900",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "3D Kulture",
  description: "3D Kulture — curated sneakers and streetwear, priced in MMK.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${yatiSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <FilterDrawerProvider>
            <Suspense>
              <Navbar />
            </Suspense>
            <div className="flex-1">{children}</div>
            <Footer />
          </FilterDrawerProvider>
        </CartProvider>
      </body>
    </html>
  );
}
