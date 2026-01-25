import { Request, Response } from "express";
import { uploadResumeService } from "./service.js";

export const uploadResumeController = async (req: Request, res: Response): Promise<void> => {
    const file = req.file;
    if(!file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
    }
};