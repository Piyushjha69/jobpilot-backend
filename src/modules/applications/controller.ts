import { type Request, type Response } from 'express';
import { Types } from 'mongoose';
import {
    CreateApplicationService,
    getUserApplicationsService,
    UpdateApplicationStatusService
} from './service.js';
import { type ApplicationStatus } from './model.js';

export const createApplicationController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { jobTitle, jobId, company, jobUrl, resumeId } = req.body;

        if (!jobTitle || !jobId || !company || !jobUrl || !resumeId) {
            res.status(400).json({ message: "All fields are required" });
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

        res.status(201).json({ application });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserApplicationsController = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const applications = await getUserApplicationsService(userId);

        return res.status(200).json(applications);
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
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
            res.status(400).json({ message: "Status is required" });
            return;
        }

        if(typeof Id !== 'string'){
            res.status(400).json({ message: "Invalid application ID" });
            return;
        }
        
        const updated = await UpdateApplicationStatusService(
            Id,
            status as ApplicationStatus
        );

        if (!updated) {
            res.status(404).json({ message: "Application not found" });
            return;
        }

        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
