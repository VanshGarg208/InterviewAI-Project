import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.service.js";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";

// Helper to extract JSON from AI output (handles markdown code fences and extra text)
const extractJson = (text) => {
  if (!text) return null;
  // Try direct parse first
  try {
    return JSON.parse(text.trim());
  } catch {}

  // Strip ```json and ``` code blocks
  const cleaned = text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/i, "$1").trim();
  try {
    return JSON.parse(cleaned);
  } catch {}

  // Try matching first '{' to last '}'
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch {}
  }
  return null;
};

export const analyzeResume = async (req, res) => {
  const filepath = req.file?.path;
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume required" });
    }

    const fileBuffer = await fs.promises.readFile(filepath);
    const uint8Array = new Uint8Array(fileBuffer);

    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

    let resumeText = "";

    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();

      const pageText = content.items.map((item) => item.str).join(" ");
      resumeText += pageText + "\n";
    }

    resumeText = resumeText.replace(/\s+/g, " ").trim();

    if (!resumeText || resumeText.length < 20) {
      return res.status(400).json({ message: "Could not extract sufficient text from the uploaded PDF. Please ensure it is not scanned or empty." });
    }

    const messages = [
      {
        role: "system",
        content: `Extract structured data from resume. Return strictly JSON with keys: role (string), experience (string), projects (array of strings), skills (array of strings).`
      },
      {
        role: "user",
        content: resumeText.slice(0, 4000) // Keep within reasonable context limit
      }
    ];

    const aiResponse = await askAi(messages);
    const parsed = extractJson(aiResponse);

    if (!parsed) {
      throw new Error("AI returned invalid JSON format for resume analysis.");
    }

    return res.json({
      role: parsed.role || "",
      experience: parsed.experience || "",
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      resumeText: resumeText.slice(0, 3000)
    });
  } catch (error) {
    console.error("[InterviewController] analyzeResume error:", error.message);
    return res.status(500).json({ message: error.message || "Failed to analyze resume." });
  } finally {
    if (filepath && fs.existsSync(filepath)) {
      try {
        fs.unlinkSync(filepath);
      } catch (err) {
        console.warn("Failed to delete temp resume file:", err.message);
      }
    }
  }
};

