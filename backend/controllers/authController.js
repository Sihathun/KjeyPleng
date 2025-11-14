import {sql} from "../config/db.js";
import bcryptjs from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail } from "../mailtrap/emails.js";

export const signUp = async (req, res) => {
    const {email, password, name} = req.body;
    try {
        if (!email || !password || !name) {
            throw new Error("All fields are required");
        }

        const userAlreadyExists = await sql`
            SELECT email FROM userschema WHERE email=${email}
        `;

        if (userAlreadyExists.length > 0) {
            return res.status(400).json({success: false, message: "User already exists"});
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationTokenExpiresAt = new Date(Date.now() + 25 * 60 * 60 * 1000);

        //adding to db
        const user = await sql`
            INSERT INTO userschema (email, password, name, verificationtoken, verificationtokenexpiresat)
            VALUES (${email}, ${hashedPassword}, ${name}, ${verificationToken}, ${verificationTokenExpiresAt})
            RETURNING *
        `;

        // jwt
        generateTokenAndSetCookie(res, user[0].id);
        await sendVerificationEmail(user[0].email, verificationToken);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            createdUser: {
                name: user[0].name,
            }
        })


    } catch (error) {
        res.status(400).json({success: false, message: error.message});
    }
};

export const verifyEmail = async (req, res) => {
    const {code} = req.body;

    try {
        const user = await sql`
            SELECT * FROM userschema WHERE verificationtoken=${code} AND verificationtokenexpiresat > NOW() LIMIT 1
        `;

        if (user.length === 0) {
            return res.status(400).json({success: false, message: "Invalid or expired verification code"});
        }

        const updatedUser = await sql`
            UPDATE userschema
            SET
                isverified= TRUE,
                verificationtoken= NULL,
                verificationtokenexpiresat = NULL,
                updated_at = NOW()
            WHERE id = ${user[0].id}
            RETURNING *
        `;

        await sendWelcomeEmail(user[0].email, user[0].name);

        
    } catch (error) {

    }
}

export const logIn = async (req, res) => {
    res.send("Login route");
};

export const logOut = async (req, res) => {
    res.send("Logout route");
};