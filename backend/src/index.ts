import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./lib/prisma";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// ========== MIDDLEWARE ==========
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ========== ROUTES ==========

// Health check
app.get("/api/health", (req: Request, res: Response) => {
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
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    timestamp: new Date(),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// ========== SERVER START ==========
async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✓ Database connected");

    app.listen(PORT, () => {
      console.log(`✓ Server running at http://localhost:${PORT}`);
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
