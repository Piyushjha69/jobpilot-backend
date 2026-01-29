import { type Request, type Response } from "express";
import { createJobService, getJobsService, getMatchedJobsService, analyzeJobMatchService } from "./service.js";
import { sendSuccess, sendError } from "../../utils/apiResponse.js";

export const createJobController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { title, company, location, description, applyUrl, source } = req.body;

        if (!title || !company || !description || !applyUrl || !source) {
            sendError(res, 400, "Missing required fields");
            return;
        }

        const job = await createJobService({
            title,
            company,
            location,
            description,
            applyUrl,
            source,
        });

        sendSuccess(res, 201, "Job created successfully", job);
    } catch (error: any){
        sendError(res, 500, "Failed to create job", error.message);
    }
};

export const getJobsController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { keyword, company, location } = req.query;

        const jobs = await getJobsService({
            keyword: keyword as string | undefined,
            company: company as string | undefined,
            location: location as string | undefined,
        });

        sendSuccess(res, 200, "Jobs fetched successfully", jobs);
    }catch (error: any){
        sendError(res, 500, "Failed to fetch jobs", error.message);
    }
};

export const getMatchedJobsController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            sendError(res, 401, "Unauthorized");
            return;
        }

        const jobs = await getMatchedJobsService(userId);
        sendSuccess(res, 200, "Matched jobs fetched successfully", jobs);
    } catch (error: any) {
        sendError(res, 500, "Failed to fetch matched jobs", error.message);
    }
};

export const analyzeJobMatchController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            sendError(res, 401, "Unauthorized");
            return;
        }

        const { jobDescription } = req.body;

        if (!jobDescription || typeof jobDescription !== "string") {
            sendError(res, 400, "Job description is required");
            return;
        }

        if (jobDescription.length < 50) {
            sendError(res, 400, "Job description is too short. Please provide more details.");
            return;
        }

        const analysis = await analyzeJobMatchService(userId, jobDescription);
        sendSuccess(res, 200, "Job match analyzed successfully", analysis);
    } catch (error: any) {
        if (error.message === "NO_RESUME") {
            sendError(res, 400, "Please upload your resume first to analyze job matches.");
            return;
        }
        sendError(res, 500, "Failed to analyze job match", error.message);
    }
};