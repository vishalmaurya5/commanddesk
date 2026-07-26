import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { FinanceService } from "@/lib/services/finance-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, FileText, Receipt, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function FinanceDashboardPage() {
  const session = await auth();
  const companyId = (session?.user as any)?.companyId;
  if (!companyId) redirect("/login");
  const invoices = await FinanceService.getInvoices(companyId);
  const expenses = await FinanceService.getExpenses(companyId);

  const totalInvoices = invoices.reduce((acc, curr) => acc + curr.total, 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netRevenue = totalInvoices - totalExpenses;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Finance Overview</h1>
                <p className="text-slate-500">Track invoices, expenses, and payroll</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href="/finance/invoices">View Invoices</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/finance/expenses">View Expenses</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue (Invoices)</CardTitle>
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalInvoices.toLocaleString()}</div>
                  <p className="text-xs text-emerald-500 flex items-center mt-1">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    Generated this period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                  <Receipt className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalExpenses.toLocaleString()}</div>
                  <p className="text-xs text-red-500 flex items-center mt-1">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    Logged this period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                  <FileText className="h-4 w-4 text-slate-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${netRevenue.toLocaleString()}</div>
                  <p className="text-xs text-slate-500 mt-1">
                    Revenue minus expenses
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                  {invoices.length === 0 ? (
                    <div className="text-sm text-slate-500 text-center py-6">No invoices found.</div>
                  ) : (
                    <div className="space-y-4">
                      {invoices.slice(0, 5).map((inv) => (
                        <div key={inv.id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                          <div>
                            <div className="font-medium">{inv.invoiceNumber}</div>
                            <div className="text-xs text-slate-500">{inv.status}</div>
                          </div>
                          <div className="font-medium">${inv.total.toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  {expenses.length === 0 ? (
                    <div className="text-sm text-slate-500 text-center py-6">No expenses found.</div>
                  ) : (
                    <div className="space-y-4">
                      {expenses.slice(0, 5).map((exp) => (
                        <div key={exp.id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                          <div>
                            <div className="font-medium">{exp.description}</div>
                            <div className="text-xs text-slate-500">{exp.category || "General"}</div>
                          </div>
                          <div className="font-medium">${exp.amount.toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
