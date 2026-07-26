import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { EmployeeService } from "@/lib/services/employee-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const employee = await EmployeeService.getById((await params).id);
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    return NextResponse.json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const employee = await EmployeeService.update((await params).id, body);
    return NextResponse.json(employee);
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await EmployeeService.delete((await params).id);
    return NextResponse.json({ message: "Employee deactivated successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
