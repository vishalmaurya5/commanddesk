"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
// Get all projects
router.get("/", async (req, res) => {
    try {
        const projects = await prisma_1.prisma.project.findMany({
            include: { lead: true, company: true, tasks: true, milestones: true },
            orderBy: { createdAt: "desc" },
        });
        res.json(projects);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get project by ID
router.get("/:id", async (req, res) => {
    try {
        const project = await prisma_1.prisma.project.findUnique({
            where: { id: req.params.id },
            include: { lead: true, company: true, tasks: true, milestones: true },
        });
        if (!project)
            return res.status(404).json({ error: "Project not found" });
        res.json(project);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Create project
router.post("/", async (req, res) => {
    try {
        const { name, description, companyId, leadId, status, priority } = req.body;
        const project = await prisma_1.prisma.project.create({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Update project
router.put("/:id", async (req, res) => {
    try {
        const project = await prisma_1.prisma.project.update({
            where: { id: req.params.id },
            data: req.body,
            include: { lead: true, company: true },
        });
        res.json(project);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Delete project
router.delete("/:id", async (req, res) => {
    try {
        await prisma_1.prisma.project.delete({ where: { id: req.params.id } });
        res.json({ message: "Project deleted" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get project stats
router.get("/:id/stats", async (req, res) => {
    try {
        const project = await prisma_1.prisma.project.findUnique({
            where: { id: req.params.id },
            include: { tasks: true },
        });
        if (!project)
            return res.status(404).json({ error: "Project not found" });
        const stats = {
            totalTasks: project.tasks.length,
            completedTasks: project.tasks.filter((t) => t.status === "COMPLETED").length,
            inProgressTasks: project.tasks.filter((t) => t.status === "IN_PROGRESS").length,
            progress: project.tasks.length > 0
                ? (project.tasks.filter((t) => t.status === "COMPLETED").length / project.tasks.length) * 100
                : 0,
        };
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=projects.js.map