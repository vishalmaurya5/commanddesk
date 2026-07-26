import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";

export async function POST(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.AI_USE);
    const body = await request.json();
    const prompt = String(body.prompt || "").trim();
    if (!prompt) return NextResponse.json({ error: "Enter a question" }, { status: 400 });
    if (prompt.length > 2000) return NextResponse.json({ error: "Question is too long" }, { status: 400 });
    const [employees, projects, openTasks, clients, invoices, expenses, pendingLeaves] = await Promise.all([
      prisma.user.count({ where: { companyId, isActive: true } }), prisma.project.count({ where: { companyId } }), prisma.task.count({ where: { project: { companyId }, status: { not: "COMPLETED" } } }), prisma.client.count({ where: { companyId, isActive: true } }), prisma.invoice.findMany({ where: { companyId }, select: { total: true, status: true } }), prisma.expense.aggregate({ where: { companyId }, _sum: { amount: true } }), prisma.leave.count({ where: { user: { companyId }, status: "PENDING" } }),
    ]);
    const paidRevenue = invoices.filter((item) => item.status === "PAID").reduce((sum, item) => sum + item.total, 0);
    const outstanding = invoices.filter((item) => ["SENT","OVERDUE"].includes(item.status)).reduce((sum, item) => sum + item.total, 0);
    const lower = prompt.toLowerCase();
    let text = `Live SOLUBRIX summary:\n\n- Active employees: ${employees}\n- Projects: ${projects}\n- Open tasks: ${openTasks}\n- Active clients: ${clients}`;
    if (/(finance|revenue|invoice|expense|profit)/.test(lower)) text = `Live finance summary:\n\n- Paid revenue: $${paidRevenue.toLocaleString()}\n- Outstanding invoices: $${outstanding.toLocaleString()}\n- Recorded expenses: $${(expenses._sum.amount ?? 0).toLocaleString()}\n- Net recorded cash: $${(paidRevenue - (expenses._sum.amount ?? 0)).toLocaleString()}`;
    else if (/(leave|employee|hr|staff)/.test(lower)) text = `Live HR summary:\n\n- Active employees: ${employees}\n- Pending leave requests: ${pendingLeaves}\n- Open assigned work: ${openTasks}`;
    else if (/(project|task|work)/.test(lower)) text = `Live delivery summary:\n\n- Projects: ${projects}\n- Open tasks: ${openTasks}\n- Active employees: ${employees}`;
    return NextResponse.json({ id: crypto.randomUUID(), sender: "ai", text, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
  } catch (error) { return apiError(error, "Unable to generate assistant response"); }
}
