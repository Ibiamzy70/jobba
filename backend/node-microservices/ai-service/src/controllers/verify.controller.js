import { verifyResumeService } from '../services/verify.service.js';
import { verifyProfileSchema } from '../schemas/ai.schemas.js';
import { validateRequest } from '../middleware/validation.js';

export const verifyProfile = async (req, res, next) => {
  try {
    const profileData = validateRequest(verifyProfileSchema, req.body, req);

    req.log.info({ reqId: req.id }, "Profile verification requested");

    const start = Date.now();
    const result = await verifyResumeService(profileData);
    const durationMs = Date.now() - start;

    // Enforce safe response contract
    const safeResult = {
      verified: !!result.verified,
      confidence: Math.max(0, Math.min(100, result.confidence || 0)),
      issues: Array.isArray(result.issues) ? result.issues : [],
      verified_at: new Date().toISOString(),
      processing_time_ms: durationMs,
    };

    req.log.info(
      { reqId: req.id, verified: safeResult.verified, confidence: safeResult.confidence },
      "Profile verification completed"
    );

    res.json({ success: true, verification: safeResult });
  } catch (e) {
    next(e);
  }
};