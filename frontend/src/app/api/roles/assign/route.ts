import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS, ROLE_PERMISSIONS } from "@/lib/saas/permissions";

export async function PATCH(request: Request) {
  try {
    const { companyId, userId: actorId } = await authorize(PERMISSIONS.ROLES_MANAGE);
    const body = (await request.json()) as {
      userId?: string;
      role?: string;
      customRoleId?: string | null;
    };
    if (!body.userId || !body.role) {
      return NextResponse.json({ error: "userId and role are required" }, { status: 400 });
    }
    if (!ROLE_PERMISSIONS[body.role] && !body.customRoleId) {
      return NextResponse.json({ error: "Unknown system role or custom role" }, { status: 400 });
    }
    if (body.userId === actorId && body.role !== "ORGANIZATION_OWNER") {
      return NextResponse.json(
        { error: "Owners cannot remove their own owner access" },
        { status: 409 },
      );
    }
    if (body.customRoleId) {
      const customRole = await prisma.customRole.findFirst({
        where: { id: body.customRoleId, companyId },
      });
      if (!customRole) {
        return NextResponse.json({ error: "Custom role not found" }, { status: 404 });
      }
    }

    const membership = await prisma.companyMembership.update({
      where: {
        companyId_userId: { companyId, userId: body.userId },
      },
      data: {
        role: body.role,
        customRoleId: body.customRoleId ?? null,
      },
    });
    return NextResponse.json({ membership });
  } catch (error) {
    return apiError(error, "Unable to assign role");
  }
}
