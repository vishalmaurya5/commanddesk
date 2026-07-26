"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
// Get all tasks
router.get("/", async (req, res) => {
    try {
        const tasks = await prisma_1.prisma.task.findMany({
            include: { assignee: true, project: true, comments: true },
            orderBy: { createdAt: "desc" },
        });
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get task by ID
router.get("/:id", async (req, res) => {
    try {
        const task = await prisma_1.prisma.task.findUnique({
            where: { id: req.params.id },
            include: { assignee: true, project: true, comments: { include: { author: true } }, timeEntries: true, subtasks: true },
        });
        if (!task)
            return res.status(404).json({ error: "Task not found" });
        res.json(task);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Create task
router.post("/", async (req, res) => {
    try {
        const { title, description, projectId, assigneeId, priority, status } = req.body;
        const task = await prisma_1.prisma.task.create({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Update task
router.put("/:id", async (req, res) => {
    try {
        const task = await prisma_1.prisma.task.update({
            where: { id: req.params.id },
            data: req.body,
            include: { assignee: true, project: true },
        });
        res.json(task);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Delete task
router.delete("/:id", async (req, res) => {
    try {
        await prisma_1.prisma.task.delete({ where: { id: req.params.id } });
        res.json({ message: "Task deleted" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Add comment to task
router.post("/:id/comments", async (req, res) => {
    try {
        const { content, authorId } = req.body;
        const comment = await prisma_1.prisma.taskComment.create({
            data: {
                content,
                taskId: req.params.id,
                authorId,
            },
            include: { author: true },
        });
        res.status(201).json(comment);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get task stats
router.get("/:id/stats", async (req, res) => {
    try {
        const task = await prisma_1.prisma.task.findUnique({
            where: { id: req.params.id },
            include: { timeEntries: true },
        });
        if (!task)
            return res.status(404).json({ error: "Task not found" });
        const totalHours = task.timeEntries.reduce((sum, t) => sum + (t.duration || 0), 0);
        res.json({
            totalHours,
            estimatedHours: task.estimatedHours,
            progress: task.estimatedHours ? (totalHours / task.estimatedHours) * 100 : 0,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=tasks.js.map