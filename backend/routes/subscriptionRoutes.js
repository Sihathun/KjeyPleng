import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
    getSubscriptionStatus,
    upgradeToPremium,
    cancelSubscription,
    canCreateListing
} from "../controllers/subscriptionController.js";

const router = express.Router();

// All routes require authentication
router.get("/status", verifyToken, getSubscriptionStatus);
router.post("/upgrade", verifyToken, upgradeToPremium);
router.post("/cancel", verifyToken, cancelSubscription);
router.get("/can-create-listing", verifyToken, canCreateListing);

export default router;
