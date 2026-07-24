"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { compressImage } from "@/lib/compress-image";

const MAX_IMAGES = 6;

type ImageItem = {
  id: string;
  url: string;
  previewUrl?: string;
  status: "uploading" | "done" | "error";
  error?: string;
};

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

async function uploadFile(file: File): Promise<string> {
  const compressed = await compressImage(file);
  const form = new FormData();
  form.append("file", compressed);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? "Upload failed.");
  return body.url as string;
}

export function ImageDropzone({
  initialUrls,
  onChange,
}: {
  initialUrls: string[];
  onChange: (urls: string[]) => void;
}) {
  const [items, setItems] = useState<ImageItem[]>(
    initialUrls.filter(Boolean).map((url) => ({ id: randomId(), url, status: "done" })),
  );
  const didInit = useRef(false);

  useEffect(() => {
    if (!didInit.current) {
      didInit.current = true;
      return;
    }
    onChange(items.filter((i) => i.status === "done").map((i) => i.url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const onDrop = useCallback(
    (accepted: File[]) => {
      setItems((prev) => {
        const remaining = MAX_IMAGES - prev.length;
        const files = accepted.slice(0, Math.max(0, remaining));
        const newItems: ImageItem[] = files.map((file) => ({
          id: randomId(),
          url: "",
          previewUrl: URL.createObjectURL(file),
          status: "uploading",
        }));

        newItems.forEach((item, i) => {
          uploadFile(files[i])
            .then((url) => {
              setItems((cur) => cur.map((it) => (it.id === item.id ? { ...it, url, status: "done" } : it)));
            })
            .catch((e) => {
              setItems((cur) =>
                cur.map((it) =>
                  it.id === item.id
                    ? { ...it, status: "error", error: e instanceof Error ? e.message : "Upload failed." }
                    : it,
                ),
              );
            })
            .finally(() => {
              if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
            });
        });

        return [...prev, ...newItems];
      });
    },
    [],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [], "image/gif": [] },
    maxFiles: MAX_IMAGES,
    disabled: items.length >= MAX_IMAGES,
  });

  function removeItem(id: string) {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.id} className="relative aspect-square overflow-hidden rounded-md bg-zinc-100">
            {(item.url || item.previewUrl) && (
              <Image
                src={item.url || item.previewUrl!}
                alt=""
                fill
                sizes="140px"
                unoptimized
                className="object-cover"
              />
            )}
            {item.status === "uploading" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-[10px] font-semibold text-white">
                Uploading…
              </div>
            )}
            {item.status === "error" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-2 text-center text-[10px] font-semibold text-white">
                {item.error ?? "Failed"}
              </div>
            )}
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              aria-label="Remove image"
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white hover:bg-black/80"
            >
              ✕
            </button>
          </div>
        ))}

        {items.length < MAX_IMAGES && (
          <div
            {...getRootProps()}
            className={`flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-2 text-center transition-colors ${
              isDragActive ? "border-brand bg-brand/5" : "border-border hover:border-foreground"
            }`}
          >
            <input {...getInputProps()} />
            <span className="text-[11px] font-medium text-muted">
              {isDragActive ? "Drop images" : "Drag & drop or click"}
            </span>
          </div>
        )}
      </div>
      <p className="text-[11px] text-muted">
        {items.length}/{MAX_IMAGES} images — auto-compressed on upload.
      </p>
    </div>
  );
}
