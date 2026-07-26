"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
// Get all departments
router.get("/", async (req, res) => {
    try {
        const departments = await prisma_1.prisma.department.findMany({
            include: { company: true, users: true },
        });
        res.json(departments);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get department by ID
router.get("/:id", async (req, res) => {
    try {
        const department = await prisma_1.prisma.department.findUnique({
            where: { id: req.params.id },
            include: { company: true, users: true },
        });
        if (!department)
            return res.status(404).json({ error: "Department not found" });
        res.json(department);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Create department
router.post("/", async (req, res) => {
    try {
        const { name, code, description, companyId } = req.body;
        const department = await prisma_1.prisma.department.create({
            data: {
                name,
                code,
                description,
                companyId,
            },
            include: { company: true },
        });
        res.status(201).json(department);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Update department
router.put("/:id", async (req, res) => {
    try {
        const department = await prisma_1.prisma.department.update({
            where: { id: req.params.id },
            data: req.body,
            include: { company: true },
        });
        res.json(department);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Delete department
router.delete("/:id", async (req, res) => {
    try {
        await prisma_1.prisma.department.delete({ where: { id: req.params.id } });
        res.json({ message: "Department deleted" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=departments.js.map