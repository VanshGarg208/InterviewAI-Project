import { describe, it, expect } from "vitest";

describe("Interview Workflow Logic", () => {
  it("should validate required role and experience", () => {
    const validate = (role: string, experience: string) => {
      return Boolean(role.trim() && experience.trim());
    };

    expect(validate("", "2 years")).toBe(false);
    expect(validate("Frontend Dev", "")).toBe(false);
    expect(validate("Frontend Dev", "2 years")).toBe(true);
  });

  it("should calculate correct remaining time and progress", () => {
    const calculateProgress = (timeLeft: number, totalTime: number) => {
      return Math.round(((totalTime - timeLeft) / totalTime) * 100);
    };

    expect(calculateProgress(30, 60)).toBe(50);
    expect(calculateProgress(0, 60)).toBe(100);
    expect(calculateProgress(60, 60)).toBe(0);
  });

  it("should format performance text based on finalScore", () => {
    const getPerformanceFeedback = (score: number) => {
      if (score >= 8) return "Ready for job opportunities.";
      if (score >= 5) return "Needs minor improvement.";
      return "Significant improvement required.";
    };

    expect(getPerformanceFeedback(8.5)).toBe("Ready for job opportunities.");
    expect(getPerformanceFeedback(6.2)).toBe("Needs minor improvement.");
    expect(getPerformanceFeedback(4.0)).toBe("Significant improvement required.");
  });
});

