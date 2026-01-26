import { Router } from "express";
import { createJobController, getJobsController } from "./controller.js";
import { protect } from "../../middlewares/auth.js";
import { get } from "node:http";

const router = Router();

router.get("/", getJobsController);

//only authenticated users (or admin later) can add jobs
router.post("/", protect, createJobController);

export default router;