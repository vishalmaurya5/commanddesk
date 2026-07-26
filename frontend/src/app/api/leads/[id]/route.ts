import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { LeadService } from "@/lib/services/lead-service";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: Request,
  { params }: Params
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const lead = await LeadService.getById((await params).id);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    return NextResponse.json(lead);
  } catch (error) {
    console.error("Error fetching lead:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: Params
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    if (body.action === "convert") {
      const client = await LeadService.convertToClient((await params).id, body.clientData);
      return NextResponse.json(client);
    }
    const lead = await LeadService.update((await params).id, body);
    return NextResponse.json(lead);
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: Params
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await LeadService.delete((await params).id);
    return NextResponse.json({ message: "Lead deleted successfully" });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
