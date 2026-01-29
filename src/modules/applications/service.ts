import ResumeModel from "../resume/model.js";
import JobModel from "../jobs/model.js";
import { calculateMatchFromEmbeddings } from "../../utils/match.js";
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

    if (!resume?.embedding || !job?.embedding) {
        throw new Error("Missing embeddings");
    }

    const match = calculateMatchFromEmbeddings(resume.embedding, job.embedding);


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

export interface ApplicationStats {
    totalApplications: number;
    interviews: number;
    avgMatchScore: number;
    thisWeek: number;
}

export const getApplicationStatsService = async (
    userId: string
): Promise<ApplicationStats> => {
    const applications = await ApplicationModel.find({ userId });

    const totalApplications = applications.length;
    const interviews = applications.filter(app => app.status === "INTERVIEW").length;

    const matchScores = applications
        .map(app => app.matchScore)
        .filter((score): score is number => score !== undefined && score !== null);
    const avgMatchScore = matchScores.length > 0
        ? Math.round(matchScores.reduce((sum, score) => sum + score, 0) / matchScores.length)
        : 0;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeek = applications.filter(app => 
        app.createdAt && new Date(app.createdAt) >= oneWeekAgo
    ).length;

    return {
        totalApplications,
        interviews,
        avgMatchScore,
        thisWeek
    };
};

