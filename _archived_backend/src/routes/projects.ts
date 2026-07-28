import express, { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router: Router = express.Router();

// Get all projects
router.get("/", async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      include: { lead: true, company: true, tasks: true, milestones: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get project by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { lead: true, company: true, tasks: true, milestones: true },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create project
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, description, companyId, leadId, status, priority } = req.body;
    const project = await prisma.project.create({
      data: {
        name,
        description,
        companyId,
        leadId,
        status,
        priority,
      },
      include: { lead: true, company: true },
    });
    res.status(201).json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update project
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: req.body,
      include: { lead: true, company: true },
    });
    res.json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete project
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: "Project deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get project stats
router.get("/:id/stats", async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { tasks: true },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const stats = {
      totalTasks: project.tasks.length,
      completedTasks: project.tasks.filter((t: any) => t.status === "COMPLETED").length,
      inProgressTasks: project.tasks.filter((t: any) => t.status === "IN_PROGRESS").length,
      progress: project.tasks.length > 0 
        ? (project.tasks.filter((t: any) => t.status === "COMPLETED").length / project.tasks.length) * 100
        : 0,
    };
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
