import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/require-admin";

export async function GET() {
  const rows = await prisma.township.findMany({ orderBy: { name: "asc" }, include: { city: true } });
  return Response.json(
    rows.map((r) => ({ name: r.name, deliveryFee: r.deliveryFee, city: r.city?.name ?? null })),
  );
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const name = body?.name?.trim();
  if (!name) return Response.json({ error: "name is required." }, { status: 400 });
  const deliveryFee = Number(body?.deliveryFee) || 0;
  const cityName = body?.city?.trim();

  let cityId: string | undefined;
  if (cityName) {
    const city = await prisma.city.findUnique({ where: { name: cityName } });
    if (!city) return Response.json({ error: "City not found." }, { status: 400 });
    cityId = city.id;
  }

  const row = await prisma.township
    .create({ data: { name, deliveryFee, cityId }, include: { city: true } })
    .catch(() => null);
  if (!row) return Response.json({ error: "Already exists." }, { status: 409 });
  return Response.json(
    { name: row.name, deliveryFee: row.deliveryFee, city: row.city?.name ?? null },
    { status: 201 },
  );
}
