"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
// Get all notifications
router.get("/", async (req, res) => {
    try {
        const notifications = await prisma_1.prisma.notification.findMany({
            include: { user: true },
            orderBy: { createdAt: "desc" },
        });
        res.json(notifications);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get notifications by user
router.get("/user/:userId", async (req, res) => {
    try {
        const notifications = await prisma_1.prisma.notification.findMany({
            where: { userId: req.params.userId },
            orderBy: { createdAt: "desc" },
        });
        res.json(notifications);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Create notification
router.post("/", async (req, res) => {
    try {
        const { userId, title, message, type, link } = req.body;
        const notification = await prisma_1.prisma.notification.create({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Mark as read
router.put("/:id/read", async (req, res) => {
    try {
        const notification = await prisma_1.prisma.notification.update({
            where: { id: req.params.id },
            data: {
                isRead: true,
                readAt: new Date(),
            },
            include: { user: true },
        });
        res.json(notification);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Delete notification
router.delete("/:id", async (req, res) => {
    try {
        await prisma_1.prisma.notification.delete({ where: { id: req.params.id } });
        res.json({ message: "Notification deleted" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=notifications.js.map