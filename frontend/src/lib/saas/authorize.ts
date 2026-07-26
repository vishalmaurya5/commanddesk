import "server-only";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  permissionsForRole,
  type Permission,
} from "@/lib/saas/permissions";

export class AuthorizationError extends Error {
  constructor(
    message: string,
    public readonly status: 401 | 403 = 403,
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function getAccessContext() {
  const session = await auth();
  if (!session) throw new AuthorizationError("Authentication required", 401);
  if (!session.user.companyId) throw new AuthorizationError("Select a workspace", 403);

  const membership = await prisma.companyMembership.findUnique({
    where: {
      companyId_userId: {
        companyId: session.user.companyId,
        userId: session.user.id,
      },
    },
    include: { customRole: true },
  });

  const isSuperAdmin = session.user.role === "SUPER_ADMIN";
  if (!membership && !isSuperAdmin) {
    throw new AuthorizationError("Workspace membership required", 403);
  }
  if (membership && membership.status !== "ACTIVE") {
    throw new AuthorizationError("Workspace membership is not active", 403);
  }

  const role = membership?.role ?? session.user.role;
  const permissions = permissionsForRole(
    role,
    membership?.customRole?.permissions ?? [],
  );

  return {
    session,
    userId: session.user.id,
    companyId: session.user.companyId,
    role,
    permissions,
    membership,
  };
}

export async function authorize(permission: Permission) {
  const access = await getAccessContext();
  if (!access.permissions.includes(permission)) {
    throw new AuthorizationError(`Missing permission: ${permission}`, 403);
  }
  return access;
}
