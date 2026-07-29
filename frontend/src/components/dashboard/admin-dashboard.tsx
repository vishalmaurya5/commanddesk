"use client";

import { StatsCards } from "@/components/dashboard/stats-cards";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import Link from "next/link";
import { Building2, ShieldCheck } from "lucide-react";

const quickActionRoutes: Record<string, string> = {
  "New Project": "/projects",
  "Add Employee": "/employees",
  "Create Invoice": "/finance/invoices",
  "New Task": "/tasks",
  "Add Lead": "/crm",
  "Run Report": "/analytics",
};

interface AdminDashboardProps {
  userName?: string;
  role?: string;
}

export function AdminDashboard({ userName = "Admin", role = "ORGANIZATION_OWNER" }: AdminDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-midnight-navy p-6 text-white shadow-lg">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-teal-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Executive Workspace ({role.replace("_", " ")})
          </div>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-white">
            Welcome back, {userName}!
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Here&apos;s your high-level organization performance overview and business analytics.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-white/5 p-3 rounded-xl border border-white/10">
          <Building2 className="w-4 h-4 text-primary-indigo" />
          <span>Super Admin Management Enabled</span>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenueChart />
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-soft dark:border-gray-800 dark:bg-midnight-navy">
          <h3 className="mb-4 font-heading text-lg font-semibold text-midnight-navy dark:text-white">
            Company Recent Activity
          </h3>
          <div className="space-y-4">
            {[
              {
                action: "New project created",
                detail: "Website Redesign",
                time: "2 min ago",
              },
              {
                action: "Task completed",
                detail: "Homepage wireframe",
                time: "15 min ago",
              },
              {
                action: "Lead added",
                detail: "Acme Corp - ₹50,000",
                time: "1 hour ago",
              },
              {
                action: "Invoice paid",
                detail: "INV-2026-089",
                time: "3 hours ago",
              },
              {
                action: "Meeting scheduled",
                detail: "Sprint Planning",
                time: "5 hours ago",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-gray-50 bg-gray-50/50 p-3 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800"
              >
                <div>
                  <p className="text-sm font-medium text-midnight-navy dark:text-white">
                    {item.action}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.detail}
                  </p>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-soft dark:border-gray-800 dark:bg-midnight-navy">
        <h3 className="mb-4 font-heading text-lg font-semibold text-midnight-navy dark:text-white">
          Admin Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {[
            { label: "New Project", icon: "📋" },
            { label: "Add Employee", icon: "👤" },
            { label: "Create Invoice", icon: "📄" },
            { label: "New Task", icon: "✅" },
            { label: "Add Lead", icon: "🎯" },
            { label: "Run Report", icon: "📊" },
          ].map((action, i) => (
            <Link
              key={i}
              href={quickActionRoutes[action.label]}
              aria-label={`${action.label} — open module`}
              className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-gray-100 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-primary-indigo/20 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-indigo focus-visible:ring-offset-2 active:translate-y-0 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary-indigo/40"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
