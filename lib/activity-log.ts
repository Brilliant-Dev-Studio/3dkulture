import { prisma } from "./db";
import type { Prisma } from "./generated/prisma/client";
import type { AdminRole } from "./auth";

export async function logActivity(entry: {
  actorEmail: string;
  actorRole: AdminRole;
  action: string;
  targetType: string;
  targetId?: string;
  targetLabel?: string;
  meta?: Record<string, unknown>;
}) {
  await prisma.activityLog.create({
    data: {
      actorEmail: entry.actorEmail,
      actorRole: entry.actorRole,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId ?? null,
      targetLabel: entry.targetLabel ?? null,
      meta: (entry.meta ?? {}) as Prisma.InputJsonValue,
    },
  });
}
