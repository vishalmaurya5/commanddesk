import { prisma } from "@/lib/prisma";
import { addMonths, format } from "date-fns";

export class InvoiceService {
  static async getAll(companyId: string, status?: string) {
    const where: any = { companyId };
    if (status) where.status = status;
    return prisma.invoice.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, companyName: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(id: string) {
    return prisma.invoice.findUnique({
      where: { id },
      include: { client: true, company: true },
    });
  }

  static async generateInvoiceNumber(companyId: string): Promise<string> {
    const prefix = "INV";
    const count = await prisma.invoice.count({ where: { companyId } });
    const year = format(new Date(), "yyyy");
    return `${prefix}-${year}-${String(count + 1).padStart(4, "0")}`;
  }

  static async create(data: {
    companyId: string;
    clientId?: string;
    amount: number;
    tax?: number;
    dueDate?: Date;
    notes?: string;
  }) {
    const invoiceNumber = await this.generateInvoiceNumber(data.companyId);
    const total = (data.amount || 0) + (data.tax || 0);
    return prisma.invoice.create({
      data: {
        invoiceNumber,
        amount: data.amount,
        tax: data.tax || 0,
        total,
        dueDate: data.dueDate || addMonths(new Date(), 1),
        notes: data.notes,
        companyId: data.companyId,
        clientId: data.clientId,
      },
      include: { client: true },
    });
  }

  static async update(id: string, data: any) {
    return prisma.invoice.update({ where: { id }, data });
  }

  static async markAsPaid(id: string) {
    return prisma.invoice.update({
      where: { id },
      data: { status: "PAID" as any, paidAt: new Date() },
    });
  }

  static async markAsOverdue(id: string) {
    return prisma.invoice.update({
      where: { id },
      data: { status: "OVERDUE" as any },
    });
  }

  static async delete(id: string) {
    return prisma.invoice.update({
      where: { id },
      data: { status: "CANCELLED" as any },
    });
  }

  static async getStats(companyId: string) {
    const [total, paid, overdue, draft, totalRevenue] = await Promise.all([
      prisma.invoice.count({ where: { companyId } }),
      prisma.invoice.count({ where: { companyId, status: "PAID" as any } }),
      prisma.invoice.count({ where: { companyId, status: "OVERDUE" as any } }),
      prisma.invoice.count({ where: { companyId, status: "DRAFT" as any } }),
      prisma.invoice.aggregate({
        where: { companyId, status: "PAID" as any },
        _sum: { total: true },
      }),
    ]);
    return {
      total,
      paid,
      overdue,
      draft,
      totalRevenue: totalRevenue._sum.total || 0,
      collectionRate: total ? Math.round((paid / total) * 100) : 0,
    };
  }
}
