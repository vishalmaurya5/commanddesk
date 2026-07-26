import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";

export async function GET() {
  try {
    const { companyId } = await authorize(PERMISSIONS.ANALYTICS_VIEW);
    const now = new Date();
    const starts = Array.from({ length: 6 }, (_, index) => new Date(now.getFullYear(), now.getMonth() - 5 + index, 1));
    const [totalUsers, totalProjects, totalClients, totalTasks, completedTasks] = await Promise.all([
      prisma.user.count({ where: { companyId, isActive: true } }), prisma.project.count({ where: { companyId } }), prisma.client.count({ where: { companyId, isActive: true } }), prisma.task.count({ where: { project: { companyId } } }), prisma.task.count({ where: { project: { companyId }, status: "COMPLETED" } }),
    ]);
    const monthlyTrends = await Promise.all(starts.map(async (start, index) => {
      const end = index === starts.length - 1 ? new Date(now.getFullYear(), now.getMonth() + 1, 1) : starts[index + 1];
      const [invoices, expenses, projects] = await Promise.all([
        prisma.invoice.findMany({ where: { companyId, createdAt: { gte: start, lt: end }, status: "PAID" }, select: { total: true } }),
        prisma.expense.findMany({ where: { companyId, date: { gte: start, lt: end } }, select: { amount: true } }),
        prisma.project.count({ where: { companyId, createdAt: { lt: end } } }),
      ]);
      return { month: start.toLocaleString("en-US", { month: "short" }), revenue: invoices.reduce((sum, item) => sum + item.total, 0), expenses: expenses.reduce((sum, item) => sum + item.amount, 0), projects };
    }));
    const latest = monthlyTrends.at(-1)!;
    return NextResponse.json({ metrics: { totalUsers, totalProjects, totalClients, netIncome: latest.revenue - latest.expenses, monthlyActiveUsers: totalUsers, taskCompletionRate: totalTasks ? `${Math.round(completedTasks / totalTasks * 100)}%` : "0%" }, monthlyTrends });
  } catch (error) { return apiError(error, "Unable to load analytics"); }
}
