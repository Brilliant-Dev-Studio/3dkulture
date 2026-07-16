import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity-log";

export async function DELETE(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await params;
  const row = await prisma.category.delete({ where: { name: decodeURIComponent(name) } });

  await logActivity({
    actorEmail: session.email,
    actorRole: session.role,
    action: "category.delete",
    targetType: "category",
    targetId: row.id,
    targetLabel: row.name,
  });

  return Response.json({ ok: true });
}
