import { type Request, type Response } from "express";
import { createJobService, getJobsService } from "./service.js";

export const createJobController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { title, company, location, description, applyUrl, source } = req.body;

        if (!title || !company || !description || !applyUrl || !source) {
            res.status(400).json({ message: "Missing required fields" });
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

        res.status(201).json(job);
    } catch (error: any){
        res.status(500).json({ message: error.message });
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

        res.json(jobs);
    }catch (error: any){
        res.status(500).json({ message: error.message });
    }
};