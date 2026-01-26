import { Schema, model, Document } from 'mongoose';

export interface IJob extends Document {
    title: string;
    company: string;
    location?: string;
    description: string;
    applyUrl: string;
    source: string;
    embedding?: number[];
    createdAt: Date;
    updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
    {
        title: {type: String, required: true, index: true },
        company: {type: String, required: true, index: true },
        location: {type: String},
        description: {type: String, required: true },
        applyUrl: {type: String, required: true, unique: true },
        source: {type: String, required: true },
        embedding: {type: [Number]},
        createdAt: {type: Date, default: Date.now},
        updatedAt: {type: Date, default: Date.now}
    },
    { timestamps: true }
);

export default model<IJob>("Job", JobSchema);