import { Router } from 'express';
import {
    createApplicationController,
    getUserApplicationsController,
    updateApplicationStatusController,
    getApplicationStatsController
} from './controller.js';
import { protect } from "../../middlewares/auth.js";

const router = Router();

router.use(protect);

router.post("/", createApplicationController);
router.get("/", getUserApplicationsController);
router.get("/stats", getApplicationStatsController);
router.patch("/:id/status", updateApplicationStatusController);

export default router;
