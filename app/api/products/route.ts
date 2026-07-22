import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity-log";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const categories = searchParams.getAll("category");
  const colors = searchParams.getAll("color");
  const sizes = searchParams.getAll("size");
  const priceMin = searchParams.get("priceMin");
  const priceMax = searchParams.get("priceMax");

  const products = await prisma.product.findMany({
    where: {
      ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
      ...(categories.length ? { category: { in: categories } } : {}),
      ...(colors.length ? { colors: { hasSome: colors } } : {}),
      ...(sizes.length ? { sizes: { hasSome: sizes } } : {}),
      ...(priceMin || priceMax
        ? {
            price: {
              ...(priceMin ? { gte: Number(priceMin) } : {}),
              ...(priceMax ? { lte: Number(priceMax) } : {}),
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  const session = await getAdminSession();
  if (session) return Response.json(products);
  return Response.json(products.map(({ costPrice: _costPrice, ...p }) => p));
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.title || !body?.category || !body?.price) {
    return Response.json({ error: "title, category, and price are required." }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      title: body.title,
      category: body.category,
      description: body.description ?? "",
      price: Number(body.price),
      costPrice: Number(body.costPrice) || 0,
      discountType: body.discountType === "fixed" ? "fixed" : "percent",
      discountValue: Number(body.discountValue) || 0,
      isPreorder: Boolean(body.isPreorder),
      preorderNote: body.preorderNote ?? "",
      stock: Number(body.stock) || 0,
      lowStockThreshold: Number(body.lowStockThreshold) || 5,
      images: body.images ?? [],
      colors: body.colors ?? [],
      sizes: body.sizes ?? [],
      materials: body.materials ?? [],
      sizePrices: body.sizePrices ?? {},
      sizeDiscounts: body.sizeDiscounts ?? {},
      materialPrices: body.materialPrices ?? {},
      colorImages: body.colorImages ?? {},
      materialImages: body.materialImages ?? {},
    },
  });

  await logActivity({
    actorEmail: session.email,
    actorRole: session.role,
    action: "product.create",
    targetType: "product",
    targetId: product.id,
    targetLabel: product.title,
  });

  return Response.json(product, { status: 201 });
}
