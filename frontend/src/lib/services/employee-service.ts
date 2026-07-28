import { prisma } from "@/lib/prisma";

export class EmployeeService {
  static async getAll(companyId: string) {
    return prisma.user.findMany({
      where: { companyId, isActive: true },
      include: {
        department: true,
        employeeProfile: true,
        manager: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        department: true,
        employeeProfile: true,
        manager: { select: { id: true, firstName: true, lastName: true } },
        attendance: { take: 30, orderBy: { date: "desc" } },
        leaves: { take: 10, orderBy: { createdAt: "desc" } },
        tasks: { take: 10, orderBy: { createdAt: "desc" } },
      },
    });
  }

  static async create(data: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    companyId: string;
    departmentId?: string;
    designation?: string;
    phone?: string;
    authUserId?: string;
  }) {
    return prisma.user.create({
      data: {
        email: data.email,
        authUserId: data.authUserId,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role as any,
        companyId: data.companyId,
        departmentId: data.departmentId,
        employeeProfile: {
          create: {
            employeeId: `EMP${Date.now()}`,
            designation: data.designation,
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
    });
  }

  static async update(id: string, data: any) {
    const { designation, departmentId, ...userData } = data;
    return prisma.user.update({
      where: { id },
      data: {
        ...userData,
        departmentId: departmentId === "" ? null : departmentId,
        employeeProfile: designation
          ? { update: { designation } }
          : undefined,
      },
      include: { department: true, employeeProfile: true },
    });
  }

  static async delete(id: string) {
    return prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  static async getStats(companyId: string) {
    const [total, byDepartment, recent] = await Promise.all([
      prisma.user.count({ where: { companyId, isActive: true } }),
      prisma.user.groupBy({
        by: ["departmentId"],
        where: { companyId, isActive: true },
        _count: true,
      }),
      prisma.user.findMany({
        where: { companyId, isActive: true },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          department: { select: { name: true } },
        },
      }),
    ]);
    return { total, byDepartment, recent };
  }
}