export const generateQuestion = async (req, res) => {
  try {
    let { role, experience, mode, resumeText, projects, skills } = req.body;

    role = role?.trim();
    experience = experience?.trim();
    mode = mode?.trim();

    if (!role || !experience || !mode) {
      return res.status(400).json({ message: "Role, Experience and Mode are required." });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.credits < 50) {
      return res.status(400).json({
        message: `Not enough credits. Minimum 50 required (current balance: ${user.credits}).`
      });
    }

    const projectText = Array.isArray(projects) && projects.length ? projects.join(", ") : "None";
    const skillsText = Array.isArray(skills) && skills.length ? skills.join(", ") : "None";
    const safeResume = resumeText?.trim() || "None";

    const userPrompt = `
Role: ${role}
Experience: ${experience}
InterviewMode: ${mode}
Projects: ${projectText}
Skills: ${skillsText}
Resume: ${safeResume.slice(0, 2000)}
`;

    const messages = [
      {
        role: "system",
        content: `You are a real human interviewer conducting a professional interview.
Speak in simple, natural English as if you are directly talking to the candidate.
Generate exactly 5 interview questions.

Strict Rules:
- Each question must contain between 15 and 25 words.
- Each question must be a single complete sentence.
- Do NOT number them.
- Do NOT add explanations or intro text.
- One question per line only.
- Difficulty progression: Q1 easy, Q2 easy, Q3 medium, Q4 medium, Q5 hard.
- Tailor questions specifically to the candidate's role (${role}), experience (${experience}), mode (${mode}), and background.`
      },
      {
        role: "user",
        content: userPrompt
      }
    ];

    const aiResponse = await askAi(messages);
    if (!aiResponse || !aiResponse.trim()) {
      return res.status(500).json({ message: "AI returned an empty response." });
    }

    const questionsArray = aiResponse
      .split("\n")
      .map((q) => q.replace(/^(?:\d+[\.\)]\s*|Q\d+[:.]\s*|[-*•]\s*)/i, "").trim())
      .filter((q) => {
        if (!q || q.length < 10) return false;
        const lower = q.toLowerCase();
        if (
          lower.startsWith("here are") ||
          lower.startsWith("here is") ||
          lower.startsWith("sure") ||
          lower.startsWith("certainly") ||
          lower.startsWith("questions:")
        ) {
          return false;
        }
        return true;
      })
      .slice(0, 5);

    if (questionsArray.length === 0) {
      return res.status(500).json({
        message: "AI failed to generate valid interview questions. Please try again."
      });
    }

    const interview = await Interview.create({
      userId: user._id,
      role,
      experience,
      mode,
      resumeText: safeResume,
      questions: questionsArray.map((q, index) => ({
        question: q,
        difficulty: ["easy", "easy", "medium", "medium", "hard"][index] || "medium",
        timeLimit: [60, 60, 90, 90, 120][index] || 60,
      }))
    });

    // Deduct credits only after successful generation and saving
    user.credits = Math.max(0, user.credits - 50);
    await user.save();

    return res.status(200).json({
      interviewId: interview._id,
      creditsLeft: user.credits,
      userName: user.name,
      questions: interview.questions
    });
  } catch (error) {
    console.error("[InterviewController] generateQuestion error:", error.message);
    return res.status(500).json({ message: error.message || "Failed to create interview session." });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, timeTaken } = req.body;

    if (!interviewId || questionIndex === undefined) {
      return res.status(400).json({ message: "Interview ID and question index are required." });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found." });
    }

    // Authorization check
    if (interview.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized access to this interview session." });
    }

    if (interview.status === "completed") {
      return res.status(400).json({ message: "Interview is already completed. Answers cannot be updated." });
    }

    if (!interview.questions || questionIndex < 0 || questionIndex >= interview.questions.length) {
      return res.status(400).json({ message: "Invalid question index." });
    }

    const question = interview.questions[questionIndex];

    // If no answer or empty
    const trimmedAnswer = typeof answer === "string" ? answer.trim() : "";
    if (!trimmedAnswer || trimmedAnswer.toLowerCase() === "no text provided") {
      question.score = 0;
      question.confidence = 0;
      question.communication = 0;
      question.correctness = 0;
      question.feedback = "No answer was submitted for this question.";
      question.answer = "";
      await interview.save();
      return res.json({ feedback: question.feedback });
    }

    // If time exceeded
    if (timeTaken > question.timeLimit) {
      question.score = 0;
      question.feedback = "Time limit exceeded. Answer was not evaluated.";
      question.answer = trimmedAnswer;
      await interview.save();
      return res.json({ feedback: question.feedback });
    }

    const messages = [
      {
        role: "system",
        content: `You are a professional human interviewer evaluating a candidate's answer.
Score the answer from 0 to 10 on:
1. confidence (clarity, presence)
2. communication (structure, language)
3. correctness (accuracy, technical relevance)
4. finalScore (average rounded to nearest whole number)
5. feedback (short, 10 to 18 words, natural human feedback)

Return strictly valid JSON:
{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "feedback": "string"
}`
      },
      {
        role: "user",
        content: `Question: ${question.question}\nAnswer: ${trimmedAnswer}`
      }
    ];

    const aiResponse = await askAi(messages);
    const parsed = extractJson(aiResponse);

    question.answer = trimmedAnswer;
    question.confidence = typeof parsed?.confidence === "number" ? parsed.confidence : 5;
    question.communication = typeof parsed?.communication === "number" ? parsed.communication : 5;
    question.correctness = typeof parsed?.correctness === "number" ? parsed.correctness : 5;
    question.score = typeof parsed?.finalScore === "number" ? parsed.finalScore : 5;
    question.feedback = parsed?.feedback || "Answer evaluated successfully.";
    await interview.save();

    return res.status(200).json({ feedback: question.feedback });
  } catch (error) {
    console.error("[InterviewController] submitAnswer error:", error.message);
    return res.status(500).json({ message: error.message || "Failed to submit answer." });
  }
};

export const finishInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;
    if (!interviewId) {
      return res.status(400).json({ message: "Interview ID is required" });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Authorization check
    if (interview.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized access to this interview session." });
    }

    const totalQuestions = interview.questions.length;
    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      totalScore += q.score || 0;
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    const finalScore = totalQuestions ? totalScore / totalQuestions : 0;
    const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;
    const avgCommunication = totalQuestions ? totalCommunication / totalQuestions : 0;
    const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0;

    interview.finalScore = Number(finalScore.toFixed(1));
    interview.status = "completed";
    await interview.save();

    return res.status(200).json({
      interviewId: interview._id,
      finalScore: interview.finalScore,
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
        score: q.score || 0,
        feedback: q.feedback || "",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: `Failed to finish interview: ${error.message}` });
  }
};

export const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select("role experience mode finalScore status createdAt");

    return res.status(200).json(interviews);
  } catch (error) {
    return res.status(500).json({ message: `Failed to find interviews: ${error.message}` });
  }
};

export const getInterviewReport = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Authorization check
    if (interview.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized access to this interview report." });
    }

    const totalQuestions = interview.questions.length;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;
    const avgCommunication = totalQuestions ? totalCommunication / totalQuestions : 0;
    const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0;

    return res.json({
      interviewId: interview._id,
      role: interview.role,
      experience: interview.experience,
      mode: interview.mode,
      finalScore: interview.finalScore,
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      questionWiseScore: interview.questions
    });
  } catch (error) {
    return res.status(500).json({ message: `Failed to find interview report: ${error.message}` });
  }
};
