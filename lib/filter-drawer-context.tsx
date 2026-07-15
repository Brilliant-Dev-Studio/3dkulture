"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type FilterDrawerContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const FilterDrawerContext = createContext<FilterDrawerContextValue | null>(null);

export function FilterDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <FilterDrawerContext.Provider value={{ open, setOpen }}>
      {children}
    </FilterDrawerContext.Provider>
  );
}

export function useFilterDrawer() {
  const ctx = useContext(FilterDrawerContext);
  if (!ctx) throw new Error("useFilterDrawer must be used within FilterDrawerProvider");
  return ctx;
}
