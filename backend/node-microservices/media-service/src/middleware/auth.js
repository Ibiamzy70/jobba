import crypto from "crypto";
import { RateLimiterMemory } from "rate-limiter-flexible";
import logger from "../utils/logger.js";


let internalApiKeyBuffer;

// --------------------------
// Internal Authentication Middleware
// --------------------------
export const internalAuth = (req, res, next) => {
 
  if (!internalApiKeyBuffer) {
    if (!process.env.INTERNAL_API_KEY) {
      logger.fatal("[FATAL] INTERNAL_API_KEY environment variable is required");
      throw new Error("[FATAL] INTERNAL_API_KEY environment variable is required");
    }
    internalApiKeyBuffer = Buffer.from(process.env.INTERNAL_API_KEY);
    logger.info("Internal API key initialized successfully");
  }

  
  const providedKey = String(req.headers["x-internal-key"] || "").trim();

  let match = false;

  // Elite fix: First check length (constant time, no throw)
  const providedBuffer = Buffer.from(providedKey);
  if (providedBuffer.length === internalApiKeyBuffer.length) {
    match = crypto.timingSafeEqual(providedBuffer, internalApiKeyBuffer);
  }

  if (!match) {
    const log = req.log || logger;
    log.warn(
      { reqId: req.id, ip: req.ip, origin: req.headers.origin },
      "Invalid or missing internal API key"
    );
    return res.status(403).json({ error: "Forbidden" });
  }

  if (process.env.NODE_ENV !== "production") {
    const log = req.log || logger;
    log.debug(
      { reqId: req.id, path: req.originalUrl, ip: req.ip },
      "Internal authentication successful"
    );
  }

  next();
};

// --------------------------
// In-Memory Rate Limiting (Redis removed)
// --------------------------
const rateLimiter = new RateLimiterMemory({
  keyPrefix: "rl_internal",
  points: 100, // 100 requests
  duration: 60, // per minute
  blockDuration: 60, 
});

export const internalRateLimit = async (req, res, next) => {
  // Use real IP (trust proxy from server.js)
  const ip = req.ip;

  try {
    await rateLimiter.consume(ip);
    next();
  } catch (rej) {
    // Redis down or limit exceeded
    if (rej instanceof Error) {
      // Redis failure — fail open for internal traffic (resilience)
      const log = req.log || logger;
      log.error({ reqId: req.id, err: rej }, "Rate limiter unavailable — failing open");
      return next(); 
    }

    // Normal rate limit exceeded
    const log = req.log || logger;
    log.warn(
      { reqId: req.id, ip, remainingPoints: rej.remainingPoints },
      "Internal rate limit exceeded"
    );

    const retryAfter = Math.ceil(rej.msBeforeNext / 1000);
    res.set("Retry-After", retryAfter);

    return res.status(429).json({
      error: "Too Many Requests",
      message: "Internal rate limit exceeded",
      retryAfter,
    });
  }
};