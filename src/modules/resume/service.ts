import { PDFParse } from "pdf-parse";
import ResumeModel, { type Iresume } from "./model.js";
import { getEmbedding } from "../../utils/embeddings.js";

interface UploadResumeInput {
    userId: string;
    fileBuffer: Buffer;
    originalFileName: string;
}

interface ParsedResumeData {
    text: string;
    email: string;
    skills: string[];
    experience: Array<{
        company: string;
        position: string;
        duration: string;
    }>;
}

const extractEmailFromText = (text: string): string => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailRegex);
    return matches ? matches[0] : "";
};

const extractSkillsFromText = (text: string): string[] => {
    const commonSkills = [
        "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Ruby", "Go", "Rust", "PHP",
        "React", "Angular", "Vue", "Next.js", "Node.js", "Express", "Django", "Flask", "Spring",
        "MongoDB", "PostgreSQL", "MySQL", "Redis", "GraphQL", "REST", "API",
        "AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Git", "GitHub",
        "HTML", "CSS", "SASS", "TailwindCSS", "Bootstrap", "Material UI",
        "Machine Learning", "AI", "Data Science", "TensorFlow", "PyTorch",
        "Agile", "Scrum", "Jira", "Figma", "UI/UX", "Design",
        "SQL", "NoSQL", "Linux", "Windows", "MacOS",
        "Communication", "Leadership", "Problem Solving", "Team Work"
    ];

    const foundSkills: string[] = [];
    const lowerText = text.toLowerCase();

    for (const skill of commonSkills) {
        if (lowerText.includes(skill.toLowerCase())) {
            foundSkills.push(skill);
        }
    }

    return [...new Set(foundSkills)].slice(0, 15);
};

const parseResumeText = (text: string): ParsedResumeData => {
    return {
        text,
        email: extractEmailFromText(text),
        skills: extractSkillsFromText(text),
        experience: []
    };
};

export const uploadResumeService = async (
    input: UploadResumeInput
): Promise<Iresume> => {
    const { userId, fileBuffer, originalFileName } = input;

    // Parse PDF - convert Buffer to Uint8Array for pdf-parse
    const uint8Array = new Uint8Array(fileBuffer);
    const pdfParser = new PDFParse({ data: uint8Array });
    const textResult = await pdfParser.getText();
    const extractedText = textResult.text;

    if (!extractedText || extractedText.trim().length === 0) {
        throw new Error("Failed to extract text from PDF");
    }

    // Parse resume data
    const parsedData = parseResumeText(extractedText);

    // Generate embedding (skip if no embedding service configured)
    let embedding: number[] = [];
    try {
        embedding = await getEmbedding(extractedText);
    } catch (err) {
        console.log("Embedding generation skipped:", err);
    }

    // Check if resume already exists for this user
    const existingResume = await ResumeModel.findOne({ userId });

    if (existingResume) {
        // Update existing resume
        existingResume.name = originalFileName;
        existingResume.text = parsedData.text;
        existingResume.email = parsedData.email || existingResume.email;
        existingResume.skills = parsedData.skills;
        existingResume.experience = parsedData.experience;
        existingResume.embedding = embedding;
        existingResume.updatedAt = new Date();
        await existingResume.save();
        return existingResume;
    }

    // Create new resume
    const resume = await ResumeModel.create({
        userId,
        name: originalFileName,
        text: parsedData.text,
        email: parsedData.email || "",
        skills: parsedData.skills,
        experience: parsedData.experience,
        embedding,
    });

    return resume;
};

export const getResumeService = async (userId: string): Promise<Iresume | null> => {
    const resume = await ResumeModel.findOne({ userId });
    return resume;
};

export const deleteResumeService = async (userId: string): Promise<boolean> => {
    const result = await ResumeModel.deleteOne({ userId });
    return result.deletedCount > 0;
};
