import express from "express";
import isAuth from "../middlewares/isAuth.js";
import requireDb from "../middlewares/dbCheck.js";
import { upload } from "../middlewares/multer.js";
import {
  analyzeResume,
  finishInterview,
  generateQuestion,
  getInterviewReport,
  getMyInterviews,
  submitAnswer
} from "../controllers/interview.controller.js";

const interviewRouter = express.Router();

interviewRouter.post("/resume", isAuth, requireDb, upload.single("resume"), analyzeResume);
interviewRouter.post("/generate-questions", isAuth, requireDb, generateQuestion);
interviewRouter.post("/submit-answer", isAuth, requireDb, submitAnswer);
interviewRouter.post("/finish", isAuth, requireDb, finishInterview);

interviewRouter.get("/get-interview", isAuth, requireDb, getMyInterviews);
interviewRouter.get("/report/:id", isAuth, requireDb, getInterviewReport);

export default interviewRouter;
