import express from "express";
import { logIn, logOut, signUp, verifyEmail, forgotPassword, resetPassword, checkAuth, changePassword, updateProfilePicture, removeProfilePicture } from "../controllers/authController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth);

router.post("/signup", signUp);
router.post("/login", logIn);
router.post("/logout", logOut);

router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);
router.post("/change-password", verifyToken, changePassword);

router.post("/update-profile-picture", verifyToken, upload.single('profilePicture'), updateProfilePicture);
router.delete("/remove-profile-picture", verifyToken, removeProfilePicture);



export default router;