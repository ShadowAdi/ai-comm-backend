import { Router } from "express";
import {
    getAllAiProducts,
    getAiProductById,
    createAiProduct,
    getOptions,
} from "../controllers/ai-categorize-product.controller.js";

const router = Router();

router.get("/options", getOptions);
router.get("/", getAllAiProducts);
router.get("/:id", getAiProductById);
router.post("/", createAiProduct);

export default router;
