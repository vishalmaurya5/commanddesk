import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./lib/prisma";

import authRoutes from "./routes/auth";
import employeeRoutes from "./routes/employees";
import attendanceRoutes from "./routes/attendance";
import leaveRoutes from "./routes/leaves";
import taskRoutes from "./routes/tasks";
import projectRoutes from "./routes/projects";
import clientRoutes from "./routes/clients";
import departmentRoutes from "./routes/departments";
import leadRoutes from "./routes/leads";
import invoiceRoutes from "./routes/invoices";
import notificationRoutes from "./routes/notifications";
import companyRoutes from "./routes/companies";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Allowed CORS origins list and matcher
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://commanddesk-gold.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed =
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin) ||
        /^http:\/\/localhost:\d+$/.test(origin);
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(null, true); // Fallback allow in production to prevent CORS blocks
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ========== ROUTES ==========

// Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", service: "commanddesk-backend", timestamp: new Date() });
});

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/companies", companyRoutes);

// ========== ERROR HANDLING ==========
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error("Express Error Handler Caught:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    timestamp: new Date(),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ========== SERVER START ==========
async function startServer() {
  try {
    await prisma.$connect();
    console.log("✓ Database connected successfully");

    app.listen(PORT, () => {
      console.log(`✓ CommandDesk Backend running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("✗ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
