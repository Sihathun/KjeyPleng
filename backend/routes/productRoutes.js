import express from "express";
import {
    getProducts,
    getProduct,
    createProduct,
    deleteProduct,
    updateProduct,
    getMyListings,
    getUserListings,
    getCategories,
    uploadProductImages,
    getDashboardStats,
    renewListing,
    getSellerOrders,
    updateOrderStatus
} from "../controllers/productController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/", getProducts);
router.get("/categories", getCategories);

// Protected routes - must come before /:id to avoid conflicts
router.get("/my/listings", verifyToken, getMyListings);
router.get("/my/orders", verifyToken, getSellerOrders);
router.get("/dashboard/stats", verifyToken, getDashboardStats);
router.post("/", verifyToken, upload.array('images', 5), createProduct);
router.post("/upload", verifyToken, upload.array('images', 5), uploadProductImages);
router.post("/renew/:id", verifyToken, renewListing);
router.put("/orders/:id/status", verifyToken, updateOrderStatus);

// Public routes with params
router.get("/user/:userId", getUserListings);
router.get("/:id", getProduct);

// Protected routes with params
router.put("/:id", verifyToken, upload.array('images', 5), updateProduct);
router.delete("/:id", verifyToken, deleteProduct);

export default router;