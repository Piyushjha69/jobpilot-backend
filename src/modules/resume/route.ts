import {Router} from "express";
import multer from "multer";
import {uploadResumeController} from "./controller.js"

const router = Router();

// memory storage for multer
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("resume"), uploadResumeController);

export default router;