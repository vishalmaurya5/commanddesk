import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { TaskService } from "@/lib/services/task-service";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const stats = await TaskService.getStats((session.user as any).companyId);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching task stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
