import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { LeaveService } from "@/lib/services/leave-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const leave = await LeaveService.getById((await params).id);
    if (!leave) {
      return NextResponse.json({ error: "Leave not found" }, { status: 404 });
    }
    return NextResponse.json(leave);
  } catch (error) {
    console.error("Error fetching leave:", error);
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
    const userId = (session.user as any).id;

    if (action === "approve") {
      const leave = await LeaveService.approve((await params).id, userId);
      return NextResponse.json(leave);
    }
    if (action === "reject") {
      const leave = await LeaveService.reject((await params).id, userId);
      return NextResponse.json(leave);
    }
    if (action === "cancel") {
      const leave = await LeaveService.cancel((await params).id);
      return NextResponse.json(leave);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating leave:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
