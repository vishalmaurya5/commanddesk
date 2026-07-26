import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";

export async function GET() {
  try {
    const { companyId } = await authorize(PERMISSIONS.FINANCE_VIEW);
    const [invoices, expenses] = await Promise.all([
      prisma.invoice.findMany({ where: { companyId }, include: { client: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
      prisma.expense.findMany({ where: { companyId }, include: { vendor: { select: { name: true } } }, orderBy: { date: "desc" } }),
    ]);
    const totalRevenue = invoices.filter((item) => item.status === "PAID").reduce((sum, item) => sum + item.total, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    return NextResponse.json({
      summary: { totalRevenue, totalExpenses, netIncome: totalRevenue - totalExpenses, growthRate: "Live" },
      invoices: invoices.map((item) => ({ ...item, clientName: item.client?.name ?? "Unassigned", createdDate: item.createdAt })),
      expenses: expenses.map((item) => ({ ...item, vendor: item.vendor?.name ?? "Unassigned" })),
    });
  } catch (error) { return apiError(error, "Unable to load finance data"); }
}

export async function POST(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.FINANCE_MANAGE);
    const body = await request.json();
    if (body.type === "invoice") {
      const amount = Number(body.amount);
      const tax = Number(body.tax || 0);
      if (!body.invoiceNumber?.trim() || !Number.isFinite(amount) || amount < 0) return NextResponse.json({ error: "Invoice number and valid amount are required" }, { status: 400 });
      if (body.clientId) {
        const client = await prisma.client.findFirst({ where: { id: body.clientId, companyId }, select: { id: true } });
        if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
      }
      return NextResponse.json(await prisma.invoice.create({ data: { companyId, invoiceNumber: body.invoiceNumber.trim(), amount, tax, total: amount + tax, clientId: body.clientId || null, dueDate: body.dueDate ? new Date(body.dueDate) : null, notes: body.notes || null } }), { status: 201 });
    }
    if (body.type === "expense") {
      const amount = Number(body.amount);
      if (!body.description?.trim() || !Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: "Description and positive amount are required" }, { status: 400 });
      return NextResponse.json(await prisma.expense.create({ data: { companyId, description: body.description.trim(), amount, category: body.category || null, date: body.date ? new Date(body.date) : new Date(), receiptUrl: body.receiptUrl || null, notes: body.notes || null, isBillable: Boolean(body.isBillable) } }), { status: 201 });
    }
    return NextResponse.json({ error: "Type must be invoice or expense" }, { status: 400 });
  } catch (error) { return apiError(error, "Unable to save finance record"); }
}

export async function PATCH(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.FINANCE_MANAGE);
    const body = await request.json();
    if (body.type === "expense") {
      const owned = await prisma.expense.findFirst({ where: { id: body.id, companyId }, select: { id: true } });
      if (!owned) return NextResponse.json({ error: "Expense not found" }, { status: 404 });
      const amount = body.amount === undefined ? undefined : Number(body.amount);
      if (amount !== undefined && (!Number.isFinite(amount) || amount <= 0)) return NextResponse.json({ error: "Amount must be positive" }, { status: 400 });
      return NextResponse.json(await prisma.expense.update({ where: { id: body.id }, data: { description: body.description?.trim(), category: body.category || null, amount, date: body.date ? new Date(body.date) : undefined, receiptUrl: body.receiptUrl === "" ? null : body.receiptUrl, notes: body.notes === "" ? null : body.notes, isBillable: body.isBillable } }));
    }
    if (body.type !== "invoice" || !body.id || !["DRAFT","SENT","PAID","OVERDUE","CANCELLED","REFUNDED"].includes(body.status)) return NextResponse.json({ error: "Valid invoice id and status are required" }, { status: 400 });
    const owned = await prisma.invoice.findFirst({ where: { id: body.id, companyId }, select: { id: true } });
    if (!owned) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    return NextResponse.json(await prisma.invoice.update({ where: { id: body.id }, data: { status: body.status, paidAt: body.status === "PAID" ? new Date() : undefined } }));
  } catch (error) { return apiError(error, "Unable to update invoice"); }
}

export async function DELETE(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.FINANCE_MANAGE);
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Expense id is required" }, { status: 400 });
    const result = await prisma.expense.deleteMany({ where: { id, companyId } });
    if (!result.count) return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    return NextResponse.json({ message: "Expense deleted" });
  } catch (error) { return apiError(error, "Unable to delete expense"); }
}
