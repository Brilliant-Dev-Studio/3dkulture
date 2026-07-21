import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity-log";

export async function GET() {
  const rows = await prisma.heroSlide.findMany({ orderBy: { order: "asc" } });
  return Response.json(rows);
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.image || !body?.title) {
    return Response.json({ error: "image and title are required." }, { status: 400 });
  }

  const last = await prisma.heroSlide.findFirst({ orderBy: { order: "desc" } });
  const slide = await prisma.heroSlide.create({
    data: {
      image: body.image,
      badge: body.badge ?? "",
      title: body.title,
      subtitle: body.subtitle ?? "",
      linkUrl: body.linkUrl ?? "",
      order: (last?.order ?? -1) + 1,
    },
  });

  await logActivity({
    actorEmail: session.email,
    actorRole: session.role,
    action: "hero_slide.create",
    targetType: "hero_slide",
    targetId: slide.id,
    targetLabel: slide.title,
  });

  return Response.json(slide, { status: 201 });
}
