import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { EmployeeService } from "@/lib/services/employee-service";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const employees = await EmployeeService.getAll((session.user as any).companyId);
    return NextResponse.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
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
    const employee = await EmployeeService.create({
      ...body,
      companyId: (session.user as any).companyId,
    });
    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
