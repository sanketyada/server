import crypto from "node:crypto";
import cartModel from "../model/cart.model.js";
import paymentModel from "../model/payment.model.js";
import config from "../config/config.js";
import { createRazorpayOrder } from "../services/razorpay.service.js";

function calculateCartAmount(cart) {
  if (!cart?.products?.length) {
    return 0;
  }

  return cart.products.reduce((total, item) => {
    const product = item.product;
    if (!product || !product.isListed) {
      throw new Error("Cart contains a product that is no longer available");
    }

    if (product.price.currency !== "INR") {
      throw new Error("Only INR products can be paid through Razorpay");
    }

    const amount = Number(product.price.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Cart contains a product with an invalid price");
    }

    return total + Math.round(amount * 100) * item.quantity;
  }, 0);
}

function signaturesMatch(expected, received) {
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received ?? "");

  return (
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export async function createPaymentOrder(req, res) {
  try {
    const cart = await cartModel
      .findOne({ user: req.user._id })
      .populate("products.product");
    const amount = 1000;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Cannot create a payment order for an empty cart",
      });
    }

    const razorpayOrder = await createRazorpayOrder({
      amount,
      currency: "INR",
      receipt: `snitch_${Date.now().toString(36)}_${req.user._id.toString().slice(-8)}`,
    });

    await paymentModel.create({
      user: req.user._id,
      razorpayOrderId: razorpayOrder.id,
      amount,
      currency: "INR",
    });

    return res.status(201).json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: config.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error("Creating Razorpay order failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create payment order",
    });
  }
}

export async function verifyPayment(req, res) {
  const {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  } = req.body;

  if (!orderId || !paymentId || !signature) {
    return res.status(400).json({
      success: false,
      message: "Payment verification fields are required",
    });
  }

  if (!config.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({
      success: false,
      message: "Payment verification is not configured",
    });
  }

  try {
    const payment = await paymentModel.findOne({
      razorpayOrderId: orderId,
      user: req.user._id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment order not found",
      });
    }

    if (payment.status === "paid") {
      return res.status(200).json({
        success: true,
        message: "Payment was already verified",
        data: { orderId, paymentId: payment.razorpayPaymentId },
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", config.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (!signaturesMatch(expectedSignature, signature)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    payment.razorpayPaymentId = paymentId;
    payment.status = "paid";
    await payment.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: { orderId, paymentId },
    });
  } catch (error) {
    console.error("Verifying Razorpay payment failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to verify payment",
    });
  }
}

export async function handleRazorpayWebhook(req, res) {
  const signature = req.headers["x-razorpay-signature"];

  if (!config.RAZORPAY_WEBHOOK_SECRET || !req.rawBody || !signature) {
    return res.status(400).json({
      success: false,
      message: "Invalid webhook request",
    });
  }

  const expectedSignature = crypto
    .createHmac("sha256", config.RAZORPAY_WEBHOOK_SECRET)
    .update(req.rawBody)
    .digest("hex");

  if (!signaturesMatch(expectedSignature, signature)) {
    return res.status(400).json({
      success: false,
      message: "Invalid webhook signature",
    });
  }

  try {
    const event = req.body;
    const paymentEntity = event?.payload?.payment?.entity;
    const orderId =
      paymentEntity?.order_id ?? event?.payload?.order?.entity?.id;

    if (orderId && ["payment.captured", "order.paid"].includes(event.event)) {
      await paymentModel.findOneAndUpdate(
        { razorpayOrderId: orderId },
        {
          $set: {
            status: "paid",
            ...(paymentEntity?.id
              ? { razorpayPaymentId: paymentEntity.id }
              : {}),
          },
        },
      );
    }

    if (orderId && event.event === "payment.failed") {
      await paymentModel.findOneAndUpdate(
        { razorpayOrderId: orderId, status: { $ne: "paid" } },
        { $set: { status: "failed" } },
      );
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Processing Razorpay webhook failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to process webhook",
    });
  }
}
