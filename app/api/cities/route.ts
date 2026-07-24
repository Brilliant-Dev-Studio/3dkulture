import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/require-admin";

export async function GET() {
  const rows = await prisma.city.findMany({ orderBy: { name: "asc" }, include: { region: true } });
  return Response.json(
    rows.map((r) => ({ name: r.name, nameMy: r.nameMy, region: r.region?.name ?? null })),
  );
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const name = body?.name?.trim();
  if (!name) return Response.json({ error: "name is required." }, { status: 400 });
  const nameMy = body?.nameMy?.trim() ?? "";
  const regionName = body?.region?.trim();

  let regionId: string | undefined;
  if (regionName) {
    const region = await prisma.region.findUnique({ where: { name: regionName } });
    if (!region) return Response.json({ error: "Region not found." }, { status: 400 });
    regionId = region.id;
  }

  const row = await prisma.city
    .create({ data: { name, nameMy, regionId }, include: { region: true } })
    .catch(() => null);
  if (!row) return Response.json({ error: "Already exists." }, { status: 409 });
  return Response.json(
    { name: row.name, nameMy: row.nameMy, region: row.region?.name ?? null },
    { status: 201 },
  );
}
