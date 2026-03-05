import { logger } from "../config/logger.js";
import { AppError } from "../utils/AppError.js";
import ProductAIResult from "../models/ProductAIResult.schema.js";
import { IProductAIResponse, ProductAIRequest, IProductAI } from "../interface/ProductAIResult.interface.js";
import { callSarvamAI } from "../utils/sarvam-ai.util.js";
import { PRIMARY_CATEGORIES, SUSTAINABILITY_FILTERS } from "../constants/product-categories.js";

export const getPredefinedOptions = () => {
    return {
        primaryCategories: PRIMARY_CATEGORIES,
        sustainabilityFilters: SUSTAINABILITY_FILTERS,
    };
};

export const getAllAiCategorizeProduct = async (): Promise<IProductAIResponse[]> => {
    try {
        const aiProducts = await ProductAIResult.find().lean();
        return aiProducts as unknown as IProductAIResponse[];
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Failed to get all AI Categorize Product: ${errorMessage}`);
        throw new AppError('Failed to fetch AI categorized products', 500);
    }
};

/**
 * Get single AI categorized product by ID
 */
export const getAiCategorizeProductById = async (id: string): Promise<IProductAIResponse> => {
    try {
        const aiProduct = await ProductAIResult.findById(id).lean();
        
        if (!aiProduct) {
            throw new AppError(`AI Product not found with id: ${id}`, 404);
        }
        
        return aiProduct as unknown as IProductAIResponse;
    } catch (error: unknown) {
        if (error instanceof AppError) {
            throw error;
        }
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Failed to get AI Categorize Product by ID: ${errorMessage}`);
        throw new AppError('Failed to fetch AI product', 500);
    }
};


export const createAiCategorizeProduct = async (
    productData: ProductAIRequest
): Promise<IProductAIResponse> => {
    try {
        const { title, description } = productData;

        if (!title || title.trim().length === 0) {
            throw new AppError("Product title is required", 400);
        }

        logger.info(`Creating AI categorized product for: ${title}`);

        const aiResponse = await callSarvamAI(title, description);

        const productToSave: IProductAI = {
            title,
            description,
            primaryCategory: aiResponse.primaryCategory,
            subCategory: aiResponse.subCategory,
            seoTags: aiResponse.seoTags,
            sustainabilityFilters: aiResponse.sustainabilityFilters,
        };

        const savedProduct = await ProductAIResult.create(productToSave);
        
        logger.info(`Successfully created AI product with ID: ${savedProduct._id}`);

        return savedProduct.toObject() as unknown as IProductAIResponse;
    } catch (error: unknown) {
        if (error instanceof AppError) {
            throw error;
        }
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Failed to create AI Categorize Product: ${errorMessage}`);
        throw new AppError('Failed to create AI categorized product', 500);
    }
};