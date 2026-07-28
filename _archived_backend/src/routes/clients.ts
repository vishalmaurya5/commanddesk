import express, { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router: Router = express.Router();

// Get all clients
router.get("/", async (req: Request, res: Response) => {
  try {
    const clients = await prisma.client.findMany({
      include: { company: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(clients);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get client by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.params.id },
      include: { company: true, leads: true, invoices: true },
    });
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json(client);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create client
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, email, phone, companyId, companyName } = req.body;
    const client = await prisma.client.create({
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update client
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const client = await prisma.client.update({
      where: { id: req.params.id },
      data: req.body,
      include: { company: true },
    });
    res.json(client);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete client
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.client.delete({ where: { id: req.params.id } });
    res.json({ message: "Client deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
