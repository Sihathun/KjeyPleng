import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
    getSubscriptionStatus,
    upgradeToPremium,
    cancelSubscription,
    canCreateListing,
    downgradeToFree
} from "../controllers/subscriptionController.js";

const router = express.Router();

// All routes require authentication
router.get("/status", verifyToken, getSubscriptionStatus);
router.post("/upgrade", verifyToken, upgradeToPremium);
router.post("/cancel", verifyToken, cancelSubscription);
router.post("/downgrade", verifyToken, downgradeToFree);
router.get("/can-create-listing", verifyToken, canCreateListing);

export default router;
