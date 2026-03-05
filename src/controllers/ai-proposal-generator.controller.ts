import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger.js";
import { generateProposal, getAllProposals, getProposalById } from "../services/ai-proposal-generator.service.js";
import { GenerateProposalRequest } from "../interface/Proposal.interface.js";
import { AppError } from "../utils/AppError.js";

const validateProposalRequest = (body: any): body is GenerateProposalRequest => {
    if (!body.industry || typeof body.industry !== "string") {
        throw new AppError("Industry is required and must be a string", 400);
    }

    if (!body.budget || typeof body.budget !== "number" || body.budget <= 0) {
        throw new AppError("Budget is required and must be a positive number", 400);
    }

    if (!body.goal || typeof body.goal !== "string") {
        throw new AppError("Goal is required and must be a string", 400);
    }

    if (body.industry.trim().length < 3) {
        throw new AppError("Industry must be at least 3 characters long", 400);
    }

    if (body.goal.trim().length < 10) {
        throw new AppError("Goal must be at least 10 characters long", 400);
    }

    if (body.budget > 1000000) {
        throw new AppError("Budget cannot exceed $1,000,000", 400);
    }

    return true;
};

export const createProposal = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        logger.info("Received proposal generation request");

        validateProposalRequest(req.body);

        const requestData: GenerateProposalRequest = {
            industry: req.body.industry.trim(),
            budget: req.body.budget,
            goal: req.body.goal.trim()
        };

        logger.info(`Generating proposal for industry: ${requestData.industry}, budget: $${requestData.budget}`);

        const result = await generateProposal(requestData);

        res.status(201).json({
            success: true,
            message: "Proposal generated successfully",
            data: result
        });
    } catch (error: unknown) {
        next(error);
    }
};

export const getProposals = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        logger.info("Fetching all proposals");
        const proposals = await getAllProposals();

        res.status(200).json({
            success: true,
            count: proposals.length,
            data: proposals
        });
    } catch (error: unknown) {
        next(error);
    }
};

export const getProposal = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        
        if (!id || typeof id !== "string") {
            throw new AppError("Invalid proposal ID", 400);
        }
        
        logger.info(`Fetching proposal with ID: ${id}`);
        
        const proposal = await getProposalById(id);

        res.status(200).json({
            success: true,
            data: proposal
        });
    } catch (error: unknown) {
        next(error);
    }
};
