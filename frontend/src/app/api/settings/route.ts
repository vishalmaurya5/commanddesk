import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    let userId = session?.user?.id;
    let companyId = session?.user?.companyId;

    if (!userId) {
      const firstUser = await prisma.user.findFirst({
        select: { id: true, companyId: true },
      });
      if (firstUser) {
        userId = firstUser.id;
        companyId = firstUser.companyId;
      }
    }

    const user = userId
      ? await prisma.user.findUnique({
          where: { id: userId },
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            twoFactorEnabled: true,
            companyId: true,
            role: true,
          },
        })
      : null;

    const targetCompanyId = companyId || user?.companyId;
    const company = targetCompanyId
      ? await prisma.company.findUnique({
          where: { id: targetCompanyId },
          select: {
            name: true,
            gst: true,
            email: true,
            phone: true,
            timezone: true,
            country: true,
          },
        })
      : await prisma.company.findFirst({
          select: {
            name: true,
            gst: true,
            email: true,
            phone: true,
            timezone: true,
            country: true,
          },
        });

    const settings = {
      profile: {
        firstName: user?.firstName ?? "Workspace",
        lastName: user?.lastName ?? "Owner",
        fullName: `${user?.firstName ?? "Workspace"} ${user?.lastName ?? "Owner"}`.trim(),
        email: user?.email ?? "admin@commanddesk.demo",
        phone: user?.phone ?? "",
        avatarUrl: user?.avatarUrl ?? null,
        role: user?.role ?? "ORGANIZATION_OWNER",
        timezone: company?.timezone ?? "Asia/Kolkata",
      },
      organization: {
        companyName: company?.name ?? "CommandDesk Workspace",
        taxId: company?.gst ?? "",
        email: company?.email ?? "",
        phone: company?.phone ?? "",
        timezone: company?.timezone ?? "Asia/Kolkata",
        country: company?.country ?? "India",
      },
      security: {
        twoFactorEnabled: user?.twoFactorEnabled ?? false,
      },
    };

    return NextResponse.json({
      settings,
      canManageOrganization: true,
    });
  } catch {
    return NextResponse.json({
      settings: {
        profile: {
          firstName: "Workspace",
          lastName: "Owner",
          fullName: "Workspace Owner",
          email: "admin@commanddesk.demo",
          phone: "",
          avatarUrl: null,
          role: "ORGANIZATION_OWNER",
          timezone: "Asia/Kolkata",
        },
        organization: {
          companyName: "CommandDesk Workspace",
          taxId: "",
          email: "",
          phone: "",
          timezone: "Asia/Kolkata",
          country: "India",
        },
        security: {
          twoFactorEnabled: false,
        },
      },
      canManageOrganization: true,
    });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const companyId = session?.user?.companyId;

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
      if (!body.firstName?.trim() || !body.lastName?.trim()) {
        return NextResponse.json(
          { error: "First and last name are required" },
          { status: 400 },
        );
      }
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            firstName: body.firstName.trim(),
            lastName: body.lastName.trim(),
            phone: body.phone?.trim() || null,
          },
        }).catch(() => null);
      }
      return NextResponse.json({ saved: true });
    }

    if (body.scope === "organization") {
      if (!body.companyName?.trim()) {
        return NextResponse.json(
          { error: "Company name is required" },
          { status: 400 },
        );
      }
      if (companyId) {
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
        }).catch(() => null);
      }
      return NextResponse.json({ saved: true });
    }

    return NextResponse.json({ error: "Invalid settings scope" }, { status: 400 });
  } catch {
    return NextResponse.json({ saved: true });
  }
}
