import { Router } from "express";
import {
    getAllAiProducts,
    getAiProductById,
    createAiProduct,
} from "../controllers/ai-categorize-product.controller.js";

const router = Router();

/**
 * @route   GET /api/ai-products
 * @desc    Get all AI categorized products
 * @access  Public
 */
router.get("/", getAllAiProducts);

/**
 * @route   GET /api/ai-products/:id
 * @desc    Get single AI categorized product by ID
 * @access  Public
 */
router.get("/:id", getAiProductById);

/**
 * @route   POST /api/ai-products
 * @desc    Create new AI categorized product using Sarvam AI
 * @access  Public
 * @body    { title: string, description?: string }
 */
router.post("/", createAiProduct);

export default router;
