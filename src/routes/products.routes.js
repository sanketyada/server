import express from "express";
import {
    createProduct,
    products,
    unlistProduct,
    listProduct,
} from "../controllers/product.controllers.js";
import { productValidator } from "../validator/product.validator.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { sellerAuth } from "../middleware/seller.middlewere.js";
const router = express.Router();

import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 1 * 1024 * 1024, files: 5 },
});

function parseProductFormData(req, res, next) {
    try {
        if (typeof req.body.price === "string") {
            req.body.price = JSON.parse(req.body.price);
        }

        if (typeof req.body.sizes === "string") {
            req.body.sizes = JSON.parse(req.body.sizes);
        }

        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "price and sizes must contain valid JSON",
        });
    }
}

// router.get("/", (req, res) => res.send("Welcome to product Routes"));
router.post(
    "/create",
    upload.array("images"),
    parseProductFormData,
    productValidator,
    authMiddleware,
    sellerAuth,
    createProduct,
);
router.get("/",authMiddleware,products)

router.patch("/unlist/:id", authMiddleware, unlistProduct);
router.patch("/list/:id", authMiddleware, listProduct);

export default router;
