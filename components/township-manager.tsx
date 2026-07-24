"use client";

import { useState } from "react";
import type { City, Region, Township } from "@/lib/types";

function NameChip({ name, nameMy, onRemove }: { name: string; nameMy: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm">
      {name}
      {nameMy && <span className="text-muted">({nameMy})</span>}
      <button type="button" onClick={onRemove} aria-label={`Remove ${name}`} className="text-muted hover:text-brand">
        ✕
      </button>
    </span>
  );
}

function groupByKey<T extends { [k: string]: unknown }>(
  parents: string[],
  items: T[],
  key: keyof T,
): [string, T[]][] {
  return [
    ...parents.map((p): [string, T[]] => [p, items.filter((i) => i[key] === p)]),
    ["Unassigned", items.filter((i) => !i[key])] as [string, T[]],
  ].filter(([, group]) => group.length > 0);
}

export function RegionManager({
  items,
  onAdd,
  onRemove,
}: {
  items: Region[];
  onAdd: (name: string, nameMy: string) => void;
  onRemove: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const [nameMy, setNameMy] = useState("");

  return (
    <div className="rounded-md border border-border bg-white p-5">
      <h2 className="mb-1 text-sm font-bold uppercase tracking-wide">Regions / States</h2>
      <p className="mb-4 text-xs text-muted">The top level a customer picks first, e.g. Yangon Region.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          onAdd(name.trim(), nameMy.trim());
          setName("");
          setNameMy("");
        }}
        className="mb-4 flex flex-wrap gap-2"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Yangon Region"
          className="min-w-32 flex-1 rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <input
          value={nameMy}
          onChange={(e) => setNameMy(e.target.value)}
          placeholder="မြန်မာအမည် (Myanmar name)"
          className="min-w-32 flex-1 rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <button
          type="submit"
          className="shrink-0 rounded-md bg-brand px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-brand-dark"
        >
          Add
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {items.map((r) => (
          <NameChip key={r.name} name={r.name} nameMy={r.nameMy} onRemove={() => onRemove(r.name)} />
        ))}
        {items.length === 0 && <p className="text-sm text-muted">None yet.</p>}
      </div>
    </div>
  );
}

export function CityManager({
  items,
  regions,
  onAdd,
  onRemove,
}: {
  items: City[];
  regions: Region[];
  onAdd: (name: string, region: string | null, nameMy: string) => void;
  onRemove: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const [nameMy, setNameMy] = useState("");
  const [region, setRegion] = useState("");

  const groups = groupByKey(
    regions.map((r) => r.name),
    items,
    "region",
  );

  return (
    <div className="rounded-md border border-border bg-white p-5">
      <h2 className="mb-1 text-sm font-bold uppercase tracking-wide">Cities</h2>
      <p className="mb-4 text-xs text-muted">Nested under a region — a customer picks this after their region.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          onAdd(name.trim(), region || null, nameMy.trim());
          setName("");
          setNameMy("");
        }}
        className="mb-4 flex flex-wrap gap-2"
      >
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="rounded-md border border-border px-2 py-2 text-sm outline-none focus:border-brand"
        >
          <option value="">No region</option>
          {regions.map((r) => (
            <option key={r.name} value={r.name}>
              {r.name}
            </option>
          ))}
        </select>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Yangon"
          className="min-w-28 flex-1 rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <input
          value={nameMy}
          onChange={(e) => setNameMy(e.target.value)}
          placeholder="မြန်မာအမည်"
          className="min-w-28 flex-1 rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-brand"
        />
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
            <div className="flex flex-wrap gap-2">
              {group.map((c) => (
                <NameChip key={c.name} name={c.name} nameMy={c.nameMy} onRemove={() => onRemove(c.name)} />
              ))}
            </div>
          </div>
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
  onRemove,
}: {
  items: Township[];
  cities: string[];
  onAdd: (name: string, city: string | null, nameMy: string) => void;
  onRemove: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const [nameMy, setNameMy] = useState("");
  const [city, setCity] = useState("");

  const groups = groupByKey(cities, items, "city");

  return (
    <div className="rounded-md border border-border bg-white p-5">
      <h2 className="mb-1 text-sm font-bold uppercase tracking-wide">Townships</h2>
      <p className="mb-4 text-xs text-muted">Nested under a city — the last step a customer picks at checkout.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          onAdd(name.trim(), city || null, nameMy.trim());
          setName("");
          setNameMy("");
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
          className="min-w-28 flex-1 rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <input
          value={nameMy}
          onChange={(e) => setNameMy(e.target.value)}
          placeholder="မြန်မာအမည်"
          className="min-w-28 flex-1 rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-brand"
        />
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
            <div className="flex flex-wrap gap-2">
              {group.map((t) => (
                <NameChip key={t.name} name={t.name} nameMy={t.nameMy} onRemove={() => onRemove(t.name)} />
              ))}
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted">None yet.</p>}
      </div>
    </div>
  );
}
