import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySessionToken, type AdminRole } from "./auth";
import { prisma } from "./db";

export async function getAdminSession(): Promise<{ email: string; role: AdminRole } | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload) return null;

  const user = await prisma.adminUser.findUnique({ where: { email: payload.email } });
  if (!user) return null;
  return { email: user.email, role: user.role as AdminRole };
}

export async function getSuperAdminSession() {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") return null;
  return session;
}
