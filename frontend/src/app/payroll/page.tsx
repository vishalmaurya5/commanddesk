"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { apiClient } from "@/lib/api-client";
import {
  Receipt,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  Download,
  Send,
  Building,
  CreditCard,
} from "lucide-react";

export default function PayrollPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["payroll-summary"],
    queryFn: async () => {
      const res = await apiClient.get("/payroll");
      return res.data;
    },
  });

  const summary = data?.summary || {
    totalPayrollMonth: 148500,
    employeesCount: 42,
    processedPercentage: 88,
    nextDisbursementDate: "2026-08-01",
  };

  const payslips = data?.payslips || [];

  return (
    <DashboardLayout>
      <div className="space-y-7">
        {/* Header Banner */}
        <section className="relative overflow-hidden rounded-[28px] bg-midnight-navy px-6 py-7 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:px-8">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-primary-indigo/50 blur-3xl" />
          <div className="absolute right-32 top-10 h-32 w-32 rounded-full bg-premium-teal/30 blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur">
                <Receipt className="h-3.5 w-3.5 text-teal-300" />
                Financial Compensation
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Payroll Management
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Process monthly employee salaries, generate tax slips, manage bonuses, and track disbursements.
              </p>
            </div>
            <button className="flex items-center justify-center gap-2 rounded-xl bg-teal px-4 py-2.5 font-medium text-white shadow-lg transition hover:opacity-90">
              <Send className="h-4 w-4" /> Run Payroll Batch
            </button>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Total Monthly Payroll</span>
              <DollarSign className="h-4 w-4 text-teal" />
            </div>
            <div className="mt-3 text-3xl font-bold text-foreground">
              ${summary.totalPayrollMonth.toLocaleString()}
            </div>
            <span className="text-xs text-emerald-500">Jul 2026 Disbursement</span>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Eligible Employees</span>
              <Users className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="mt-3 text-3xl font-bold text-foreground">
              {summary.employeesCount}
            </div>
            <span className="text-xs text-muted-foreground">Active contracts</span>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Processing Status</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-3 text-3xl font-bold text-foreground">
              {summary.processedPercentage}%
            </div>
            <span className="text-xs text-emerald-500">37 of 42 paid</span>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Next Cycle Date</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-3 text-2xl font-bold text-foreground">
              {summary.nextDisbursementDate}
            </div>
            <span className="text-xs text-muted-foreground">Automatic schedule</span>
          </div>
        </div>

        {/* Payslips Table */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-card-foreground">
              Employee Payslips & Salary Breakdown
            </h3>
            <button className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
              <Download className="h-3.5 w-3.5" /> Export All Payslips (CSV)
            </button>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Loading payroll records...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                    <th className="pb-3 font-medium">Employee</th>
                    <th className="pb-3 font-medium">Department</th>
                    <th className="pb-3 font-medium">Base Salary</th>
                    <th className="pb-3 font-medium">Bonus</th>
                    <th className="pb-3 font-medium">Deductions</th>
                    <th className="pb-3 font-medium">Net Pay</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payslips.map((ps: any) => (
                    <tr key={ps.id} className="hover:bg-muted/30">
                      <td className="py-3.5">
                        <div className="font-medium text-foreground">{ps.employeeName}</div>
                        <div className="text-xs text-muted-foreground">{ps.role}</div>
                      </td>
                      <td className="py-3.5 text-muted-foreground">{ps.department}</td>
                      <td className="py-3.5 text-foreground font-mono">${ps.baseSalary.toLocaleString()}</td>
                      <td className="py-3.5 text-emerald-500 font-mono">+${ps.bonus.toLocaleString()}</td>
                      <td className="py-3.5 text-rose-500 font-mono">-${ps.deductions.toLocaleString()}</td>
                      <td className="py-3.5 font-bold text-foreground font-mono">${ps.netPay.toLocaleString()}</td>
                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            ps.status === "PAID"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : ps.status === "PROCESSING"
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {ps.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button className="text-xs text-teal font-medium hover:underline">
                          View Slip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
