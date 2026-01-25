import {Schema, model, Document } from 'mongoose';

export type ApplicationStatus = 
| "SAVED"
| "APPLIED"
| "INTERVIEW"
| "REJECTED"
| "OFFER";

export interface IApplication extends Document {
    userId: string;
    jobTitle: string;
    company: string;
    jobUrl: string;
    resumeId: string;
    status: ApplicationStatus;
    appliedAt?: Date;
    createdAt: Date;
    updatedAt?: Date;
}

const ApplicationSchema = new Schema<IApplication>({
    userId: { type: String, required: true , index: true },
    jobTitle: { type: String, required: true},
    company: {type: String, required: true},
    jobUrl: { type: String, required: true},
    resumeId: { type: String, required: true},
    status: {type: String, enum: ["SAVED", "APPLIED", "INTERVIEW", "REJECTED", "OFFER"], default: "SAVED"},
    appliedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default model<IApplication>("Application", ApplicationSchema);
