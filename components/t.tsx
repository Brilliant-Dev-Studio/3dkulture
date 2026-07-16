"use client";

import { useI18n } from "@/lib/i18n";

type Key = Parameters<ReturnType<typeof useI18n>["t"]>[0];

export function T({ k }: { k: Key }) {
  const { t } = useI18n();
  return <>{t(k)}</>;
}
