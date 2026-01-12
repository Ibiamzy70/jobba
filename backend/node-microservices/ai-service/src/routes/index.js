import express from "express";
import verifyRoutes from "./ai/verify.routes.js";
import parseRoutes from "./ai/parse.routes.js";
import matchRoutes from "./ai/match.routes.js";
import moderateRoutes from "./ai/moderate.routes.js";

const router = express.Router();

const API_V1 = "/v1";


router.use(`${API_V1}/verify`, verifyRoutes);     
router.use(`${API_V1}/parse`, parseRoutes);       
router.use(`${API_V1}/match`, matchRoutes);       
router.use(`${API_V1}/moderate`, moderateRoutes); 

if (process.env.NODE_ENV !== "production") {
  router.get("/", (req, res) => {
    res.json({
      service: "ai-service",
      version: "v1",
      status: "healthy",
      documentation: "Internal AI microservice — endpoints require X-Internal-Key",
      endpoints: {
        verify_profile: "POST /ai/v1/verify/profile",
        parse_resume: "POST /ai/v1/parse/resume",
        match_score: "POST /ai/v1/match/score",
        moderate_content: "POST /ai/v1/moderate",
      },
      timestamp: new Date().toISOString(),
    });
  });
}

export default router;