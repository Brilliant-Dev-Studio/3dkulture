import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/require-admin";

export async function GET() {
  const rows = await prisma.city.findMany({ orderBy: { name: "asc" } });
  return Response.json(rows.map((r) => r.name));
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const name = body?.name?.trim();
  if (!name) return Response.json({ error: "name is required." }, { status: 400 });

  const row = await prisma.city.create({ data: { name } }).catch(() => null);
  if (!row) return Response.json({ error: "Already exists." }, { status: 409 });
  return Response.json(row.name, { status: 201 });
}
