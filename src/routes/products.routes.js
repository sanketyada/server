import express from "express";
import { createProduct, products } from "../controllers/product.controllers.js";
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

// router.get("/", (req, res) => res.send("Welcome to product Routes"));
router.post(
    "/create",
    upload.array("images"),
    productValidator,
    authMiddleware,
    sellerAuth,
    (req, res, next) => {
        // console.log("DATATTATAT",req.body.price)
        req.body.price = JSON.parse(req.body.price);
        next();
    },
    createProduct,
);
router.get("/",authMiddleware,products)

export default router;
