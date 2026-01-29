import { Router } from "express";
import { loginController, registerController, getProfileController, refreshTokenController } from "./controller.js";
import { protect } from "../../middlewares/auth.js";

const router = Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/refresh", refreshTokenController);
router.get("/profile", protect, getProfileController);

export default router;