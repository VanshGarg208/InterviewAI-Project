import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import { getRazorpayInstance, isRazorpayReady } from "../services/razorpay.service.js";
import crypto from "crypto";

export const createOrder = async (req, res) => {
  try {
    const { planId, amount, credits } = req.body;

    if (!amount || !credits || typeof amount !== "number" || typeof credits !== "number" || amount <= 0 || credits <= 0) {
      return res.status(400).json({ message: "Invalid plan data. Amount and credits must be positive numbers." });
    }

    const razorpay = getRazorpayInstance();

    // If Razorpay is not configured with valid API keys
    if (!razorpay || !isRazorpayReady()) {
      return res.status(503).json({
        message: "Razorpay payment gateway is not configured on this server. Please set valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Backend/.env.",
        configured: false
      });
    }

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${req.userId.toString().slice(-4)}`,
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
      userId: req.userId,
      planId: planId || "credits_pack",
      amount,
      credits,
      razorpayOrderId: order.id,
      status: "created",
    });

    return res.json({
      ...order,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error("[PaymentController] createOrder error:", error.message);
    return res.status(500).json({ message: `Failed to create payment order: ${error.message}` });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing required payment verification parameters." });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret || secret === "your_razorpay_key_secret") {
      return res.status(503).json({ message: "Razorpay secret key is not configured on the server." });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature. Verification failed." });
    }

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment order record not found." });
    }

    // Authorization: ensure this payment order belongs to the requesting user
    if (payment.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized payment verification." });
    }

    if (payment.status === "paid") {
      return res.json({
        success: true,
        message: "Payment was already processed.",
        creditsAdded: 0
      });
    }

    // Update payment record
    payment.status = "paid";
    payment.razorpayPaymentId = razorpay_payment_id;
    await payment.save();

    // Add credits atomically to user
    const updatedUser = await User.findByIdAndUpdate(
      payment.userId,
      { $inc: { credits: payment.credits } },
      { new: true }
    ).select("-password");

    return res.json({
      success: true,
      message: "Payment verified and credits added successfully.",
      creditsAdded: payment.credits,
      user: updatedUser,
    });
  } catch (error) {
    console.error("[PaymentController] verifyPayment error:", error.message);
    return res.status(500).json({ message: `Failed to verify payment: ${error.message}` });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select("planId amount credits razorpayOrderId razorpayPaymentId status createdAt");

    return res.status(200).json(payments);
  } catch (error) {
    return res.status(500).json({ message: `Failed to fetch payment history: ${error.message}` });
  }
};
