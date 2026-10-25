import express from "express"
import authMiddleware from "../middleware/auth.middleware.js"
import cartValidator from "../validator/cart.validator.js"
import { addToCart, getUsersCart } from "../controllers/cart.controllers.js"

const router = express.Router()

router.get("/",authMiddleware,getUsersCart)
router.post("/", authMiddleware, cartValidator, addToCart)

export default router;