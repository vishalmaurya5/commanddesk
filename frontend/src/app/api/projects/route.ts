import { NextResponse } from "next/server";
import { ProjectService } from "@/lib/services/project-service";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";

export async function GET() {
  try {
    const { companyId } = await authorize(PERMISSIONS.PROJECTS_VIEW);
    const projects = await ProjectService.getAll(companyId);
    return NextResponse.json(projects);
  } catch (error) {
    return apiError(error, "Unable to load projects");
  }
}

export async function POST(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.PROJECTS_MANAGE);
    const body = (await request.json()) as {
      name?: string;
      description?: string;
      leadId?: string;
      priority?: string;
      startDate?: string;
      endDate?: string;
    };
    if (!body.name?.trim() || !body.leadId) {
      return NextResponse.json(
        { error: "Project name and lead are required" },
        { status: 400 },
      );
    }
    const project = await ProjectService.create({
      ...body,
      name: body.name.trim(),
      description: body.description?.trim(),
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      leadId: body.leadId,
      companyId,
    });
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to create project");
  }
}
