import { prisma } from "@/lib/prisma";

export class CrmService {
  // ---- LEADS ----

  static async getLeads(companyId: string) {
    return prisma.lead.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getLeadById(id: string, companyId: string) {
    return prisma.lead.findUnique({
      where: { id, companyId },
    });
  }

  static async createLead(companyId: string, data: { name: string; email?: string; phone?: string; source?: string; budget?: number; notes?: string }) {
    return prisma.lead.create({
      data: {
        ...data,
        companyId,
      },
    });
  }

  static async updateLead(id: string, companyId: string, data: any) {
    return prisma.lead.update({
      where: { id, companyId },
      data,
    });
  }

  static async updateLeadStatus(id: string, companyId: string, status: any) {
    return prisma.lead.update({
      where: { id, companyId },
      data: { status },
    });
  }

  static async deleteLead(id: string, companyId: string) {
    return prisma.lead.delete({
      where: { id, companyId },
    });
  }

  // ---- CLIENTS ----

  static async getClients(companyId: string) {
    return prisma.client.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
    });
  }

  static async getClientById(id: string, companyId: string) {
    return prisma.client.findUnique({
      where: { id, companyId },
      include: {
        leads: true,
        invoices: true,
      }
    });
  }

  static async createClient(companyId: string, data: { name: string; email?: string; phone?: string; companyName?: string; website?: string }) {
    return prisma.client.create({
      data: {
        ...data,
        companyId,
      },
    });
  }

  static async updateClient(id: string, companyId: string, data: any) {
    return prisma.client.update({
      where: { id, companyId },
      data,
    });
  }

  static async deleteClient(id: string, companyId: string) {
    return prisma.client.delete({
      where: { id, companyId },
    });
  }
}
