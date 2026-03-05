import mongoose, { Schema, Document } from 'mongoose';
import { IProductAI } from '../interface/ProductAIResult.interface.js';

export interface IProductAIDocument extends IProductAI, Document {}

const ProductAIResultSchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        primaryCategory: {
            type: String,
            required: true,
            trim: true
        },
        subCategory: {
            type: String,
            required: true,
            trim: true
        },
        seoTags: {
            type: [String],
            default: []
        },
        sustainabilityFilters: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<IProductAIDocument>('ProductAIResult', ProductAIResultSchema);
