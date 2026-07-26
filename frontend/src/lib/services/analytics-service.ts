import { prisma } from "../prisma";

export const AnalyticsService = {
  getDashboardMetrics: async (companyId: string) => {
    const totalUsers = await prisma.user.count({ where: { companyId } });
    const totalProjects = await prisma.project.count({ where: { companyId } });
    const totalClients = await prisma.client.count({ where: { companyId } });
    
    // Total revenue and expenses for the month
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    const invoicesThisMonth = await prisma.invoice.findMany({
      where: { 
        companyId,
        createdAt: { gte: startOfMonth }
      }
    });
    
    const expensesThisMonth = await prisma.expense.findMany({
      where: {
        companyId,
        date: { gte: startOfMonth }
      }
    });

    const revenue = invoicesThisMonth.reduce((sum, inv) => sum + inv.total, 0);
    const expenses = expensesThisMonth.reduce((sum, exp) => sum + exp.amount, 0);

    return {
      totalUsers,
      totalProjects,
      totalClients,
      revenue,
      expenses,
      netIncome: revenue - expenses
    };
  }
};
