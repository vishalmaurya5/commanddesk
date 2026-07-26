import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { InvoiceService } from "@/lib/services/invoice-service";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const invoices = await InvoiceService.getAll((session.user as any).companyId, status);
    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
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
    const invoice = await InvoiceService.create({
      ...body,
      companyId: (session.user as any).companyId,
    });
    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
