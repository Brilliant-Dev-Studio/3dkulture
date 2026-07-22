import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity-log";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return Response.json({ error: "Not found" }, { status: 404 });

  const session = await getAdminSession();
  if (session) return Response.json(product);
  const { costPrice: _costPrice, ...publicProduct } = product;
  return Response.json(publicProduct);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid body" }, { status: 400 });

  const product = await prisma.product.update({
    where: { id },
    data: {
      title: body.title,
      category: body.category,
      description: body.description,
      price: body.price !== undefined ? Number(body.price) : undefined,
      costPrice: body.costPrice !== undefined ? Number(body.costPrice) : undefined,
      discountType: body.discountType !== undefined ? (body.discountType === "fixed" ? "fixed" : "percent") : undefined,
      discountValue: body.discountValue !== undefined ? Number(body.discountValue) : undefined,
      isPreorder: body.isPreorder !== undefined ? Boolean(body.isPreorder) : undefined,
      preorderNote: body.preorderNote,
      stock: body.stock !== undefined ? Number(body.stock) : undefined,
      lowStockThreshold: body.lowStockThreshold !== undefined ? Number(body.lowStockThreshold) : undefined,
      images: body.images,
      colors: body.colors,
      sizes: body.sizes,
      materials: body.materials,
      sizePrices: body.sizePrices,
      sizeDiscounts: body.sizeDiscounts,
      materialPrices: body.materialPrices,
      colorImages: body.colorImages,
      materialImages: body.materialImages,
    },
  });

  await logActivity({
    actorEmail: session.email,
    actorRole: session.role,
    action: "product.update",
    targetType: "product",
    targetId: product.id,
    targetLabel: product.title,
  });

  return Response.json(product);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const product = await prisma.product.delete({ where: { id } });

  await logActivity({
    actorEmail: session.email,
    actorRole: session.role,
    action: "product.delete",
    targetType: "product",
    targetId: product.id,
    targetLabel: product.title,
  });

  return Response.json({ ok: true });
}
