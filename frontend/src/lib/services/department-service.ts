import { prisma } from "@/lib/prisma";

export class DepartmentService {
  static async getAll(companyId: string) {
    return prisma.department.findMany({
      where: { companyId, isActive: true },
      include: {
        head: { select: { id: true, firstName: true, lastName: true } },
        users: { select: { id: true } },
      },
      orderBy: { name: "asc" },
    });
  }

  static async getById(id: string) {
    return prisma.department.findUnique({
      where: { id },
      include: {
        head: { select: { id: true, firstName: true, lastName: true, email: true } },
        users: {
          select: { id: true, firstName: true, lastName: true, role: true },
          where: { isActive: true },
        },
      },
    });
  }

  static async create(data: { name: string; code?: string; description?: string; headId?: string; companyId: string }) {
    return prisma.department.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        headId: data.headId,
        companyId: data.companyId,
      },
      include: { head: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  static async update(id: string, data: any) {
    return prisma.department.update({
      where: { id },
      data,
      include: { head: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  static async delete(id: string) {
    return prisma.department.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
