import { prisma } from "@/lib/db";
import { getSuperAdminSession } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity-log";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSuperAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const target = await prisma.adminUser.findUnique({ where: { id } });
  if (!target) return Response.json({ error: "Not found" }, { status: 404 });

  if (target.email === session.email) {
    return Response.json({ error: "You can't remove your own account." }, { status: 400 });
  }
  if (target.role === "super_admin") {
    const superAdminCount = await prisma.adminUser.count({ where: { role: "super_admin" } });
    if (superAdminCount <= 1) {
      return Response.json({ error: "At least one super admin must remain." }, { status: 400 });
    }
  }

  await prisma.adminUser.delete({ where: { id } });

  await logActivity({
    actorEmail: session.email,
    actorRole: session.role,
    action: "admin.delete",
    targetType: "admin_user",
    targetId: target.id,
    targetLabel: target.email,
  });

  return Response.json({ ok: true });
}
