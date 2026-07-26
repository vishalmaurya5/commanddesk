import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const memberships = await prisma.companyMembership.findMany({
    where: { userId: session.user.id, status: "ACTIVE" },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          subscriptionPlan: true,
        },
      },
      customRole: { select: { name: true, permissions: true } },
    },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({
    activeCompanyId: session.user.companyId,
    workspaces: memberships.map((membership) => ({
      ...membership.company,
      role: membership.role,
      customRole: membership.customRole,
    })),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { companyId } = (await request.json()) as { companyId?: string };
  if (!companyId) return NextResponse.json({ error: "companyId is required" }, { status: 400 });

  const membership = await prisma.companyMembership.findUnique({
    where: { companyId_userId: { companyId, userId: session.user.id } },
  });
  if (!membership || membership.status !== "ACTIVE") {
    return NextResponse.json({ error: "Workspace access denied" }, { status: 403 });
  }

  const cookieStore = await cookies();
  cookieStore.set("commanddesk_company_id", companyId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return NextResponse.json({ success: true, companyId });
}
