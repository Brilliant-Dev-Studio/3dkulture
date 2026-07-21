import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity-log";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid body" }, { status: 400 });

  const slide = await prisma.heroSlide.update({
    where: { id },
    data: {
      image: body.image,
      badge: body.badge,
      title: body.title,
      subtitle: body.subtitle,
      linkUrl: body.linkUrl,
      order: body.order,
    },
  });

  return Response.json(slide);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const slide = await prisma.heroSlide.delete({ where: { id } });

  await logActivity({
    actorEmail: session.email,
    actorRole: session.role,
    action: "hero_slide.delete",
    targetType: "hero_slide",
    targetId: slide.id,
    targetLabel: slide.title,
  });

  return Response.json({ ok: true });
}
