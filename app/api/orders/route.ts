import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/require-admin";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(orders);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.customer?.fullName || !body?.items?.length) {
    return Response.json({ error: "customer and items are required." }, { status: 400 });
  }

  const productIds: string[] = Array.from(new Set(body.items.map((item: { productId: string }) => item.productId)));
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const costPriceById = new Map(products.map((p) => [p.id, p.costPrice]));

  const order = await prisma.order.create({
    data: {
      customerFullName: body.customer.fullName,
      customerPhone: body.customer.phone ?? "",
      customerAddress: body.customer.address ?? "",
      city: body.city ?? "",
      township: body.township ?? "",
      deliveryFee: Number(body.deliveryFee) || 0,
      paymentMethod: body.paymentMethod ?? "",
      notes: body.notes ?? "",
      total: Number(body.total) || 0,
      invoiceDataUrl: body.invoiceDataUrl ?? null,
      invoiceName: body.invoiceName ?? null,
      status: "pending",
      items: {
        create: body.items.map(
          (item: {
            productId: string;
            title: string;
            image: string;
            color: string;
            size: string;
            material: string;
            qty: number;
            price: number;
          }) => ({
            productId: item.productId,
            title: item.title,
            image: item.image,
            color: item.color,
            size: item.size,
            material: item.material ?? "",
            qty: item.qty,
            price: item.price,
            costPrice: costPriceById.get(item.productId) ?? 0,
          }),
        ),
      },
    },
    include: { items: true },
  });

  return Response.json(order, { status: 201 });
}
