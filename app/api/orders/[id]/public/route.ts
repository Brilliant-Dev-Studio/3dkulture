import { prisma } from "@/lib/db";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return Response.json({ error: "Not found" }, { status: 404 });

  const { items, ...rest } = order;
  return Response.json({
    ...rest,
    items: items.map(({ costPrice: _costPrice, ...item }) => item),
  });
}
