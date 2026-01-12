import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { v4 as uuidv4 } from "uuid";
import pinoHttp from "pino-http";

import routes from "./src/routes/index.js"; 
import { internalAuth } from "./src/middleware/auth.js"; 
import logger from "./src/utils/logger.js";

const app = express();
const PORT = process.env.PORT || 7002;
const NODE_ENV = process.env.NODE_ENV || "development";

// --------------------------
// Startup Validation (Fail Fast)
const requiredEnv = ["GROQ_API_KEY", "INTERNAL_API_KEY", "ALLOWED_ORIGINS"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`[FATAL] Missing required environment variables: ${missingEnv.join(", ")}`);
  process.exit(1);
}

// --------------------------
// Structured Logging with Pino
app.use(
  pinoHttp({
    logger,
    genReqId: () => uuidv4(),
    customLogLevel: (res, err) => {
      if (res.statusCode >= 400 && res.statusCode < 500) return "warn";
      if (res.statusCode >= 500 || err) return "error";
      return "info";
    },
  })
);

// --------------------------
// Trust Proxy
app.set("trust proxy", 1);

// --------------------------
// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// --------------------------
// Rate Limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests — rate limit exceeded" },
    skip: (req) => req.path.includes("/health"),
  })
);

// --------------------------
// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Internal-Key"],
    credentials: true,
  })
);

// --------------------------
// Body Parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// --------------------------
// Request Timeout
app.use((req, res, next) => {
  req.setTimeout(120000); // 2 minutes
  res.setTimeout(120000);
  next();
});

// --------------------------
// Health Check (Public)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "ai-service",
    timestamp: new Date().toISOString(),
    env: NODE_ENV,
    requestId: req.id,
  });
});


app.use("/ai", internalAuth, routes);

// --------------------------
// 404 Handler
app.use((req, res) => {
  logger.info({ reqId: req.id, path: req.originalUrl }, "Route not found");
  res.status(404).json({
    error: "Not Found",
    path: req.originalUrl,
    requestId: req.id,
  });
});

// --------------------------
// Global Error Handler
app.use((err, req, res, next) => {
  const reqId = req.id || "unknown";
  logger.error({ reqId, err }, "Unhandled error");

  res.status(500).json({
    error: NODE_ENV === "production" ? "Internal Server Error" : err.message,
    requestId: reqId,
  });
});

// --------------------------
// Graceful Shutdown
let server;
const shutdown = () => {
  logger.info("Shutdown signal received. Closing server...");
  if (server) {
    server.close(() => {
      logger.info("Server closed.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// --------------------------
// Start Server
server = app.listen(PORT, "0.0.0.0", () => {
  logger.info(`AI Service running on port ${PORT}`);
  logger.info(`Environment: ${NODE_ENV}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});

export default app;
