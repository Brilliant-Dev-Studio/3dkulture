import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSuperAdminSession } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity-log";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSuperAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const password = body?.password;
  if (!password || password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const target = await prisma.adminUser.findUnique({ where: { id } });
  if (!target) return Response.json({ error: "Not found" }, { status: 404 });

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.update({ where: { id }, data: { passwordHash } });

  await logActivity({
    actorEmail: session.email,
    actorRole: session.role,
    action: "admin.reset_password",
    targetType: "admin_user",
    targetId: target.id,
    targetLabel: target.email,
  });

  return Response.json({ ok: true });
}
