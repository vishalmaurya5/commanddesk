import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AttendanceService } from "@/lib/services/attendance-service";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") ? parseInt(searchParams.get("month")!) : undefined;
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;
    const userId = searchParams.get("userId");

    if (userId) {
      const attendance = await AttendanceService.getByUser(userId, month, year);
      return NextResponse.json(attendance);
    }
    const attendance = await AttendanceService.getAll((session.user as any).companyId);
    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { action, ...data } = await request.json();
    if (action === "clock-in") {
      const attendance = await AttendanceService.clockIn((session.user as any).id, data);
      return NextResponse.json(attendance, { status: 201 });
    }
    if (action === "clock-out") {
      const attendance = await AttendanceService.clockOut((session.user as any).id);
      return NextResponse.json(attendance);
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error processing attendance:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
