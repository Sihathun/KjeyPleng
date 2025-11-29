import {sql} from "../config/db.js";

import bcryptjs from "bcryptjs";
import crypto from "crypto";

import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail } from "../mailtrap/emails.js";
import { uploadImage, deleteImage } from "../utils/uploadImage.js";

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
        console.log("Verification Token: ", verificationToken);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                ...user[0],
                password: undefined
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

        await sendWelcomeEmail(updatedUser[0].email, updatedUser[0].name);

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: {
                ...updatedUser[0],
                password: undefined
            }
        })
        
    } catch (error) {
        console.log("Error in verifying email", error)
        res.status(500).json({success:false, message: "Server error"});

    }
}

export const logIn = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await sql`
            SELECT * FROM userschema WHERE email = ${email}
        `;

        if (user.length === 0) {
            return res.status(400).json({success: false, message: "Invalid credentials"})
        }

        const isPasswordValid = await bcryptjs.compare(password, user[0].password);
        if (!isPasswordValid) {
            return res.status(400).json({success: false, message: "Invalid credentials"})
        }

        generateTokenAndSetCookie(res, user[0].id);

        const updatedUser = await sql`
            UPDATE userschema
            SET
                lastlogin = NOW()
            WHERE id = ${user[0].id}
            RETURNING *
        `;


        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                ...updatedUser[0],
                password: undefined,
            }
        })

    } catch (error) {
        console.log("Error in login", error);
        res.status(400).json({success: false, message: error.message});
    }
};

export const logOut = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({success: true, message: "Logged out sucessfully"});
};

export const forgotPassword = async (req, res) => {
    const {email} = req.body;

    try {
        const user = await sql`
            SELECT * FROM userschema WHERE email = ${email}
        `;

        if ( user.length === 0 ) {
            return res.status(400).json({success: false, message: "User not found"})
        }

        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000);

        const updatedUser = await sql`
            UPDATE userschema
            SET
                resetpasswordtoken = ${resetToken},
                resetpasswordexpiresat = ${resetTokenExpiresAt}
            WHERE id = ${user[0].id}
            RETURNING *
        `;

        await sendPasswordResetEmail(updatedUser[0].email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`)
        console.log(`${process.env.CLIENT_URL}/reset-password/${resetToken}`);



        res.status(200).json({success: true, message: "Password reset link sent to your email"});
    } catch (error) {
        console.log("Error in forgotPassword", error);
        res.status(400).json({ success: false, message: error.message });
    }
}

export const resetPassword = async (req, res) => {
    try {
        const {token} = req.params;
        const {password} = req.body;

        const user = await sql`
            SELECT * FROM userschema WHERE resetpasswordtoken = ${token} AND resetpasswordexpiresat > NOW() LIMIT 1
        `;

        if (user.length === 0) {
            return res.status(400).json({success: false, message: "Invalid or expired reset token"});
        }

        // updating password

        const hashedPassword = await bcryptjs.hash(password, 10);

        const updatedUser = await sql`
            UPDATE userschema
            SET 
                password = ${hashedPassword},
                resetpasswordtoken = NULL,
                resetpasswordexpiresat = NULL,
                updated_at = NOW()
            WHERE id = ${user[0].id}
            RETURNING *
        `;

        await sendResetSuccessEmail(updatedUser[0].email);

		res.status(200).json({ success: true, message: "Password reset successful" });

    } catch (error) {
		console.log("Error in resetPassword ", error);
		res.status(400).json({ success: false, message: error.message });        
    }
}

export const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    try {
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        }

        // Get the user from the database
        const user = await sql`
            SELECT * FROM userschema WHERE id=${req.userId} LIMIT 1
        `;

        if (user.length === 0) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        // Verify current password
        const isPasswordValid = await bcryptjs.compare(currentPassword, user[0].password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Current password is incorrect" });
        }

        // Hash the new password
        const hashedPassword = await bcryptjs.hash(newPassword, 10);

        // Update the password
        await sql`
            UPDATE userschema
            SET 
                password = ${hashedPassword},
                updated_at = NOW()
            WHERE id = ${user[0].id}
        `;

        res.status(200).json({ success: true, message: "Password changed successfully" });

    } catch (error) {
        console.log("Error in changePassword", error);
        res.status(400).json({ success: false, message: error.message });
    }
}

export const checkAuth = async (req, res) => {
    try {
        const user = await sql`
            SELECT * FROM userschema WHERE id=${req.userId} LIMIT 1
        `;

        if (user.length === 0) {
            return res.status(400).json({ success: false, message: "User not found"});
        }

        res.status(200).json({success: true, user: {
            ...user[0],
            password: undefined
        }});

    } catch (error) {
        console.log("Error in checkAuth", error);
        res.status(400).json({ success: false, message: error.message });
        
    }
}



export const updateProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No image file provided" });
        }

        // Get current user to check if they have an existing profile picture
        const currentUser = await sql`
            SELECT profile_picture_public_id FROM userschema WHERE id = ${req.userId} LIMIT 1
        `;

        if (currentUser.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Delete old profile picture from Cloudinary if exists
        if (currentUser[0].profile_picture_public_id) {
            try {
                await deleteImage(currentUser[0].profile_picture_public_id);
            } catch (error) {
                console.log("Error deleting old profile picture:", error);
            }
        }

        // Upload new profile picture to Cloudinary
        const result = await uploadImage(req.file.buffer, 'kjeypleng/profiles');

        // Update user in database
        const updatedUser = await sql`
            UPDATE userschema
            SET 
                profile_picture = ${result.url},
                profile_picture_public_id = ${result.public_id},
                updated_at = NOW()
            WHERE id = ${req.userId}
            RETURNING *
        `;

        res.status(200).json({
            success: true,
            message: "Profile picture updated successfully",
            user: {
                ...updatedUser[0],
                password: undefined
            }
        });

    } catch (error) {
        console.log("Error in updateProfilePicture", error);
        res.status(400).json({ success: false, message: error.message });
    }
}

export const removeProfilePicture = async (req, res) => {
    try {
        // Get current user to check if they have an existing profile picture
        const currentUser = await sql`
            SELECT profile_picture_public_id FROM userschema WHERE id = ${req.userId} LIMIT 1
        `;

        if (currentUser.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Delete profile picture from Cloudinary if exists
        if (currentUser[0].profile_picture_public_id) {
            try {
                await deleteImage(currentUser[0].profile_picture_public_id);
            } catch (error) {
                console.log("Error deleting profile picture:", error);
            }
        }

        // Update user in database - set profile picture to null
        const updatedUser = await sql`
            UPDATE userschema
            SET 
                profile_picture = NULL,
                profile_picture_public_id = NULL,
                updated_at = NOW()
            WHERE id = ${req.userId}
            RETURNING *
        `;

        res.status(200).json({
            success: true,
            message: "Profile picture removed successfully",
            user: {
                ...updatedUser[0],
                password: undefined
            }
        });

    } catch (error) {
        console.log("Error in removeProfilePicture", error);
        res.status(400).json({ success: false, message: error.message });
    }
}