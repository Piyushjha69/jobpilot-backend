import { getEmbedding } from "./embeddings.js"
import { cosineSimilarity } from "./similarity.js";

export const calculateMatchFromEmbeddings =  (
    resumeEmbedding: number[],
    jobEmbedding: number[]
) => {
    const similarity = cosineSimilarity(resumeEmbedding, jobEmbedding);

    return {
        score: Math.round(similarity * 100),
        summary: similarity > 0.7
            ? "Strong match based on skills and experience."
            : similarity > 0.4
            ? "Moderate match, some skills align."
            : "Weak match, missing key skills."
    };   
};
