import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TaskService } from "@/lib/services/task-service";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";

export async function GET(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.TASKS_VIEW);
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId") || undefined;
    const tasks = await TaskService.getAll(
      companyId,
      projectId
    );
    return NextResponse.json(tasks);
  } catch (error) {
    return apiError(error, "Unable to load tasks");
  }
}

export async function POST(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.TASKS_MANAGE);
    const body = (await request.json()) as {
      title?: string;
      description?: string;
      projectId?: string;
      assigneeId?: string;
      priority?: string;
      dueDate?: string;
    };
    if (!body.title?.trim() || !body.projectId) {
      return NextResponse.json(
        { error: "Task title and project are required" },
        { status: 400 },
      );
    }
    const project = await prisma.project.findFirst({
      where: { id: body.projectId, companyId },
      select: { id: true },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    if (body.assigneeId) {
      const assignee = await prisma.user.findFirst({
        where: {
          id: body.assigneeId,
          companyId,
          isActive: true,
        },
        select: { id: true },
      });
      if (!assignee) {
        return NextResponse.json({ error: "Assignee not found" }, { status: 404 });
      }
    }
    const task = await TaskService.create({
      ...body,
      title: body.title.trim(),
      projectId: body.projectId,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    });
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to create task");
  }
}
