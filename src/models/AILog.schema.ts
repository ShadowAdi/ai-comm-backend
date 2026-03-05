import mongoose, { Schema, Document } from "mongoose";

export interface IAILog extends Document {
    module: string;
    prompt: string;
    response: string;
    createdAt: Date;
}

const AILogSchema = new Schema<IAILog>({
    module: { type: String, required: true },
    prompt: { type: String, required: true },
    response: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export const AILogModel = mongoose.model<IAILog>("AILog", AILogSchema);
