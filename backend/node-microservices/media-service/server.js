import dotenv from "dotenv";

dotenv.config();

console.log("INTERNAL_API_KEY loaded:", process.env.INTERNAL_API_KEY ? "YES" : "NO");
console.log("First 10 chars:", process.env.INTERNAL_API_KEY?.substring(0, 10));


import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { v4 as uuidv4 } from "uuid";
import pino from "pino";
import pinoHttp from "pino-http";

import imageRoutes from "./src/routes/media/image.routes.js";
import pdfRoutes from "./src/routes/media/pdf.routes.js";
import logger from "./src/utils/logger.js";
import path from "path"; 
import { fileURLToPath } from "url"; 


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const app = express();
const PORT = process.env.PORT || 4001;
const NODE_ENV = process.env.NODE_ENV || "development";


app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --------------------------
// Startup Validation (Fail Fast)
// --------------------------
const requiredEnv = ["ALLOWED_ORIGINS"];
const missingEnv = requiredEnv.filter(key => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(`[FATAL] Missing required environment variables: ${missingEnv.join(", ")}`);
  process.exit(1);
}

// --------------------------
// Structured Logging (Pino)
// --------------------------
const httpLogger = pinoHttp({
  logger,
  genReqId: () => uuidv4(),
  customLogLevel: (res, err) => {
    if (res.statusCode >= 400 && res.statusCode < 500) return "warn";
    if (res.statusCode >= 500 || err) return "error";
    return "info";
  },
});

app.use(httpLogger);

// --------------------------
// Trust Proxy (Critical for Cloud/LB)
// --------------------------
app.set("trust proxy", 1);

// --------------------------
// Security Middleware
// --------------------------
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// Rate limiting — tuned for uploads
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
  skip: (req) => req.path.includes("/health"),
});

app.use(limiter);

// --------------------------
// CORS — Strict in all non-dev environments
// --------------------------
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
  : ["http://localhost:3000"];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (NODE_ENV === "development") return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    logger.warn(`CORS blocked origin: ${origin}`);
    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Internal-Key"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// --------------------------
// Body Parsing
// --------------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// --------------------------
// Request Timeout Protection
// --------------------------
app.use((req, res, next) => {
  req.setTimeout(300000); // 5 minutes
  res.setTimeout(300000);
  next();
});

// --------------------------
// Health Check
// --------------------------
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "media-service",
    timestamp: new Date().toISOString(),
    env: NODE_ENV,
    requestId: req.id,
  });
});

// --------------------------
// API Routes
// --------------------------
app.use("/media", imageRoutes);  
app.use("/media", pdfRoutes); 

// --------------------------
// 404 Handler
// --------------------------
app.use((req, res) => {
  logger.info({ reqId: req.id, path: req.originalUrl }, "Route not found");
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    requestId: req.id,
  });
});

// --------------------------
// Global Error Handler
// --------------------------
app.use((err, req, res, next) => {
  const reqId = req.id || "unknown";

  if (err.code === "LIMIT_FILE_SIZE") {
    logger.warn({ reqId, err }, "File too large");
    return res.status(400).json({ error: "File too large. Max 10MB allowed.", requestId: reqId });
  }

  if (err.message && err.message.includes("Unexpected field")) {
    logger.warn({ reqId, err }, "Invalid file field");
    return res.status(400).json({ error: "Invalid file field name.", requestId: reqId });
  }

  if (err.message === "Not allowed by CORS") {
    logger.warn({ reqId, origin: req.headers.origin }, "CORS violation");
    return res.status(403).json({ error: "Origin not allowed", requestId: reqId });
  }

  logger.error({ reqId, err }, "Unhandled error");
  res.status(500).json({
    error: NODE_ENV === "production" ? "Internal server error" : err.message,
    requestId: reqId,
  });
});

// --------------------------
// Unhandled Rejection & Exception
// --------------------------
process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled Rejection");
});

process.on("uncaughtException", (err) => {
  logger.error({ err }, "Uncaught Exception");
  setTimeout(() => process.exit(1), 1000);
});

// --------------------------
// Graceful Shutdown
// --------------------------
let server;
const shutdown = () => {
  logger.info("Shutdown signal received. Closing server...");
  if (server) {
    server.close(() => {
      logger.info("Server closed.");
      process.exit(0);
    });
  } else process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// --------------------------
// Start Server
// --------------------------
server = app.listen(PORT, "0.0.0.0", () => {
  logger.info(`Media Processing Service running on port ${PORT}`);
  logger.info(`Environment: ${NODE_ENV}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});

export default app;
