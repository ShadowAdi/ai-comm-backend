import { Request, Response, NextFunction } from "express";
import { generateImpactReport, getAllImpactReports, getImpactReportByOrderId } from "../services/ai-impact-report.service.js";
import { GenerateImpactRequest } from "../interface/ImpactReport.interface.js";
import { AppError } from "../utils/AppError.js";

export const generateImpactReportController = async (
    req: Request<{}, {}, GenerateImpactRequest>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { orderId, products } = req.body;

        if (!orderId || !products || !Array.isArray(products) || products.length === 0) {
            throw new AppError("Invalid request: orderId and products array required", 400);
        }

        for (const product of products) {
            if (!product.name || typeof product.quantity !== "number" || product.quantity <= 0) {
                throw new AppError("Invalid product: name and positive quantity required", 400);
            }
        }

        const result = await generateImpactReport(orderId, products);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const getAllImpactReportsController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const reports = await getAllImpactReports();
        res.status(200).json(reports);
    } catch (error) {
        next(error);
    }
};

export const getImpactReportByOrderIdController = async (
    req: Request<{ orderId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { orderId } = req.params;

        if (!orderId) {
            throw new AppError("Order ID is required", 400);
        }

        const report = await getImpactReportByOrderId(orderId);
        res.status(200).json(report);
    } catch (error) {
        next(error);
    }
};
