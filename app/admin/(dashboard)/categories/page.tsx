"use client";

import { useState } from "react";
import { useAdminStore } from "@/lib/admin-store";
import type { Category } from "@/lib/types";

function SubCategoryForm({ onAdd }: { onAdd: (name: string) => Promise<unknown> }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-xs font-medium text-brand hover:underline">
        + Add sub-category
      </button>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await onAdd(value.trim());
      setValue("");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add sub-category.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Sub-category name"
          className="flex-1 rounded-md border border-border px-3 py-1.5 text-sm outline-none focus:border-brand"
        />
        <button
          type="submit"
          disabled={submitting}
          className="shrink-0 rounded-md bg-foreground px-3 text-xs font-semibold text-white disabled:opacity-60"
        >
          {submitting ? "Adding…" : "Add"}
        </button>
        <button
          type="button"
          onClick={() => {
            setValue("");
            setOpen(false);
          }}
          aria-label="Cancel"
          className="shrink-0 rounded-md border border-border px-3 text-xs text-muted"
        >
          ✕
        </button>
      </form>
      {error && <p className="mt-1.5 text-xs text-brand">{error}</p>}
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
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
  );
}

export default function AdminCategoriesPage() {
  const { categories, products, addCategory, removeCategory } = useAdminStore();
  const [mainName, setMainName] = useState("");
  const [mainError, setMainError] = useState<string | null>(null);
  const [submittingMain, setSubmittingMain] = useState(false);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const mains = categories.filter((c) => !c.parentId);
  const childrenOf = (parent: Category) => categories.filter((c) => c.parentId === parent.id);
  const productCount = (name: string) => products.filter((p) => p.category === name).length;

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  const visibleMains = mains
    .map((main) => {
      const subs = childrenOf(main);
      const mainMatches = main.name.toLowerCase().includes(q);
      const matchingSubs = searching ? subs.filter((s) => s.name.toLowerCase().includes(q)) : subs;
      return { main, subs: mainMatches ? subs : matchingSubs, matches: mainMatches || matchingSubs.length > 0 };
    })
    .filter((m) => !searching || m.matches);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function onSubmitMain(e: React.FormEvent) {
    e.preventDefault();
    setMainError(null);
    if (!mainName.trim()) {
      setMainError("Enter a category name.");
      return;
    }
    setSubmittingMain(true);
    try {
      await addCategory(mainName.trim());
      setMainName("");
    } catch (err) {
      setMainError(err instanceof Error ? err.message : "Failed to add category.");
    } finally {
      setSubmittingMain(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-1 text-xl font-bold">Categories</h1>
      <p className="mb-6 text-xs text-muted">
        Main categories group your catalog; each product picks one sub-category underneath.
      </p>

      <form onSubmit={onSubmitMain} className="mb-2 flex gap-2">
        <input
          value={mainName}
          onChange={(e) => {
            setMainName(e.target.value);
            if (mainError) setMainError(null);
          }}
          placeholder="New main category name"
          className="flex-1 rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <button
          type="submit"
          disabled={submittingMain}
          className="shrink-0 rounded-md bg-brand px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {submittingMain ? "Adding…" : "Add Main Category"}
        </button>
      </form>
      {mainError && <p className="mb-4 text-xs text-brand">{mainError}</p>}

      <div className="relative mb-6">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search categories…"
          className="w-full rounded-md border border-border py-2 pl-9 pr-3 text-sm outline-none focus:border-brand"
        />
      </div>

      <div className="space-y-3">
        {visibleMains.map(({ main, subs }) => {
          const isOpen = searching || expanded.has(main.id);
          return (
            <div key={main.id} className="rounded-md border border-border bg-white">
              <button
                type="button"
                onClick={() => toggle(main.id)}
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-2">
                  <ChevronIcon open={isOpen} />
                  <span className="font-semibold text-foreground">{main.name}</span>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-muted">
                    {childrenOf(main).length}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted">{productCount(main.name)} products</span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCategory(main.name);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && removeCategory(main.name)}
                    className="text-xs font-medium text-muted hover:text-brand"
                  >
                    Remove
                  </span>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-border px-4 pb-4">
                  <ul className="divide-y divide-border">
                    {subs.map((sub) => (
                      <li key={sub.id} className="flex items-center justify-between py-2 pl-6 text-sm">
                        <span className="text-foreground">{sub.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted">{productCount(sub.name)} products</span>
                          <button
                            type="button"
                            onClick={() => removeCategory(sub.name)}
                            className="text-xs font-medium text-muted hover:text-brand"
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                    {subs.length === 0 && (
                      <li className="py-2 pl-6 text-xs text-muted">
                        {searching ? "No matching sub-categories." : "No sub-categories yet."}
                      </li>
                    )}
                  </ul>

                  {!searching && (
                    <div className="mt-3 pl-6">
                      <SubCategoryForm onAdd={(name) => addCategory(name, main.id)} />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {visibleMains.length === 0 && (
          <div className="rounded-md border border-border bg-white py-8 text-center text-sm text-muted">
            {searching ? "No categories match your search." : "No categories yet."}
          </div>
        )}
      </div>
    </div>
  );
}
