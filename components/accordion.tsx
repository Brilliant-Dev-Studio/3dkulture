"use client";

import { useState } from "react";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={`h-4 w-4 shrink-0 transition-transform ${open ? "" : "rotate-180"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="m6 15 6-6 6 6" />
    </svg>
  );
}

export function AccordionSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border py-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-sm font-bold uppercase tracking-wide"
      >
        {title}
        <Chevron open={open} />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}
