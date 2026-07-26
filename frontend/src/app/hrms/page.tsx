"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { apiClient } from "@/lib/api-client";
import {
  UserCircle,
  FileText,
  Award,
  Laptop,
  CheckCircle2,
  Users,
  ShieldAlert,
  Plus,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export default function HrmsPage() {
  const [activeTab, setActiveTab] = useState<"policies" | "documents" | "trainings" | "assets">("policies");

  const { data: hrmsData, isLoading } = useQuery({
    queryKey: ["hrms-all"],
    queryFn: async () => {
      const res = await apiClient.get("/hrms");
      return res.data;
    },
  });

  const policies = hrmsData?.policies || [
    { id: "pol-1", name: "Remote Work & Flexible Hours Policy", description: "Guidelines for remote work eligibility, Core hours, and home office stipend.", folder: "POLICY" },
    { id: "pol-2", name: "Annual Leave & Health Benefits Guidelines", description: "Overview of paid time off accrual, sick leaves, and medical coverage benefits.", folder: "POLICY" },
    { id: "pol-3", name: "Code of Conduct & Data Security 2026", description: "Information security standards, data privacy, and workplace ethics protocol.", folder: "POLICY" },
  ];

  const documents = hrmsData?.documents || [
    { id: "doc-1", name: "Employee Onboarding Checklist 2026.pdf", fileType: "pdf", description: "Standard welcome pack and verification list" },
    { id: "doc-2", name: "Standard NDA Agreement Template.docx", fileType: "docx", description: "Legal non-disclosure agreement for new contracts" },
  ];

  const trainings = hrmsData?.trainings || [
    { id: "tr-1", name: "Cybersecurity Essentials & Anti-Phishing 2026", description: "Mandatory annual security awareness training for all employees." },
    { id: "tr-2", name: "Leadership Development & Team Dynamics", description: "Workshop series on effective communication and engineering management." },
  ];

  const assets = hrmsData?.assets || [
    { id: "ast-1", name: 'MacBook Pro 16" M3 Max', type: "Laptop", serialNumber: "C02G1829MD6", user: { firstName: "Alex", lastName: "Rivera" } },
    { id: "ast-2", name: "Dell UltraSharp 27 4K Monitor", type: "Display", serialNumber: "CN-0982-A00", user: { firstName: "Sarah", lastName: "Chen" } },
    { id: "ast-3", name: "Keychron K2 Mechanical Keyboard", type: "Peripheral", serialNumber: "KC-89210", user: { firstName: "Marcus", lastName: "Vance" } },
  ];

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
                <UserCircle className="h-3.5 w-3.5 text-teal-300" />
                Human Resource Management
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                HRMS Portal
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Manage company policies, training programs, employee assets, and HR documentation in one unified hub.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Company Policies</span>
              <BookOpen className="h-4 w-4 text-teal" />
            </div>
            <div className="mt-3 text-3xl font-bold text-foreground">{policies.length}</div>
            <span className="text-xs text-muted-foreground">Active compliance docs</span>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Assigned Assets</span>
              <Laptop className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="mt-3 text-3xl font-bold text-foreground">{assets.length}</div>
            <span className="text-xs text-emerald-500">100% accounted for</span>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Active Trainings</span>
              <Award className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-3 text-3xl font-bold text-foreground">{trainings.length}</div>
            <span className="text-xs text-muted-foreground">Enrolled team members</span>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">HR Documents</span>
              <FileText className="h-4 w-4 text-blue-500" />
            </div>
            <div className="mt-3 text-3xl font-bold text-foreground">{documents.length}</div>
            <span className="text-xs text-muted-foreground">Official repository</span>
          </div>
        </div>

        {/* Tab Navigation & Content */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex border-b border-border space-x-6">
            <button
              onClick={() => setActiveTab("policies")}
              className={`pb-3 text-sm font-semibold transition border-b-2 ${
                activeTab === "policies"
                  ? "border-teal text-teal"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Policies ({policies.length})
            </button>
            <button
              onClick={() => setActiveTab("assets")}
              className={`pb-3 text-sm font-semibold transition border-b-2 ${
                activeTab === "assets"
                  ? "border-teal text-teal"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Asset Allocation ({assets.length})
            </button>
            <button
              onClick={() => setActiveTab("trainings")}
              className={`pb-3 text-sm font-semibold transition border-b-2 ${
                activeTab === "trainings"
                  ? "border-teal text-teal"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Trainings ({trainings.length})
            </button>
            <button
              onClick={() => setActiveTab("documents")}
              className={`pb-3 text-sm font-semibold transition border-b-2 ${
                activeTab === "documents"
                  ? "border-teal text-teal"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Documents ({documents.length})
            </button>
          </div>

          {/* Policies View */}
          {activeTab === "policies" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {policies.map((pol: any) => (
                <div key={pol.id} className="rounded-xl border border-border p-4 hover:border-teal/50 transition bg-card">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal/10 text-teal">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="font-semibold text-foreground text-sm line-clamp-1">{pol.name}</div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                    {pol.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-teal font-medium cursor-pointer hover:underline">
                    <span>Read Full Policy</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Assets View */}
          {activeTab === "assets" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                    <th className="pb-3 font-medium">Asset Name</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium">Serial Number</th>
                    <th className="pb-3 font-medium">Assigned To</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {assets.map((ast: any) => (
                    <tr key={ast.id} className="hover:bg-muted/30">
                      <td className="py-3 font-medium text-foreground">{ast.name}</td>
                      <td className="py-3 text-muted-foreground">{ast.type}</td>
                      <td className="py-3 font-mono text-xs text-muted-foreground">{ast.serialNumber}</td>
                      <td className="py-3 font-medium text-foreground">
                        {ast.user ? `${ast.user.firstName} ${ast.user.lastName}` : "Unassigned"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Trainings View */}
          {activeTab === "trainings" && (
            <div className="space-y-4">
              {trainings.map((tr: any) => (
                <div key={tr.id} className="flex items-center justify-between rounded-xl border border-border p-4 bg-card">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground text-sm">{tr.name}</div>
                      <div className="text-xs text-muted-foreground">{tr.description}</div>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500">
                    Active Module
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Documents View */}
          {activeTab === "documents" && (
            <div className="space-y-4">
              {documents.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between rounded-xl border border-border p-4 bg-card">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground text-sm">{doc.name}</div>
                      <div className="text-xs text-muted-foreground">{doc.description}</div>
                    </div>
                  </div>
                  <button className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
                    Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
