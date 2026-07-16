import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSuperAdminSession } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity-log";

export async function GET() {
  const session = await getSuperAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, role: true, createdAt: true },
  });
  return Response.json(users);
}

export async function POST(request: Request) {
  const session = await getSuperAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;
  const role = body?.role === "super_admin" ? "super_admin" : "admin";

  if (!email || !password) {
    return Response.json({ error: "Email and password are required." }, { status: 400 });
  }
  if (password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.adminUser
    .create({ data: { email, passwordHash, role }, select: { id: true, email: true, role: true, createdAt: true } })
    .catch(() => null);
  if (!user) return Response.json({ error: "An account with that email already exists." }, { status: 409 });

  await logActivity({
    actorEmail: session.email,
    actorRole: session.role,
    action: "admin.create",
    targetType: "admin_user",
    targetId: user.id,
    targetLabel: user.email,
    meta: { role },
  });

  return Response.json(user, { status: 201 });
}
