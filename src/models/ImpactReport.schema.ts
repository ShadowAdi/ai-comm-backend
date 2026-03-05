import mongoose, { Schema, Document } from "mongoose";

export interface IImpactReport extends Document {
    orderId: string;
    plasticSavedKg: number;
    carbonAvoidedKg: number;
    localSourcingSummary: string;
    impactStatement: string;
    createdAt: Date;
}

const ImpactReportSchema = new Schema<IImpactReport>({
    orderId: { type: String, required: true, unique: true },
    plasticSavedKg: { type: Number, required: true },
    carbonAvoidedKg: { type: Number, required: true },
    localSourcingSummary: { type: String, required: true },
    impactStatement: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export const ImpactReportModel = mongoose.model<IImpactReport>("ImpactReport", ImpactReportSchema);
