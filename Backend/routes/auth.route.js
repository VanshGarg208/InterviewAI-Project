import express from "express";
import { register, login, logOut, getMe } from "../controllers/auth.controller.js";
import isAuth from "../middlewares/isAuth.js";
import requireDb from "../middlewares/dbCheck.js";

const authRouter = express.Router();

authRouter.post("/register", requireDb, register);
authRouter.post("/login", requireDb, login);
authRouter.post("/logout", logOut);
authRouter.get("/me", isAuth, requireDb, getMe);

export default authRouter;
