import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { FinanceService } from "@/lib/services/finance-service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function ExpensesPage() {
  const session = await auth();
  const companyId = (session?.user as any)?.companyId;
  if (!companyId) redirect("/login");

  const expenses = await FinanceService.getExpenses(companyId);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Expenses</h1>
                <p className="text-slate-500">Track and manage company expenditures</p>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Log Expense
              </Button>
            </div>

            <div className="bg-white rounded-md border shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Billable</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-slate-500">
                        No expenses found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenses.map((exp) => (
                      <TableRow key={exp.id}>
                        <TableCell className="font-medium">{exp.description}</TableCell>
                        <TableCell>{exp.category || "General"}</TableCell>
                        <TableCell>{exp.date.toLocaleDateString()}</TableCell>
                        <TableCell>
                          {exp.isBillable ? (
                            <Badge variant="default" className="bg-blue-500">Yes</Badge>
                          ) : (
                            <Badge variant="secondary">No</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium text-red-600">
                          ${exp.amount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
