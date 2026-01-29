import { type Request, type Response } from 'express';
import { Types } from 'mongoose';
import {
    CreateApplicationService,
    getUserApplicationsService,
    UpdateApplicationStatusService,
    getApplicationStatsService
} from './service.js';
import { type ApplicationStatus } from './model.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

export const createApplicationController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { jobTitle, jobId, company, jobUrl, resumeId } = req.body;

        if (!jobTitle || !jobId || !company || !jobUrl || !resumeId) {
            sendError(res, 400, "All fields are required");
            return;
        }

        const application = await CreateApplicationService({
            userId: req.user!.id,
            jobId: new Types.ObjectId(jobId),
            jobTitle,
            company,
            jobUrl,
            resumeId
        });

        sendSuccess(res, 201, "Application created successfully", { application });
    } catch (error: any) {
        sendError(res, 500, error.message);
    }
};

export const getUserApplicationsController = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return sendError(res, 401, "Unauthorized");
        }

        const applications = await getUserApplicationsService(userId);

        return sendSuccess(res, 200, "Applications retrieved successfully", applications);
    } catch (error) {
        return sendError(res, 500, "Server error");
    }
};

export const updateApplicationStatusController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { status } = req.body;
        const { Id } = req.params;

        if (!status) {
            sendError(res, 400, "Status is required");
            return;
        }

        if(typeof Id !== 'string'){
            sendError(res, 400, "Invalid application ID");
            return;
        }
        
        const updated = await UpdateApplicationStatusService(
            Id,
            status as ApplicationStatus
        );

        if (!updated) {
            sendError(res, 404, "Application not found");
            return;
        }

        sendSuccess(res, 200, "Application status updated successfully", updated);
    } catch (error: any) {
        sendError(res, 500, error.message);
    }
};

export const getApplicationStatsController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            sendError(res, 401, "Unauthorized");
            return;
        }

        const stats = await getApplicationStatsService(userId);

        sendSuccess(res, 200, "Application stats retrieved successfully", stats);
    } catch (error: any) {
        sendError(res, 500, error.message);
    }
};
