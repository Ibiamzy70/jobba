import fs from "fs/promises";
import mammoth from "mammoth";
import path from "path";
import logger from "./logger.js"; 

/**
 * Extract clean text from resume file (PDF or DOCX)
 * Secure, robust, observable, and resource-protected
 *
 * @param {Object} file - Multer file object
 * @param {Object} context - { log, reqId } from request context
 * @returns {Promise<string>} Extracted text
 */
export async function extractText(file, context = {}) {
  const log = context.log || logger;
  const reqId = context.reqId || "unknown";

  if (!file || !file.path || !file.mimetype || !file.size) {
    log.warn({ reqId }, "Invalid file object passed to resume parser");
    throw new Error("Invalid file object provided");
  }

  const allowedMimes = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/msword": "doc",
  };

  if (!allowedMimes[file.mimetype]) {
    log.warn({ reqId, mimetype: file.mimetype }, "Unsupported resume file type");
    throw new Error("Unsupported file type. Only PDF and DOCX are allowed.");
  }

  // ------------------------------
  // Resource Protection: Size & Sanity
  // ------------------------------
  const MAX_SIZE = 10 * 1024 * 1024; 
  if (file.size > MAX_SIZE) {
    log.warn({ reqId, size: file.size }, "Resume exceeds maximum size");
    throw new Error("Resume file exceeds maximum allowed size");
  }

  let extractedText = "";
  const startTime = Date.now();

  try {
    const buffer = await fs.readFile(file.path);

    if (file.mimetype === "application/pdf") {
      
      const pdfParse = (await import("pdf-parse")).default;
      
      const data = await pdfParse(buffer, { 
        max: 10,
        pagerender: (pageData) =>
          pageData.getTextContent().then((content) =>
            content.items.map((item) => item.str).join(" ")
          ),
      });
      extractedText = cleanText(data.text);
    } else {
      // DOCX / DOC
      const result = await mammoth.extractRawText({ buffer });
      extractedText = cleanText(result.value);
    }

    const durationMs = Date.now() - startTime;
    log.info(
      { reqId, mimetype: file.mimetype, durationMs, size: file.size },
      "Resume parsed successfully"
    );

    return extractedText;
  } catch (err) {
    const durationMs = Date.now() - startTime;
    log.error(
      {
        reqId,
        err: err.message,
        mimetype: file.mimetype,
        durationMs,
        file: path.basename(file.path),
      },
      "Resume parsing failed"
    );

    // Client-facing error — generic for security
    throw new Error("Failed to parse resume. File may be corrupted or password-protected.");
  } finally {
    // ------------------------------
    // Deterministic Cleanup — Privacy + Disk Hygiene
    // ------------------------------
    try {
      await fs.unlink(file.path);
      log.debug({ reqId, file: path.basename(file.path) }, "Processed resume file deleted");
    } catch (unlinkErr) {
      log.error(
        { reqId, err: unlinkErr.message, file: file.path },
        "Failed to delete processed resume file"
      );
    }
  }
}

/**
 * Clean extracted text — normalize whitespace
 * @param {string} text
 * @returns {string}
 */
function cleanText(text) {
  if (!text) return "";
  return text
    .replace(/\s+/g, " ")
    .replace(/\r\n|\r|\n/g, " ")
    .trim();
}