import {Router} from "express";
import multer from "multer";
import {uploadResumeController, getResumeController} from "./controller.js"
import { protect } from "../../middlewares/auth.js";

const router = Router();

// memory storage for multer
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", protect, getResumeController);

router.post(
  "/upload",
  protect,
  upload.single("resume"),
  uploadResumeController
);

export default router;