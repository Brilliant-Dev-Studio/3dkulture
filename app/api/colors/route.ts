import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/require-admin";

export async function GET() {
  const rows = await prisma.color.findMany({ orderBy: { name: "asc" } });
  return Response.json(rows.map((r) => ({ name: r.name, hex: r.hex })));
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const name = body?.name?.trim();
  if (!name) return Response.json({ error: "name is required." }, { status: 400 });
  const hex = /^#[0-9a-fA-F]{6}$/.test(body?.hex) ? body.hex : "#000000";

  const row = await prisma.color.create({ data: { name, hex } }).catch(() => null);
  if (!row) return Response.json({ error: "Already exists." }, { status: 409 });
  return Response.json({ name: row.name, hex: row.hex }, { status: 201 });
}
