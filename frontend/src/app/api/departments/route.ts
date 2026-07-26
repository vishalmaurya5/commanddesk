import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { DepartmentService } from "@/lib/services/department-service";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const departments = await DepartmentService.getAll((session.user as any).companyId);
    return NextResponse.json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const department = await DepartmentService.create({
      ...body,
      companyId: (session.user as any).companyId,
    });
    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    console.error("Error creating department:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
