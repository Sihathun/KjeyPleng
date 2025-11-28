import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root directory
dotenv.config({ path: path.resolve(__dirname, "../../..", ".env") });

// Create Gmail SMTP transporter
export const transporter = nodemailer.createTransport({
  service: "gmail",
  host: process.env.GMAIL_HOST || "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS, // Gmail App Password
  },
});

export const sender = {
  email: process.env.GMAIL_USER,
  name: "kjeyPleng",
};




