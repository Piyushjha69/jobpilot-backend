import { Router } from 'express';
import resumeRouter from './modules/resume/route.js';
import authRouter from './modules/auth/route.js';
import applicationRoutes from './modules/applications/route.js';
import jobRouter from './modules/jobs/route.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Server is healthy',
        data: {
            timestamp: new Date().toISOString()
        }
    });
});

// Module routes
router.use('/auth', authRouter);
router.use('/resume', resumeRouter);
router.use('/jobs', jobRouter);
router.use('/applications', applicationRoutes);

export default router;
