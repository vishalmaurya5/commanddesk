import { NextResponse } from "next/server";

export async function GET() {
  try {
    const websites = [
      {
        id: "site-1",
        name: "CommandDesk Corporate Portal",
        domain: "app.commanddesk.io",
        status: "OPERATIONAL",
        uptime: "99.98%",
        responseTime: "142ms",
        sslStatus: "VALID",
        lastDeploy: "2 hours ago",
      },
      {
        id: "site-2",
        name: "Customer Docs & Knowledge Base",
        domain: "docs.commanddesk.io",
        status: "OPERATIONAL",
        uptime: "100.0%",
        responseTime: "89ms",
        sslStatus: "VALID",
        lastDeploy: "1 day ago",
      },
      {
        id: "site-3",
        name: "Public Marketing Landing Page",
        domain: "commanddesk.io",
        status: "OPERATIONAL",
        uptime: "99.95%",
        responseTime: "110ms",
        sslStatus: "VALID",
        lastDeploy: "3 days ago",
      },
    ];

    return NextResponse.json({ websites });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
