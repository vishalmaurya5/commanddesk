import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import Link from "next/link";

const quickActionRoutes: Record<string, string> = {
  "New Project": "/projects",
  "Add Employee": "/employees",
  "Create Invoice": "/finance",
  "New Task": "/tasks",
  "Add Lead": "/crm",
  "Run Report": "/analytics",
};

export default function Home() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-heading font-bold text-midnight-navy dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Welcome back! Here&apos;s your business overview.
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RevenueChart />
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-soft dark:border-gray-800 dark:bg-midnight-navy">
            <h3 className="mb-4 font-heading text-lg font-semibold text-midnight-navy dark:text-white">
              Recent Activity
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
                  detail: "Acme Corp - $50k",
                  time: "1 hour ago",
                },
                {
                  action: "Invoice paid",
                  detail: "INV-2024-089",
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
            Quick Actions
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
    </DashboardLayout>
  );
}
