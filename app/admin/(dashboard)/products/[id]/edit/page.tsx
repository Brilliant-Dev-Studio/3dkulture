"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAdminStore } from "@/lib/admin-store";
import { ProductForm } from "@/components/admin-product-form";
import type { Product } from "@/lib/types";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { products, updateProduct } = useAdminStore();
  const product = products.find((p) => p.id === params.id);

  async function handleSubmit(updated: Omit<Product, "id">) {
    if (!product) return;
    await updateProduct(product.id, updated);
    router.push("/admin/products");
  }

  return (
    <div className="px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/products" className="text-sm font-medium text-muted hover:text-brand">
          ← Cancel
        </Link>
        <h1 className="text-xl font-bold">Edit Product</h1>
      </div>

      {!product ? (
        <div className="py-16 text-center">
          <p className="text-muted">Product not found.</p>
          <Link href="/admin/products" className="mt-4 inline-block text-sm font-medium text-brand">
            ← Back to products
          </Link>
        </div>
      ) : (
        <ProductForm initialProduct={product} submitLabel="Save Changes" onSubmit={handleSubmit} />
      )}
    </div>
  );
}
