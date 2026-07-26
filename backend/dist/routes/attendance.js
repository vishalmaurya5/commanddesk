"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
// Get all attendance records
router.get("/", async (req, res) => {
    try {
        const attendance = await prisma_1.prisma.attendance.findMany({
            include: { user: true },
            orderBy: { date: "desc" },
        });
        res.json(attendance);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get attendance by user
router.get("/user/:userId", async (req, res) => {
    try {
        const attendance = await prisma_1.prisma.attendance.findMany({
            where: { userId: req.params.userId },
            orderBy: { date: "desc" },
        });
        res.json(attendance);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Mark attendance
router.post("/", async (req, res) => {
    try {
        const { userId, date, status, clockIn, clockOut } = req.body;
        const attendance = await prisma_1.prisma.attendance.create({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Update attendance
router.put("/:id", async (req, res) => {
    try {
        const attendance = await prisma_1.prisma.attendance.update({
            where: { id: req.params.id },
            data: req.body,
            include: { user: true },
        });
        res.json(attendance);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Delete attendance
router.delete("/:id", async (req, res) => {
    try {
        await prisma_1.prisma.attendance.delete({ where: { id: req.params.id } });
        res.json({ message: "Attendance record deleted" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=attendance.js.map