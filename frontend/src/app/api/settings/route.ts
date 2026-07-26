import { NextResponse } from "next/server";

export async function GET() {
  try {
    const settings = {
      profile: {
        fullName: "Alex Rivera",
        email: "alex.rivera@commanddesk.io",
        role: "Administrator",
        timezone: "UTC-5 (Eastern Time)",
      },
      organization: {
        companyName: "CommandDesk Enterprise",
        workspaceUrl: "commanddesk.io/org/enterprise",
        taxId: "US-894210952",
        currency: "USD ($)",
      },
      notifications: {
        emailDigest: true,
        desktopAlerts: true,
        slackIntegration: true,
        payrollReminders: true,
      },
      security: {
        twoFactorEnabled: true,
        sessionTimeoutMinutes: 60,
      },
    };

    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
