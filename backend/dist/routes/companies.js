"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
// Get all companies
router.get("/", async (req, res) => {
    try {
        const companies = await prisma_1.prisma.company.findMany();
        res.json(companies);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get company by ID
router.get("/:id", async (req, res) => {
    try {
        const company = await prisma_1.prisma.company.findUnique({
            where: { id: req.params.id },
            include: { users: true, departments: true, projects: true },
        });
        if (!company)
            return res.status(404).json({ error: "Company not found" });
        res.json(company);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Create company
router.post("/", async (req, res) => {
    try {
        const { name, slug, email, phone, website } = req.body;
        const company = await prisma_1.prisma.company.create({
            data: {
                name,
                slug,
                email,
                phone,
                website,
            },
        });
        res.status(201).json(company);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Update company
router.put("/:id", async (req, res) => {
    try {
        const company = await prisma_1.prisma.company.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(company);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Delete company
router.delete("/:id", async (req, res) => {
    try {
        await prisma_1.prisma.company.delete({ where: { id: req.params.id } });
        res.json({ message: "Company deleted" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=companies.js.map