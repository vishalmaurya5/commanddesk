import { prisma } from "../prisma";

export const FinanceService = {
  getInvoices: async (companyId: string) => {
    return prisma.invoice.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });
  },
  
  getExpenses: async (companyId: string) => {
    return prisma.expense.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });
  },

  getPayroll: async (companyId: string) => {
    return prisma.payroll.findMany({
      where: { user: { companyId } },
      orderBy: { createdAt: "desc" },
    });
  },
};
