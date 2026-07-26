import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { DepartmentService } from "@/lib/services/department-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const department = await DepartmentService.getById((await params).id);
    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }
    return NextResponse.json(department);
  } catch (error) {
    console.error("Error fetching department:", error);
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
    const department = await DepartmentService.update((await params).id, body);
    return NextResponse.json(department);
  } catch (error) {
    console.error("Error updating department:", error);
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
    await DepartmentService.delete((await params).id);
    return NextResponse.json({ message: "Department deactivated successfully" });
  } catch (error) {
    console.error("Error deleting department:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
