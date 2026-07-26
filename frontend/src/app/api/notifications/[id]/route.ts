import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await authorize(PERMISSIONS.NOTIFICATIONS_VIEW);
    const { id } = await params;
    const result = await prisma.notification.updateMany({ where: { id, userId }, data: { isRead: true, readAt: new Date() } });
    if (!result.count) return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    return NextResponse.json({ id, isRead: true });
  } catch (error) { return apiError(error, "Unable to mark notification as read"); }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await authorize(PERMISSIONS.NOTIFICATIONS_VIEW);
    const { id } = await params;
    const result = await prisma.notification.deleteMany({ where: { id, userId } });
    if (!result.count) return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    return NextResponse.json({ message: "Notification deleted" });
  } catch (error) { return apiError(error, "Unable to delete notification"); }
}
