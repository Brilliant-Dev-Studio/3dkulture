import { prisma } from "@/lib/db";
import { getSuperAdminSession } from "@/lib/require-admin";

export async function GET(request: Request) {
  const session = await getSuperAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const take = Math.min(200, Number(searchParams.get("take")) || 100);

  const rows = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take,
  });

  return Response.json(rows);
}
