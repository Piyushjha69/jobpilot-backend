import pdfParse from "pdf-parse";
import ResumeModel, {type Iresume} from "./model.js";

interface UploadResumeInput {
    userId: string;
    fileBuffer: Buffer;
    originalFileName: string;
}

export const uploadResumeService = async (
    input: UploadResumeInput
): Promise<Iresume> => {
    const { userId, fileBuffer, originalFileName } = input;

    //Parse PDF
    const parsed = await pdfParse(fileBuffer);
    const extractedText = parsed.text;
    if(!extractedText){
        throw new Error("Failed to extract text from PDF");
    }

    // save to DB
    const resume = await ResumeModel.create({
        userId,
        name: originalFileName,
        text: extractedText
    });

    return resume;
};