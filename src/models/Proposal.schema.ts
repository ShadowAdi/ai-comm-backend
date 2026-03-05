import mongoose, { Schema, Document } from "mongoose";

interface IProposalProduct {
    name: string;
    quantity: number;
    unit_price: number;
    total_cost: number;
}

export interface IProposal extends Document {
    industry: string;
    budget: number;
    goal: string;
    recommendedProducts: IProposalProduct[];
    budgetUsed: number;
    impactSummary: string;
    proposalSummary: string;
    createdAt: Date;
}

const ProposalProductSchema = new Schema<IProposalProduct>({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit_price: { type: Number, required: true },
    total_cost: { type: Number, required: true }
}, { _id: false });

const ProposalSchema = new Schema<IProposal>({
    industry: { type: String, required: true },
    budget: { type: Number, required: true },
    goal: { type: String, required: true },
    recommendedProducts: { type: [ProposalProductSchema], required: true },
    budgetUsed: { type: Number, required: true },
    impactSummary: { type: String, required: true },
    proposalSummary: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export const ProposalModel = mongoose.model<IProposal>("Proposal", ProposalSchema);
