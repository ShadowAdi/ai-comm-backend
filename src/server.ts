import express from "express";
import helmet from "helmet";
import { CorsConfig } from "./config/cors.js";
import { healthRouter } from "./routes/health.route.js";


const app = express()

app.use(helmet())
CorsConfig(app)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/api/health", healthRouter);


app.get('/', (_req, res) => {
    res.json({
        service: 'ai-commerce-backend',
        status: 'running',
        version: '2.1.0',
        features: {
        },
        endpoints: {
            health: '/api/health',
        }
    });
});

// app.use(CustomErrorHandler)

export default app