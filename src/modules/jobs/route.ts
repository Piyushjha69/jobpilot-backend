import { Router } from "express";
import { createJobController, getJobsController, getMatchedJobsController, analyzeJobMatchController } from "./controller.js";
import { protect } from "../../middlewares/auth.js";

const router = Router();

router.get("/", getJobsController);
router.get("/matched", protect, getMatchedJobsController);
router.post("/analyze", protect, analyzeJobMatchController);

//only authenticated users (or admin later) can add jobs
router.post("/", protect, createJobController);

export default router;