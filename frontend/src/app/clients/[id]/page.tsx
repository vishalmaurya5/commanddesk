import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CrmService } from "@/lib/services/crm-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, Mail, MapPin, Phone, Globe } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function ClientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const companyId = (session?.user as any)?.companyId;
  if (!companyId) redirect("/login");

  const { id } = await params;
  const client = await CrmService.getClientById(id, companyId);

  if (!client) redirect("/clients");

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/clients"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-slate-900">{client.name}</h1>
                  <Badge variant={client.isActive ? "default" : "secondary"}>
                    {client.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-slate-500">{client.companyName || "Individual Client"}</p>
              </div>
              <div className="ml-auto flex gap-2">
                <Button variant="outline">Edit Client</Button>
                <Button className="bg-teal-600 hover:bg-teal-700">New Project</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {client.email && (
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <a href={`mailto:${client.email}`} className="text-teal-600 hover:underline">{client.email}</a>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <a href={`tel:${client.phone}`} className="text-teal-600 hover:underline">{client.phone}</a>
                      </div>
                    )}
                    {client.website && (
                      <div className="flex items-center gap-3 text-sm">
                        <Globe className="h-4 w-4 text-slate-400" />
                        <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">
                          {client.website}
                        </a>
                      </div>
                    )}
                    {client.companyName && (
                      <div className="flex items-center gap-3 text-sm">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-700">{client.companyName}</span>
                      </div>
                    )}
                    {(client.address || client.city || client.country) && (
                      <div className="flex items-start gap-3 text-sm">
                        <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                        <span className="text-slate-700">
                          {client.address}<br />
                          {client.city}{client.state ? `, ${client.state}` : ''} {client.pincode}<br />
                          {client.country}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {client.notes ? (
                      <p className="text-slate-700 whitespace-pre-wrap text-sm">{client.notes}</p>
                    ) : (
                      <p className="text-slate-500 italic text-sm">No notes provided.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Active Projects</CardTitle>
                    <Button variant="link" className="text-teal-600 h-auto p-0">View All</Button>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6 text-slate-500 text-sm">
                      No active projects for this client.
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
