import { NextResponse } from "next/server";

export async function GET() {
  try {
    const tickets = [
      {
        id: "t-101",
        subject: "SSO Login authentication timeout on mobile client",
        category: "Authentication",
        priority: "HIGH",
        status: "OPEN",
        createdAt: "2026-07-26T08:30:00Z",
        requester: "Sarah Chen",
        assignee: "Alex Rivera",
      },
      {
        id: "t-102",
        subject: "Exporting custom PDF report takes longer than 30s",
        category: "Reporting",
        priority: "MEDIUM",
        status: "IN_PROGRESS",
        createdAt: "2026-07-25T14:15:00Z",
        requester: "Marcus Vance",
        assignee: "DevOps Team",
      },
      {
        id: "t-103",
        subject: "Update employee department permissions for Q3",
        category: "User Access",
        priority: "LOW",
        status: "RESOLVED",
        createdAt: "2026-07-24T11:00:00Z",
        requester: "Elena Rostova",
        assignee: "HR Ops",
      },
      {
        id: "t-104",
        subject: "Stripe webhook notification delay on invoice payment",
        category: "Billing",
        priority: "URGENT",
        status: "OPEN",
        createdAt: "2026-07-26T09:00:00Z",
        requester: "Acme Corp Admin",
        assignee: "Finance Engineering",
      },
    ];

    return NextResponse.json({ tickets });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
