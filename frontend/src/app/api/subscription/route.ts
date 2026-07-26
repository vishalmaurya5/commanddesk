import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";

const PLAN_LIMITS = {
  FREE: { users: 5, projects: 3, storageGb: 1, websites: 1, apiCalls: 1_000 },
  STARTER: { users: 25, projects: 25, storageGb: 10, websites: 5, apiCalls: 25_000 },
  BUSINESS: { users: 100, projects: 200, storageGb: 100, websites: 25, apiCalls: 250_000 },
  ENTERPRISE: { users: -1, projects: -1, storageGb: 1_000, websites: -1, apiCalls: -1 },
} as const;

export async function GET() {
  try {
    const { companyId } = await authorize(PERMISSIONS.SUBSCRIPTION_VIEW);
    const [subscription, usage] = await Promise.all([
      prisma.subscription.findUnique({ where: { companyId } }),
      prisma.usageRecord.findMany({
        where: { companyId, periodEnd: { gte: new Date() } },
        orderBy: { metric: "asc" },
      }),
    ]);
    const plan = (subscription?.plan.toUpperCase() ?? "FREE") as keyof typeof PLAN_LIMITS;
    return NextResponse.json({
      subscription,
      limits: PLAN_LIMITS[plan] ?? PLAN_LIMITS.FREE,
      usage,
      availablePlans: PLAN_LIMITS,
    });
  } catch (error) {
    return apiError(error, "Unable to load subscription");
  }
}
