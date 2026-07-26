import { NextResponse } from "next/server";

export async function GET() {
  try {
    const payrollSummary = {
      totalPayrollMonth: 148500,
      employeesCount: 42,
      processedPercentage: 88,
      nextDisbursementDate: "2026-08-01",
      currency: "USD",
    };

    const payslips = [
      {
        id: "pay-101",
        employeeName: "Alex Rivera",
        role: "Senior Fullstack Engineer",
        department: "Engineering",
        baseSalary: 9500,
        bonus: 1200,
        deductions: 1850,
        netPay: 8850,
        status: "PAID",
        paymentDate: "2026-07-01",
      },
      {
        id: "pay-102",
        employeeName: "Sarah Chen",
        role: "Lead Product Designer",
        department: "Design",
        baseSalary: 8800,
        bonus: 900,
        deductions: 1650,
        netPay: 8050,
        status: "PAID",
        paymentDate: "2026-07-01",
      },
      {
        id: "pay-103",
        employeeName: "Marcus Vance",
        role: "DevOps Specialist",
        department: "Engineering",
        baseSalary: 9100,
        bonus: 500,
        deductions: 1720,
        netPay: 7880,
        status: "PENDING",
        paymentDate: "2026-08-01",
      },
      {
        id: "pay-104",
        employeeName: "Elena Rostova",
        role: "HR Operations Lead",
        department: "HRMS",
        baseSalary: 7800,
        bonus: 600,
        deductions: 1400,
        netPay: 7000,
        status: "PROCESSING",
        paymentDate: "2026-08-01",
      },
    ];

    return NextResponse.json({ summary: payrollSummary, payslips });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
