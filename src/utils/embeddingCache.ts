import { getEmbedding } from "./embeddings.js";

export const getOrCreateEmbedding = async (
    text: string,
    existingEmbedding?: number[],
    saveFn?: (embedding: number[]) => Promise<void>
): Promise<number []> => {
    //if already cached -> return
    if (existingEmbedding && existingEmbedding.length > 0) {
        return existingEmbedding;
    }

    //generate embedding (Gemini call)
    const embedding = await getEmbedding(text);

    //persist if save function provided
    if (saveFn) {
        await saveFn(embedding);
    }

    return embedding;
};