import { Router } from "express";
import { createProposal, getProposals, getProposal } from "../controllers/ai-proposal-generator.controller.js";

const router = Router();

router.get("/proposals", getProposals);
router.get("/proposals/:id", getProposal);
router.post("/generate-proposal", createProposal);

export default router;
