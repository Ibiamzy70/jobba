import pino from "pino";
import os from "os"; 

const NODE_ENV = process.env.NODE_ENV || "development";


const baseConfig = {
  level: process.env.LOG_LEVEL || (NODE_ENV === "production" ? "info" : "debug"),
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers['x-internal-key']",
      "req.headers.cookie",
      "res.headers['set-cookie']",
      "*.password",
      "*.token",
      "*.secret",
    ],
    censor: "**REDACTED**",
  },
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  base: {
    pid: process.pid,
    hostname: os.hostname(), 
    service: "ai-service", 
  },
};


let logger;

if (NODE_ENV !== "production") {
  
  logger = pino({
    ...baseConfig, 
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname,req.id",
        messageFormat: "{req.id} {msg}",
      },
    },
  });
} else {
  
  logger = pino(baseConfig);
}

export default logger;