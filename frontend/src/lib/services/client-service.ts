import { prisma } from "@/lib/prisma";

export class ClientService {
  static async getAll(companyId: string) {
    return prisma.client.findMany({
      where: { companyId, isActive: true },
      include: { _count: { select: { leads: true, invoices: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(id: string) {
    return prisma.client.findUnique({
      where: { id },
      include: {
        leads: { orderBy: { createdAt: "desc" }, take: 10 },
        invoices: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });
  }

  static async create(data: any) {
    return prisma.client.create({ data });
  }

  static async update(id: string, data: any) {
    return prisma.client.update({ where: { id }, data });
  }

  static async delete(id: string) {
    return prisma.client.update({ where: { id }, data: { isActive: false } });
  }

  static async getStats(companyId: string) {
    const [total, active, withLeads] = await Promise.all([
      prisma.client.count({ where: { companyId } }),
      prisma.client.count({ where: { companyId, isActive: true } }),
      prisma.client.count({ where: { companyId, leads: { some: {} } } }),
    ]);
    return { total, active, withLeads };
  }
}
