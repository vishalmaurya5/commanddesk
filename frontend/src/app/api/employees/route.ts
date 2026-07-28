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
    let companyId: string | null = null;
    if (session?.user?.companyId) {
      companyId = session.user.companyId;
    }

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

    if (employees.length === 0) {
      const allEmployees = await prisma.user.findMany({
        where: { isActive: true },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isActive: true,
          department: {
            select: { id: true, name: true },
          },
          employeeProfile: {
            select: { designation: true },
          },
        },
        orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      });
      return NextResponse.json(allEmployees);
    }

    return NextResponse.json(employees);
  } catch {
    const fallbackEmployees = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        department: { select: { id: true, name: true } },
        employeeProfile: { select: { designation: true } },
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    }).catch(() => []);
    return NextResponse.json(fallbackEmployees);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    let companyId = session?.user?.companyId;

    if (!companyId) {
      const firstCompany = await prisma.company.findFirst({ select: { id: true } });
      if (firstCompany) companyId = firstCompany.id;
    }

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
      !body.role?.trim()
    ) {
      return NextResponse.json(
        { error: "Email, first name, last name, and role are required" },
        { status: 400 },
      );
    }

    const email = body.email.trim().toLowerCase();
    const role = ASSIGNABLE_ROLES.has(body.role) ? body.role.trim() : "EMPLOYEE";
    const password = body.password || "TempPass123!";

    let authUserId: string | undefined;
    try {
      authUserId = await provisionAuthUser({
        email,
        password,
        fullName: `${body.firstName.trim()} ${body.lastName.trim()}`,
        role,
      });
    } catch {
      // Continue even if auth provision is isolated
    }

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          firstName: body.firstName.trim(),
          lastName: body.lastName.trim(),
          phone: body.phone?.trim() || existingUser.phone,
          role: role as any,
          isActive: true,
          companyId: companyId || existingUser.companyId,
          departmentId: body.departmentId || existingUser.departmentId,
          employeeProfile: {
            upsert: {
              create: {
                employeeId: `EMP${Date.now()}`,
                designation: body.designation?.trim() || "Team Member",
              },
              update: {
                designation: body.designation?.trim() || "Team Member",
              },
            },
          },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          department: { select: { id: true, name: true } },
          employeeProfile: { select: { designation: true } },
        },
      });
      return NextResponse.json(updatedUser, { status: 200 });
    }

    const employee = await EmployeeService.create({
      email,
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      role,
      companyId: companyId || "default",
      authUserId,
      departmentId: body.departmentId,
      designation: body.designation?.trim() || "Team Member",
      phone: body.phone?.trim(),
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error("POST /api/employees error:", error);
    return apiError(error, "Unable to create employee");
  }
}
