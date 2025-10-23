import express from "express";
import {getProducts, getProduct, createProduct, deleteProduct, updateProduct} from "../controllers/productController.js";


const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);



export default router;