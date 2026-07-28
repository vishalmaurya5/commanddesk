import express, { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router: Router = express.Router();

// Get all tasks
router.get("/", async (req: Request, res: Response) => {
  try {
    const tasks = await prisma.task.findMany({
      include: { assignee: true, project: true, comments: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get task by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { assignee: true, project: true, comments: { include: { author: true } }, timeEntries: true, subtasks: true },
    });
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create task
router.post("/", async (req: Request, res: Response) => {
  try {
    const { title, description, projectId, assigneeId, priority, status } = req.body;
    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        assigneeId,
        priority,
        status,
      },
      include: { assignee: true, project: true },
    });
    res.status(201).json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update task
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: req.body,
      include: { assignee: true, project: true },
    });
    res.json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete task
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ message: "Task deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add comment to task
router.post("/:id/comments", async (req: Request, res: Response) => {
  try {
    const { content, authorId } = req.body;
    const comment = await prisma.taskComment.create({
      data: {
        content,
        taskId: req.params.id,
        authorId,
      },
      include: { author: true },
    });
    res.status(201).json(comment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get task stats
router.get("/:id/stats", async (req: Request, res: Response) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { timeEntries: true },
    });
    if (!task) return res.status(404).json({ error: "Task not found" });

    const totalHours = task.timeEntries.reduce((sum: number, t: any) => sum + (t.duration || 0), 0);
    res.json({
      totalHours,
      estimatedHours: task.estimatedHours,
      progress: task.estimatedHours ? (totalHours / task.estimatedHours) * 100 : 0,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
