import "server-only";

import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { seedWorkspaceDemoData } from "@/lib/saas/seed-workspace-demo-data";

export type AppSession = {
  user: {
    id: string;
    authUserId: string;
    email: string;
    name: string;
    image: string | null;
    role: string;
    companyId: string | null;
    companyName: string | null;
  };
} | null;

/**
 * Supabase-backed session adapter. It preserves the old `await auth()` call
 * shape so existing pages and route handlers stay compatible while identity
 * and sessions are handled by Supabase Auth.
 */
export async function auth(): Promise<AppSession> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user?.email) return null;

  let profile = await prisma.user.findFirst({
    where: {
      OR: [
        { authUserId: data.user.id },
        { email: data.user.email },
      ],
    },
    select: {
      id: true,
      authUserId: true,
      email: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      role: true,
      isActive: true,
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!profile) {
    const rawName =
      (data.user.user_metadata?.full_name as string | undefined) ??
      data.user.email.split("@")[0];
    const [firstName, ...lastNameParts] = rawName.trim().split(/\s+/);
    const slugBase = data.user.email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const companySlug = `${slugBase || "workspace"}-${data.user.id.slice(0, 8)}`;

    profile = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: `${firstName || "My"}'s Workspace`,
          slug: companySlug,
          email: data.user.email,
          subscriptionPlan: "free",
          subscription: {
            create: {
              plan: "FREE",
              status: "TRIALING",
              trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            },
          },
        },
      });

      return tx.user.create({
        data: {
          authUserId: data.user.id,
          email: data.user.email!,
          firstName: firstName || "User",
          lastName: lastNameParts.join(" "),
          role: "ORGANIZATION_OWNER",
          emailVerified: data.user.email_confirmed_at ? new Date(data.user.email_confirmed_at) : null,
          companyId: company.id,
          memberships: {
            create: {
              companyId: company.id,
              role: "ORGANIZATION_OWNER",
              isDefault: true,
            },
          },
        },
        select: {
          id: true,
          authUserId: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          role: true,
          isActive: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });

    if (profile.companyId) {
      await seedWorkspaceDemoData(profile.companyId, profile.id);
    }
  }

  if (!profile.isActive) return null;

  if (!profile.authUserId) {
    await prisma.user.update({
      where: { id: profile.id },
      data: { authUserId: data.user.id, emailVerified: new Date() },
    });
  }

  const cookieStore = await cookies();
  const requestedCompanyId = cookieStore.get("commanddesk_company_id")?.value;

  let memberships: Array<{
    companyId: string;
    role: string;
    company: { id: string; name: string };
  }> = [];

  if (profile.role !== "SUPER_ADMIN") {
    try {
      memberships = await prisma.companyMembership.findMany({
        where: {
          userId: profile.id,
          status: "ACTIVE",
        },
        select: {
          companyId: true,
          role: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });
    } catch (error) {
      if (
        !(
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2021"
        )
      ) {
        throw error;
      }
    }
  }

  const activeMembership =
    memberships.find((item) => item.companyId === requestedCompanyId) ??
    memberships[0];
  const company = activeMembership?.company ?? profile.company;

  return {
    user: {
      id: profile.id,
      authUserId: data.user.id,
      email: profile.email,
      name: `${profile.firstName} ${profile.lastName}`.trim(),
      image: profile.avatarUrl,
      role: activeMembership?.role ?? profile.role,
      companyId: company?.id ?? null,
      companyName: company?.name ?? null,
    },
  };
}
