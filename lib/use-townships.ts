"use client";

import { useEffect, useState } from "react";
import type { Township } from "./types";

export function useTownships() {
  const [townships, setTownships] = useState<Township[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/townships")
      .then((r) => r.json())
      .then(setTownships)
      .finally(() => setLoading(false));
  }, []);

  return { townships, loading };
}
