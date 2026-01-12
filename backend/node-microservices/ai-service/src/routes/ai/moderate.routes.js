import express from "express";
import { internalAuth, internalRateLimit } from "../../middleware/auth.js";
import {moderateContent}  from "../../controllers/moderate.controller.js";
import { validateRequest } from "../../middleware/validation.js";
import { moderateSchema } from "../../schemas/ai.schemas.js";

const router = express.Router();

router.use(express.json({ limit: "1mb" }));

router.post(
  "/moderate",
  internalAuth,
  internalRateLimit,
  validateRequest(moderateSchema),
  moderateContent 
);

export default router;