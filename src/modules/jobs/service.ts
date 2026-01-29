import { getEmbedding } from "../../utils/embeddings.js";
import { calculateMatchFromEmbeddings } from "../../utils/match.js";
import { cosineSimilarity } from "../../utils/similarity.js";
import jobModel, { type IJob } from "./model.js";
import ResumeModel from "../resume/model.js";

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

interface MatchedJob {
    _id: string;
    title: string;
    company: string;
    location?: string;
    description: string;
    applyUrl: string;
    matchScore: number;
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

export const getMatchedJobsService = async (
    userId: string
): Promise<MatchedJob[]> => {
    const resume = await ResumeModel.findOne({ userId });

    if (!resume?.embedding) {
        throw new Error("Resume not found or missing embedding");
    }

    const jobs = await jobModel.find({ embedding: { $exists: true, $ne: [] } });

    const matchedJobs: MatchedJob[] = jobs.map((job) => {
        const match = calculateMatchFromEmbeddings(resume.embedding!, job.embedding!);
        return {
            _id: job._id.toString(),
            title: job.title,
            company: job.company,
            location: job.location,
            description: job.description,
            applyUrl: job.applyUrl,
            matchScore: match.score,
        };
    });

    return matchedJobs.sort((a, b) => b.matchScore - a.matchScore);
};

export interface JobMatchAnalysis {
    overallScore: number;
    matchSummary: string;
    skillsMatch: {
        matched: string[];
        missing: string[];
        matchPercentage: number;
    };
    keywordsAnalysis: {
        found: string[];
        required: string[];
        matchPercentage: number;
    };
    recommendations: string[];
}

const extractSkillsFromText = (text: string): string[] => {
    const commonSkills = [
        "javascript", "typescript", "python", "java", "c++", "c#", "go", "rust", "ruby", "php", "swift", "kotlin",
        "react", "angular", "vue", "svelte", "nextjs", "nuxtjs", "nodejs", "express", "fastapi", "django", "flask", "spring",
        "mongodb", "postgresql", "mysql", "redis", "elasticsearch", "dynamodb", "firebase",
        "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "jenkins", "github actions", "ci/cd",
        "git", "agile", "scrum", "jira", "rest api", "graphql", "microservices", "machine learning", "ai",
        "html", "css", "sass", "tailwind", "bootstrap", "figma", "sketch",
        "sql", "nosql", "data analysis", "data science", "tableau", "power bi",
        "leadership", "communication", "problem solving", "teamwork", "project management"
    ];

    const lowerText = text.toLowerCase();
    return commonSkills.filter(skill => lowerText.includes(skill));
};

const extractKeywordsFromJobDescription = (description: string): string[] => {
    const keywordPatterns = [
        /\b(required|requirements?|must have|essential)\b[:\s]*([\w\s,]+)/gi,
        /\b(experience with|proficient in|knowledge of|familiar with)\b\s*([\w\s,]+)/gi,
        /\b(\d+\+?\s*years?)\s*(of\s*)?(experience|expertise)/gi,
    ];
    
    const keywords: Set<string> = new Set();
    const lowerDesc = description.toLowerCase();
    
    const importantTerms = [
        "bachelor", "master", "degree", "certification", "certified",
        "senior", "junior", "mid-level", "lead", "architect", "manager",
        "remote", "hybrid", "onsite", "full-time", "part-time", "contract",
        "startup", "enterprise", "agile", "scrum", "kanban"
    ];
    
    importantTerms.forEach(term => {
        if (lowerDesc.includes(term)) {
            keywords.add(term);
        }
    });
    
    const skillsFound = extractSkillsFromText(description);
    skillsFound.forEach(skill => keywords.add(skill));
    
    return Array.from(keywords);
};

const generateRecommendations = (
    matchScore: number,
    missingSkills: string[],
    resumeSkills: string[]
): string[] => {
    const recommendations: string[] = [];
    
    if (matchScore < 50) {
        recommendations.push("Consider gaining more relevant experience before applying to this role.");
    }
    
    if (missingSkills.length > 0) {
        const topMissing = missingSkills.slice(0, 3);
        recommendations.push(`Add these skills to your resume if you have them: ${topMissing.join(", ")}.`);
    }
    
    if (matchScore >= 70 && matchScore < 85) {
        recommendations.push("Tailor your resume summary to highlight relevant experience for this role.");
    }
    
    if (matchScore >= 85) {
        recommendations.push("Your profile is a strong match! Apply with confidence.");
    }
    
    if (resumeSkills.length < 5) {
        recommendations.push("Consider adding more skills to your resume to improve matching.");
    }
    
    recommendations.push("Use keywords from the job description in your cover letter.");
    
    return recommendations.slice(0, 5);
};

export const analyzeJobMatchService = async (
    userId: string,
    jobDescription: string
): Promise<JobMatchAnalysis> => {
    const resume = await ResumeModel.findOne({ userId });
    
    if (!resume) {
        throw new Error("NO_RESUME");
    }
    
    if (!resume.embedding) {
        throw new Error("Resume embedding not found. Please re-upload your resume.");
    }
    
    const jobEmbedding = await getEmbedding(jobDescription);
    
    const similarity = cosineSimilarity(resume.embedding, jobEmbedding);
    const overallScore = Math.round(similarity * 100);
    
    const jobSkills = extractSkillsFromText(jobDescription);
    const resumeSkills = resume.skills.map(s => s.toLowerCase());
    
    const matchedSkills = jobSkills.filter(skill => 
        resumeSkills.some(rs => rs.includes(skill) || skill.includes(rs))
    );
    const missingSkills = jobSkills.filter(skill => 
        !resumeSkills.some(rs => rs.includes(skill) || skill.includes(rs))
    );
    
    const skillsMatchPercentage = jobSkills.length > 0 
        ? Math.round((matchedSkills.length / jobSkills.length) * 100)
        : 0;
    
    const requiredKeywords = extractKeywordsFromJobDescription(jobDescription);
    const resumeText = resume.text.toLowerCase();
    const foundKeywords = requiredKeywords.filter(kw => resumeText.includes(kw));
    
    const keywordsMatchPercentage = requiredKeywords.length > 0
        ? Math.round((foundKeywords.length / requiredKeywords.length) * 100)
        : 0;
    
    const matchSummary = overallScore >= 85
        ? "Excellent match! Your profile aligns very well with this position."
        : overallScore >= 70
        ? "Good match! You have many of the required qualifications."
        : overallScore >= 50
        ? "Moderate match. Consider highlighting relevant experience."
        : "Low match. This role may require skills you haven't listed.";
    
    const recommendations = generateRecommendations(overallScore, missingSkills, resume.skills);
    
    return {
        overallScore,
        matchSummary,
        skillsMatch: {
            matched: matchedSkills,
            missing: missingSkills,
            matchPercentage: skillsMatchPercentage,
        },
        keywordsAnalysis: {
            found: foundKeywords,
            required: requiredKeywords,
            matchPercentage: keywordsMatchPercentage,
        },
        recommendations,
    };
};