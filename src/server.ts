import express from "express";
import helmet from "helmet";
import { CorsConfig } from "./config/cors.js";
import { healthRouter } from "./routes/health.route.js";
import aiCategorizeProductRouter from "./routes/ai-categorize-product.route.js";
import aiProposalGeneratorRouter from "./routes/ai-proposal-generator.route.js";
import { CustomErrorHandler } from "./middlewares/custom-error.middleware.js";


const app = express()

app.use(helmet())
CorsConfig(app)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/api/health", healthRouter);
app.use("/api/ai-products", aiCategorizeProductRouter);
app.use("/api/ai", aiProposalGeneratorRouter);


app.get('/', (_req, res) => {
    res.json({
        service: 'ai-commerce-backend',
        status: 'running',
        version: '1.0.0',
        features: {
            aiCategorization: 'Auto-categorize products using Sarvam AI',
            aiProposalGenerator: 'Generate B2B sustainable product proposals',
        },
        endpoints: {
            health: '/api/health',
            aiProducts: '/api/ai-products',
            aiProposals: '/api/ai/generate-proposal',
        }
    });
});

app.use(CustomErrorHandler)

export default app