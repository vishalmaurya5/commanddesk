import { NextResponse } from "next/server";

export async function GET() {
  try {
    const metrics = {
      totalUsers: 42,
      totalProjects: 12,
      totalClients: 28,
      netIncome: 164600,
      monthlyActiveUsers: 38,
      taskCompletionRate: "94.2%",
    };

    const monthlyTrends = [
      { month: "Jan", revenue: 32000, expenses: 14000, projects: 6 },
      { month: "Feb", revenue: 38000, expenses: 15000, projects: 7 },
      { month: "Mar", revenue: 45000, expenses: 18000, projects: 9 },
      { month: "Apr", revenue: 52000, expenses: 20000, projects: 10 },
      { month: "May", revenue: 61000, expenses: 22000, projects: 11 },
      { month: "Jun", revenue: 68000, expenses: 24000, projects: 12 },
    ];

    return NextResponse.json({ metrics, monthlyTrends });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
