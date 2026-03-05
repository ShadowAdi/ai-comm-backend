import axios from "axios";
import { logger } from "../config/logger.js";
import { AI_API_KEY } from "../config/dotenv.js";
import { AppError } from "./AppError.js";
import { ProductAIResponse } from "../interface/ProductAIResult.interface.js";
import { PRIMARY_CATEGORIES, SUSTAINABILITY_FILTERS } from "../constants/product-categories.js";

const SARVAM_API_URL = "https://api.sarvam.ai/v1/chat/completions";
const SARVAM_MODEL = "sarvam-m";

export const getProductCategorizationPrompt = (
    title: string,
    description?: string
): string => {
    return `You are an AI assistant for a sustainable commerce platform. Analyze the following product and provide categorization details.

Product Title: ${title}
Product Description: ${description || "Not provided"}

Please analyze this product and return a JSON object with the following structure:
{
    "primaryCategory": "string (choose from: ${PRIMARY_CATEGORIES.join(', ')})",
    "subCategory": "string (relevant sub-category)",
    "seoTags": ["array of 5-10 relevant SEO tags"],
    "sustainabilityFilters": ["array from: ${SUSTAINABILITY_FILTERS.join(', ')}"]
}

Return ONLY valid JSON, no additional text or explanation.`;
};

export const callSarvamAI = async (
    title: string,
    description?: string
): Promise<ProductAIResponse> => {
    try {
        const prompt = getProductCategorizationPrompt(title, description);

        logger.info(`Calling Sarvam AI for product: ${title}`);

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
                max_tokens: 2000,
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

        let parsedData: ProductAIResponse;
        try {
            const rawParsed = JSON.parse(rawContent);
            parsedData = normalizeAIResponse(rawParsed);
        } catch (parseError) {
            logger.error(`Failed to parse AI response as JSON: ${parseError}`);
            throw new Error("AI returned invalid JSON");
        }

        if (
            !parsedData.primaryCategory ||
            !parsedData.subCategory ||
            !parsedData.seoTags ||
            !parsedData.sustainabilityFilters
        ) {
            logger.error("AI response missing required fields");
            throw new Error("AI response missing required fields");
        }

        validateAIResponse(parsedData);

        logger.info(`Successfully processed AI response for: ${title}`);
        return parsedData;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            logger.error(`Sarvam AI API Error - Status: ${error.response?.status}`);
            logger.error(`Response Data: ${JSON.stringify(error.response?.data, null, 2)}`);
            console.error("STATUS:", error.response?.status);
            console.error("DATA:", JSON.stringify(error.response?.data, null, 2));
            console.error("HEADERS:", error.response?.headers);
        } else {
            logger.error(`Sarvam AI Error: ${error}`);
            console.error(error);
        }

        throw new AppError(
            "Sarvam AI request failed. Check logs for details.",
            500
        );
    }
};

const normalizeAIResponse = (rawResponse: any): ProductAIResponse => {
    return {
        primaryCategory: rawResponse.primaryCategory || rawResponse.primary_category || "",
        subCategory: rawResponse.subCategory || rawResponse.sub_category || "",
        seoTags: Array.isArray(rawResponse.seoTags)
            ? rawResponse.seoTags
            : Array.isArray(rawResponse.seo_tags)
            ? rawResponse.seo_tags
            : [],
        sustainabilityFilters: Array.isArray(rawResponse.sustainabilityFilters)
            ? rawResponse.sustainabilityFilters
            : Array.isArray(rawResponse.sustainability_filters)
            ? rawResponse.sustainability_filters
            : [],
    };
};

const validateAIResponse = (response: ProductAIResponse): void => {
    if (!PRIMARY_CATEGORIES.includes(response.primaryCategory as any)) {
        logger.warn(`Invalid primary category: ${response.primaryCategory}. Using first valid category.`);
        response.primaryCategory = PRIMARY_CATEGORIES[0];
    }

    const validFilters = response.sustainabilityFilters.filter(filter =>
        SUSTAINABILITY_FILTERS.includes(filter as any)
    );
    
    if (validFilters.length !== response.sustainabilityFilters.length) {
        logger.warn(`Some sustainability filters were invalid. Valid count: ${validFilters.length}/${response.sustainabilityFilters.length}`);
        response.sustainabilityFilters = validFilters as [string];
    }

    if (response.seoTags.length < 5) {
        logger.warn(`Only ${response.seoTags.length} SEO tags provided, expected 5-10`);
    }

    if (response.seoTags.length > 10) {
        logger.warn(`Too many SEO tags (${response.seoTags.length}), trimming to 10`);
        response.seoTags = response.seoTags.slice(0, 10) as [string];
    }
};
