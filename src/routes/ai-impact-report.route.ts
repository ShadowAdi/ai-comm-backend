import { Router } from "express";
import { generateImpactReportController, getAllImpactReportsController, getImpactReportByOrderIdController } from "../controllers/ai-impact-report.controller.js";

const router = Router();

router.post("/generate-impact-report", generateImpactReportController);
router.get("/impact-reports", getAllImpactReportsController);
router.get("/impact-reports/:orderId", getImpactReportByOrderIdController);

export default router;
