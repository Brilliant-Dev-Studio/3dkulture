"use client";

import { useEffect, useRef, useState } from "react";

export type DropdownOption = { value: string; label: string };

export function DropdownSelect({
  value,
  onChange,
  options,
  placeholder,
  icon,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const current = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between text-left ${className}`}
      >
        <span className="flex min-w-0 items-center gap-2">
          {icon}
          <span className={`truncate ${current ? "text-foreground" : "text-muted"}`}>
            {current?.label ?? placeholder}
          </span>
        </span>
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className={`h-4 w-4 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="scroll-thin absolute left-0 top-full z-50 mt-1.5 max-h-64 w-full overflow-y-auto rounded-2xl border border-border bg-white py-1.5 shadow-lg">
          {options.length === 0 && <p className="px-4 py-2 text-sm text-muted">No options.</p>}
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm ${
                o.value === value ? "font-semibold text-brand" : "text-foreground hover:bg-zinc-50"
              }`}
            >
              {o.label}
              {o.value === value && <span aria-hidden>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
