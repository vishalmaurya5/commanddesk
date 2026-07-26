"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { apiClient } from "@/lib/api-client";
import {
  MessageSquare,
  Plus,
  LifeBuoy,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
} from "lucide-react";

export default function SupportPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "", priority: "MEDIUM" });

  const { data, isLoading } = useQuery({
    queryKey: ["support-tickets"],
    queryFn: async () => {
      const res = await apiClient.get("/support");
      return res.data;
    },
  });

  const tickets = data?.tickets || [];
  const createTicket = useMutation({ mutationFn: () => apiClient.post("/support", form), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["support-tickets"] }); setForm({ title: "", description: "", category: "", priority: "MEDIUM" }); setShowForm(false); } });
  const updateTicket = useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => apiClient.patch("/support", { id, status }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["support-tickets"] }) });

  const filteredTickets = tickets.filter((t: any) => (filter === "ALL" || t.status === filter) && (!search.trim() || `${t.subject} ${t.category} ${t.requester}`.toLowerCase().includes(search.toLowerCase())));

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
                <LifeBuoy className="h-3.5 w-3.5 text-teal-300" />
                Customer & Team Helpdesk
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Support Desk
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Track client inquiries, system incidents, technical requests, and resolution SLAs.
              </p>
            </div>
            <button onClick={() => setShowForm((value) => !value)} className="flex items-center justify-center gap-2 rounded-xl bg-teal px-4 py-2.5 font-medium text-white shadow-lg transition hover:opacity-90">
              <Plus className="h-4 w-4" /> Create Ticket
            </button>
          </div>
        </section>
        {showForm && <form onSubmit={(event) => { event.preventDefault(); createTicket.mutate(); }} className="rounded-2xl border bg-card p-5"><div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-medium">Title<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-1 h-11 w-full rounded-xl border px-3" /></label><label className="text-sm font-medium">Category<input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="mt-1 h-11 w-full rounded-xl border px-3" /></label><label className="text-sm font-medium">Priority<select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })} className="mt-1 h-11 w-full rounded-xl border px-3"><option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>URGENT</option></select></label><label className="text-sm font-medium md:col-span-2">Description<textarea required rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" /></label></div>{createTicket.error && <p className="mt-2 text-sm text-red-600">{createTicket.error.message}</p>}<div className="mt-4 flex justify-end"><button disabled={createTicket.isPending} className="rounded-xl bg-primary-indigo px-5 py-2 font-semibold text-white disabled:opacity-50">{createTicket.isPending ? "Creating..." : "Create Ticket"}</button></div></form>}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <span className="text-xs font-medium text-muted-foreground block">Open Tickets</span>
            <div className="mt-2 text-3xl font-bold text-foreground">
              {tickets.filter((t: any) => t.status === "OPEN").length}
            </div>
            <span className="text-xs text-teal">Active requests</span>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <span className="text-xs font-medium text-muted-foreground block">In Progress</span>
            <div className="mt-2 text-3xl font-bold text-foreground">
              {tickets.filter((t: any) => t.status === "IN_PROGRESS").length}
            </div>
            <span className="text-xs text-amber-500">Being handled</span>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <span className="text-xs font-medium text-muted-foreground block">Resolved Tickets</span>
            <div className="mt-2 text-3xl font-bold text-foreground">
              {tickets.filter((t: any) => t.status === "RESOLVED").length}
            </div>
            <span className="text-xs text-emerald-500">Completed SLA</span>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <span className="text-xs font-medium text-muted-foreground block">High Priority</span>
            <div className="mt-2 text-3xl font-bold text-rose-500">
              {tickets.filter((t: any) => t.priority === "HIGH" || t.priority === "URGENT").length}
            </div>
            <span className="text-xs text-rose-500">Needs attention</span>
          </div>
        </div>

        {/* Tickets Filter & Table */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilter(st)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    filter === st
                      ? "bg-teal text-white"
                      : "border border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
            <div className="relative w-64"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tickets..." className="w-full rounded-xl border py-2 pl-9 pr-3 text-xs" /></div>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Loading support tickets...
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTickets.map((ticket: any) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between rounded-xl border border-border p-4 hover:border-teal/50 transition bg-card"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-sm">{ticket.subject}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          ticket.priority === "URGENT" || ticket.priority === "HIGH"
                            ? "bg-rose-500/10 text-rose-500"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {ticket.priority}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Requested by {ticket.requester} &bull; Category: {ticket.category} &bull; Assigned to {ticket.assignee}
                    </div>
                  </div>

                  <select
                    value={ticket.status}
                    onChange={(event) => updateTicket.mutate({ id: ticket.id, status: event.target.value })}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      ticket.status === "OPEN"
                        ? "bg-blue-500/10 text-blue-500"
                        : ticket.status === "IN_PROGRESS"
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-emerald-500/10 text-emerald-500"
                    }`}
                  ><option value="OPEN">Open</option><option value="IN_PROGRESS">In progress</option><option value="RESOLVED">Resolved</option><option value="CLOSED">Closed</option></select>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
