import express, { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router: Router = express.Router();

// Get all leaves
router.get("/", async (req: Request, res: Response) => {
  try {
    const leaves = await prisma.leave.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(leaves);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get leaves by user
router.get("/user/:userId", async (req: Request, res: Response) => {
  try {
    const leaves = await prisma.leave.findMany({
      where: { userId: req.params.userId },
      orderBy: { startDate: "desc" },
    });
    res.json(leaves);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create leave request
router.post("/", async (req: Request, res: Response) => {
  try {
    const { userId, startDate, endDate, type, reason } = req.body;
    const leave = await prisma.leave.create({
      data: {
        userId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        type,
        reason,
        status: "PENDING",
      },
      include: { user: true },
    });
    res.status(201).json(leave);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Approve leave
router.put("/:id/approve", async (req: Request, res: Response) => {
  try {
    const leave = await prisma.leave.update({
      where: { id: req.params.id },
      data: {
        status: "APPROVED",
        approvedBy: req.body.approvedBy,
        approvedAt: new Date(),
      },
      include: { user: true },
    });
    res.json(leave);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Reject leave
router.put("/:id/reject", async (req: Request, res: Response) => {
  try {
    const leave = await prisma.leave.update({
      where: { id: req.params.id },
      data: { status: "REJECTED" },
      include: { user: true },
    });
    res.json(leave);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete leave
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.leave.delete({ where: { id: req.params.id } });
    res.json({ message: "Leave deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
