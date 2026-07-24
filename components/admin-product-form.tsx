"use client";

import { useState } from "react";
import Image from "next/image";
import { useAdminStore } from "@/lib/admin-store";
import { formatMMK } from "@/lib/format";
import { ImageDropzone } from "@/components/image-dropzone";
import { SearchableSelect } from "@/components/searchable-select";
import { ColorPicker } from "@/components/color-picker";
import type { Product } from "@/lib/types";

const fieldClass =
  "w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition-colors focus:border-brand";
const errorFieldClass = "border-brand focus:border-brand";
const labelClass = "mb-1.5 block text-xs font-semibold text-muted";
const cardClass = "rounded-md border border-border bg-white p-6";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-brand">{message}</p>;
}

function TagToggle({
  label,
  active,
  onClick,
  swatch,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  swatch?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors ${
        active ? "border-2 border-foreground font-semibold text-foreground" : "border-border text-foreground hover:border-foreground"
      }`}
    >
      {swatch && (
        <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/10" style={{ backgroundColor: swatch }} />
      )}
      {label}
    </button>
  );
}

function SizePriceRow({
  label,
  value,
  basePrice,
  onChange,
}: {
  label: string;
  value: number | undefined;
  basePrice: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-foreground">{label}</span>
      <div className="relative w-32">
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted">K</span>
        <input
          type="number"
          value={value ?? basePrice}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          placeholder={String(basePrice)}
          className={`${fieldClass} py-1.5 pl-6 text-xs`}
        />
      </div>
    </div>
  );
}

function SizeDiscountRow({
  label,
  value,
  unit,
  overallValue,
  onChange,
  onClear,
}: {
  label: string;
  value: number | undefined;
  unit: string;
  overallValue: number;
  onChange: (v: number) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <div className="relative w-32">
          <input
            type="number"
            value={value ?? ""}
            onChange={(e) => onChange(Number(e.target.value) || 0)}
            placeholder={overallValue ? `${overallValue}${unit}` : "Same as overall"}
            className={`${fieldClass} py-1.5 pr-7 text-xs`}
          />
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted">
            {unit}
          </span>
        </div>
        {value != null && (
          <button
            type="button"
            onClick={onClear}
            aria-label={`Clear ${label} discount override`}
            className="text-xs text-muted hover:text-brand"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

function ImageManager({
  images,
  onImagesChange,
  colors,
  colorImages,
  onColorImagesChange,
}: {
  images: string[];
  onImagesChange: (urls: string[]) => void;
  colors: string[];
  colorImages: Record<string, string[]>;
  onColorImagesChange: (color: string, urls: string[]) => void;
}) {
  type Tab = "default" | "color";
  const [tab, setTab] = useState<Tab>("default");
  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "default", label: "Default" },
    { key: "color", label: "By Color", count: colors.length },
  ];

  return (
    <div>
      <div className="mb-4 flex gap-1 rounded-md bg-zinc-100 p-1">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            type="button"
            onClick={() => setTab(tb.key)}
            className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors ${
              tab === tb.key ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            {tb.label}
            {tb.count !== undefined && tb.count > 0 ? ` (${tb.count})` : ""}
          </button>
        ))}
      </div>

      {tab === "default" && (
        <div>
          <p className="mb-3 text-xs text-muted">Main gallery — shown by default and whenever a color/material has no images of its own.</p>
          <ImageDropzone initialUrls={images} onChange={onImagesChange} />
        </div>
      )}

      {tab === "color" &&
        (colors.length === 0 ? (
          <p className="text-sm text-muted">Select at least one color under Variants to add color-specific photos.</p>
        ) : (
          <div className="space-y-6">
            <p className="text-xs text-muted">
              Optional — a customer picking this color sees these photos instead of the default gallery.
            </p>
            {colors.map((c) => (
              <div key={c}>
                <span className={labelClass}>{c}</span>
                <ImageDropzone
                  initialUrls={colorImages[c] ?? []}
                  onChange={(urls) => onColorImagesChange(c, urls)}
                />
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}

function AddNew({
  placeholder,
  onAdd,
}: {
  placeholder: string;
  onAdd: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 text-xs font-medium text-brand hover:underline"
      >
        + Add new
      </button>
    );
  }

  return (
    <div className="mt-2 flex gap-2">
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key !== "Enter") return;
          e.preventDefault();
          if (!value.trim()) return;
          onAdd(value.trim());
          setValue("");
          setOpen(false);
        }}
        className={`${fieldClass} text-sm`}
      />
      <button
        type="button"
        onClick={() => {
          if (!value.trim()) return;
          onAdd(value.trim());
          setValue("");
          setOpen(false);
        }}
        className="shrink-0 rounded-md bg-foreground px-3 text-xs font-semibold text-white"
      >
        Add
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
    </div>
  );
}

function AddNewColor({ onAdd }: { onAdd: (name: string, hex: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [hex, setHex] = useState("#000000");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 text-xs font-medium text-brand hover:underline"
      >
        + Add new
      </button>
    );
  }

  function submit() {
    if (!name.trim()) return;
    onAdd(name.trim(), hex);
    setName("");
    setHex("#000000");
    setOpen(false);
  }

  return (
    <div className="mt-2 flex gap-2">
      <ColorPicker value={hex} onChange={setHex} />
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New color name"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
        className={`${fieldClass} text-sm`}
      />
      <button
        type="button"
        onClick={submit}
        className="shrink-0 rounded-md bg-foreground px-3 text-xs font-semibold text-white"
      >
        Add
      </button>
      <button
        type="button"
        onClick={() => {
          setName("");
          setOpen(false);
        }}
        aria-label="Cancel"
        className="shrink-0 rounded-md border border-border px-3 text-xs text-muted"
      >
        ✕
      </button>
    </div>
  );
}

export function ProductForm({
  initialProduct,
  submitLabel,
  onSubmit,
}: {
  initialProduct?: Product;
  submitLabel: string;
  onSubmit: (product: Omit<Product, "id">) => Promise<void>;
}) {
  const { categories, colors, sizes, materials, addCategory, addColor, addSize, addMaterial } = useAdminStore();
  const [submitting, setSubmitting] = useState(false);

  const mainCategories = categories.filter((c) => !c.parentId);
  const subCategoriesOf = (parentId: string) => categories.filter((c) => c.parentId === parentId);
  const initialCategoryRow = categories.find((c) => c.name === initialProduct?.category);
  const initialMainId = initialCategoryRow
    ? initialCategoryRow.parentId ?? initialCategoryRow.id
    : mainCategories[0]?.id ?? "";
  const initialMain = mainCategories.find((c) => c.id === initialMainId);
  const initialSubOptions = initialMain ? [initialMain, ...subCategoriesOf(initialMain.id)] : [];

  const [title, setTitle] = useState(initialProduct?.title ?? "");
  const [mainCategoryId, setMainCategoryId] = useState(initialMainId);
  const [category, setCategory] = useState(initialProduct?.category ?? initialSubOptions[0]?.name ?? "");
  const [price, setPrice] = useState(initialProduct ? String(initialProduct.price) : "");
  const [costPrice, setCostPrice] = useState(initialProduct ? String(initialProduct.costPrice || "") : "");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">(initialProduct?.discountType ?? "percent");
  const [discountValue, setDiscountValue] = useState(
    initialProduct ? String(initialProduct.discountValue || "") : "",
  );
  const [isPreorder, setIsPreorder] = useState(initialProduct?.isPreorder ?? false);
  const [preorderNote, setPreorderNote] = useState(initialProduct?.preorderNote ?? "");
  const [stock, setStock] = useState(initialProduct ? String(initialProduct.stock) : "0");
  const [lowStockThreshold, setLowStockThreshold] = useState(
    initialProduct ? String(initialProduct.lowStockThreshold) : "5",
  );
  const [description, setDescription] = useState(initialProduct?.description ?? "");
  const [selectedColors, setSelectedColors] = useState<string[]>(initialProduct?.colors ?? []);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(initialProduct?.sizes ?? []);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(initialProduct?.materials ?? []);
  const [images, setImages] = useState<string[]>(initialProduct?.images ? [...initialProduct.images] : []);
  const [sizePrices, setSizePrices] = useState<Record<string, number>>(initialProduct?.sizePrices ?? {});
  const [sizeDiscounts, setSizeDiscounts] = useState<Record<string, number>>(initialProduct?.sizeDiscounts ?? {});
  const [materialPrices, setMaterialPrices] = useState<Record<string, number>>(
    initialProduct?.materialPrices ?? {},
  );
  const [colorImages, setColorImages] = useState<Record<string, string[]>>(initialProduct?.colorImages ?? {});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const selectedMain = mainCategories.find((c) => c.id === mainCategoryId);
  const subOptions = selectedMain ? [selectedMain, ...subCategoriesOf(selectedMain.id)] : [];

  function toggleColor(c: string) {
    setSelectedColors((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }
  function toggleSize(s: string) {
    setSelectedSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }
  function toggleMaterial(m: string) {
    setSelectedMaterials((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = "Title is required.";
    if (!category) errors.category = "Pick a category.";
    if (!price || Number(price) <= 0) errors.price = "Enter a valid price.";
    if (costPrice && Number(costPrice) < 0) errors.costPrice = "Enter a valid cost.";
    if (discountValue && discountType === "percent" && (Number(discountValue) < 0 || Number(discountValue) > 100))
      errors.discountValue = "Enter 0-100.";
    if (discountValue && discountType === "fixed" && Number(discountValue) < 0)
      errors.discountValue = "Enter a valid amount.";
    if (stock && Number(stock) < 0) errors.stock = "Enter a valid stock count.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const fallbackImage = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=60&auto=format&fit=crop";
    const product: Omit<Product, "id"> = {
      title: title.trim(),
      category,
      description: description.trim(),
      price: Number(price),
      costPrice: Number(costPrice) || 0,
      discountType,
      discountValue: Number(discountValue) || 0,
      isPreorder,
      preorderNote: preorderNote.trim(),
      stock: Number(stock) || 0,
      lowStockThreshold: Number(lowStockThreshold) || 5,
      images: images.length > 0 ? images : [fallbackImage],
      colors: selectedColors,
      sizes: selectedSizes,
      materials: selectedMaterials,
      sizePrices: Object.fromEntries(selectedSizes.map((s) => [s, sizePrices[s] ?? (Number(price) || 0)])),
      sizeDiscounts: Object.fromEntries(
        selectedSizes.filter((s) => sizeDiscounts[s] != null).map((s) => [s, sizeDiscounts[s]]),
      ),
      materialPrices: Object.fromEntries(selectedMaterials.map((m) => [m, materialPrices[m] ?? 0])),
      colorImages: Object.fromEntries(
        selectedColors.map((c) => [c, colorImages[c] ?? []]).filter(([, v]) => (v as string[]).length > 0),
      ),
      materialImages: {},
    };
    setSubmitting(true);
    try {
      await onSubmit(product);
    } finally {
      setSubmitting(false);
    }
  }

  const previewImage = images[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=60&auto=format&fit=crop";
  const previewBasePrice = Number(price || 0);
  const previewFinalPrice = Math.max(
    0,
    Math.round(
      discountType === "fixed"
        ? previewBasePrice - Number(discountValue || 0)
        : previewBasePrice * (1 - Number(discountValue || 0) / 100),
    ),
  );
  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className={cardClass}>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide">Details</h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="title">
                Title *
              </label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Adizero Evo SL Shoes"
                className={`${fieldClass} ${fieldErrors.title ? errorFieldClass : ""}`}
              />
              <FieldError message={fieldErrors.title} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="mainCategory">
                  Main Category *
                </label>
                <SearchableSelect
                  id="mainCategory"
                  value={mainCategoryId}
                  options={mainCategories.map((c) => ({ value: c.id, label: c.name }))}
                  onChange={(id) => {
                    setMainCategoryId(id);
                    const main = mainCategories.find((c) => c.id === id);
                    setCategory(main?.name ?? "");
                  }}
                  placeholder="Select main category"
                  error={!!fieldErrors.category}
                />
                <FieldError message={fieldErrors.category} />
                <AddNew
                  placeholder="New main category name"
                  onAdd={async (v) => {
                    const created = await addCategory(v);
                    setMainCategoryId(created.id);
                    setCategory(created.name);
                  }}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="subCategory">
                  Sub-Category *
                </label>
                <SearchableSelect
                  id="subCategory"
                  value={category}
                  options={subOptions.map((c) => ({
                    value: c.name,
                    label: c.id === mainCategoryId ? `${c.name} (General)` : c.name,
                  }))}
                  onChange={setCategory}
                  placeholder="Select sub-category"
                />
                <AddNew
                  placeholder="New sub-category name"
                  onAdd={async (v) => {
                    const created = await addCategory(v, mainCategoryId);
                    setCategory(created.name);
                  }}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="price">
                  Selling Price *
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">K</span>
                  <input
                    id="price"
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="150000"
                    className={`${fieldClass} pl-6 ${fieldErrors.price ? errorFieldClass : ""}`}
                  />
                </div>
                <FieldError message={fieldErrors.price} />
              </div>

              <div>
                <label className={labelClass} htmlFor="costPrice">
                  Cost Price
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">K</span>
                  <input
                    id="costPrice"
                    type="number"
                    min={0}
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="80000"
                    className={`${fieldClass} pl-6 ${fieldErrors.costPrice ? errorFieldClass : ""}`}
                  />
                </div>
                <FieldError message={fieldErrors.costPrice} />
                <p className="mt-1 text-[11px] text-muted">What it costs you — used to compute profit. Not shown to customers.</p>
              </div>
            </div>

            <div>
              <span className={labelClass}>Discount</span>
              <div className="flex gap-2">
                <div className="flex rounded-md border border-border p-0.5">
                  {(["percent", "fixed"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setDiscountType(t)}
                      className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
                        discountType === t ? "bg-brand text-white" : "text-muted hover:text-foreground"
                      }`}
                    >
                      {t === "percent" ? "%" : "K"}
                    </button>
                  ))}
                </div>
                <div className="relative flex-1">
                  <input
                    id="discountValue"
                    type="number"
                    min={0}
                    max={discountType === "percent" ? 100 : undefined}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="0"
                    className={`${fieldClass} pr-8 ${fieldErrors.discountValue ? errorFieldClass : ""}`}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                    {discountType === "percent" ? "%" : "K"}
                  </span>
                </div>
              </div>
              <FieldError message={fieldErrors.discountValue} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="stock">
                  Stock
                </label>
                <input
                  id="stock"
                  type="number"
                  min={0}
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="20"
                  className={`${fieldClass} ${fieldErrors.stock ? errorFieldClass : ""}`}
                />
                <FieldError message={fieldErrors.stock} />
              </div>

              <div>
                <label className={labelClass} htmlFor="lowStockThreshold">
                  Low Stock Alert At
                </label>
                <input
                  id="lowStockThreshold"
                  type="number"
                  min={0}
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                  placeholder="5"
                  className={fieldClass}
                />
                <p className="mt-1 text-[11px] text-muted">Flagged on the dashboard when stock drops to this or below.</p>
              </div>
            </div>

            <div>
              <label className="flex items-center justify-between gap-3">
                <span className={labelClass}>Preorder</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isPreorder}
                  onClick={() => setIsPreorder((v) => !v)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                    isPreorder ? "bg-brand" : "bg-zinc-300"
                  }`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      isPreorder ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </label>
              <p className="mt-1 text-[11px] text-muted">
                Storefront shows "Preorder" instead of "Buy Now" — customers can order before stock arrives.
              </p>

              {isPreorder && (
                <input
                  type="text"
                  value={preorderNote}
                  onChange={(e) => setPreorderNote(e.target.value)}
                  placeholder="e.g. Ships in 2-3 weeks"
                  className={`${fieldClass} mt-2`}
                />
              )}
            </div>

            <div>
              <label className={labelClass} htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What makes this product worth buying?"
                className={fieldClass}
              />
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide">Variants</h2>
          <div className="space-y-6">
            <div>
              <span className={labelClass}>Colors *</span>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <TagToggle
                    key={c.name}
                    label={c.name}
                    swatch={c.hex}
                    active={selectedColors.includes(c.name)}
                    onClick={() => toggleColor(c.name)}
                  />
                ))}
              </div>
              <FieldError message={fieldErrors.colors} />
              <AddNewColor
                onAdd={(name, hex) => {
                  addColor(name, hex);
                  setSelectedColors((prev) => [...prev, name]);
                }}
              />
            </div>

            <div>
              <span className={labelClass}>Sizes *</span>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <TagToggle key={s} label={s} active={selectedSizes.includes(s)} onClick={() => toggleSize(s)} />
                ))}
              </div>
              <FieldError message={fieldErrors.sizes} />
              <AddNew
                placeholder="New size name"
                onAdd={(v) => {
                  addSize(v);
                  setSelectedSizes((prev) => [...prev, v]);
                }}
              />
            </div>

            <div>
              <span className={labelClass}>Materials</span>
              <div className="flex flex-wrap gap-2">
                {materials.map((m) => (
                  <TagToggle
                    key={m}
                    label={m}
                    active={selectedMaterials.includes(m)}
                    onClick={() => toggleMaterial(m)}
                  />
                ))}
              </div>
              <AddNew
                placeholder="New material name"
                onAdd={(v) => {
                  addMaterial(v);
                  setSelectedMaterials((prev) => [...prev, v]);
                }}
              />
            </div>
          </div>
        </div>

        {selectedSizes.length > 0 && (
          <div className={cardClass}>
            <h2 className="mb-1 text-sm font-bold uppercase tracking-wide">Size Pricing</h2>
            <p className="mb-4 text-xs text-muted">
              Exact price for each size — replaces the base price entirely (not added on top).
            </p>
            <div className="space-y-2">
              {selectedSizes.map((s) => (
                <SizePriceRow
                  key={s}
                  label={s}
                  value={sizePrices[s]}
                  basePrice={Number(price) || 0}
                  onChange={(v) => setSizePrices((prev) => ({ ...prev, [s]: v }))}
                />
              ))}
            </div>
          </div>
        )}

        {selectedSizes.length > 0 && (
          <div className={cardClass}>
            <h2 className="mb-1 text-sm font-bold uppercase tracking-wide">Size Discounts</h2>
            <p className="mb-4 text-xs text-muted">
              Override the overall discount for a specific size. Leave blank to use the overall discount below.
            </p>
            <div className="space-y-2">
              {selectedSizes.map((s) => (
                <SizeDiscountRow
                  key={s}
                  label={s}
                  value={sizeDiscounts[s]}
                  unit={discountType === "percent" ? "%" : "K"}
                  overallValue={Number(discountValue) || 0}
                  onChange={(v) => setSizeDiscounts((prev) => ({ ...prev, [s]: v }))}
                  onClear={() =>
                    setSizeDiscounts((prev) => {
                      const next = { ...prev };
                      delete next[s];
                      return next;
                    })
                  }
                />
              ))}
            </div>
          </div>
        )}


      </div>

      <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <div className={cardClass}>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide">Preview</h2>
          <div className="relative aspect-square overflow-hidden rounded-md bg-zinc-100">
            <Image src={previewImage} alt="" fill sizes="280px" unoptimized className="object-cover" />
          </div>
          <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
            {category || "Category"}
          </p>
          <p className="mt-1 text-sm text-foreground">{title || "Product title"}</p>
          {Number(discountValue) > 0 ? (
            <div className="mt-1 flex items-center gap-2">
              <span className="text-base font-semibold text-brand">{formatMMK(previewFinalPrice)}</span>
              <span className="text-xs text-muted line-through">{formatMMK(Number(price || 0))}</span>
              <span className="rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
                {discountType === "percent" ? `-${discountValue}%` : `-${formatMMK(Number(discountValue))}`}
              </span>
            </div>
          ) : (
            <p className="mt-1 text-base font-semibold text-foreground">
              {price ? formatMMK(Number(price)) : "K0"}
            </p>
          )}
          {Number(stock) <= 0 ? (
            <p className="mt-2 text-xs font-semibold text-brand">Out of stock</p>
          ) : Number(stock) <= Number(lowStockThreshold || 0) ? (
            <p className="mt-2 text-xs font-semibold text-amber-600">Low stock — {stock} left</p>
          ) : (
            <p className="mt-2 text-xs text-muted">{stock} in stock</p>
          )}
        </div>

        <div className={cardClass}>
          <h2 className="mb-1 text-sm font-bold uppercase tracking-wide">Images</h2>
          <p className="mb-4 text-xs text-muted">Up to 4 photos per section.</p>
          <ImageManager
            images={images}
            onImagesChange={setImages}
            colors={selectedColors}
            colorImages={colorImages}
            onColorImagesChange={(c, urls) => setColorImages((prev) => ({ ...prev, [c]: urls }))}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-brand py-3 text-xs font-semibold uppercase tracking-widest text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
