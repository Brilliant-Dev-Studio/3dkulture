import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/require-admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 8, 24);

  const grouped = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { qty: true },
    orderBy: { _sum: { qty: "desc" } },
    take: limit,
  });

  const productIds = grouped.map((g) => g.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const ordered = grouped
    .map((g) => {
      const product = byId.get(g.productId);
      if (!product) return null;
      return { ...product, soldQty: g._sum.qty ?? 0 };
    })
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const session = await getAdminSession();
  if (session) return Response.json(ordered);
  return Response.json(ordered.map(({ costPrice: _costPrice, ...p }) => p));
}
