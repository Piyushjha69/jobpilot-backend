import { type Request, type Response } from "express";
import { uploadResumeService } from "./service.js";

export const uploadResumeController = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;

    const file = req.file;
    if(!file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
    }
};