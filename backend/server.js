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
        // User schema
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

        // Instruments/Products schema - Updated for marketplace with rental support
        await sql`
            CREATE TABLE IF NOT EXISTS instruments (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES userSchema(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                category VARCHAR(100) NOT NULL,
                brand VARCHAR(100),
                image VARCHAR(500) NOT NULL,
                images TEXT[],
                condition VARCHAR(50) NOT NULL,
                location VARCHAR(255) NOT NULL,
                listing_type VARCHAR(20) NOT NULL DEFAULT 'sale',
                sale_price DECIMAL(10, 2),
                rental_price DECIMAL(10, 2),
                rental_period VARCHAR(50),
                is_available BOOLEAN NOT NULL DEFAULT TRUE,
                is_approved BOOLEAN NOT NULL DEFAULT FALSE,
                views INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Rentals table for tracking rental transactions
        await sql`
            CREATE TABLE IF NOT EXISTS rentals (
                id SERIAL PRIMARY KEY,
                instrument_id INTEGER NOT NULL REFERENCES instruments(id) ON DELETE CASCADE,
                renter_id INTEGER NOT NULL REFERENCES userSchema(id) ON DELETE CASCADE,
                owner_id INTEGER NOT NULL REFERENCES userSchema(id) ON DELETE CASCADE,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                total_price DECIMAL(10, 2) NOT NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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