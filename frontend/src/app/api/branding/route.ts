import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";

export async function GET() {
  try {
    const { companyId } = await authorize(PERMISSIONS.COMPANY_VIEW);
    const branding = await prisma.brandingSettings.findUnique({ where: { companyId } });
    return NextResponse.json({ branding });
  } catch (error) {
    return apiError(error, "Unable to load branding");
  }
}

export async function PUT(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.BRANDING_MANAGE);
    const body = (await request.json()) as {
      productName?: string;
      logoUrl?: string;
      iconUrl?: string;
      primaryColor?: string;
      secondaryColor?: string;
      customCss?: string;
      supportEmail?: string;
      hideCommandDesk?: boolean;
    };
    const branding = await prisma.brandingSettings.upsert({
      where: { companyId },
      create: { companyId, ...body },
      update: body,
    });
    return NextResponse.json({ branding });
  } catch (error) {
    return apiError(error, "Unable to update branding");
  }
}
