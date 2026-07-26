import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { EmployeeService } from "@/lib/services/employee-service";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const stats = await EmployeeService.getStats((session.user as any).companyId);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching employee stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
