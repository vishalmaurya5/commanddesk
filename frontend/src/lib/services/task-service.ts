import { prisma } from "@/lib/prisma";

export class TaskService {
  static async getAll(companyId: string, projectId?: string) {
    return prisma.task.findMany({
      where: { project: { companyId }, projectId },
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        project: { select: { id: true, name: true, color: true } },
        _count: { select: { subtasks: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(id: string) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        project: { select: { id: true, name: true, color: true } },
        milestone: true,
        subtasks: { include: { assignee: { select: { id: true, firstName: true, lastName: true } } } },
        comments: {
          include: { author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  static async create(data: {
    title: string; description?: string; projectId: string;
    assigneeId?: string; priority?: string; dueDate?: Date;
    estimatedHours?: number; milestoneId?: string; parentTaskId?: string;
  }) {
    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        assigneeId: data.assigneeId,
        priority: data.priority as any || "MEDIUM",
        dueDate: data.dueDate,
        estimatedHours: data.estimatedHours,
        milestoneId: data.milestoneId,
        parentTaskId: data.parentTaskId,
      },
      include: { assignee: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  static async update(id: string, data: any) {
    return prisma.task.update({
      where: { id },
      data: {
        ...data,
        assigneeId: data.assigneeId === "" ? null : data.assigneeId,
        projectId: data.projectId === "" ? null : data.projectId,
        milestoneId: data.milestoneId === "" ? null : data.milestoneId,
        parentTaskId: data.parentTaskId === "" ? null : data.parentTaskId,
        completedAt: data.status === "COMPLETED" ? new Date() : undefined,
      },
      include: { assignee: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  static async delete(id: string) {
    return prisma.task.delete({ where: { id } });
  }

  static async addComment(taskId: string, authorId: string, content: string) {
    return prisma.taskComment.create({
      data: { taskId, authorId, content },
      include: { author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
    });
  }

  static async getStats(companyId: string) {
    const [total, todo, inProgress, completed, overdue] = await Promise.all([
      prisma.task.count({ where: { project: { companyId } } }),
      prisma.task.count({ where: { project: { companyId }, status: "TODO" } }),
      prisma.task.count({ where: { project: { companyId }, status: "IN_PROGRESS" } }),
      prisma.task.count({ where: { project: { companyId }, status: "COMPLETED" } }),
      prisma.task.count({
        where: { project: { companyId }, dueDate: { lt: new Date() }, status: { not: "COMPLETED" } },
      }),
    ]);
    return { total, todo, inProgress, completed, overdue };
  }
}
