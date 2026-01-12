import { moderateContentService } from '../services/moderate.service.js';
import { moderateSchema } from '../schemas/ai.schemas.js';
import { validateRequest } from '../middleware/validation.js';

export const moderateContent = async (req, res, next) => {
  try {
    const { content, context } = validateRequest(moderateSchema, req.body, req);

    req.log.info(
      { reqId: req.id, contentLength: content.length, context },
      "Content moderation requested"
    );

    const start = Date.now();
    const result = await moderateContentService({ content, context });
    const durationMs = Date.now() - start;

    // Enforce safe moderation contract
    const safeResult = {
      flagged: !!result.flagged,
      categories: Array.isArray(result.categories) ? result.categories : [],
      score: Math.max(0, Math.min(1, result.score || 0)),
      moderated_at: new Date().toISOString(),
      processing_time_ms: durationMs,
    };

    req.log.info(
      { reqId: req.id, flagged: safeResult.flagged, categories: safeResult.categories.length },
      "Content moderation completed"
    );

    res.json({ success: true, moderation: safeResult });
  } catch (e) {
    next(e);
  }
};