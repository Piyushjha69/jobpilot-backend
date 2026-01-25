import { Router } from 'express';
import resumeRouter from './modules/resume/route.js';
import authRouter from './modules/auth/route.js';
    
const router = Router();

router.use('/auth', authRouter);
router.use('/resume', resumeRouter);

export default router;