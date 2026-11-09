import { describe, it, expect } from "vitest";

describe("Pricing Plans Configuration", () => {
  const plans = [
    { planId: "free_tier", name: "Free Trial", price: "₹0", credits: 1000 },
    { planId: "pro_tier", name: "Pro Interviewer", price: "₹499", credits: 5000 },
    { planId: "mastery_tier", name: "Job Mastery Pack", price: "₹1,299", credits: 15000 },
  ];

  it("should have correct plans with expected credit amounts", () => {
    expect(plans).toHaveLength(3);
    expect(plans[0].credits).toBe(1000);
    expect(plans[1].credits).toBe(5000);
    expect(plans[2].credits).toBe(15000);
  });

  it("should have valid price formats", () => {
    plans.forEach((p) => {
      expect(p.price).toMatch(/^₹\d+(,\d+)?$/);
    });
  });
});

