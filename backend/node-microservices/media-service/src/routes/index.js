import { Router } from "express";
import pdfRoute from "./pdf.route.js";
import imageRoute from "./image.route.js";

const router = Router();

// Mount sub-routers
router.use("/", pdfRoute);       
router.use("/", imageRoute);     

// Service discovery endpoint
router.get("/", (req, res) => {
  res.json({
    service: "Media Processing Service",
    version: process.env.SERVICE_VERSION || "1.0.0",
    endpoints: {
      resume_parse: "POST /media/resume/parse",
      image_optimize: "POST /media/image/optimize",
    },
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

export default router;