import express from "express";
import {
    getProducts,
    getProduct,
    createProduct,
    deleteProduct,
    updateProduct,
    getMyListings,
    getUserListings,
    getCategories
} from "../controllers/productController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/", getProducts);
router.get("/categories", getCategories);

// Protected routes - must come before /:id to avoid conflicts
router.get("/my/listings", verifyToken, getMyListings);
router.post("/", verifyToken, createProduct);

// Public routes with params
router.get("/user/:userId", getUserListings);
router.get("/:id", getProduct);

// Protected routes with params
router.put("/:id", verifyToken, updateProduct);
router.delete("/:id", verifyToken, deleteProduct);

export default router;