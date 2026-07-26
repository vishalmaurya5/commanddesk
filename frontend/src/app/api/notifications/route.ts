import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NotificationService } from "@/lib/services/notification-service";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";
    const notifications = await NotificationService.getAll(
      (session.user as any).id,
      unreadOnly
    );
    const unreadCount = await NotificationService.getUnreadCount(
      (session.user as any).id
    );
    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { action } = await request.json();
    if (action === "markAllRead") {
      await NotificationService.markAllAsRead((session.user as any).id);
      return NextResponse.json({ message: "All notifications marked as read" });
    }
    const body = await request.json();
    const notification = await NotificationService.create({
      ...body,
      userId: (session.user as any).id,
    });
    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("Error managing notifications:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
