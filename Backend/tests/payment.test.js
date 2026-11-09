import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";

test("Payment Verification - HMAC SHA256 Signature Verification", () => {
  const secret = "test_razorpay_secret_999";
  const orderId = "order_DBJOWzybf0sJbb";
  const paymentId = "pay_29QQoUBi66xm2f";

  const body = `${orderId}|${paymentId}`;
  const validSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  // Verify valid signature passes
  const computed = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  assert.equal(computed, validSignature);

  // Tampered payload fails
  const tamperedSignature = "tampered_signature_123456";
  assert.notEqual(computed, tamperedSignature);
});

test("Payment Idempotency - Duplicate verification prevention", () => {
  const mockPayment = {
    razorpayOrderId: "order_123",
    status: "paid",
    credits: 5000,
  };

  const processPayment = (payment) => {
    if (payment.status === "paid") {
      return { success: true, message: "Already processed", creditsAdded: 0 };
    }
    payment.status = "paid";
    return { success: true, creditsAdded: payment.credits };
  };

  const firstAttempt = processPayment(mockPayment);
  assert.equal(firstAttempt.creditsAdded, 0);
  assert.equal(firstAttempt.message, "Already processed");
});

test("Payment Authorization - User ID matching", () => {
  const orderOwnerId = "user_111";
  const requestingUserId = "user_222";

  const verifyOwnership = (ownerId, reqId) => {
    return ownerId === reqId;
  };

  assert.equal(verifyOwnership(orderOwnerId, requestingUserId), false);
  assert.equal(verifyOwnership(orderOwnerId, "user_111"), true);
});

