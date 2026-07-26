import { prisma } from "@/lib/prisma";

export class LeaveService {
  static async getAll(companyId: string, status?: string) {
    const where: any = { user: { companyId } };
    if (status) where.status = status;
    return prisma.leave.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, employeeProfile: { select: { employeeId: true, designation: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getByUser(userId: string) {
    return prisma.leave.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(id: string) {
    return prisma.leave.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, employeeProfile: { select: { employeeId: true, designation: true } } } },
      },
    });
  }

  static async create(data: {
    userId: string;
    startDate: Date;
    endDate: Date;
    type: string;
    reason?: string;
  }) {
    return prisma.leave.create({ data });
  }

  static async approve(id: string, approvedBy: string) {
    return prisma.leave.update({
      where: { id },
      data: { status: "APPROVED" as any, approvedBy, approvedAt: new Date() },
    });
  }

  static async reject(id: string, approvedBy: string) {
    return prisma.leave.update({
      where: { id },
      data: { status: "REJECTED" as any, approvedBy, approvedAt: new Date() },
    });
  }

  static async cancel(id: string) {
    return prisma.leave.update({
      where: { id },
      data: { status: "CANCELLED" as any },
    });
  }

  static async getStats(companyId: string) {
    const [pending, approved, rejected] = await Promise.all([
      prisma.leave.count({ where: { status: "PENDING" as any, user: { companyId } } }),
      prisma.leave.count({ where: { status: "APPROVED" as any, user: { companyId } } }),
      prisma.leave.count({ where: { status: "REJECTED" as any, user: { companyId } } }),
    ]);
    return { pending, approved, rejected, total: pending + approved + rejected };
  }
}
