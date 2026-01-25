import { Schema, model, Document } from "mongoose";

export interface Iuser extends Document {
    id: string;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

 const userSchema = new Schema<Iuser>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true},
        password: { type: String, required: true, minlength: 6 },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    },
    { timestamps: true }
 ); 

 export default model<Iuser>("User", userSchema);
