import express, { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router: Router = express.Router();

// Get all companies
router.get("/", async (req: Request, res: Response) => {
  try {
    const companies = await prisma.company.findMany();
    res.json(companies);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get company by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.params.id },
      include: { users: true, departments: true, projects: true },
    });
    if (!company) return res.status(404).json({ error: "Company not found" });
    res.json(company);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create company
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, slug, email, phone, website } = req.body;
    const company = await prisma.company.create({
      data: {
        name,
        slug,
        email,
        phone,
        website,
      },
    });
    res.status(201).json(company);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update company
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const company = await prisma.company.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(company);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete company
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.company.delete({ where: { id: req.params.id } });
    res.json({ message: "Company deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
