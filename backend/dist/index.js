"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_1 = require("./lib/prisma");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// ========== MIDDLEWARE ==========
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});
// ========== ROUTES ==========
// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date() });
});
// Auth routes
app.use("/api/auth", require("./routes/auth").default);
// Employee routes
app.use("/api/employees", require("./routes/employees").default);
// Attendance routes
app.use("/api/attendance", require("./routes/attendance").default);
// Leave routes
app.use("/api/leaves", require("./routes/leaves").default);
// Task routes
app.use("/api/tasks", require("./routes/tasks").default);
// Project routes
app.use("/api/projects", require("./routes/projects").default);
// Client routes
app.use("/api/clients", require("./routes/clients").default);
// Department routes
app.use("/api/departments", require("./routes/departments").default);
// Lead routes
app.use("/api/leads", require("./routes/leads").default);
// Invoice routes
app.use("/api/invoices", require("./routes/invoices").default);
// Notification routes
app.use("/api/notifications", require("./routes/notifications").default);
// Company routes
app.use("/api/companies", require("./routes/companies").default);
// ========== ERROR HANDLING ==========
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(err.status || 500).json({
        error: err.message || "Internal Server Error",
        timestamp: new Date(),
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});
// ========== SERVER START ==========
async function startServer() {
    try {
        // Test database connection
        await prisma_1.prisma.$connect();
        console.log("✓ Database connected");
        app.listen(PORT, () => {
            console.log(`✓ Server running at http://localhost:${PORT}`);
            console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
        });
    }
    catch (error) {
        console.error("✗ Failed to start server:", error);
        process.exit(1);
    }
}
startServer();
// Graceful shutdown
process.on("SIGINT", async () => {
    await prisma_1.prisma.$disconnect();
    process.exit(0);
});
//# sourceMappingURL=index.js.map