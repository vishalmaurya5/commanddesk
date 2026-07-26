import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { SupportService } from "@/lib/services/support-service";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Clock, User, Tag } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const companyId = (session?.user as any)?.companyId;
  if (!companyId) redirect("/login");

  const { id } = await params;
  const ticket = await SupportService.getTicketById(id, companyId);

  if (!ticket) redirect("/support");

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/support">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">{ticket.title}</h1>
                  <Badge variant="secondary">{ticket.status}</Badge>
                  <Badge variant="outline" className={ticket.priority === "HIGH" ? "border-red-500 text-red-600" : ""}>
                    {ticket.priority}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={ticket.createdBy.avatarUrl || undefined} />
                          <AvatarFallback>{ticket.createdBy.firstName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{ticket.createdBy.firstName} {ticket.createdBy.lastName}</p>
                          <p className="text-xs text-slate-500">{ticket.createdBy.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-slate-500">
                        <Clock className="mr-1 h-3 w-3" />
                        {ticket.createdAt.toLocaleString()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none text-slate-700">
                      {ticket.description.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Conversation</h3>
                  {ticket.comments.map(comment => (
                    <Card key={comment.id} className={comment.isInternal ? "bg-amber-50 border-amber-200" : ""}>
                      <CardHeader className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={comment.author.avatarUrl || undefined} />
                              <AvatarFallback>{comment.author.firstName[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{comment.author.firstName} {comment.author.lastName}</span>
                            {comment.isInternal && (
                              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 text-[10px]">Internal Note</Badge>
                            )}
                          </div>
                          <span className="text-xs text-slate-500">{comment.createdAt.toLocaleString()}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="py-3 pt-0">
                        <p className="text-sm text-slate-700">{comment.content}</p>
                      </CardContent>
                    </Card>
                  ))}

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Avatar>
                          <AvatarImage src={(session?.user as any)?.image || undefined} />
                          <AvatarFallback>ME</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-4">
                          <Input placeholder="Type your reply here..." className="w-full" />
                          <div className="flex justify-between items-center">
                            <label className="flex items-center gap-2 text-sm text-slate-600">
                              <input type="checkbox" className="rounded border-slate-300" />
                              Internal note
                            </label>
                            <Button size="sm">
                              <Send className="mr-2 h-4 w-4" /> Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Ticket Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-2"><User className="h-4 w-4"/> Assignee</span>
                      <span className="font-medium">{ticket.assignedTo ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}` : "Unassigned"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-2"><Tag className="h-4 w-4"/> Category</span>
                      <span className="font-medium">{ticket.category || "General"}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2 pt-0">
                    <Button variant="outline" className="w-full">Assign to me</Button>
                    {ticket.status !== "CLOSED" && (
                      <Button variant="secondary" className="w-full">Close Ticket</Button>
                    )}
                  </CardFooter>
                </Card>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
