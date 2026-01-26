import { PDFParse } from "pdf-parse";
import { getOrCreateEmbedding } from "../../utils/embeddingCache.js";
import ResumeModel, {type Iresume} from "./model.js";
import { getEmbedding } from "../../utils/embeddings.js";

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
    const parsed = await new PDFParse(fileBuffer);
    const extractedText = await parsed.getText();
    if(!extractedText){
        throw new Error("Failed to extract text from PDF");
    }

    const embedding = await getEmbedding(extractedText.text);

    // save to DB
    const resume = await ResumeModel.create({
        userId,
        name: originalFileName,
        text: extractedText.text,
        embedding,
    });

    return resume;
};