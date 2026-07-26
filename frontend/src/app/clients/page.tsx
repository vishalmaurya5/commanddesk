import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CrmService } from "@/lib/services/crm-service";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function ClientsPage() {
  const session = await auth();
  const companyId = (session?.user as any)?.companyId;
  if (!companyId) redirect("/login");

  const clients = await CrmService.getClients(companyId);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 flex flex-col p-6 overflow-hidden">
          <div className="max-w-7xl mx-auto w-full space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Clients</h1>
                <p className="text-slate-500">Manage your active customers and organizations.</p>
              </div>
              <Button className="bg-teal-600 hover:bg-teal-700">
                <Plus className="mr-2 h-4 w-4" /> Add Client
              </Button>
            </div>

            <div className="bg-white rounded-lg border shadow-sm flex-1 overflow-hidden flex flex-col">
              <div className="p-4 border-b flex justify-between items-center bg-slate-50/50">
                <div className="relative w-72">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                  <Input placeholder="Search clients..." className="pl-9" />
                </div>
              </div>

              <div className="flex-1 overflow-auto">
                <Table>
                  <TableHeader className="bg-slate-50 sticky top-0">
                    <TableRow>
                      <TableHead>Client Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium text-slate-900">{client.name}</TableCell>
                        <TableCell className="text-slate-500">{client.companyName || "—"}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="text-slate-900">{client.email}</div>
                            <div className="text-slate-500">{client.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={client.isActive ? "default" : "secondary"}>
                            {client.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/clients/${client.id}`}>View Profile</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {clients.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                          No clients found. Start by converting a lead!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
