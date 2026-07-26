import { NextResponse } from "next/server";
import { AttendanceService } from "@/lib/services/attendance-service";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") ? parseInt(searchParams.get("month")!) : undefined;
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;
    const userId = searchParams.get("userId");

    if (userId) {
      await authorize(PERMISSIONS.ATTENDANCE_VIEW);
      const attendance = await AttendanceService.getByUser(userId, month, year);
      return NextResponse.json(attendance);
    }
    const { userId: currentUserId } = await authorize(PERMISSIONS.ATTENDANCE_SELF);
    const attendance = await AttendanceService.getByUser(currentUserId, month, year);
    return NextResponse.json(attendance);
  } catch (error) {
    return apiError(error, "Unable to load attendance");
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await authorize(PERMISSIONS.ATTENDANCE_SELF);
    const { action, ...data } = await request.json();
    if (action === "clock-in") {
      const attendance = await AttendanceService.clockIn(userId, data);
      return NextResponse.json(attendance, { status: 201 });
    }
    if (action === "clock-out") {
      const attendance = await AttendanceService.clockOut(userId);
      return NextResponse.json(attendance);
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return apiError(error, "Unable to update attendance");
  }
}
