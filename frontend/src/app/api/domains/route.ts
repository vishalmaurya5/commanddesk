import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";

export async function GET() {
  try {
    const { companyId } = await authorize(PERMISSIONS.COMPANY_VIEW);
    const domains = await prisma.customDomain.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ domains });
  } catch (error) {
    return apiError(error, "Unable to load domains");
  }
}

export async function POST(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.DOMAINS_MANAGE);
    const body = (await request.json()) as { hostname?: string };
    const hostname = body.hostname?.trim().toLowerCase();
    if (!hostname || !/^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(hostname)) {
      return NextResponse.json({ error: "Valid hostname is required" }, { status: 400 });
    }
    const domain = await prisma.customDomain.create({
      data: {
        companyId,
        hostname,
        verification: `commanddesk-verification=${randomBytes(20).toString("hex")}`,
      },
    });
    return NextResponse.json({ domain }, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to add domain");
  }
}
