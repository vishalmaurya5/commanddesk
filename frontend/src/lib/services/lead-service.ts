import { prisma } from "@/lib/prisma";

export class LeadService {
  static async getAll(companyId: string, status?: string) {
    const where: any = { companyId };
    if (status) where.status = status;
    return prisma.lead.findMany({
      where,
      include: { client: { select: { id: true, name: true, companyName: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(id: string) {
    return prisma.lead.findUnique({
      where: { id },
      include: { client: true },
    });
  }

  static async create(data: any) {
    return prisma.lead.create({ data });
  }

  static async update(id: string, data: any) {
    return prisma.lead.update({ where: { id }, data });
  }

  static async convertToClient(id: string, clientData?: any) {
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new Error("Lead not found");
    const client = await prisma.client.create({
      data: {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        companyId: lead.companyId,
        ...clientData,
      },
    });
    await prisma.lead.update({
      where: { id },
      data: { status: "WON" as any, clientId: client.id, convertedAt: new Date() },
    });
    return client;
  }

  static async delete(id: string) {
    return prisma.lead.delete({ where: { id } });
  }

  static async getStats(companyId: string) {
    const [total, new_, contacted, qualified, won, lost] = await Promise.all([
      prisma.lead.count({ where: { companyId } }),
      prisma.lead.count({ where: { companyId, status: "NEW" as any } }),
      prisma.lead.count({ where: { companyId, status: "CONTACTED" as any } }),
      prisma.lead.count({ where: { companyId, status: "QUALIFIED" as any } }),
      prisma.lead.count({ where: { companyId, status: "WON" as any } }),
      prisma.lead.count({ where: { companyId, status: "LOST" as any } }),
    ]);
    return { total, new: new_, contacted, qualified, won, lost, conversionRate: total ? Math.round((won / total) * 100) : 0 };
  }
}
