import { getEmbedding } from "../../utils/embeddings.js";
import jobModel, { type IJob } from "./model.js"

interface CreateJopInput {
    title: string;
    company: string;
    location?: string;
    description: string;
    applyUrl: string;
    source: string;
}

interface JobFilters {
    keyword?: string;
    company?: string;
    location?: string;
}

export const createJobService = async (
    input: CreateJopInput
): Promise<IJob> => {
    const existing = await jobModel.findOne({ applyUrl: input.applyUrl });
    if (existing) {
        return existing;
    }

    const embedding = await getEmbedding(input.description);

    return jobModel.create({
        ...input,
        embedding,
    });
};

export const getJobsService = async (
    filters: JobFilters
): Promise<IJob[]> => {
    const query: any = {};

    if (filters.keyword) {
        query.title = { $regex: filters.keyword, $options: "i" };
    }

    if (filters.company) {
        query.company = { $regex: filters.company, $options: "i" };
    }

    return jobModel.find(query).sort({ createdAt: -1 });
};