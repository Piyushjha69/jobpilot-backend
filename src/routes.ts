import { Router } from 'express';
import resumeRouter from './modules/resume/route.js';
import authRouter from './modules/auth/route.js';
import applicationRoutes from './modules/applications/route.js';
import jobRouter from './modules/jobs/route.js';

const router = Router();

router.use('/applications', applicationRoutes);
router.use('/auth', authRouter);
router.use('/resume', resumeRouter);
router.use('/jobs', jobRouter);
export default router;