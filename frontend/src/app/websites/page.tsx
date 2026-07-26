"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { apiClient } from "@/lib/api-client";
import {
  Globe,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Plus,
  RefreshCw,
  Server,
  Zap,
} from "lucide-react";

export default function WebsitesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", domain: "" });
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["websites-list"],
    queryFn: async () => {
      const res = await apiClient.get("/websites");
      return res.data;
    },
  });

  const websites = data?.websites || [];
  const addWebsite = useMutation({ mutationFn: () => apiClient.post("/websites", form), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["websites-list"] }); setForm({ name: "", domain: "" }); setShowForm(false); } });
  const removeWebsite = useMutation({ mutationFn: (id: string) => apiClient.delete(`/websites?id=${id}`), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["websites-list"] }) });

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
                <Globe className="h-3.5 w-3.5 text-teal-300" />
                Web Infrastructure & Domains
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Websites & Deployments
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Monitor live app performance, domain SSL health, uptime metrics, and custom landing page deployments.
              </p>
            </div>
            <button onClick={() => setShowForm((value) => !value)} className="flex items-center justify-center gap-2 rounded-xl bg-teal px-4 py-2.5 font-medium text-white shadow-lg transition hover:opacity-90">
              <Plus className="h-4 w-4" /> Add Domain / Property
            </button>
          </div>
        </section>
        {showForm && <form onSubmit={(event) => { event.preventDefault(); addWebsite.mutate(); }} className="rounded-2xl border bg-card p-5"><div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-medium">Property name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 h-11 w-full rounded-xl border px-3" /></label><label className="text-sm font-medium">Domain<input required placeholder="example.com" value={form.domain} onChange={(event) => setForm({ ...form, domain: event.target.value })} className="mt-1 h-11 w-full rounded-xl border px-3" /></label></div>{addWebsite.error && <p className="mt-2 text-sm text-red-600">{addWebsite.error.message}</p>}<div className="mt-4 flex justify-end"><button disabled={addWebsite.isPending} className="rounded-xl bg-primary-indigo px-5 py-2 font-semibold text-white disabled:opacity-50">{addWebsite.isPending ? "Adding..." : "Add Property"}</button></div></form>}
        <div className="flex justify-end"><button onClick={() => refetch()} className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"><RefreshCw className="h-4 w-4" /> Refresh</button></div>

        {/* Websites Status Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              Checking website health...
            </div>
          ) : (
            websites.map((site: any) => (
              <div
                key={site.id}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:border-teal/50 transition space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10 text-teal">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{site.name}</h3>
                      <a
                        href={`https://${site.domain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-teal hover:underline"
                      >
                        {site.domain} <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-y border-border py-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Uptime</span>
                    <span className="font-semibold text-emerald-500">{site.uptime}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Response Speed</span>
                    <span className="font-semibold text-foreground">{site.responseTime}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">SSL Cert</span>
                    <span className="inline-flex items-center gap-1 text-emerald-500 font-medium">
                      <ShieldCheck className="h-3 w-3" /> {site.sslStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Last Deploy</span>
                    <span className="text-muted-foreground">{site.lastDeploy}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-500">
                    <CheckCircle2 className="h-3 w-3" /> Operational
                  </span>
                  <button onClick={() => window.confirm("Remove this property?") && removeWebsite.mutate(site.id)} className="text-xs font-medium text-muted-foreground hover:text-red-600">
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
