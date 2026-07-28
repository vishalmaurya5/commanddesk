import express, { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router: Router = express.Router();

// Get all invoices
router.get("/", async (req: Request, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { company: true, client: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(invoices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get invoice by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: { company: true, client: true },
    });
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    res.json(invoice);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create invoice
router.post("/", async (req: Request, res: Response) => {
  try {
    const { invoiceNumber, amount, tax, clientId, companyId, status } = req.body;
    const invoice = await prisma.invoice.create({
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update invoice
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: req.body,
      include: { company: true, client: true },
    });
    res.json(invoice);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete invoice
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.invoice.delete({ where: { id: req.params.id } });
    res.json({ message: "Invoice deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
