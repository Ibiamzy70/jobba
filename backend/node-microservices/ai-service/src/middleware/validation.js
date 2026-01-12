import { z } from "zod";

/**
 * Middleware to validate request body against a Zod schema
 * 
 * @param {z.ZodSchema} schema 
 * @returns {Function} 
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
     
      const parsed = schema.parse(req.body);

     
      req.body = parsed;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        }));

        req.log?.warn(
          { reqId: req.id, validationErrors: issues },
          "Request validation failed"
        );

        return res.status(400).json({
          error: "Validation failed",
          details: issues,
          requestId: req.id || "unknown",
        });
      }

      // Unexpected error
      req.log?.error(
        { reqId: req.id, error: error.message },
        "Unexpected validation error"
      );

      return res.status(500).json({
        error: "Internal validation error",
        requestId: req.id || "unknown",
      });
    }
  };
};