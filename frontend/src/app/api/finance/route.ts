import { NextResponse } from "next/server";

export async function GET() {
  try {
    const summary = {
      totalRevenue: 248900,
      totalExpenses: 84300,
      netIncome: 164600,
      growthRate: "+18.4%",
    };

    const invoices = [
      {
        id: "inv-2026-001",
        invoiceNumber: "INV-2026-001",
        clientName: "Acme Enterprise Solutions",
        status: "PAID",
        createdDate: "2026-07-01",
        dueDate: "2026-07-15",
        total: 45000,
      },
      {
        id: "inv-2026-002",
        invoiceNumber: "INV-2026-002",
        clientName: "Starlight Digital Labs",
        status: "SENT",
        createdDate: "2026-07-10",
        dueDate: "2026-07-24",
        total: 28500,
      },
      {
        id: "inv-2026-003",
        invoiceNumber: "INV-2026-003",
        clientName: "Apex Cloud Innovations",
        status: "OVERDUE",
        createdDate: "2026-06-15",
        dueDate: "2026-06-30",
        total: 19200,
      },
      {
        id: "inv-2026-004",
        invoiceNumber: "INV-2026-004",
        clientName: "Nexus Global Tech",
        status: "PAID",
        createdDate: "2026-07-18",
        dueDate: "2026-08-01",
        total: 34000,
      },
    ];

    const expenses = [
      {
        id: "exp-101",
        category: "Cloud Infrastructure (AWS/GCP)",
        vendor: "Amazon Web Services",
        date: "2026-07-20",
        amount: 14200,
        status: "APPROVED",
      },
      {
        id: "exp-102",
        category: "Software Subscriptions",
        vendor: "GitHub / Figma / Slack",
        date: "2026-07-15",
        amount: 3800,
        status: "APPROVED",
      },
      {
        id: "exp-103",
        category: "Office Supplies & Hardware",
        vendor: "Apple Store Direct",
        date: "2026-07-05",
        amount: 8900,
        status: "PENDING",
      },
    ];

    return NextResponse.json({ summary, invoices, expenses });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
