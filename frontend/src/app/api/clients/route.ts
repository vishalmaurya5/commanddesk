import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ClientService } from "@/lib/services/client-service";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const clients = await ClientService.getAll((session.user as any).companyId);
    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
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
    const client = await ClientService.create({
      ...body,
      companyId: (session.user as any).companyId,
    });
    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
