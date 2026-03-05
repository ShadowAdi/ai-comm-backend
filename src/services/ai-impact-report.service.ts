import axios from "axios";
import { logger } from "../config/logger.js";
import { AI_API_KEY } from "../config/dotenv.js";
import { ImpactProduct, ImpactReportResponse } from "../interface/ImpactReport.interface.js";
import { ImpactReportModel } from "../models/ImpactReport.schema.js";
import { AILogModel } from "../models/AILog.schema.js";
import { AppError } from "../utils/AppError.js";

const SARVAM_API_URL = "https://api.sarvam.ai/v1/chat/completions";
const SARVAM_MODEL = "sarvam-m";

interface ImpactValues {
    plasticEquivalent: number;
    carbonEquivalent: number;
}

const IMPACT_MAP: Record<string, ImpactValues> = {
    "compostable coffee cups": { plasticEquivalent: 12, carbonEquivalent: 0.05 },
    "bamboo cutlery": { plasticEquivalent: 8, carbonEquivalent: 0.03 },
    "plastic cup": { plasticEquivalent: 12, carbonEquivalent: 0.05 },
    "plastic cutlery": { plasticEquivalent: 8, carbonEquivalent: 0.03 },
};

const getImpactValues = (productName: string): ImpactValues => {
    const normalizedName = productName.toLowerCase();
    
    for (const [key, value] of Object.entries(IMPACT_MAP)) {
        if (normalizedName.includes(key) || key.includes(normalizedName)) {
            return value;
        }
    }
    
    return { plasticEquivalent: 10, carbonEquivalent: 0.04 };
};

const calculateImpact = (products: ImpactProduct[]): { plasticSavedKg: number; carbonAvoidedKg: number } => {
    let totalPlasticGrams = 0;
    let totalCarbonKg = 0;

    for (const product of products) {
        const { plasticEquivalent, carbonEquivalent } = getImpactValues(product.name);
        
        totalPlasticGrams += plasticEquivalent * product.quantity;
        totalCarbonKg += carbonEquivalent * product.quantity;
    }

    const plasticSavedKg = totalPlasticGrams / 1000;
    const carbonAvoidedKg = totalCarbonKg;

    return { plasticSavedKg, carbonAvoidedKg };
};

const generateAISummary = async (
    plasticSavedKg: number,
    carbonAvoidedKg: number
): Promise<string> => {
    const prompt = `Generate a concise sustainability impact statement for an eco-friendly order.

Plastic saved: ${plasticSavedKg} kg
CO₂ emissions avoided: ${carbonAvoidedKg} kg

Create a single sentence highlighting these environmental benefits and mention support for sustainable sourcing. Be inspiring but factual.`;

    try {
        logger.info("Calling Sarvam AI for impact statement generation");

        const response = await axios.post(
            SARVAM_API_URL,
            {
                messages: [
                    {
                        content: prompt,
                        role: "user",
                    },
                ],
                model: SARVAM_MODEL,
                max_tokens: 200,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "API-Subscription-Key": AI_API_KEY,
                },
            }
        );

        const aiResponse = response.data.choices[0]?.message?.content || "";

        await AILogModel.create({
            module: "ai-impact-report",
            prompt,
            response: aiResponse,
        });

        logger.info("AI impact statement generated successfully");

        return aiResponse.trim();
    } catch (error: any) {
        logger.error(`Sarvam AI error: ${error.message}`);
        throw new AppError(`AI service error: ${error.message}`, 500);
    }
};

export const generateImpactReport = async (
    orderId: string,
    products: ImpactProduct[]
): Promise<ImpactReportResponse> => {
    try {
        logger.info(`Generating impact report for order: ${orderId}`);

        const { plasticSavedKg, carbonAvoidedKg } = calculateImpact(products);

        const localSourcingSummary = "This order supports sustainable and local sourcing practices.";

        const impactStatement = await generateAISummary(plasticSavedKg, carbonAvoidedKg);

        await ImpactReportModel.create({
            orderId,
            plasticSavedKg,
            carbonAvoidedKg,
            localSourcingSummary,
            impactStatement,
        });

        logger.info(`Impact report saved for order: ${orderId}`);

        return {
            plastic_saved_kg: parseFloat(plasticSavedKg.toFixed(2)),
            carbon_avoided_kg: parseFloat(carbonAvoidedKg.toFixed(2)),
            local_sourcing_summary: localSourcingSummary,
            impact_statement: impactStatement,
        };
    } catch (error: any) {
        logger.error(`Impact report generation failed: ${error.message}`);
        throw error;
    }
};

export const getAllImpactReports = async (): Promise<ImpactReportResponse[]> => {
    try {
        logger.info("Fetching all impact reports");

        const reports = await ImpactReportModel.find().sort({ createdAt: -1 }).lean();

        return reports.map(report => ({
            plastic_saved_kg: parseFloat(report.plasticSavedKg.toFixed(2)),
            carbon_avoided_kg: parseFloat(report.carbonAvoidedKg.toFixed(2)),
            local_sourcing_summary: report.localSourcingSummary,
            impact_statement: report.impactStatement,
        }));
    } catch (error: any) {
        logger.error(`Failed to fetch impact reports: ${error.message}`);
        throw error;
    }
};

export const getImpactReportByOrderId = async (orderId: string): Promise<ImpactReportResponse> => {
    try {
        logger.info(`Fetching impact report for order: ${orderId}`);

        const report = await ImpactReportModel.findOne({ orderId }).lean();

        if (!report) {
            throw new AppError(`Impact report not found for order: ${orderId}`, 404);
        }

        return {
            plastic_saved_kg: parseFloat(report.plasticSavedKg.toFixed(2)),
            carbon_avoided_kg: parseFloat(report.carbonAvoidedKg.toFixed(2)),
            local_sourcing_summary: report.localSourcingSummary,
            impact_statement: report.impactStatement,
        };
    } catch (error: any) {
        logger.error(`Failed to fetch impact report: ${error.message}`);
        throw error;
    }
};
