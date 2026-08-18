import { describe, expect, it } from "vitest";
import { formatInterest, interestBarWidth, progressStep, remainingSeconds } from "./format";

describe("remainingSeconds", () => {
  it("is the full duration at 0%", () => {
    expect(remainingSeconds(30, 0)).toBe(30);
  });
  it("is zero at 100%", () => {
    expect(remainingSeconds(30, 100)).toBe(0);
  });
  it("rounds mid-playback", () => {
    expect(remainingSeconds(25, 50)).toBe(13);
  });
  it("clamps out-of-range progress", () => {
    expect(remainingSeconds(20, -40)).toBe(20);
    expect(remainingSeconds(20, 320)).toBe(0);
  });
});

describe("progressStep", () => {
  it("advances 100% over the duration at 10 ticks per second", () => {
    expect(progressStep(10) * 10 * 10).toBeCloseTo(100);
  });
  it("completes instantly for a zero or negative duration", () => {
    expect(progressStep(0)).toBe(100);
    expect(progressStep(-5)).toBe(100);
  });
});

describe("interestBarWidth", () => {
  it("is 0 with no interest", () => {
    expect(interestBarWidth(0)).toBe(0);
  });
  it("caps at 100", () => {
    expect(interestBarWidth(9999)).toBe(100);
  });
  it("uses magnitude for negative weights", () => {
    expect(interestBarWidth(-2, 4)).toBe(interestBarWidth(2, 4));
  });
  it("guards against a zero ceiling", () => {
    expect(interestBarWidth(3, 0)).toBe(0);
  });
});

describe("formatInterest", () => {
  it("signs positive values", () => {
    expect(formatInterest(2.46)).toBe("+2.5");
  });
  it("keeps the minus sign", () => {
    expect(formatInterest(-1.42)).toBe("-1.4");
  });
  it("renders zero without a sign", () => {
    expect(formatInterest(0)).toBe("0.0");
  });
});
