import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity-log";

export async function GET() {
  const rows = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return Response.json(rows.map((r) => ({ id: r.id, name: r.name, parentId: r.parentId })));
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const name = body?.name?.trim();
  if (!name) return Response.json({ error: "name is required." }, { status: 400 });

  const parentId = body?.parentId || null;
  if (parentId) {
    const parent = await prisma.category.findUnique({ where: { id: parentId } });
    if (!parent) return Response.json({ error: "Parent category not found." }, { status: 400 });
    if (parent.parentId) return Response.json({ error: "Sub-categories can't have their own sub-categories." }, { status: 400 });
  }

  const row = await prisma.category.create({ data: { name, parentId } }).catch(() => null);
  if (!row) return Response.json({ error: "Already exists." }, { status: 409 });

  await logActivity({
    actorEmail: session.email,
    actorRole: session.role,
    action: parentId ? "category.create_sub" : "category.create_main",
    targetType: "category",
    targetId: row.id,
    targetLabel: row.name,
  });

  return Response.json({ id: row.id, name: row.name, parentId: row.parentId }, { status: 201 });
}
