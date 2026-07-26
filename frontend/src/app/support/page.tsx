import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { SupportService } from "@/lib/services/support-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function SupportPage() {
  const session = await auth();
  const companyId = (session?.user as any)?.companyId;
  if (!companyId) redirect("/login");

  const tickets = await SupportService.getTickets(companyId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN": return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "IN_PROGRESS": return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      case "RESOLVED": return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100";
      case "CLOSED": return "bg-slate-100 text-slate-800 hover:bg-slate-100";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
      case "URGENT": return "text-red-600 font-semibold";
      case "MEDIUM": return "text-amber-600";
      default: return "text-slate-500";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Support Desk</h1>
                <p className="text-slate-500">Manage internal and client support requests</p>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New Ticket
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Open Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{tickets.filter(t => t.status === "OPEN").length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{tickets.filter(t => t.status === "IN_PROGRESS").length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Resolved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{tickets.filter(t => t.status === "RESOLVED").length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">High Priority</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{tickets.filter(t => t.priority === "HIGH" || t.priority === "URGENT").length}</div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-white rounded-md border shadow-sm mt-6">
              <div className="divide-y">
                {tickets.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">No tickets found.</div>
                ) : (
                  tickets.map(ticket => (
                    <Link 
                      key={ticket.id} 
                      href={`/support/${ticket.id}`}
                      className="block p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">{ticket.title}</span>
                            <Badge variant="secondary" className={getStatusColor(ticket.status)}>
                              {ticket.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500 line-clamp-1 max-w-2xl">
                            {ticket.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-500 pt-2">
                            <span className={getPriorityColor(ticket.priority)}>
                              {ticket.priority} Priority
                            </span>
                            <span>•</span>
                            <span>Created {ticket.createdAt.toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="flex items-center">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {ticket._count.comments}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {ticket.assignedTo ? (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <span>Assigned to</span>
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={ticket.assignedTo.avatarUrl || undefined} />
                                <AvatarFallback>{ticket.assignedTo.firstName[0]}</AvatarFallback>
                              </Avatar>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400 italic">Unassigned</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
