import express from "express";
import isAuth from "../middlewares/isAuth.js";
import requireDb from "../middlewares/dbCheck.js";
import { getCurrentUser, updateProfile } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.get("/current-user", isAuth, requireDb, getCurrentUser);
userRouter.put("/profile", isAuth, requireDb, updateProfile);

export default userRouter;
