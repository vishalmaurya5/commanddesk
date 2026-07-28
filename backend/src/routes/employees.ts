import express, { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router: Router = express.Router();

// Get all employees
router.get("/", async (req: Request, res: Response) => {
  try {
    const employees = await prisma.user.findMany({
      where: { isActive: true },
      include: { employeeProfile: true, department: true, company: true },
    });
    res.json(employees);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get employee by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const employee = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { employeeProfile: true, department: true, attendance: true, leaves: true },
    });
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    res.json(employee);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create employee
router.post("/", async (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName, departmentId, role, companyId } = req.body;
    const employee = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        departmentId,
        role,
        companyId,
        passwordHash: "temp_password",
      },
      include: { employeeProfile: true, department: true },
    });
    res.status(201).json(employee);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update employee
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const employee = await prisma.user.update({
      where: { id: req.params.id },
      data: req.body,
      include: { employeeProfile: true, department: true },
    });
    res.json(employee);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete employee
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: "Employee deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get employee stats
router.get("/:id/stats", async (req: Request, res: Response) => {
  try {
    const employee = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        tasks: true,
        attendance: true,
        leaves: true,
        timeEntries: true,
      },
    });
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    res.json({
      totalTasks: employee.tasks.length,
      completedTasks: employee.tasks.filter((t: any) => t.status === "COMPLETED").length,
      presentDays: employee.attendance.filter((a: any) => a.status === "PRESENT").length,
      totalLeaves: employee.leaves.length,
      totalHours: employee.timeEntries.reduce((sum: number, t: any) => sum + (t.duration || 0), 0),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
