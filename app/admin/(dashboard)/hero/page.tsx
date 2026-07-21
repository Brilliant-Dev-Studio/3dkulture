"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { compressImage } from "@/lib/compress-image";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Skeleton } from "@/components/skeleton";
import type { HeroSlide } from "@/lib/types";

const fieldClass =
  "w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition-colors focus:border-brand";
const labelClass = "mb-1.5 block text-xs font-semibold text-muted";
const cardClass = "rounded-md border border-border bg-white p-5";

async function uploadImage(file: File): Promise<string> {
  const compressed = await compressImage(file);
  const form = new FormData();
  form.append("file", compressed);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? "Upload failed.");
  return body.url as string;
}

function BannerDropzone({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[]) => {
      const file = accepted[0];
      if (!file) return;
      setUploading(true);
      setError(null);
      uploadImage(file)
        .then(onChange)
        .catch((e) => setError(e instanceof Error ? e.message : "Upload failed."))
        .finally(() => setUploading(false));
    },
    [onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
  });

  return (
    <div>
      {value ? (
        <div className="relative aspect-16/6 w-full overflow-hidden rounded-md bg-zinc-100">
          <Image src={value} alt="" fill unoptimized className="object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Remove image"
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-sm text-white hover:bg-black/80"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`flex aspect-16/6 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed text-center transition-colors ${
            isDragActive ? "border-brand bg-brand/5" : "border-border hover:border-foreground"
          }`}
        >
          <input {...getInputProps()} />
          <span className="text-sm text-muted">
            {uploading ? "Uploading…" : isDragActive ? "Drop image" : "Drag & drop or click — banner image"}
          </span>
        </div>
      )}
      {error && <p className="mt-1 text-xs text-brand">{error}</p>}
    </div>
  );
}

function SlideForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: HeroSlide;
  submitLabel: string;
  onSubmit: (data: Omit<HeroSlide, "id" | "order">) => Promise<void>;
  onCancel?: () => void;
}) {
  const [image, setImage] = useState(initial?.image ?? "");
  const [badge, setBadge] = useState(initial?.badge ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [linkUrl, setLinkUrl] = useState(initial?.linkUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!image) {
      setError("Upload a banner image.");
      return;
    }
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ image, badge: badge.trim(), title: title.trim(), subtitle: subtitle.trim(), linkUrl: linkUrl.trim() });
      if (!initial) {
        setImage("");
        setBadge("");
        setTitle("");
        setSubtitle("");
        setLinkUrl("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <BannerDropzone value={image} onChange={setImage} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Badge</label>
          <input value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="New Arrivals" className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>Link (optional)</label>
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="/?category=Miniatures"
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Title *</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Crafted In Every Dimension" className={fieldClass} />
      </div>

      <div>
        <label className={labelClass}>Subtitle</label>
        <textarea
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          rows={2}
          placeholder="Premium 3D printed figures and collectibles, priced in MMK."
          className={fieldClass}
        />
      </div>

      {error && <p className="text-sm text-brand">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-brand px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {submitting ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-border px-4 py-2 text-xs font-semibold uppercase tracking-widest text-muted hover:bg-zinc-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default function AdminHeroSlidesPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<HeroSlide | null>(null);

  function load() {
    return fetch("/api/hero-slides")
      .then((r) => r.json())
      .then(setSlides);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function createSlide(data: Omit<HeroSlide, "id" | "order">) {
    const res = await fetch("/api/hero-slides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Failed to create slide.");
    await load();
  }

  async function updateSlide(id: string, data: Partial<Omit<HeroSlide, "id">>) {
    const res = await fetch(`/api/hero-slides/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Failed to update slide.");
    await load();
  }

  async function deleteSlide(id: string) {
    await fetch(`/api/hero-slides/${id}`, { method: "DELETE" });
    setSlides((prev) => prev.filter((s) => s.id !== id));
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= slides.length) return;
    const a = slides[index];
    const b = slides[target];
    const next = [...slides];
    [next[index], next[target]] = [next[target], next[index]];
    setSlides(next);
    await Promise.all([
      fetch(`/api/hero-slides/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: b.order }),
      }),
      fetch(`/api/hero-slides/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: a.order }),
      }),
    ]);
    await load();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-xl font-bold">Hero Slides</h1>
        <p className="mt-1 text-sm text-muted">The rotating banner shown at the top of the homepage.</p>
      </div>

      <div className={cardClass}>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide">Add Slide</h2>
        <SlideForm submitLabel="Add Slide" onSubmit={createSlide} />
      </div>

      <div className="space-y-4">
        {loading &&
          Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}

        {!loading &&
          slides.map((slide, i) =>
            editingId === slide.id ? (
              <div key={slide.id} className={cardClass}>
                <h2 className="mb-4 text-sm font-bold uppercase tracking-wide">Edit Slide</h2>
                <SlideForm
                  initial={slide}
                  submitLabel="Save Changes"
                  onCancel={() => setEditingId(null)}
                  onSubmit={async (data) => {
                    await updateSlide(slide.id, data);
                    setEditingId(null);
                  }}
                />
              </div>
            ) : (
              <div key={slide.id} className="flex gap-4 rounded-md border border-border bg-white p-4">
                <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                  <Image src={slide.image} alt="" fill unoptimized className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  {slide.badge && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">{slide.badge}</span>
                  )}
                  <p className="truncate font-semibold text-foreground">{slide.title}</p>
                  <p className="truncate text-xs text-muted">{slide.subtitle}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end justify-between gap-2">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label="Move up"
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted hover:text-foreground disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === slides.length - 1}
                      aria-label="Move down"
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted hover:text-foreground disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                  <div className="flex gap-3 text-xs font-medium">
                    <button type="button" onClick={() => setEditingId(slide.id)} className="text-brand hover:underline">
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(slide)}
                      className="text-muted hover:text-brand"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ),
          )}

        {!loading && slides.length === 0 && (
          <div className="rounded-md border border-border bg-white py-8 text-center text-sm text-muted">
            No slides yet — add one above.
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Remove this slide?"
        description={pendingDelete ? `"${pendingDelete.title}" will be removed from the homepage.` : undefined}
        confirmLabel="Remove"
        onConfirm={() => {
          if (pendingDelete) deleteSlide(pendingDelete.id);
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
