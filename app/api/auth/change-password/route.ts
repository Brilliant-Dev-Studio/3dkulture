import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity-log";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const currentPassword = body?.currentPassword;
  const newPassword = body?.newPassword;

  if (!currentPassword || !newPassword) {
    return Response.json({ error: "Current and new password are required." }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return Response.json({ error: "New password must be at least 8 characters." }, { status: 400 });
  }

  const user = await prisma.adminUser.findUnique({ where: { email: session.email } });
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    return Response.json({ error: "Current password is incorrect." }, { status: 401 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.adminUser.update({ where: { id: user.id }, data: { passwordHash } });

  await logActivity({
    actorEmail: session.email,
    actorRole: session.role,
    action: "account.change_password",
    targetType: "admin_user",
    targetId: user.id,
    targetLabel: user.email,
  });

  return Response.json({ ok: true });
}
