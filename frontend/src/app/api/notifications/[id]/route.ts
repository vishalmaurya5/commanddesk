import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NotificationService } from "@/lib/services/notification-service";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  _request: Request,
  { params }: Params
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const notification = await NotificationService.markAsRead((await params).id);
    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
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
    await NotificationService.delete((await params).id);
    return NextResponse.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
