import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  createPaymentOrder,
  handleRazorpayWebhook,
  verifyPayment,
} from "../controllers/payment.controllers.js";

const router = express.Router();

router.post("/order", authMiddleware, createPaymentOrder);
router.post("/verify", authMiddleware, verifyPayment);
router.post("/webhook", handleRazorpayWebhook);

export default router;
