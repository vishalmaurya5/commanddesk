import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";

export async function GET() {
  try {
    const access = await authorize(PERMISSIONS.SETTINGS_SELF);
    const { userId, companyId, role } = access;
    const [user, company] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          avatarUrl: true,
          twoFactorEnabled: true,
        },
      }),
      prisma.company.findUnique({
        where: { id: companyId },
        select: {
          name: true,
          gst: true,
          email: true,
          phone: true,
          timezone: true,
          country: true,
        },
      }),
    ]);

    if (!user || !company) {
      return NextResponse.json({ error: "Settings not found" }, { status: 404 });
    }

    const settings = {
      profile: {
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        phone: user.phone ?? "",
        avatarUrl: user.avatarUrl,
        role,
        timezone: company.timezone,
      },
      organization: {
        companyName: company.name,
        taxId: company.gst ?? "",
        email: company.email ?? "",
        phone: company.phone ?? "",
        timezone: company.timezone,
        country: company.country,
      },
      security: {
        twoFactorEnabled: user.twoFactorEnabled,
      },
    };

    return NextResponse.json({
      settings,
      canManageOrganization: access.permissions.includes(
        PERMISSIONS.SETTINGS_MANAGE,
      ),
    });
  } catch (error) {
    return apiError(error, "Unable to load settings");
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      scope?: "profile" | "organization";
      firstName?: string;
      lastName?: string;
      phone?: string;
      companyName?: string;
      taxId?: string;
      email?: string;
      timezone?: string;
      country?: string;
    };

    if (body.scope === "profile") {
      const { userId } = await authorize(PERMISSIONS.SETTINGS_SELF);
      if (!body.firstName?.trim() || !body.lastName?.trim()) {
        return NextResponse.json(
          { error: "First and last name are required" },
          { status: 400 },
        );
      }
      await prisma.user.update({
        where: { id: userId },
        data: {
          firstName: body.firstName.trim(),
          lastName: body.lastName.trim(),
          phone: body.phone?.trim() || null,
        },
      });
      return NextResponse.json({ saved: true });
    }

    if (body.scope === "organization") {
      const { companyId } = await authorize(PERMISSIONS.SETTINGS_MANAGE);
      if (!body.companyName?.trim()) {
        return NextResponse.json(
          { error: "Company name is required" },
          { status: 400 },
        );
      }
      await prisma.company.update({
        where: { id: companyId },
        data: {
          name: body.companyName.trim(),
          gst: body.taxId?.trim() || null,
          email: body.email?.trim() || null,
          phone: body.phone?.trim() || null,
          timezone: body.timezone?.trim() || "Asia/Kolkata",
          country: body.country?.trim() || "India",
        },
      });
      return NextResponse.json({ saved: true });
    }

    return NextResponse.json({ error: "Invalid settings scope" }, { status: 400 });
  } catch (error) {
    return apiError(error, "Unable to save settings");
  }
}
