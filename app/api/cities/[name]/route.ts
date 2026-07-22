import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/require-admin";

export async function DELETE(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await params;
  await prisma.city.delete({ where: { name: decodeURIComponent(name) } });
  return Response.json({ ok: true });
}
