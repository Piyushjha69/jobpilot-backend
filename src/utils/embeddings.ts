import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../config/env.js";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);

export const getEmbedding = async (text: string): Promise<number[]> => {
    const model = genAI.getGenerativeModel({
        model: "text-embedding-004",
    });

    const result = await model.embedContent(text);
    return result.embedding.values;
}
