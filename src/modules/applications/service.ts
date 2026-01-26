import ResumeModel from "../resume/model.js";
import JobModel from "../jobs/model.js";
import { calculateMatchScore } from "../../utils/match.js";
import ApplicationModel, {
    type IApplication,
    type ApplicationStatus
} from "./model.js";
import { Types } from "mongoose";

interface CreateApplicationInput {
    userId: string;
    jobId: Types.ObjectId;
    jobTitle: string;
    company: string;
    jobUrl: string;
    resumeId: string;
}

export const CreateApplicationService = async (
    input: CreateApplicationInput
): Promise<IApplication> => {
    const existing = await ApplicationModel.findOne({
        userId: input.userId,
        jobId: input.jobId
    });

    if (existing) {
        return existing;
    }

    const resume = await ResumeModel.findById(input.resumeId);
    const job = await JobModel.findById(input.jobId);

    if (!resume || !job) {
        throw new Error("Resume or Job not found");
    }

    const match = calculateMatchScore(resume.text, job.description);


    const application = await ApplicationModel.create({
        ...input,
        matchScore: match.score,
        matchSummary: match.summary,
        status: "SAVED",
    });
    return application;
};

export const getUserApplicationsService = async (
    userId: string
): Promise<IApplication[]> => {
    return ApplicationModel.find({ userId })
        .populate("jobId")
        .sort({ createdAt: -1 });
};

export const UpdateApplicationStatusService = async (
    applicationId: string,
    status: ApplicationStatus
): Promise<IApplication | null> => {
    const update: Partial<IApplication> = { status };

    if (status === "APPLIED") {
        update.appliedAt = new Date();
    }

    return ApplicationModel.findByIdAndUpdate(
        applicationId,
        update, {
        new: true,
    });
};

