import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CrmService } from "@/lib/services/crm-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, UserPlus, DollarSign } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CrmDashboardPage() {
  const session = await auth();
  const companyId = (session?.user as any)?.companyId;
  if (!companyId) redirect("/login");
  const leads = await CrmService.getLeads(companyId);
  const clients = await CrmService.getClients(companyId);

  const newLeads = leads.filter(l => l.status === "NEW").length;
  const wonLeads = leads.filter(l => l.status === "WON").length;
  const totalClients = clients.length;
  
  // Calculate potential pipeline value
  const pipelineValue = leads.reduce((sum, lead) => sum + (lead.budget || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">CRM Dashboard</h1>
                <p className="text-slate-500">Overview of your sales pipeline and clients.</p>
              </div>
              <div className="space-x-3">
                <Link href="/leads">
                  <Button className="bg-teal-600 hover:bg-teal-700">View Pipeline</Button>
                </Link>
                <Link href="/clients">
                  <Button variant="outline">View Clients</Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Total Leads</CardTitle>
                  <Target className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{leads.length}</div>
                  <p className="text-xs text-slate-500 mt-1">{newLeads} new leads</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Total Clients</CardTitle>
                  <Users className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{totalClients}</div>
                  <p className="text-xs text-slate-500 mt-1">Active organizations</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Converted Deals</CardTitle>
                  <UserPlus className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{wonLeads}</div>
                  <p className="text-xs text-slate-500 mt-1">
                    {leads.length > 0 ? Math.round((wonLeads / leads.length) * 100) : 0}% conversion rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Pipeline Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    ${pipelineValue.toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Total budget in pipeline</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leads.slice(0, 5).map(lead => (
                      <div key={lead.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">{lead.name}</p>
                          <p className="text-sm text-slate-500">{lead.email}</p>
                        </div>
                        <div className="text-sm font-medium px-2 py-1 bg-slate-200 text-slate-700 rounded">
                          {lead.status}
                        </div>
                      </div>
                    ))}
                    {leads.length === 0 && (
                      <div className="text-center py-4 text-slate-500">No leads found.</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Clients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {clients.slice(0, 5).map(client => (
                      <div key={client.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">{client.name}</p>
                          <p className="text-sm text-slate-500">{client.companyName || 'N/A'}</p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/clients/${client.id}`}>View</Link>
                        </Button>
                      </div>
                    ))}
                    {clients.length === 0 && (
                      <div className="text-center py-4 text-slate-500">No clients found.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
