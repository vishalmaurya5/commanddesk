import express, { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router: Router = express.Router();

// Get all notifications
router.get("/", async (req: Request, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get notifications by user
router.get("/user/:userId", async (req: Request, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.params.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create notification
router.post("/", async (req: Request, res: Response) => {
  try {
    const { userId, title, message, type, link } = req.body;
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link,
      },
      include: { user: true },
    });
    res.status(201).json(notification);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mark as read
router.put("/:id/read", async (req: Request, res: Response) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
      include: { user: true },
    });
    res.json(notification);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete notification
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.notification.delete({ where: { id: req.params.id } });
    res.json({ message: "Notification deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
