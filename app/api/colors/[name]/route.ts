import { prisma } from "@/lib/db";
import { makeAttributeHandlers } from "@/lib/attribute-routes";

const { DELETE_BY_NAME } = makeAttributeHandlers(prisma.color);

export async function DELETE(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  return DELETE_BY_NAME(decodeURIComponent(name));
}
