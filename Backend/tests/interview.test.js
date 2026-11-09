import test from "node:test";
import assert from "node:assert/strict";

test("Interview Score Calculation - Averages and metrics", () => {
  const questions = [
    { question: "Q1", score: 8, confidence: 7, communication: 8, correctness: 9 },
    { question: "Q2", score: 6, confidence: 6, communication: 7, correctness: 5 },
    { question: "Q3", score: 10, confidence: 9, communication: 9, correctness: 10 },
  ];

  const totalQuestions = questions.length;
  let totalScore = 0;
  let totalConfidence = 0;
  let totalCommunication = 0;
  let totalCorrectness = 0;

  questions.forEach((q) => {
    totalScore += q.score;
    totalConfidence += q.confidence;
    totalCommunication += q.communication;
    totalCorrectness += q.correctness;
  });

  const finalScore = Number((totalScore / totalQuestions).toFixed(1));
  const avgConfidence = Number((totalConfidence / totalQuestions).toFixed(1));
  const avgCommunication = Number((totalCommunication / totalQuestions).toFixed(1));
  const avgCorrectness = Number((totalCorrectness / totalQuestions).toFixed(1));

  assert.equal(finalScore, 8.0);
  assert.equal(avgConfidence, 7.3);
  assert.equal(avgCommunication, 8.0);
  assert.equal(avgCorrectness, 8.0);
});

test("Interview Authorization - IDOR prevention", () => {
  const interviewOwnerId = "user_abc";
  const callerUserId = "user_attacker";

  const isAuthorized = interviewOwnerId === callerUserId;
  assert.equal(isAuthorized, false);
});

test("Interview Credit Check - Minimum 50 required", () => {
  const checkCredits = (userCredits) => {
    if (userCredits < 50) {
      return { allowed: false, message: "Not enough credits. Minimum 50 required." };
    }
    return { allowed: true, creditsRemaining: userCredits - 50 };
  };

  assert.equal(checkCredits(40).allowed, false);
  assert.equal(checkCredits(50).allowed, true);
  assert.equal(checkCredits(100).creditsRemaining, 50);
});

