import { prisma } from "@/lib/prisma";

export class ProjectService {
  static async getAll(companyId: string) {
    return prisma.project.findMany({
      where: { companyId },
      include: {
        lead: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        lead: { select: { id: true, firstName: true, lastName: true, email: true } },
        tasks: {
          include: { assignee: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { createdAt: "desc" },
        },
        milestones: true,
      },
    });
  }

  static async create(data: {
    name: string; description?: string; companyId: string;
    leadId: string; startDate?: Date; endDate?: Date; budget?: number;
    priority?: string; color?: string; isBillable?: boolean;
  }) {
    return prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        companyId: data.companyId,
        leadId: data.leadId,
        startDate: data.startDate,
        endDate: data.endDate,
        budget: data.budget,
        priority: data.priority as any || "MEDIUM",
        color: data.color,
        isBillable: data.isBillable ?? true,
      },
      include: { lead: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  static async update(id: string, data: any) {
    return prisma.project.update({ where: { id }, data });
  }

  static async delete(id: string) {
    return prisma.project.delete({ where: { id } });
  }

  static async getStats(companyId: string) {
    const [total, active, completed, byPriority] = await Promise.all([
      prisma.project.count({ where: { companyId } }),
      prisma.project.count({ where: { companyId, status: "ACTIVE" } }),
      prisma.project.count({ where: { companyId, status: "COMPLETED" } }),
      prisma.project.groupBy({
        by: ["priority"],
        where: { companyId },
        _count: true,
      }),
    ]);
    return { total, active, completed, byPriority };
  }
}
