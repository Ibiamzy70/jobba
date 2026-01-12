import express from "express";
import { internalAuth, internalRateLimit } from "../../middleware/auth.js";
import { verifyProfile } from "../../controllers/verify.controller.js";
import { validateRequest } from "../../middleware/validation.js";
import { verifyProfileSchema } from "../../schemas/ai.schemas.js";

const router = express.Router();

router.use(express.json({ limit: "2mb" }));

router.post(
  "/profile",
  internalAuth,
  internalRateLimit,
  validateRequest(verifyProfileSchema),
  verifyProfile
);

export default router;