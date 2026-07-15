"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export function InvoiceDropzone({
  file,
  onChange,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onChange(accepted[0]);
    },
    [onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "image/*": [], "application/pdf": [] },
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed px-4 py-8 text-center transition-colors ${
          isDragActive ? "border-brand bg-red-50" : "border-border hover:border-brand"
        }`}
      >
        <input {...getInputProps()} required={!file} className="hidden" />
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-8 w-8 text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path d="M12 16V4m0 0 4 4m-4-4L8 8" />
          <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
        <p className="mt-2 text-sm text-foreground">
          {isDragActive ? "Drop the invoice here" : "Drag & drop your payment invoice, or click to browse"}
        </p>
        <p className="mt-1 text-xs text-muted">Image or PDF</p>
      </div>

      {file && (
        <div className="mt-2 flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
          <span className="truncate text-foreground">{file.name}</span>
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove file"
            className="ml-2 shrink-0 text-muted hover:text-brand"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
