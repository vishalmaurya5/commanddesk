import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AnalyticsService } from "@/lib/services/analytics-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsCharts } from "./analytics-charts";
import { Users, Briefcase, Target, DollarSign, Activity, FileText } from "lucide-react";

export default async function AnalyticsPage() {
  const session = await auth();
  const companyId = (session?.user as any)?.companyId;
  if (!companyId) redirect("/login");

  const metrics = await AnalyticsService.getDashboardMetrics(companyId);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analytics & Reporting</h1>
                <p className="text-slate-500">Business intelligence and performance metrics</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                  <Users className="h-4 w-4 text-slate-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalUsers}</div>
                  <p className="text-xs text-slate-500 mt-1">Across all departments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                  <Briefcase className="h-4 w-4 text-slate-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalProjects}</div>
                  <p className="text-xs text-slate-500 mt-1">Currently in progress</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                  <Target className="h-4 w-4 text-slate-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalClients}</div>
                  <p className="text-xs text-slate-500 mt-1">Active customer accounts</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Revenue (MTD)</CardTitle>
                  <DollarSign className="h-4 w-4 text-slate-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${metrics.netIncome.toLocaleString()}</div>
                  <p className="text-xs text-slate-500 mt-1">Month to date</p>
                </CardContent>
              </Card>
            </div>

            <AnalyticsCharts />
          </div>
        </main>
      </div>
    </div>
  );
}
