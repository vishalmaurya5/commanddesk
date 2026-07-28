import express, { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router: Router = express.Router();

// Get all leads
router.get("/", async (req: Request, res: Response) => {
  try {
    const leads = await prisma.lead.findMany({
      include: { company: true, client: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(leads);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get lead by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id },
      include: { company: true, client: true },
    });
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.json(lead);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create lead
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, email, phone, source, companyId } = req.body;
    const lead = await prisma.lead.create({
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update lead
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const lead = await prisma.lead.update({
      where: { id: req.params.id },
      data: req.body,
      include: { company: true },
    });
    res.json(lead);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete lead
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.lead.delete({ where: { id: req.params.id } });
    res.json({ message: "Lead deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
