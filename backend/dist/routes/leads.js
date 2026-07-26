"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
// Get all leads
router.get("/", async (req, res) => {
    try {
        const leads = await prisma_1.prisma.lead.findMany({
            include: { company: true, client: true },
            orderBy: { createdAt: "desc" },
        });
        res.json(leads);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get lead by ID
router.get("/:id", async (req, res) => {
    try {
        const lead = await prisma_1.prisma.lead.findUnique({
            where: { id: req.params.id },
            include: { company: true, client: true },
        });
        if (!lead)
            return res.status(404).json({ error: "Lead not found" });
        res.json(lead);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Create lead
router.post("/", async (req, res) => {
    try {
        const { name, email, phone, source, companyId } = req.body;
        const lead = await prisma_1.prisma.lead.create({
            data: {
                name,
                email,
                phone,
                source,
                companyId,
                status: "NEW",
            },
            include: { company: true },
        });
        res.status(201).json(lead);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Update lead
router.put("/:id", async (req, res) => {
    try {
        const lead = await prisma_1.prisma.lead.update({
            where: { id: req.params.id },
            data: req.body,
            include: { company: true },
        });
        res.json(lead);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Delete lead
router.delete("/:id", async (req, res) => {
    try {
        await prisma_1.prisma.lead.delete({ where: { id: req.params.id } });
        res.json({ message: "Lead deleted" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=leads.js.map