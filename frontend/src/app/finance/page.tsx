"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { apiClient } from "@/lib/api-client";
import {
  DollarSign,
  Receipt,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  TrendingUp,
  CreditCard,
  Building,
} from "lucide-react";
import Link from "next/link";

export default function FinanceDashboardPage() {
  const queryClient = useQueryClient();
  const [formType, setFormType] = useState<"invoice" | "expense" | null>(null);
  const [form, setForm] = useState({ invoiceNumber: "", amount: "", tax: "", dueDate: "", description: "", category: "", date: "" });
  const { data, isLoading } = useQuery({
    queryKey: ["finance-overview"],
    queryFn: async () => {
      const res = await apiClient.get("/finance");
      return res.data;
    },
  });

  const summary = data?.summary || {
    totalRevenue: 248900,
    totalExpenses: 84300,
    netIncome: 164600,
    growthRate: "+18.4%",
  };

  const invoices = data?.invoices || [];
  const expenses = data?.expenses || [];
  const saveRecord = useMutation({
    mutationFn: () => apiClient.post("/finance", { type: formType, ...form, amount: Number(form.amount), tax: Number(form.tax || 0) }),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["finance-overview"] }); setForm({ invoiceNumber: "", amount: "", tax: "", dueDate: "", description: "", category: "", date: "" }); setFormType(null); },
  });
  const updateInvoice = useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => apiClient.patch("/finance", { type: "invoice", id, status }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["finance-overview"] }) });

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
                <DollarSign className="h-3.5 w-3.5 text-teal-300" />
                Financial Management
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Finance Overview
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Track enterprise invoices, manage vendor expenses, monitor cash flow, and review profit margins.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/finance/invoices"
                className="flex items-center justify-center gap-2 rounded-xl bg-teal px-4 py-2.5 font-medium text-white shadow-lg transition hover:opacity-90 text-xs sm:text-sm"
              >
                View Invoices
              </Link>
              <Link
                href="/finance/expenses"
                className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 font-medium text-white transition hover:bg-white/20 text-xs sm:text-sm"
              >
                Log Expenses
              </Link>
            </div>
          </div>
        </section>
        <div className="flex flex-wrap gap-3"><button onClick={() => setFormType("invoice")} className="flex items-center gap-2 rounded-xl bg-primary-indigo px-4 py-2 text-sm font-medium text-white"><Plus className="h-4 w-4" /> New Invoice</button><button onClick={() => setFormType("expense")} className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium"><Plus className="h-4 w-4" /> Log Expense</button></div>
        {formType && <form onSubmit={(event) => { event.preventDefault(); saveRecord.mutate(); }} className="rounded-2xl border bg-card p-5"><h2 className="mb-4 font-semibold">{formType === "invoice" ? "Create invoice" : "Log expense"}</h2><div className="grid gap-4 md:grid-cols-2">{formType === "invoice" ? <><label className="text-sm font-medium">Invoice number<input required value={form.invoiceNumber} onChange={(event) => setForm({ ...form, invoiceNumber: event.target.value })} className="mt-1 h-11 w-full rounded-xl border px-3" /></label><label className="text-sm font-medium">Tax<input type="number" min="0" value={form.tax} onChange={(event) => setForm({ ...form, tax: event.target.value })} className="mt-1 h-11 w-full rounded-xl border px-3" /></label><label className="text-sm font-medium">Due date<input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} className="mt-1 h-11 w-full rounded-xl border px-3" /></label></> : <><label className="text-sm font-medium">Description<input required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-1 h-11 w-full rounded-xl border px-3" /></label><label className="text-sm font-medium">Category<input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="mt-1 h-11 w-full rounded-xl border px-3" /></label><label className="text-sm font-medium">Date<input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="mt-1 h-11 w-full rounded-xl border px-3" /></label></>}<label className="text-sm font-medium">Amount<input required type="number" min="0" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} className="mt-1 h-11 w-full rounded-xl border px-3" /></label></div>{saveRecord.error && <p className="mt-2 text-sm text-red-600">{saveRecord.error.message}</p>}<div className="mt-4 flex justify-end gap-3"><button type="button" onClick={() => setFormType(null)} className="rounded-xl border px-4 py-2">Cancel</button><button disabled={saveRecord.isPending} className="rounded-xl bg-primary-indigo px-5 py-2 font-semibold text-white disabled:opacity-50">{saveRecord.isPending ? "Saving..." : "Save"}</button></div></form>}

        {/* Stats Overview Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Total Revenue (Invoices)</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold text-foreground font-mono">
              ${summary.totalRevenue.toLocaleString()}
            </div>
            <span className="text-xs text-emerald-500 flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3" /> {summary.growthRate} YoY Growth
            </span>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Total Operating Expenses</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
                <Receipt className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold text-foreground font-mono">
              ${summary.totalExpenses.toLocaleString()}
            </div>
            <span className="text-xs text-rose-500 flex items-center gap-1 mt-1">
              <ArrowDownRight className="h-3 w-3" /> Approved operational costs
            </span>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Net Profit Income</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal/10 text-teal">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold text-foreground font-mono">
              ${summary.netIncome.toLocaleString()}
            </div>
            <span className="text-xs text-muted-foreground mt-1 block">
              Revenue minus expenses
            </span>
          </div>
        </div>

        {/* Recent Invoices & Expenses */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Invoices List */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-card-foreground">Recent Invoices</h3>
              <Link href="/finance/invoices" className="text-xs font-medium text-teal hover:underline">
                View All &rarr;
              </Link>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-xs text-muted-foreground">Loading invoices...</div>
            ) : (
              <div className="space-y-3">
                {invoices.map((inv: any) => (
                  <div key={inv.id} className="flex items-center justify-between rounded-xl border border-border p-3.5 hover:bg-muted/30 transition">
                    <div>
                      <div className="font-semibold text-foreground text-sm">{inv.invoiceNumber}</div>
                      <div className="text-xs text-muted-foreground">{inv.clientName}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-foreground text-sm">${inv.total.toLocaleString()}</div>
                      <select
                        value={inv.status}
                        onChange={(event) => updateInvoice.mutate({ id: inv.id, status: event.target.value })}
                        className={`inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                          inv.status === "PAID"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : inv.status === "OVERDUE"
                            ? "bg-rose-500/10 text-rose-500"
                            : "bg-amber-500/10 text-amber-500"
                        }`}
                      ><option value="DRAFT">Draft</option><option value="SENT">Sent</option><option value="PAID">Paid</option><option value="OVERDUE">Overdue</option><option value="CANCELLED">Cancelled</option></select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expenses List */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-card-foreground">Recent Expenses</h3>
              <Link href="/finance/expenses" className="text-xs font-medium text-teal hover:underline">
                View All &rarr;
              </Link>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-xs text-muted-foreground">Loading expenses...</div>
            ) : (
              <div className="space-y-3">
                {expenses.map((exp: any) => (
                  <div key={exp.id} className="flex items-center justify-between rounded-xl border border-border p-3.5 hover:bg-muted/30 transition">
                    <div>
                      <div className="font-semibold text-foreground text-sm">{exp.category}</div>
                      <div className="text-xs text-muted-foreground">{exp.vendor}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-rose-500 text-sm">-${exp.amount.toLocaleString()}</div>
                      <span className="text-[10px] text-muted-foreground">{exp.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
