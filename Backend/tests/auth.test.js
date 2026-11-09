import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

test("Auth Security - Password Hashing", async () => {
  const plainPassword = "SuperSecretPassword123!";
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(plainPassword, salt);

  assert.notEqual(hash, plainPassword);
  assert.equal(await bcrypt.compare(plainPassword, hash), true);
  assert.equal(await bcrypt.compare("WrongPassword", hash), false);
});

test("Auth Security - JWT Generation and Verification", () => {
  const secret = "test_jwt_secret_key_12345";
  const userId = "507f1f77bcf86cd799439011";

  const token = jwt.sign({ userId }, secret, { expiresIn: "1h" });
  assert.ok(token);

  const decoded = jwt.verify(token, secret);
  assert.equal(decoded.userId, userId);

  // Verification fails with invalid secret
  assert.throws(() => {
    jwt.verify(token, "wrong_secret");
  });
});

test("Auth Validation - Required fields", () => {
  const validateRegister = (name, email, password) => {
    if (!name || !email || !password) {
      return { valid: false, message: "Please provide all required fields" };
    }
    return { valid: true };
  };

  assert.equal(validateRegister("", "test@example.com", "pass").valid, false);
  assert.equal(validateRegister("Test", "", "pass").valid, false);
  assert.equal(validateRegister("Test", "test@example.com", "").valid, false);
  assert.equal(validateRegister("Test", "test@example.com", "pass").valid, true);
});

