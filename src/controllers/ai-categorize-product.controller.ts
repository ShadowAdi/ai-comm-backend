import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger.js";
import {
    getAllAiCategorizeProduct,
    getAiCategorizeProductById,
    createAiCategorizeProduct,
} from "../services/ai-categorize-product.service.js";
import { ProductAIRequest } from "../interface/ProductAIResult.interface.js";

export const getAllAiProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        logger.info("Fetching all AI categorized products");
        const products = await getAllAiCategorizeProduct();

        res.status(200).json({
            success: true,
            count: products.length,
            data: products,
        });
    } catch (error: unknown) {
        next(error);
    }
};

export const getAiProductById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        logger.info(`Fetching AI product with ID: ${id}`);

        const product = await getAiCategorizeProductById(String(id));

        res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error: unknown) {
        next(error);
    }
};

export const createAiProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const productRequest: ProductAIRequest = req.body;
        
        logger.info(`Creating AI product: ${productRequest.title}`);

        const product = await createAiCategorizeProduct(productRequest);

        res.status(201).json({
            success: true,
            message: "AI product created successfully",
            data: product,
        });
    } catch (error: unknown) {
        next(error);
    }
};
