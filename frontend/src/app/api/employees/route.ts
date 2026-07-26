import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EmployeeService } from "@/lib/services/employee-service";
import {
  AuthorizationError,
  authorize,
} from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import {
  PERMISSIONS,
  roleHasPermission,
} from "@/lib/saas/permissions";
import { provisionAuthUser } from "@/lib/provision-auth-user";

const ASSIGNABLE_ROLES = new Set([
  "EMPLOYEE",
  "TEAM_LEAD",
  "MANAGER",
  "HR",
  "FINANCE",
  "SALES",
  "SUPPORT",
  "ADMIN",
]);

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      throw new AuthorizationError("Authentication required", 401);
    }

    const isGlobalSuperAdmin =
      session.user.role === "SUPER_ADMIN" && !session.user.companyId;

    if (
      isGlobalSuperAdmin &&
      !roleHasPermission(session.user.role, PERMISSIONS.EMPLOYEES_VIEW)
    ) {
      throw new AuthorizationError(
        `Missing permission: ${PERMISSIONS.EMPLOYEES_VIEW}`,
        403,
      );
    }

    const companyId = isGlobalSuperAdmin
      ? null
      : (await authorize(PERMISSIONS.EMPLOYEES_VIEW)).companyId;

    const employees = await prisma.user.findMany({
      where: {
        isActive: true,
        ...(companyId ? { companyId } : {}),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        employeeProfile: {
          select: {
            designation: true,
          },
        },
      },
      orderBy: [
        { firstName: "asc" },
        { lastName: "asc" },
      ],
    });

    return NextResponse.json(employees);
  } catch (error) {
    return apiError(error, "Unable to load employees");
  }
}

export async function POST(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.EMPLOYEES_MANAGE);
    const body = (await request.json()) as {
      email?: string;
      firstName?: string;
      lastName?: string;
      role?: string;
      departmentId?: string;
      designation?: string;
      phone?: string;
      password?: string;
    };

    if (
      !body.email?.trim() ||
      !body.firstName?.trim() ||
      !body.lastName?.trim() ||
      !body.role?.trim() ||
      !body.password
    ) {
      return NextResponse.json(
        { error: "Email, first name, last name, role, and password are required" },
        { status: 400 },
      );
    }
    if (!ASSIGNABLE_ROLES.has(body.role)) {
      return NextResponse.json({ error: "Invalid employee role" }, { status: 400 });
    }
    if (body.password.length < 8) {
      return NextResponse.json(
        { error: "Password must contain at least 8 characters" },
        { status: 400 },
      );
    }

    const email = body.email.trim().toLowerCase();
    const authUserId = await provisionAuthUser({
      email,
      password: body.password,
      fullName: `${body.firstName.trim()} ${body.lastName.trim()}`,
      role: body.role,
    });

    const employee = await EmployeeService.create({
      email,
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      role: body.role.trim(),
      companyId,
      authUserId,
      departmentId: body.departmentId,
      designation: body.designation?.trim(),
      phone: body.phone?.trim(),
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to create employee");
  }
}
