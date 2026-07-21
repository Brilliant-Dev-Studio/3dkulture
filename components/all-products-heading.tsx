"use client";

import { useI18n } from "@/lib/i18n";

export function AllProductsHeading() {
  const { t } = useI18n();
  return <h2 className="text-xl font-semibold text-foreground sm:text-2xl">{t("home.allProducts")}</h2>;
}
