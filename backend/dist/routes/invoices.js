"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
// Get all invoices
router.get("/", async (req, res) => {
    try {
        const invoices = await prisma_1.prisma.invoice.findMany({
            include: { company: true, client: true },
            orderBy: { createdAt: "desc" },
        });
        res.json(invoices);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get invoice by ID
router.get("/:id", async (req, res) => {
    try {
        const invoice = await prisma_1.prisma.invoice.findUnique({
            where: { id: req.params.id },
            include: { company: true, client: true },
        });
        if (!invoice)
            return res.status(404).json({ error: "Invoice not found" });
        res.json(invoice);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Create invoice
router.post("/", async (req, res) => {
    try {
        const { invoiceNumber, amount, tax, clientId, companyId, status } = req.body;
        const invoice = await prisma_1.prisma.invoice.create({
            data: {
                invoiceNumber,
                amount,
                tax,
                total: amount + tax,
                clientId,
                companyId,
                status,
            },
            include: { company: true, client: true },
        });
        res.status(201).json(invoice);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Update invoice
router.put("/:id", async (req, res) => {
    try {
        const invoice = await prisma_1.prisma.invoice.update({
            where: { id: req.params.id },
            data: req.body,
            include: { company: true, client: true },
        });
        res.json(invoice);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Delete invoice
router.delete("/:id", async (req, res) => {
    try {
        await prisma_1.prisma.invoice.delete({ where: { id: req.params.id } });
        res.json({ message: "Invoice deleted" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=invoices.js.map