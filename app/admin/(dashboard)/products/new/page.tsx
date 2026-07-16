"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/lib/admin-store";
import { ProductForm } from "@/components/admin-product-form";
import type { Product } from "@/lib/types";

export default function CreateProductPage() {
  const router = useRouter();
  const { addProduct } = useAdminStore();

  async function handleSubmit(product: Omit<Product, "id">) {
    await addProduct(product);
    router.push("/admin/products");
  }

  return (
    <div className="px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/products" className="text-sm font-medium text-muted hover:text-brand">
          ← Cancel
        </Link>
        <h1 className="text-xl font-bold">Create Product</h1>
      </div>
      <ProductForm submitLabel="Create Product" onSubmit={handleSubmit} />
    </div>
  );
}
