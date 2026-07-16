"use client";

import { useState } from "react";
import { useAdminStore } from "@/lib/admin-store";

function AttributeList({
  title,
  items,
  onAdd,
  onRemove,
  placeholder,
}: {
  title: string;
  items: string[];
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
  placeholder: string;
}) {
  const [value, setValue] = useState("");

  return (
    <div className="rounded-md border border-border bg-white p-5">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide">{title}</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!value.trim()) return;
          onAdd(value.trim());
          setValue("");
        }}
        className="mb-4 flex gap-2"
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <button
          type="submit"
          className="shrink-0 rounded-md bg-brand px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-brand-dark"
        >
          Add
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm"
          >
            {item}
            <button
              type="button"
              onClick={() => onRemove(item)}
              aria-label={`Remove ${item}`}
              className="text-muted hover:text-brand"
            >
              ✕
            </button>
          </span>
        ))}
        {items.length === 0 && <p className="text-sm text-muted">None yet.</p>}
      </div>
    </div>
  );
}

export default function AdminAttributesPage() {
  const { colors, sizes, materials, addColor, removeColor, addSize, removeSize, addMaterial, removeMaterial } =
    useAdminStore();

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6">
      <h1 className="text-xl font-bold">Attributes</h1>
      <AttributeList title="Colors" items={colors} onAdd={addColor} onRemove={removeColor} placeholder="e.g. Maroon" />
      <AttributeList title="Sizes" items={sizes} onAdd={addSize} onRemove={removeSize} placeholder="e.g. XL" />
      <AttributeList
        title="Materials"
        items={materials}
        onAdd={addMaterial}
        onRemove={removeMaterial}
        placeholder="e.g. Resin"
      />
    </div>
  );
}
