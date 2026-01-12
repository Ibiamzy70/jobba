import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import logger from "../utils/logger.js";

// --------------------------
// Constants & Configuration
// --------------------------
const UPLOAD_DIR = path.resolve("uploads");

// Allowed MIME types (strict)
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

// Extension mapping from MIME (trusted source)
const MIME_TO_EXT = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

// --------------------------
// Startup: Create Directories Asynchronously
// --------------------------
(async () => {
  try {
    await fs.mkdir(path.join(UPLOAD_DIR, "resumes"), { recursive: true });
    await fs.mkdir(path.join(UPLOAD_DIR, "images"), { recursive: true });
    logger.info(`Upload directories ready: ${UPLOAD_DIR}/{resumes,images}`);
  } catch (err) {
    logger.error({ err }, "[FATAL] Failed to create upload directories");
    process.exit(1);
  }
})();

// --------------------------
// File Filter — Strict & Secure
// --------------------------
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error("Invalid file type");
    err.code = "INVALID_FILE_TYPE";
    err.mimetype = file.mimetype; // ← Attach for logging
    cb(err, false);
  }
};

// --------------------------
// Custom Storage — Secure & Organized
// --------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isResume = file.mimetype.startsWith("application/");
    const dir = path.join(UPLOAD_DIR, isResume ? "resumes" : "images");
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = MIME_TO_EXT[file.mimetype] || ".bin";
    const safeName = `${uuidv4()}_${Date.now()}${ext}`;
    cb(null, safeName);
  },
});

// --------------------------
// Multer Instance — Production Secure
// --------------------------
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
  fileFilter,
});

// Single-field helpers
export const uploadResume = upload.single("resume");
export const uploadImage = upload.single("image");

// --------------------------
// Multer Error Handler — Fully Observable & Secure
// --------------------------
export const handleMulterError = (err, req, res, next) => {
  const reqId = req.id || "unknown";

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      req.log.warn({ reqId, ip: req.ip }, "Upload exceeded size limit");
      return res.status(400).json({ error: "File too large" });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      req.log.warn({ reqId }, "Too many files uploaded");
      return res.status(400).json({ error: "Too many files" });
    }
  }

  if (err.code === "INVALID_FILE_TYPE") {
    req.log.warn(
      { reqId, mimetype: err.mimetype, ip: req.ip },
      "Invalid file type uploaded"
    );
    return res.status(400).json({ error: "Invalid file type" });
  }

  // Unexpected errors → global handler
  next(err);
};