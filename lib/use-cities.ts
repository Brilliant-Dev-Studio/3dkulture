"use client";

import { useEffect, useState } from "react";

export function useCities() {
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cities")
      .then((r) => r.json())
      .then(setCities)
      .finally(() => setLoading(false));
  }, []);

  return { cities, loading };
}
