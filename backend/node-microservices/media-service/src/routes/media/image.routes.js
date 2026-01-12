import { Router } from "express";
import { internalAuth, internalRateLimit } from "../../middleware/auth.js";
import { uploadImage, handleMulterError } from "../../config/storage.js";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";

const router = Router();

/**
 * POST /media/image/optimize
 * Optimizes uploaded image (avatars, logos)
 */
router.post(
  "/image/optimize",
  internalAuth,
  internalRateLimit,
  uploadImage,
  handleMulterError,
  async (req, res) => {
    if (!req.file) {
      req.log.warn({ reqId: req.id }, "No image file uploaded");
      return res.status(400).json({
        error: "No file uploaded",
        message: "Field name must be 'image'",
      });
    }

    const outputDir = path.dirname(req.file.path);
    const outputName = `${uuidv4()}-optimized.webp`; // Collision-safe
    const outputPath = path.join(outputDir, outputName);

    const startTime = Date.now();

    try {
      await sharp(req.file.path)
        .resize(800, 800, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toFile(outputPath);

      const durationMs = Date.now() - startTime;

      // Delete original (parser-style cleanup)
      try {
        await fs.unlink(req.file.path);
        req.log.debug({ reqId: req.id, durationMs }, "Original image deleted after optimization");
      } catch (unlinkErr) {
        req.log.error({ reqId: req.id, err: unlinkErr.message }, "Failed to delete original image");
      }

      const relativeUrl = `/uploads/images/${outputName}`;

      req.log.info(
        { reqId: req.id, durationMs, original: req.file.originalname },
        "Image optimized successfully"
      );

      res.status(200).json({
        success: true,
        url: relativeUrl,
        original_filename: req.file.originalname,
        processed_at: new Date().toISOString(),
        format: "webp",
        max_width: 800,
      });
    } catch (err) {
      const durationMs = Date.now() - startTime;
      req.log.error(
        { reqId: req.id, err: err.message, durationMs },
        "Image optimization failed"
      );

      // Cleanup on failure
      try {
        await fs.unlink(req.file.path);
      } catch {}

      res.status(500).json({
        error: "Failed to process image",
        message: "File may be corrupted",
      });
    }
  }
);

export default router;