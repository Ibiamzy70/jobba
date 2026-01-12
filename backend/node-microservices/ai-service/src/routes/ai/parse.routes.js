import express from "express";
import { internalAuth, internalRateLimit } from "../../middleware/auth.js";
import {parseResume} from "../../controllers/parse.controller.js";
import { validateRequest } from "../../middleware/validation.js";
import { parseResumeSchema } from "../../schemas/ai.schemas.js";

const router = express.Router();

router.use(express.json({ limit: "5mb" })); 

router.post(
  "/resume",
  internalAuth,
  internalRateLimit,
  validateRequest(parseResumeSchema),
  parseResume
);

export default router;