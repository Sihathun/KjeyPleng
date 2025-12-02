// Vercel serverless function entry point
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

import productRoutes from "../routes/productRoutes.js";
import authRoutes from "../routes/authRoutes.js";
import subscriptionRoutes from "../routes/subscriptionRoutes.js";
import { sql } from "../config/db.js";

const app = express();

app.use(cookieParser());

// CORS configuration for production and development
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(null, true);
        }
    },
    credentials: true,
}));

app.use(express.json());
app.use(helmet({
    contentSecurityPolicy: false,
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/subscription", subscriptionRoutes);

// Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Root route
app.get("/", (req, res) => {
    res.json({ message: "KjeyPleng API is running" });
});

// Export for Vercel
export default app;
