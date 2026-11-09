import test from "node:test";
import assert from "node:assert/strict";

test("Security - Resume PDF File Filter Validation", () => {
  const isPdf = (filename, mimetype) => {
    const ext = filename.split(".").pop().toLowerCase();
    const isPdfExt = ext === "pdf";
    const isPdfMime = mimetype === "application/pdf" || mimetype === "application/x-pdf";
    return isPdfExt && isPdfMime;
  };

  assert.equal(isPdf("resume.pdf", "application/pdf"), true);
  assert.equal(isPdf("malicious.exe", "application/x-msdownload"), false);
  assert.equal(isPdf("script.js", "text/javascript"), false);
  assert.equal(isPdf("fake.pdf.exe", "application/pdf"), false);
});

test("Security - Robust JSON Extraction from AI Markdown Blocks", () => {
  const extractJson = (text) => {
    if (!text) return null;
    try {
      return JSON.parse(text.trim());
    } catch {}

    const cleaned = text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/i, "$1").trim();
    try {
      return JSON.parse(cleaned);
    } catch {}

    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {}
    }
    return null;
  };

  const rawJson = '{"score": 9, "feedback": "Great answer"}';
  assert.equal(extractJson(rawJson)?.score, 9);

  const markdownJson = 'Here is the evaluation:\n```json\n{"score": 8, "feedback": "Well explained"}\n```';
  assert.equal(extractJson(markdownJson)?.score, 8);

  const nestedText = 'Note: candidate did well. {"score": 7, "feedback": "Good attempt"} Best regards.';
  assert.equal(extractJson(nestedText)?.score, 7);
});

test("Security - Socket.IO Room Access Control", () => {
  const canJoinRoom = (authenticatedUserId, requestedRoomId) => {
    if (!authenticatedUserId) return false;
    return authenticatedUserId.toString() === requestedRoomId?.toString();
  };

  assert.equal(canJoinRoom("user_123", "user_123"), true);
  assert.equal(canJoinRoom("user_123", "victim_456"), false);
  assert.equal(canJoinRoom(null, "victim_456"), false);
});

