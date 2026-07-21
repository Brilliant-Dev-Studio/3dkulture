import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductView } from "@/components/product-view";
import { T } from "@/components/t";
import { Container } from "@/components/container";
import type { Product } from "@/lib/types";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await prisma.product.findUnique({ where: { id } });
  if (!row) notFound();
  const { costPrice: _costPrice, ...publicRow } = row;
  const product = publicRow as unknown as Product;

  return (
    <Container className="py-8">
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted">
        <Link href="/" className="hover:text-brand">
          <T k="nav.home" />
        </Link>
        <span>/</span>
        <Link href={`/?category=${encodeURIComponent(product.category)}`} className="hover:text-brand">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.title}</span>
      </nav>

      <ProductView product={product} />
    </Container>
  );
}
