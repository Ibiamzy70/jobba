import { matchCV } from '../services/match.service.js';
import { matchScoreSchema } from '../schemas/ai.schemas.js';
import { validateRequest } from '../middleware/validation.js';

export const matchScore = async (req, res, next) => {
  try {
    
    const payload = matchScoreSchema.parse(req.body);
    req.log.info(`Payload after validation: ${JSON.stringify(payload)}`);

    const { resume_text, job_description } = payload;

    if (!resume_text || typeof resume_text !== 'string' || resume_text.trim().length < 10) {
      return res.status(400).json({ success: false, error: 'resume_text is required as a non-empty string (minimum 10 characters)' });
    }

    if (!job_description || typeof job_description !== 'string' || job_description.trim().length < 10) {
      return res.status(400).json({ success: false, error: 'job_description is required as a non-empty string (minimum 10 characters)' });
    }

    req.log.info(
      { 
        reqId: req.id, 
        resumeLength: resume_text.length || 0,
        jobLength: job_description.length || 0 
      },
      "Match scoring requested"
    );

    const start = Date.now();
    const result = await matchCV(payload);
    const durationMs = Date.now() - start;

    const safeResult = {
      match_score: Math.max(0, Math.min(100, Math.round(result.match_score || 0))),
      breakdown: result.breakdown || {},
      explanation: result.explanation || "",
      matched_at: new Date().toISOString(),
      processing_time_ms: durationMs,
    };

    req.log.info(
      { reqId: req.id, score: safeResult.match_score },
      "Match scoring completed"
    );

    res.json({ success: true, matching: safeResult });
  } catch (e) {
    next(e);
  }
};