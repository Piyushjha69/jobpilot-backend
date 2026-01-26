import { Schema, model, Document } from 'mongoose';

export interface Iresume extends Document {
    userId: string;
    name: string;
    text: string;
    embedding?: number[];
    email: string;
    skills: string[];
    experience: Array<{
        company: string;
        position: string;
        duration: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const resumeSchema = new Schema<Iresume>({
    userId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    text: { type: String, required: true },
    embedding: { type: [Number] },
    email: { type: String, required: true, unique: true },
    skills: { type: [String], required: true },
    experience: {
        type: [{ company: String, position: String, duration: String }],
        default: []
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})

export default model<Iresume>('Resume', resumeSchema);