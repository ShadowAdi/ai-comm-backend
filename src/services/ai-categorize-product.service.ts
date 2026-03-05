import { logger } from "../config/logger.js"
import { AppError } from "../utils/AppError.js"
import ProductAIResult from "../models/ProductAIResult.schema.js";
import { IProductAIResponse } from "../interface/ProductAIResult.interface.js";\

export const getAllAiCategorizeProduct = async ():Promise<IProductAIResponse[]> => {
    try {
        const aiProducts=await ProductAIResult.find().lean()
        return aiProducts as IProductAIResponse[]
    } catch (error) {
        logger.error(`Failed to get all AI Categorize Product: ${error}`)
        console.error(`Failed to get all AI Categorize Product: ${error}`)
        throw new AppError(`Internal Server Error`, 500)
    }
}