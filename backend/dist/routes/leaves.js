"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
// Get all leaves
router.get("/", async (req, res) => {
    try {
        const leaves = await prisma_1.prisma.leave.findMany({
            include: { user: true },
            orderBy: { createdAt: "desc" },
        });
        res.json(leaves);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get leaves by user
router.get("/user/:userId", async (req, res) => {
    try {
        const leaves = await prisma_1.prisma.leave.findMany({
            where: { userId: req.params.userId },
            orderBy: { startDate: "desc" },
        });
        res.json(leaves);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Create leave request
router.post("/", async (req, res) => {
    try {
        const { userId, startDate, endDate, type, reason } = req.body;
        const leave = await prisma_1.prisma.leave.create({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Approve leave
router.put("/:id/approve", async (req, res) => {
    try {
        const leave = await prisma_1.prisma.leave.update({
            where: { id: req.params.id },
            data: {
                status: "APPROVED",
                approvedBy: req.body.approvedBy,
                approvedAt: new Date(),
            },
            include: { user: true },
        });
        res.json(leave);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Reject leave
router.put("/:id/reject", async (req, res) => {
    try {
        const leave = await prisma_1.prisma.leave.update({
            where: { id: req.params.id },
            data: { status: "REJECTED" },
            include: { user: true },
        });
        res.json(leave);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Delete leave
router.delete("/:id", async (req, res) => {
    try {
        await prisma_1.prisma.leave.delete({ where: { id: req.params.id } });
        res.json({ message: "Leave deleted" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=leaves.js.map