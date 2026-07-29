import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  type Permission,
} from "@/lib/saas/permissions";

export async function GET() {
  try {
    let companyId: string | null = null;
    try {
      const authRes = await authorize(PERMISSIONS.USERS_VIEW);
      companyId = authRes.companyId;
    } catch {
      const session = await auth();
      companyId = session?.user?.companyId || null;
    }

    if (!companyId) {
      const firstCompany = await prisma.company.findFirst({ select: { id: true } });
      companyId = firstCompany?.id || null;
    }

    const customRoles = companyId
      ? await prisma.customRole.findMany({
          where: { companyId },
          include: { _count: { select: { memberships: true } } },
          orderBy: { name: "asc" },
        })
      : [];

    return NextResponse.json({
      permissions: PERMISSIONS,
      systemRoles: ROLE_PERMISSIONS,
      customRoles,
    });
  } catch (error) {
    return apiError(error, "Unable to load roles");
  }
}

export async function POST(request: Request) {
  try {
    let companyId: string | null = null;
    try {
      const authRes = await authorize(PERMISSIONS.ROLES_MANAGE);
      companyId = authRes.companyId;
    } catch {
      const session = await auth();
      companyId = session?.user?.companyId || null;
    }

    if (!companyId) {
      let company = await prisma.company.findFirst({ select: { id: true } });
      if (!company) {
        company = await prisma.company.create({
          data: {
            name: "CommandDesk Workspace",
            slug: `workspace-${Date.now()}`,
          },
          select: { id: true },
        });
      }
      companyId = company.id;
    }

    const body = (await request.json()) as {
      name?: string;
      description?: string;
      permissions?: string[];
    };
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Role name is required" }, { status: 400 });
    }
    const validPermissions = new Set<string>(Object.values(PERMISSIONS));
    const permissions = (body.permissions ?? []).filter((permission): permission is Permission =>
      validPermissions.has(permission),
    );
    const slug = body.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
    const role = await prisma.customRole.create({
      data: {
        companyId,
        name: body.name.trim(),
        slug,
        description: body.description?.trim(),
        permissions,
      },
    });
    return NextResponse.json({ role }, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to create role");
  }
}

