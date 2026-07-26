import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { InvoiceService } from "@/lib/services/invoice-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const invoice = await InvoiceService.getById((await params).id);
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { action } = await request.json();
    if (action === "pay") {
      const invoice = await InvoiceService.markAsPaid((await params).id);
      return NextResponse.json(invoice);
    }
    if (action === "overdue") {
      const invoice = await InvoiceService.markAsOverdue((await params).id);
      return NextResponse.json(invoice);
    }
    const body = await request.json();
    const invoice = await InvoiceService.update((await params).id, body);
    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await InvoiceService.delete((await params).id);
    return NextResponse.json({ message: "Invoice cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling invoice:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
