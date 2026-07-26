"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  const [filter, setFilter] = useState("ALL");

  const { data, isLoading } = useQuery({
    queryKey: ["support-tickets"],
    queryFn: async () => {
      const res = await apiClient.get("/support");
      return res.data;
    },
  });

  const tickets = data?.tickets || [];

  const filteredTickets = tickets.filter((t: any) =>
    filter === "ALL" ? true : t.status === filter
  );

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
            <button className="flex items-center justify-center gap-2 rounded-xl bg-teal px-4 py-2.5 font-medium text-white shadow-lg transition hover:opacity-90">
              <Plus className="h-4 w-4" /> Create Ticket
            </button>
          </div>
        </section>

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

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      ticket.status === "OPEN"
                        ? "bg-blue-500/10 text-blue-500"
                        : ticket.status === "IN_PROGRESS"
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-emerald-500/10 text-emerald-500"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
