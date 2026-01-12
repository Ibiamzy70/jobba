import express from "express";
import upload from "../../utils/upload.js";
import VideoController from "../../controllers/video.controller.js";

const router = express.Router();


router.post("/video", upload.single("file"), VideoController.processVideo);

export default router;