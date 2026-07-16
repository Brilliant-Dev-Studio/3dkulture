import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity-log";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(order);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body?.status) return Response.json({ error: "status is required." }, { status: 400 });

  const order = await prisma.order.update({
    where: { id },
    data: { status: body.status },
    include: { items: true },
  });

  await logActivity({
    actorEmail: session.email,
    actorRole: session.role,
    action: "order.status_change",
    targetType: "order",
    targetId: order.id,
    targetLabel: order.customerFullName,
    meta: { status: body.status },
  });

  return Response.json(order);
}
