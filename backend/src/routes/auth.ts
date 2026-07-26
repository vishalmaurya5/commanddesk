import express, { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

const router: Router = express.Router();

// Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true, department: true },
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "Account is deactivated" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      },
      process.env.NEXTAUTH_SECRET || "secret"
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        company: user.company,
        department: user.department,
      },
      token,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, companyName } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create company if provided
    let companyId: string | undefined;
    if (companyName) {
      const company = await prisma.company.create({
        data: {
          name: companyName,
          slug: companyName.toLowerCase().replace(/\s+/g, "-"),
        },
      });
      companyId = company.id;
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        companyId,
        role: "ORGANIZATION_OWNER",
      },
      include: { company: true },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.NEXTAUTH_SECRET || "secret"
    );

    res.status(201).json({ user, token });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get("/me", async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded: any = jwt.verify(token, process.env.NEXTAUTH_SECRET || "secret");
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { company: true, department: true },
    });

    res.json(user);
  } catch (error: any) {
    res.status(401).json({ error: "Unauthorized" });
  }
});

export default router;
