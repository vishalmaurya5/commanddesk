import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { LeadService } from "@/lib/services/lead-service";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const leads = await LeadService.getAll((session.user as any).companyId, status);
    return NextResponse.json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const lead = await LeadService.create({
      ...body,
      companyId: (session.user as any).companyId,
    });
    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
