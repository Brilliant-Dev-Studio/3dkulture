import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/require-admin";

export async function GET() {
  const rows = await prisma.region.findMany({ orderBy: { name: "asc" } });
  return Response.json(rows.map((r) => ({ name: r.name, nameMy: r.nameMy })));
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const name = body?.name?.trim();
  if (!name) return Response.json({ error: "name is required." }, { status: 400 });
  const nameMy = body?.nameMy?.trim() ?? "";

  const row = await prisma.region.create({ data: { name, nameMy } }).catch(() => null);
  if (!row) return Response.json({ error: "Already exists." }, { status: 409 });
  return Response.json({ name: row.name, nameMy: row.nameMy }, { status: 201 });
}
