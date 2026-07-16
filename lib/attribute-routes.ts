import { prisma } from "./db";
import { getAdminSession } from "./require-admin";

type Delegate = {
  findMany: (args: { orderBy: { name: "asc" } }) => Promise<{ name: string }[]>;
  create: (args: { data: { name: string } }) => Promise<{ name: string }>;
  delete: (args: { where: { name: string } }) => Promise<unknown>;
};

export function makeAttributeHandlers(delegate: Delegate) {
  async function GET() {
    const rows = await delegate.findMany({ orderBy: { name: "asc" } });
    return Response.json(rows.map((r) => r.name));
  }

  async function POST(request: Request) {
    const session = await getAdminSession();
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => null);
    const name = body?.name?.trim();
    if (!name) return Response.json({ error: "name is required." }, { status: 400 });

    const row = await delegate.create({ data: { name } }).catch(() => null);
    if (!row) return Response.json({ error: "Already exists." }, { status: 409 });
    return Response.json(row, { status: 201 });
  }

  async function DELETE_BY_NAME(name: string) {
    const session = await getAdminSession();
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    await delegate.delete({ where: { name } });
    return Response.json({ ok: true });
  }

  return { GET, POST, DELETE_BY_NAME };
}

export { prisma };
