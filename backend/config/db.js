import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, DATABASE_URL } = process.env;

// Check if required env vars are present
if (!DATABASE_URL && (!PGHOST || !PGDATABASE || !PGUSER || !PGPASSWORD)) {
    console.error("Missing database configuration. Please set DATABASE_URL or PGHOST, PGDATABASE, PGUSER, PGPASSWORD");
}

// Use DATABASE_URL if available, otherwise construct from parts
const connectionString = DATABASE_URL || 
    `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`;

// creates a sql connection using our env variables through neon db
export const sql = neon(connectionString);

//this sql function  we export is used as a tagged template literal, which allows us to write SQL queries safely
