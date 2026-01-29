import { type Request, type Response } from "express";
import { uploadResumeService, getResumeService } from "./service.js";
import { sendSuccess, sendError } from "../../utils/apiResponse.js";

export const uploadResumeController = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;

    const file = req.file;
    if(!file) {
        sendError(res, 400, "No file uploaded");
        return;
    }

    try {
        const resume = await uploadResumeService({
            userId,
            fileBuffer: file.buffer,
            originalFileName: file.originalname,
        });
        sendSuccess(res, 201, "Resume uploaded successfully", resume);
    } catch (error) {
        sendError(res, 500, "Failed to upload resume", (error as Error).message);
    }
};

export const getResumeController = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;

    try {
        const resume = await getResumeService(userId);
        if (!resume) {
            sendError(res, 404, "Resume not found");
            return;
        }
        sendSuccess(res, 200, "Resume fetched successfully", resume);
    } catch (error) {
        sendError(res, 500, "Failed to fetch resume", (error as Error).message);
    }
};