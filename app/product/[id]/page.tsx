import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products";
import { formatMMK } from "@/lib/format";
import { ProductGallery } from "@/components/product-gallery";
import { AddToCart } from "@/components/add-to-cart";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted">
        <Link href="/" className="hover:text-brand">
          Home
        </Link>
        <span>/</span>
        <Link href={`/?category=${encodeURIComponent(product.category)}`} className="hover:text-brand">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.title}</span>
      </nav>

      <div className="grid gap-6 sm:grid-cols-2 sm:gap-10">
        <ProductGallery images={product.images} alt={product.title} />

        <div className="sm:sticky sm:top-24 sm:self-start">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
            {product.category}
          </span>
          <h1 className="mt-2 text-3xl font-semibold leading-snug text-foreground">{product.title}</h1>
          <p className="mt-3 text-3xl font-semibold text-foreground">{formatMMK(product.price)}</p>
          <p className="mt-4 text-sm leading-6 tracking-wide text-muted">{product.description}</p>

          <div className="mt-6 border-t border-border pt-6">
            <AddToCart product={product} />
          </div>

          <div className="mt-4 rounded-md border border-border px-4 py-3 text-center text-sm text-muted">
            Need help ordering? Contact our support team.
          </div>
        </div>
      </div>
    </div>
  );
}
