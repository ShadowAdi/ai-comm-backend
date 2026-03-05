import axios from "axios";
import { logger } from "../config/logger.js";
import { AI_API_KEY } from "../config/dotenv.js";
import { AppError } from "../utils/AppError.js";
import { GenerateProposalRequest, ProposalResponse } from "../interface/Proposal.interface.js";
import { ProposalModel } from "../models/Proposal.schema.js";
import { AILogModel } from "../models/AILog.schema.js";

const SARVAM_API_URL = "https://api.sarvam.ai/v1/chat/completions";
const SARVAM_MODEL = "sarvam-m";
const MODULE_NAME = "B2B_PROPOSAL_GENERATOR";

const buildProposalPrompt = (requestData: GenerateProposalRequest): string => {
    return `You are an AI assistant for a sustainable commerce platform. Generate a B2B proposal for sustainable products based on the following requirements:

Industry: ${requestData.industry}
Budget: $${requestData.budget}
Goal: ${requestData.goal}

Please analyze these requirements and generate a detailed proposal with sustainable product recommendations. Return a JSON object with the following structure:
{
    "recommended_products": [
        {
            "name": "string (specific product name)",
            "quantity": number,
            "unit_price": number,
            "total_cost": number
        }
    ],
    "budget_used": number (total cost of all products, must not exceed ${requestData.budget}),
    "impact_summary": "string (describe environmental impact of switching to these products)",
    "proposal_summary": "string (professional summary of the proposal tailored to the industry)"
}

Requirements:
- Recommend 3-7 sustainable products relevant to the industry and goal
- Stay within the budget of $${requestData.budget}
- Focus on products that replace non-sustainable alternatives
- Calculate accurate costs (quantity * unit_price = total_cost)
- Provide realistic unit prices for sustainable products
- Create meaningful impact and proposal summaries

Return ONLY valid JSON, no additional text or explanation.`;
};

const callSarvamAI = async (prompt: string): Promise<string> => {
    try {
        logger.info(`Calling Sarvam AI for proposal generation`);

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
                max_tokens: 3000,
            },
            {
                headers: {
                    "api-subscription-key": AI_API_KEY,
                    "Content-Type": "application/json",
                },
                timeout: 30000,
            }
        );

        const rawContent = response.data?.choices?.[0]?.message?.content;
        if (!rawContent) {
            logger.error("No content in Sarvam AI response");
            throw new Error("No content in Sarvam response");
        }

        logger.info(`Sarvam AI raw response: ${rawContent}`);
        return rawContent;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            logger.error(`Sarvam AI API Error - Status: ${error.response?.status}`);
            logger.error(`Response Data: ${JSON.stringify(error.response?.data, null, 2)}`);
        } else {
            logger.error(`Sarvam AI Error: ${error}`);
        }

        throw new AppError(
            "Sarvam AI request failed. Check logs for details.",
            500
        );
    }
};

const parseAIResponse = (rawContent: string): ProposalResponse => {
    try {
        const parsed = JSON.parse(rawContent);
        
        if (!parsed.recommended_products || !Array.isArray(parsed.recommended_products)) {
            throw new Error("Missing or invalid recommended_products array");
        }

        if (typeof parsed.budget_used !== "number") {
            throw new Error("Missing or invalid budget_used");
        }

        if (!parsed.impact_summary || !parsed.proposal_summary) {
            throw new Error("Missing impact_summary or proposal_summary");
        }

        for (const product of parsed.recommended_products) {
            if (!product.name || typeof product.quantity !== "number" || 
                typeof product.unit_price !== "number" || typeof product.total_cost !== "number") {
                throw new Error("Invalid product structure in recommended_products");
            }
        }

        return parsed as ProposalResponse;
    } catch (parseError) {
        logger.error(`Failed to parse AI response: ${parseError}`);
        throw new AppError("AI returned invalid JSON format", 500);
    }
};

const saveAILog = async (prompt: string, response: string): Promise<void> => {
    try {
        await AILogModel.create({
            module: MODULE_NAME,
            prompt,
            response,
            createdAt: new Date()
        });
        logger.info(`AI log saved for module: ${MODULE_NAME}`);
    } catch (error) {
        logger.error(`Failed to save AI log: ${error}`);
    }
};

const saveProposal = async (
    requestData: GenerateProposalRequest,
    aiResponse: ProposalResponse
) => {
    try {
        const proposal = await ProposalModel.create({
            industry: requestData.industry,
            budget: requestData.budget,
            goal: requestData.goal,
            recommendedProducts: aiResponse.recommended_products,
            budgetUsed: aiResponse.budget_used,
            impactSummary: aiResponse.impact_summary,
            proposalSummary: aiResponse.proposal_summary,
            createdAt: new Date()
        });

        logger.info(`Proposal saved with ID: ${proposal._id}`);
        return proposal;
    } catch (error) {
        logger.error(`Failed to save proposal: ${error}`);
        throw new AppError("Failed to save proposal to database", 500);
    }
};

export const generateProposal = async (requestData: GenerateProposalRequest) => {
    const prompt = buildProposalPrompt(requestData);
    
    const rawResponse = await callSarvamAI(prompt);
    
    await saveAILog(prompt, rawResponse);
    
    const parsedResponse = parseAIResponse(rawResponse);
    
    if (parsedResponse.budget_used > requestData.budget) {
        logger.warn(`AI proposal exceeded budget: ${parsedResponse.budget_used} > ${requestData.budget}`);
        throw new AppError(
            `Generated proposal exceeds budget: $${parsedResponse.budget_used} > $${requestData.budget}`,
            400
        );
    }
    
    const savedProposal = await saveProposal(requestData, parsedResponse);
    
    return {
        proposal_id: savedProposal._id,
        ...parsedResponse
    };
};

export const getAllProposals = async () => {
    try {
        logger.info("Fetching all proposals");
        const proposals = await ProposalModel.find().sort({ createdAt: -1 });
        return proposals;
    } catch (error) {
        logger.error(`Failed to fetch proposals: ${error}`);
        throw new AppError("Failed to fetch proposals from database", 500);
    }
};

export const getProposalById = async (id: string) => {
    try {
        logger.info(`Fetching proposal with ID: ${id}`);
        const proposal = await ProposalModel.findById(id);
        
        if (!proposal) {
            throw new AppError("Proposal not found", 404);
        }
        
        return proposal;
    } catch (error: any) {
        if (error.name === "CastError") {
            throw new AppError("Invalid proposal ID format", 400);
        }
        if (error instanceof AppError) {
            throw error;
        }
        logger.error(`Failed to fetch proposal: ${error}`);
        throw new AppError("Failed to fetch proposal from database", 500);
    }
};
