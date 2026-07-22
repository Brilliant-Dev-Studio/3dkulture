import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/require-admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ name: string }> }) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await params;
  const body = await request.json().catch(() => null);
  if (body?.deliveryFee === undefined) return Response.json({ error: "deliveryFee is required." }, { status: 400 });

  const row = await prisma.township.update({
    where: { name: decodeURIComponent(name) },
    data: { deliveryFee: Number(body.deliveryFee) || 0 },
  });
  return Response.json({ name: row.name, deliveryFee: row.deliveryFee });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await params;
  await prisma.township.delete({ where: { name: decodeURIComponent(name) } });
  return Response.json({ ok: true });
}
