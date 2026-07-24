"use client";

import { useEffect, useState } from "react";
import type { Region } from "./types";

export function useRegions() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/regions")
      .then((r) => r.json())
      .then(setRegions)
      .finally(() => setLoading(false));
  }, []);

  return { regions, loading };
}
