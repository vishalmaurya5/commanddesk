import express, { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router: Router = express.Router();

// Get all attendance records
router.get("/", async (req: Request, res: Response) => {
  try {
    const attendance = await prisma.attendance.findMany({
      include: { user: true },
      orderBy: { date: "desc" },
    });
    res.json(attendance);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get attendance by user
router.get("/user/:userId", async (req: Request, res: Response) => {
  try {
    const attendance = await prisma.attendance.findMany({
      where: { userId: req.params.userId },
      orderBy: { date: "desc" },
    });
    res.json(attendance);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mark attendance
router.post("/", async (req: Request, res: Response) => {
  try {
    const { userId, date, status, clockIn, clockOut } = req.body;
    const attendance = await prisma.attendance.create({
      data: {
        userId,
        date: new Date(date),
        status,
        clockIn: clockIn ? new Date(clockIn) : null,
        clockOut: clockOut ? new Date(clockOut) : null,
      },
      include: { user: true },
    });
    res.status(201).json(attendance);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update attendance
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const attendance = await prisma.attendance.update({
      where: { id: req.params.id },
      data: req.body,
      include: { user: true },
    });
    res.json(attendance);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete attendance
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.attendance.delete({ where: { id: req.params.id } });
    res.json({ message: "Attendance record deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
