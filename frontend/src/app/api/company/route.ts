import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";

export async function GET() {
  try {
    const { companyId } = await authorize(PERMISSIONS.COMPANY_VIEW);
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        branding: true,
        subscription: true,
        customDomains: { orderBy: { createdAt: "desc" } },
        _count: {
          select: {
            memberships: true,
            departments: true,
            projects: true,
            clients: true,
          },
        },
      },
    });
    return NextResponse.json({ company });
  } catch (error) {
    return apiError(error, "Unable to load company");
  }
}

export async function PATCH(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.COMPANY_MANAGE);
    const body = (await request.json()) as Record<string, unknown>;
    const allowed = [
      "name",
      "logoUrl",
      "website",
      "industry",
      "gst",
      "address",
      "email",
      "phone",
      "timezone",
      "country",
      "brandColor",
    ] as const;
    const data = Object.fromEntries(
      allowed
        .filter((key) => typeof body[key] === "string")
        .map((key) => [key, (body[key] as string).trim() || null]),
    );
    const company = await prisma.company.update({
      where: { id: companyId },
      data,
    });
    return NextResponse.json({ company });
  } catch (error) {
    return apiError(error, "Unable to update company");
  }
}
