import express, { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router: Router = express.Router();

// Get all departments
router.get("/", async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      include: { company: true, users: true },
    });
    res.json(departments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get department by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const department = await prisma.department.findUnique({
      where: { id: req.params.id },
      include: { company: true, users: true },
    });
    if (!department) return res.status(404).json({ error: "Department not found" });
    res.json(department);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create department
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, code, description, companyId } = req.body;
    const department = await prisma.department.create({
      data: {
        name,
        code,
        description,
        companyId,
      },
      include: { company: true },
    });
    res.status(201).json(department);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update department
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const department = await prisma.department.update({
      where: { id: req.params.id },
      data: req.body,
      include: { company: true },
    });
    res.json(department);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete department
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.department.delete({ where: { id: req.params.id } });
    res.json({ message: "Department deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
