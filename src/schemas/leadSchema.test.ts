import { describe, expect, it } from "vitest";

import { enquirySchema } from "@/schemas/leadSchema";

describe("enquirySchema", () => {
  it("rejects submission without consent", () => {
    const result = enquirySchema.safeParse({
      first_name: "Test",
      phone: "9876543210",
      consent_given: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid phone number", () => {
    const result = enquirySchema.safeParse({
      first_name: "Test",
      phone: "abc",
      consent_given: true,
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid enquiry payload", () => {
    const result = enquirySchema.safeParse({
      first_name: "Test",
      phone: "9876543210",
      consent_given: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a non-empty honeypot field", () => {
    const result = enquirySchema.safeParse({
      first_name: "Test",
      phone: "9876543210",
      consent_given: true,
      website: "http://spam.example",
    });
    expect(result.success).toBe(false);
  });
});
