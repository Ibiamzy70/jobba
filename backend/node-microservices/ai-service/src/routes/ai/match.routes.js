import express from "express";
import { internalAuth, internalRateLimit } from "../../middleware/auth.js";
import {matchScore} from "../../controllers/match.controller.js";
import { validateRequest } from "../../middleware/validation.js";
import { matchScoreSchema } from "../../schemas/ai.schemas.js";

const router = express.Router();


router.use(express.json({ limit: "2mb" })); 

router.post(
  "/score",
  internalAuth,
  internalRateLimit,
  validateRequest(matchScoreSchema), 
  matchScore
);

export default router;