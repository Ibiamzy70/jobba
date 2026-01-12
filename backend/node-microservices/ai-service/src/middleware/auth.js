import 'dotenv/config';
import crypto from "node:crypto";
import redis from "ioredis";
import logger from "../utils/logger.js";

// --------------------------
// Redis Client (Singleton)
// --------------------------
const redisClient = new redis(process.env.REDIS_URL);

redisClient.on("error", (err) => {
  logger.error({ err }, "Redis connection error in rate limiter");
});

redisClient.on("connect", () => {
  logger.info("Redis connected successfully for rate limiting");
});

// --------------------------
// Rate Limit Configuration
// --------------------------
const RATE_LIMIT_CONFIG = {
  general: {
    windowMs: 15 * 60 * 1000, 
    max: 100,
    burstMax: 20,
    burstWindowMs: 60 * 1000,
  },
  blockDurationMs: 5 * 60 * 1000, 
};

// --------------------------
// Helper: Secure Client ID
// --------------------------
function getClientId(req) {
  const internalKey = req.headers["x-internal-key"];
  if (internalKey) {
    // SHA-256 hash — no leakage, no collision risk
    return `key_${crypto.createHash("sha256").update(internalKey).digest("hex").substring(0, 16)}`;
  }
  return `ip_${req.ip || req.connection.remoteAddress || "unknown"}`;
}

// --------------------------
// Core Rate Limit Check (Redis)
// --------------------------
async function checkRateLimit(req, configKey = "general") {
  const reqId = req.id || "unknown";
  const clientId = getClientId(req);
  const config = RATE_LIMIT_CONFIG[configKey];

  const now = Date.now();
  const keys = {
    count: `rl:${clientId}:${configKey}:count`,
    burst: `rl:${clientId}:${configKey}:burst`,
    block: `rl:${clientId}:blocked`,
  };

  try {
    // Check if blocked
    const blockedUntil = await redisClient.get(keys.block);
    if (blockedUntil && now < parseInt(blockedUntil)) {
      const remainingMs = parseInt(blockedUntil) - now;
      logger.warn(
        { reqId, clientId, remainingMins: Math.ceil(remainingMs / 60000) },
        "Request blocked: client rate limit exceeded"
      );
      return {
        allowed: false,
        blocked: true,
        retryAfter: Math.ceil(remainingMs / 1000),
      };
    }

    // Lua script for atomic rate limit check
    const script = `
      local count_key = KEYS[1]
      local burst_key = KEYS[2]
      local window = tonumber(ARGV[1])
      local max = tonumber(ARGV[2])
      local burst_window = tonumber(ARGV[3])
      local burst_max = tonumber(ARGV[4])
      local now = tonumber(ARGV[5])

      local count = redis.call("GET", count_key)
      local burst = redis.call("GET", burst_key)

      if not count then
        redis.call("SET", count_key, 1, "PX", window)
        redis.call("SET", burst_key, 1, "PX", burst_window)
        return {1, max - 1}
      end

      count = tonumber(count)
      burst = tonumber(burst) or 0

      if burst >= burst_max then
        return {-1, 0}
      end

      redis.call("INCR", count_key)
      redis.call("INCR", burst_key)
      count = count + 1
      burst = burst + 1

      if count > max then
        return {-1, 0}
      end

      return {count, max - count}
    `;

    const result = await redisClient.eval(
      script,
      2,
      keys.count,
      keys.burst,
      config.windowMs,
      config.max,
      config.burstWindowMs || 60000,
      config.burstMax || 20,
      now
    );

    const [count, remaining] = result;

    if (count === -1) {
      // Block client
      const blockUntil = now + RATE_LIMIT_CONFIG.blockDurationMs;
      await redisClient.set(
        keys.block,
        blockUntil,
        "PX",
        RATE_LIMIT_CONFIG.blockDurationMs
      );

      logger.warn(
        { reqId, clientId, configKey },
        "Client blocked for rate limit violation"
      );

      return {
        allowed: false,
        blocked: true,
        retryAfter: Math.ceil(RATE_LIMIT_CONFIG.blockDurationMs / 1000),
      };
    }

    return {
      allowed: true,
      remaining,
      resetIn: config.windowMs,
    };
  } catch (error) {
    // Redis error - fail open (allow request but log error)
    logger.error(
      { reqId, clientId, error: error.message },
      "Rate limit check failed - allowing request"
    );
    return {
      allowed: true,
      remaining: config.max,
      error: true,
    };
  }
}

// --------------------------
// ORIGINAL AUTHENTICATION MIDDLEWARE
// --------------------------
export const internalAuth = (req, res, next) => {
  const reqId = req.id || "unknown";
  const clientIp = req.ip || req.connection.remoteAddress || "unknown";

  const providedKey = req.headers["x-internal-key"];

  if (!process.env.INTERNAL_API_KEY) {
    logger.error(
      { reqId },
      "[AUTH FATAL] INTERNAL_API_KEY not set in environment"
    );
    return res.status(500).json({
      error: "Internal configuration error",
      requestId: reqId,
    });
  }

  // -------------------------------
  // Header Presence & Format
  // -------------------------------
  if (!providedKey || typeof providedKey !== "string") {
    logger.warn(
      { reqId, clientIp, headerPresent: !!providedKey },
      "Authentication failed: missing or invalid X-Internal-Key"
    );
    return res.status(401).json({
      error: "Unauthorized",
      detail: "Missing or invalid authentication header",
      requestId: reqId,
    });
  }

  const providedBuffer = Buffer.from(providedKey.trim());
  const expectedBuffer = Buffer.from(process.env.INTERNAL_API_KEY);

  // -------------------------------
  // Constant-Time Comparison (Timing Attack Safe)
  // -------------------------------
  if (
    providedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    logger.warn(
      { reqId, clientIp },
      "Authentication failed: invalid X-Internal-Key"
    );
    return res.status(401).json({
      error: "Unauthorized",
      detail: "Invalid credentials",
      requestId: reqId,
    });
  }

  req.log?.debug({ reqId, clientIp }, "Internal authentication successful");
  next();
};

// --------------------------
// NEW RATE LIMITING MIDDLEWARE
// --------------------------
export const internalRateLimit = async (req, res, next) => {
  const reqId = req.id || "unknown";

  try {
    const result = await checkRateLimit(req, "general");

    // Set rate limit headers
    res.set("X-RateLimit-Limit", RATE_LIMIT_CONFIG.general.max);
    res.set("X-RateLimit-Remaining", result.remaining ?? 0);

    if (!result.allowed) {
      res.set("Retry-After", result.retryAfter);
      
      logger.warn(
        { reqId, retryAfter: result.retryAfter },
        "Request rejected: rate limit exceeded"
      );

      return res.status(429).json({
        error: "Too Many Requests",
        message: result.blocked
          ? "Rate limit exceeded — access temporarily blocked"
          : "Rate limit exceeded",
        retryAfter: result.retryAfter,
        requestId: reqId,
      });
    }

    req.log?.debug(
      { reqId, remaining: result.remaining },
      "Rate limit check passed"
    );

    next();
  } catch (error) {
    // Critical error in rate limiting - log and fail open
    logger.error(
      { reqId, error: error.message },
      "Critical error in rate limiting middleware - allowing request"
    );
    next();
  }
};

// --------------------------
// Graceful Shutdown
// --------------------------
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received - closing Redis connection");
  await redisClient.quit();
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received - closing Redis connection");
  await redisClient.quit();
});