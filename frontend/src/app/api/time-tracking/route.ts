import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const mockTimeEntries = [
      {
        id: "tt-1",
        project: "SOLUBRIX Core App",
        task: "Sidebar Navigation Integration",
        date: "2026-07-26",
        duration: "3h 45m",
        hours: 3.75,
        status: "Completed",
        billable: true,
      },
      {
        id: "tt-2",
        project: "HRMS Portal",
        task: "Employee Policy Document UI",
        date: "2026-07-26",
        duration: "2h 15m",
        hours: 2.25,
        status: "In Progress",
        billable: true,
      },
      {
        id: "tt-3",
        project: "CRM Pipeline",
        task: "Lead Scoring API Webhook",
        date: "2026-07-25",
        duration: "4h 00m",
        hours: 4.0,
        status: "Completed",
        billable: true,
      },
      {
        id: "tt-4",
        project: "Internal Ops",
        task: "Weekly Team Standup & Sprint Planning",
        date: "2026-07-25",
        duration: "1h 30m",
        hours: 1.5,
        status: "Completed",
        billable: false,
      },
    ];

    const stats = {
      totalHoursThisWeek: 34.5,
      billableHours: 29.0,
      activeTimer: {
        project: "SOLUBRIX Core App",
        task: "Activating Navigation Sections",
        startTime: "14:15",
        elapsedSeconds: 4320,
      },
    };

    return NextResponse.json({ entries: mockTimeEntries, stats });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newEntry = {
      id: `tt-${Date.now()}`,
      project: body.project || "General",
      task: body.task || "Work Session",
      date: new Date().toISOString().split("T")[0],
      duration: body.duration || "1h 00m",
      hours: body.hours || 1,
      status: "Completed",
      billable: body.billable !== false,
    };
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to log time entry" }, { status: 500 });
  }
}
