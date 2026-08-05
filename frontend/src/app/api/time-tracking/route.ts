import { NextResponse } from "next/server";
import { TimeTrackingService } from "@/lib/services/time-tracking-service";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";

export async function GET() {
  try {
    const { userId } = await authorize(PERMISSIONS.TIME_TRACKING_USE);
    const data = await TimeTrackingService.getByUser(userId);
    return NextResponse.json(data);
  } catch (error) {
    return apiError(error, "Unable to load time entries");
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await authorize(PERMISSIONS.TIME_TRACKING_USE);
    const body = await request.json();
    const entry = await TimeTrackingService.create(userId, body);
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to log time entry");
  }
}
