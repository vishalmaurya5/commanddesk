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

export default async function InvoicesPage() {
  const session = await auth();
  const companyId = (session?.user as any)?.companyId;
  if (!companyId) redirect("/login");

  const invoices = await FinanceService.getInvoices(companyId);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Invoices</h1>
                <p className="text-slate-500">Manage your billing and client invoices</p>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New Invoice
              </Button>
            </div>

            <div className="bg-white rounded-md border shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-slate-500">
                        No invoices found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                        <TableCell>
                          <Badge variant={inv.status === "PAID" ? "default" : "secondary"}>
                            {inv.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{inv.createdAt.toLocaleDateString()}</TableCell>
                        <TableCell>{inv.dueDate ? inv.dueDate.toLocaleDateString() : "-"}</TableCell>
                        <TableCell className="text-right font-medium">
                          ${inv.total.toLocaleString()}
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
