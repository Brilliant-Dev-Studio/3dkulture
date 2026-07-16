import { prisma } from "@/lib/db";
import { makeAttributeHandlers } from "@/lib/attribute-routes";

export const { GET, POST } = makeAttributeHandlers(prisma.size);
