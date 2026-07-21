"use client";

import { useEffect, useState } from "react";
import type { ColorSwatch } from "./types";

export function useColors() {
  const [colors, setColors] = useState<ColorSwatch[]>([]);

  useEffect(() => {
    fetch("/api/colors")
      .then((r) => (r.ok ? r.json() : []))
      .then(setColors);
  }, []);

  return colors;
}
