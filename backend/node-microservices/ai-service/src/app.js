import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { v4 as uuidv4 } from "uuid";

import routes from "./routes/index.js";
import { authenticate } from "./middleware/auth.js"; 
import logger from "./utils/logger.js"; 

const app = express();

// --------------------------
// Structured Logging with Request ID
// --------------------------
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
// CORS — Before Auth 
// --------------------------
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim()) || true,
    credentials: true,
  })
);


app.use(express.json({ limit: "10mb" }));


app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "ai-service",
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });
});


if (process.env.NODE_ENV !== "production") {
  app.get("/", (req, res) => {
    res.json({
      status: "AI Service Running",
      version: "v1",
      documentation: "Internal service — requires X-Internal-Key",
      health: "/health",
    });
  });
}


app.use("/ai", authenticate, routes);


export default app;