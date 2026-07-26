import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TaskService } from "@/lib/services/task-service";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";

const TASK_STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "TESTING", "COMPLETED"];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { companyId } = await authorize(PERMISSIONS.TASKS_VIEW);
    const { id } = await params;
    const exists = await prisma.task.findFirst({
      where: { id, project: { companyId } },
      select: { id: true },
    });
    if (!exists) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    const task = await TaskService.getById(id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json(task);
  } catch (error) {
    return apiError(error, "Unable to load task");
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { companyId } = await authorize(PERMISSIONS.TASKS_MANAGE);
    const { id } = await params;
    const body = (await request.json()) as {
      title?: string;
      description?: string | null;
      status?: string;
      priority?: string;
      dueDate?: string | null;
      assigneeId?: string | null;
    };
    const exists = await prisma.task.findFirst({
      where: { id, project: { companyId } },
      select: { id: true },
    });
    if (!exists) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    if (body.status && !TASK_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid task status" }, { status: 400 });
    }
    if (body.assigneeId) {
      const assignee = await prisma.user.findFirst({
        where: { id: body.assigneeId, companyId, isActive: true },
        select: { id: true },
      });
      if (!assignee) return NextResponse.json({ error: "Assignee not found" }, { status: 404 });
    }
    const task = await TaskService.update(id, {
      ...body,
      title: body.title?.trim(),
      dueDate:
        body.dueDate === null ? null : body.dueDate ? new Date(body.dueDate) : undefined,
    });
    return NextResponse.json(task);
  } catch (error) {
    return apiError(error, "Unable to update task");
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { companyId } = await authorize(PERMISSIONS.TASKS_MANAGE);
    const { id } = await params;
    const exists = await prisma.task.findFirst({
      where: { id, project: { companyId } },
      select: { id: true },
    });
    if (!exists) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    await TaskService.delete(id);
    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    return apiError(error, "Unable to delete task");
  }
}
