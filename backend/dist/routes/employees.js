"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
// Get all employees
router.get("/", async (req, res) => {
    try {
        const employees = await prisma_1.prisma.user.findMany({
            where: { role: { in: ["EMPLOYEE", "MANAGER", "TEAM_LEAD", "HR"] } },
            include: { employeeProfile: true, department: true, company: true },
        });
        res.json(employees);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get employee by ID
router.get("/:id", async (req, res) => {
    try {
        const employee = await prisma_1.prisma.user.findUnique({
            where: { id: req.params.id },
            include: { employeeProfile: true, department: true, attendance: true, leaves: true },
        });
        if (!employee)
            return res.status(404).json({ error: "Employee not found" });
        res.json(employee);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Create employee
router.post("/", async (req, res) => {
    try {
        const { email, firstName, lastName, departmentId, role, companyId } = req.body;
        const employee = await prisma_1.prisma.user.create({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Update employee
router.put("/:id", async (req, res) => {
    try {
        const employee = await prisma_1.prisma.user.update({
            where: { id: req.params.id },
            data: req.body,
            include: { employeeProfile: true, department: true },
        });
        res.json(employee);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Delete employee
router.delete("/:id", async (req, res) => {
    try {
        await prisma_1.prisma.user.delete({ where: { id: req.params.id } });
        res.json({ message: "Employee deleted" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get employee stats
router.get("/:id/stats", async (req, res) => {
    try {
        const employee = await prisma_1.prisma.user.findUnique({
            where: { id: req.params.id },
            include: {
                tasks: true,
                attendance: true,
                leaves: true,
                timeEntries: true,
            },
        });
        if (!employee)
            return res.status(404).json({ error: "Employee not found" });
        res.json({
            totalTasks: employee.tasks.length,
            completedTasks: employee.tasks.filter((t) => t.status === "COMPLETED").length,
            presentDays: employee.attendance.filter((a) => a.status === "PRESENT").length,
            totalLeaves: employee.leaves.length,
            totalHours: employee.timeEntries.reduce((sum, t) => sum + (t.duration || 0), 0),
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=employees.js.map