import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize, getAccessContext } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";

const STATUSES = new Set(["PENDING", "PROCESSING", "PAID", "CANCELLED"]);

export async function GET(request: Request) {
  try {
    const { companyId, userId, permissions } = await getAccessContext();
    const canViewAll = permissions.includes(PERMISSIONS.PAYROLL_VIEW);
    if (!canViewAll && !permissions.includes(PERMISSIONS.PAYROLL_SELF)) {
      return NextResponse.json({ error: "Missing payroll permission" }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const month = Number(searchParams.get("month") || new Date().getMonth() + 1);
    const year = Number(searchParams.get("year") || new Date().getFullYear());
    const where = {
      month,
      year,
      user: { companyId },
      ...(!canViewAll ? { userId } : {}),
    };
    const records = await prisma.payroll.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
            department: { select: { name: true } },
            employeeProfile: { select: { designation: true } },
          },
        },
      },
      orderBy: [{ status: "asc" }, { user: { firstName: "asc" } }],
    });
    const total = records.reduce((sum, record) => sum + record.netSalary, 0);
    const paid = records.filter((record) => record.status === "PAID").length;
    return NextResponse.json({
      summary: {
        totalPayrollMonth: total,
        employeesCount: records.length,
        processedPercentage: records.length ? Math.round((paid / records.length) * 100) : 0,
        nextDisbursementDate: records.find((record) => record.paymentDate)?.paymentDate ?? null,
        month,
        year,
      },
      payslips: records.map((record) => ({
        id: record.id,
        employeeName: `${record.user.firstName} ${record.user.lastName}`,
        role: record.user.employeeProfile?.designation ?? record.user.role,
        department: record.user.department?.name ?? "Unassigned",
        baseSalary: record.basicSalary,
        bonus: record.bonus ?? 0,
        deductions: (record.deductions ?? 0) + (record.tax ?? 0) + (record.pf ?? 0) + (record.esi ?? 0),
        netPay: record.netSalary,
        status: record.status,
        paymentDate: record.paymentDate,
      })),
    });
  } catch (error) {
    return apiError(error, "Unable to load payroll");
  }
}

export async function POST(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.PAYROLL_MANAGE);
    const body = (await request.json()) as {
      month?: number;
      year?: number;
      paymentDate?: string;
    };
    const month = Number(body.month);
    const year = Number(body.year);
    if (!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(year)) {
      return NextResponse.json({ error: "Valid month and year are required" }, { status: 400 });
    }
    const employees = await prisma.user.findMany({
      where: { companyId, isActive: true },
      select: {
        id: true,
        employeeProfile: { select: { baseSalary: true } },
      },
    });
    let created = 0;
    for (const employee of employees) {
      const basicSalary = employee.employeeProfile?.baseSalary ?? 0;
      const existing = await prisma.payroll.findFirst({
        where: { userId: employee.id, month, year },
        select: { id: true },
      });
      if (!existing) {
        await prisma.payroll.create({
          data: {
            userId: employee.id,
            month,
            year,
            basicSalary,
            netSalary: basicSalary,
            paymentDate: body.paymentDate ? new Date(body.paymentDate) : null,
            status: "PENDING",
          },
        });
        created += 1;
      }
    }
    return NextResponse.json({ created, totalEligible: employees.length }, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to run payroll batch");
  }
}

export async function PATCH(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.PAYROLL_MANAGE);
    const body = (await request.json()) as { id?: string; status?: string };
    if (!body.id || !body.status || !STATUSES.has(body.status)) {
      return NextResponse.json({ error: "Payroll id and valid status are required" }, { status: 400 });
    }
    const record = await prisma.payroll.findFirst({
      where: { id: body.id, user: { companyId } },
      select: { id: true },
    });
    if (!record) return NextResponse.json({ error: "Payroll record not found" }, { status: 404 });
    const updated = await prisma.payroll.update({
      where: { id: body.id },
      data: {
        status: body.status,
        paymentDate: body.status === "PAID" ? new Date() : undefined,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return apiError(error, "Unable to update payroll");
  }
}
