import { Router } from "express";
import { internalAuth, internalRateLimit } from "../../middleware/auth.js";
import { uploadResume, handleMulterError } from "../../config/storage.js";
import { extractText } from "../../utils/resumeParser.js";

const router = Router();

/**
 * POST /media/resume/parse
 * Extracts clean text from uploaded resume (PDF/DOCX)
 * Auth: Internal API key + rate limiting
 */
router.post(
  "/resume/parse",
  internalAuth,
  internalRateLimit,
  uploadResume,
  handleMulterError,
  async (req, res) => {
    if (!req.file) {
      req.log.warn({ reqId: req.id }, "No resume file uploaded");
      return res.status(400).json({
        error: "No file uploaded",
        message: "Field name must be 'resume'",
      });
    }

    try {
      // Pass request context for full observability
      const text = await extractText(req.file, {
        log: req.log,
        reqId: req.id,
      });

      res.status(200).json({
        success: true,
        text,
        filename: req.file.originalname,
        extracted_at: new Date().toISOString(),
      });
    } catch (err) {
      // extractText already logs + deletes file
      req.log.warn({ reqId: req.id, err: err.message }, "Resume parse failed in route");
      res.status(400).json({
        error: "Failed to parse resume",
        message: "File may be corrupted or password-protected",
      });
    }
  }
);

export default router;