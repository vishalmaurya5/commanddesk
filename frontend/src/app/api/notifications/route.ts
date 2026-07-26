import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";

export async function GET(request: Request) {
  try {
    const { userId } = await authorize(PERMISSIONS.NOTIFICATIONS_VIEW);
    const unreadOnly = new URL(request.url).searchParams.get("unread") === "true";
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({ where: { userId, ...(unreadOnly ? { isRead: false } : {}) }, orderBy: { createdAt: "desc" }, take: 100 }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return NextResponse.json({ notifications, unreadCount });
  } catch (error) { return apiError(error, "Unable to load notifications"); }
}

export async function POST(request: Request) {
  try {
    const { userId } = await authorize(PERMISSIONS.NOTIFICATIONS_VIEW);
    const body = await request.json();
    if (body.action === "markAllRead") {
      const result = await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true, readAt: new Date() } });
      return NextResponse.json({ updated: result.count });
    }
    if (body.action === "clearAll") {
      const result = await prisma.notification.deleteMany({ where: { userId } });
      return NextResponse.json({ deleted: result.count });
    }
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error) { return apiError(error, "Unable to update notifications"); }
}
