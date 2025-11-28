import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import {sql} from "./config/db.js";
import {aj} from "./lib/arcjet.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log(PORT);

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(helmet());
app.use(morgan("dev"));

// apply arcjet rate-limit to all routes

app.use(async (req, res, next) => {
    try {
        const decision = await aj.protect(req, {
            requested: 1 // specifies that each request consumes 1 token
        });

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                res.status(429).json({
                    error: "Too many requests",
                })
            } else if (decision.reason.isBot()) {
                res.status(403).json({
                    error: "Bot access denied",
                })
            } else {
                res.status(403).json({error: "Forbidden"});
            }
            return;
        }   

        //check for spoofed bots
        
        if (decision.results.some((result) => result.reason.isBot()  && result.reason.isSpoofed())) {
            res.status(403).json({error: "Spoofed bot detected"});
            return;
        }

        next();
    } catch (error) {
        console.log("Arcjet error", error);
        next(error);

    }
})

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// initializing database
async function initDB() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS instruments (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                image VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                description VARCHAR(255) NOT NULL,
                condition VARCHAR(255) NOT NULL,
                location VARCHAR(255) NOT NULL,
                availability BOOLEAN NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS userSchema (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                lastLogin TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                isVerified BOOLEAN NOT NULL DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                resetPasswordToken VARCHAR(255),
                resetPasswordExpiresAt TIMESTAMP,
                verificationToken VARCHAR(255),
                verificationTokenExpiresAt TIMESTAMP
            )            
        `;

        console.log("Database initialized successfully")
    } catch (error) {
        console.log("Error initializing DB", error);
    }


}


// this basically initialize the database first then host the server
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    })
})