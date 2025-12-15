import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {sql} from "../config/db.js";
import {
    getAllUsers,
    getAllListings,
    getAdminStats,
    toggleUserAdmin,
    toggleUserPremium,
    deleteListing,
    deleteUser
} from "../controllers/adminController.js";

const router = express.Router();

// Middleware to verify admin status
const verifyAdmin = async (req, res, next) => {
    try {
        const userId = req.userId;
        
        const [user] = await sql`SELECT is_admin FROM userschema WHERE id = ${userId}`;
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        if (!user.is_admin) {
            return res.status(403).json({ success: false, message: "Access denied - Admin only" });
        }
        
        next();
    } catch (error) {
        console.log("Error in verifyAdmin:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

// All routes require authentication and admin status
router.use(verifyToken);
router.use(verifyAdmin);

// Admin routes
router.get("/users", getAllUsers);
router.get("/listings", getAllListings);
router.get("/stats", getAdminStats);
router.patch("/users/:userId/toggle-admin", toggleUserAdmin);
router.patch("/users/:userId/toggle-premium", toggleUserPremium);
router.delete("/listings/:listingId", deleteListing);
router.delete("/users/:userId", deleteUser);

export default router;
