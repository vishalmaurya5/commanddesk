import { NextResponse } from "next/server";
import { DepartmentService } from "@/lib/services/department-service";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";

export async function GET() {
  try {
    const { companyId } = await authorize(PERMISSIONS.DEPARTMENTS_VIEW);
    const departments = await DepartmentService.getAll(companyId);
    return NextResponse.json(departments);
  } catch (error) {
    return apiError(error, "Unable to load departments");
  }
}

export async function POST(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.DEPARTMENTS_MANAGE);
    const body = (await request.json()) as {
      name?: string;
      code?: string;
      description?: string;
      headId?: string;
    };
    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: "Department name is required" },
        { status: 400 },
      );
    }
    const department = await DepartmentService.create({
      name: body.name.trim(),
      code: body.code?.trim() || undefined,
      description: body.description?.trim() || undefined,
      headId: body.headId || undefined,
      companyId,
    });
    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to create department");
  }
}
