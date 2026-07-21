"use client";

import { useEffect, useRef, useState } from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";

const PRESET_COLORS = [
  "#000000", "#ffffff", "#6b7280", "#dc2626", "#ea580c", "#d97706",
  "#ca8a04", "#65a30d", "#16a34a", "#059669", "#0d9488", "#0891b2",
  "#0284c7", "#2563eb", "#4f46e5", "#7c3aed", "#9333ea", "#c026d3",
  "#db2777", "#e11d48",
];

export function ColorPicker({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Pick color"
        className="h-9 w-10 shrink-0 rounded-md border border-border"
        style={{ backgroundColor: /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000" }}
      />

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-44 rounded-md border border-border bg-white p-2.5 shadow-lg">
          <style>{`
            .compact-color-picker.react-colorful {
              width: 168px !important;
              height: 90px !important;
            }
            .compact-color-picker .react-colorful__saturation {
              border-radius: 6px 6px 0 0;
            }
            .compact-color-picker .react-colorful__hue {
              height: 14px !important;
              border-radius: 0 0 6px 6px;
            }
            .compact-color-picker .react-colorful__saturation-pointer,
            .compact-color-picker .react-colorful__hue-pointer {
              width: 14px !important;
              height: 14px !important;
            }
          `}</style>
          <HexColorPicker
            className="compact-color-picker"
            color={value}
            onChange={onChange}
          />

          <div className="mt-2.5 grid grid-cols-5 gap-1">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onChange(c)}
                aria-label={c}
                className={`h-5 w-5 rounded-full border ${
                  value.toLowerCase() === c ? "ring-2 ring-brand ring-offset-1" : "border-black/10"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span
              className="h-6 w-6 shrink-0 rounded-md border border-border"
              style={{ backgroundColor: /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000" }}
            />
            <HexColorInput
              color={value}
              onChange={onChange}
              prefixed
              placeholder="#000000"
              className="w-full rounded-md border border-border px-2 py-1 text-xs outline-none focus:border-brand"
            />
          </div>
        </div>
      )}
    </div>
  );
}
