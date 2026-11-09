import "../config/env.js";
import Razorpay from "razorpay";

const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

const isConfigured = Boolean(
  keyId &&
  keySecret &&
  keyId !== "your_razorpay_key_id" &&
  keySecret !== "your_razorpay_key_secret"
);

let razorpayInstance = null;

if (isConfigured) {
  try {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    console.log("💳 Razorpay service initialized successfully");
  } catch (error) {
    console.warn("⚠️ Failed to initialize Razorpay:", error.message);
  }
} else {
  console.log("ℹ️ Razorpay credentials not configured or using placeholders. Payment routes will operate in test/simulation mode.");
}

export const getRazorpayInstance = () => razorpayInstance;
export const isRazorpayReady = () => Boolean(razorpayInstance);

export default razorpayInstance;
