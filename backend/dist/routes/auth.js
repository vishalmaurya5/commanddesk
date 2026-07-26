"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
            include: { company: true, department: true },
        });
        if (!user || !user.passwordHash) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const isValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        if (!user.isActive) {
            return res.status(403).json({ error: "Account is deactivated" });
        }
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            role: user.role,
            companyId: user.companyId,
        }, process.env.NEXTAUTH_SECRET || "secret");
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Register
router.post("/register", async (req, res) => {
    try {
        const { email, password, firstName, lastName, companyName } = req.body;
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        // Create company if provided
        let companyId;
        if (companyName) {
            const company = await prisma_1.prisma.company.create({
                data: {
                    name: companyName,
                    slug: companyName.toLowerCase().replace(/\s+/g, "-"),
                },
            });
            companyId = company.id;
        }
        const user = await prisma_1.prisma.user.create({
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
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.NEXTAUTH_SECRET || "secret");
        res.status(201).json({ user, token });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get current user
router.get("/me", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token)
            return res.status(401).json({ error: "Unauthorized" });
        const decoded = jsonwebtoken_1.default.verify(token, process.env.NEXTAUTH_SECRET || "secret");
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.id },
            include: { company: true, department: true },
        });
        res.json(user);
    }
    catch (error) {
        res.status(401).json({ error: "Unauthorized" });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map