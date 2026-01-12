import { parseResumeService } from '../services/parse.service.js';
import { parseResumeSchema } from '../schemas/ai.schemas.js';
import { validateRequest } from '../middleware/validation.js';

export const parseResume = async (req, res, next) => {
  try {
    // Schema validation (size + format enforced)
    const { resumeText } = validateRequest(parseResumeSchema, req.body, req);

    req.log.info(
      { reqId: req.id, resumeLength: resumeText.length },
      "Resume parsing requested"
    );

    const start = Date.now();
    const result = await parseResumeService({ resumeText });
    const durationMs = Date.now() - start;

    req.log.info(
      { reqId: req.id, durationMs, sections: Object.keys(result).length },
      "Resume parsed successfully"
    );

    res.json({
      success: true,
      parsed_resume: result,
      parsed_at: new Date().toISOString(),
      processing_time_ms: durationMs,
    });
  } catch (e) {
    next(e);
  }
};