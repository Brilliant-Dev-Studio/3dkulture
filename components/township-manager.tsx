"use client";

import { useState } from "react";
import type { Township } from "@/lib/types";

function TownshipRow({
  township,
  onUpdate,
  onRemove,
}: {
  township: Township;
  onUpdate: (deliveryFee: number) => void;
  onRemove: () => void;
}) {
  const [fee, setFee] = useState(String(township.deliveryFee));

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-2.5 last:border-b-0">
      <span className="text-sm text-foreground">{township.name}</span>
      <div className="flex items-center gap-2">
        <div className="relative w-32">
          <input
            type="number"
            min={0}
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            onBlur={() => onUpdate(Number(fee) || 0)}
            className="w-full rounded-md border border-border py-1.5 pl-3 pr-8 text-xs outline-none focus:border-brand"
          />
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted">
            K
          </span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${township.name}`}
          className="text-muted hover:text-brand"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export function CityManager({
  items,
  onAdd,
  onRemove,
}: {
  items: string[];
  onAdd: (name: string) => void;
  onRemove: (name: string) => void;
}) {
  const [name, setName] = useState("");

  return (
    <div className="rounded-md border border-border bg-white p-5">
      <h2 className="mb-1 text-sm font-bold uppercase tracking-wide">Cities / States</h2>
      <p className="mb-4 text-xs text-muted">Group townships under a city or state — used to narrow the list at checkout.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          onAdd(name.trim());
          setName("");
        }}
        className="mb-4 flex gap-2"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Yangon"
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
        {items.map((c) => (
          <span key={c} className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm">
            {c}
            <button type="button" onClick={() => onRemove(c)} aria-label={`Remove ${c}`} className="text-muted hover:text-brand">
              ✕
            </button>
          </span>
        ))}
        {items.length === 0 && <p className="text-sm text-muted">None yet.</p>}
      </div>
    </div>
  );
}

export function TownshipManager({
  items,
  cities,
  onAdd,
  onUpdate,
  onRemove,
}: {
  items: Township[];
  cities: string[];
  onAdd: (name: string, deliveryFee: number, city: string | null) => void;
  onUpdate: (name: string, deliveryFee: number) => void;
  onRemove: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const [fee, setFee] = useState("");
  const [city, setCity] = useState("");

  const groups: [string, Township[]][] = [
    ...cities.map((c): [string, Township[]] => [c, items.filter((t) => t.city === c)]),
    ["Unassigned", items.filter((t) => !t.city)] as [string, Township[]],
  ].filter(([, group]) => group.length > 0);

  return (
    <div className="rounded-md border border-border bg-white p-5">
      <h2 className="mb-1 text-sm font-bold uppercase tracking-wide">Townships &amp; Delivery Fees</h2>
      <p className="mb-4 text-xs text-muted">Shown to customers as a delivery option at checkout.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          onAdd(name.trim(), Number(fee) || 0, city || null);
          setName("");
          setFee("");
        }}
        className="mb-4 flex flex-wrap gap-2"
      >
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="rounded-md border border-border px-2 py-2 text-sm outline-none focus:border-brand"
        >
          <option value="">No city</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Yankin"
          className="min-w-32 flex-1 rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <div className="relative w-32">
          <input
            type="number"
            min={0}
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            placeholder="0"
            className="w-full rounded-md border border-border py-2 pl-3 pr-8 text-sm outline-none focus:border-brand"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">
            K
          </span>
        </div>
        <button
          type="submit"
          className="shrink-0 rounded-md bg-brand px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-brand-dark"
        >
          Add
        </button>
      </form>

      <div className="space-y-4">
        {groups.map(([groupName, group]) => (
          <div key={groupName}>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">{groupName}</p>
            {group.map((t) => (
              <TownshipRow
                key={t.name}
                township={t}
                onUpdate={(deliveryFee) => onUpdate(t.name, deliveryFee)}
                onRemove={() => onRemove(t.name)}
              />
            ))}
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted">None yet.</p>}
      </div>
    </div>
  );
}
