"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
// Get all clients
router.get("/", async (req, res) => {
    try {
        const clients = await prisma_1.prisma.client.findMany({
            include: { company: true },
            orderBy: { createdAt: "desc" },
        });
        res.json(clients);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get client by ID
router.get("/:id", async (req, res) => {
    try {
        const client = await prisma_1.prisma.client.findUnique({
            where: { id: req.params.id },
            include: { company: true, leads: true, invoices: true },
        });
        if (!client)
            return res.status(404).json({ error: "Client not found" });
        res.json(client);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Create client
router.post("/", async (req, res) => {
    try {
        const { name, email, phone, companyId, companyName } = req.body;
        const client = await prisma_1.prisma.client.create({
            data: {
                name,
                email,
                phone,
                companyName,
                companyId,
            },
            include: { company: true },
        });
        res.status(201).json(client);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Update client
router.put("/:id", async (req, res) => {
    try {
        const client = await prisma_1.prisma.client.update({
            where: { id: req.params.id },
            data: req.body,
            include: { company: true },
        });
        res.json(client);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Delete client
router.delete("/:id", async (req, res) => {
    try {
        await prisma_1.prisma.client.delete({ where: { id: req.params.id } });
        res.json({ message: "Client deleted" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=clients.js.map