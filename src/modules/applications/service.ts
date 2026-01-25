import ApplicationModel, {
    type IApplication,
    type ApplicationStatus
} from "./model.js";

interface CreateApplicationInput {
    userId: string;
    jobTitle: string;
    company: string;
    jobUrl: string;
    resumeId: string;
}

export const CreateApplicationService = async (
    input: CreateApplicationInput
): Promise<IApplication> => {
    const application = await ApplicationModel.create({
        ...input,
        status: "SAVED",
    });
    return application;
};

export const getUserApplicationsService = async (
    userId: string
): Promise<IApplication[]> => {
    return ApplicationModel.find({ userId }).sort({ createdAt: -1 });
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