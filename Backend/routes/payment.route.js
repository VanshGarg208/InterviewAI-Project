import express from "express";
import isAuth from "../middlewares/isAuth.js";
import requireDb from "../middlewares/dbCheck.js";
import { createOrder, verifyPayment, getPaymentHistory } from "../controllers/payment.controller.js";

const paymentRouter = express.Router();

paymentRouter.post("/order", isAuth, requireDb, createOrder);
paymentRouter.post("/verify", isAuth, requireDb, verifyPayment);
paymentRouter.get("/history", isAuth, requireDb, getPaymentHistory);

export default paymentRouter;
