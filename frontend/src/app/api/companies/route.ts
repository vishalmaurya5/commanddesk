import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";

export async function GET() {
  try {
    const { userId, role } = await authorize(PERMISSIONS.COMPANY_VIEW);
    const companies = await prisma.company.findMany({
      where: role === "SUPER_ADMIN"
        ? { isActive: true }
        : { memberships: { some: { userId, status: "ACTIVE" } } },
      include: {
        subscription: true,
        _count: { select: { memberships: true, projects: true, clients: true } },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ companies });
  } catch (error) {
    return apiError(error, "Unable to load companies");
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await authorize(PERMISSIONS.COMPANY_CREATE);
    const body = (await request.json()) as {
      name?: string;
      slug?: string;
      email?: string;
      industry?: string;
      timezone?: string;
      country?: string;
    };
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 });
    }
    const slug = (body.slug || body.name)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    if (!slug) return NextResponse.json({ error: "Valid slug is required" }, { status: 400 });

    const company = await prisma.company.create({
      data: {
        name: body.name.trim(),
        slug,
        email: body.email?.trim(),
        industry: body.industry?.trim(),
        timezone: body.timezone?.trim() || "Asia/Kolkata",
        country: body.country?.trim() || "India",
        memberships: {
          create: {
            userId,
            role: "ORGANIZATION_OWNER",
            isDefault: false,
          },
        },
        subscription: {
          create: {
            plan: "FREE",
            status: "TRIALING",
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          },
        },
        branding: { create: {} },
      },
      include: { subscription: true, branding: true },
    });
    return NextResponse.json({ company }, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to create company");
  }
}
