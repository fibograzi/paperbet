import { describe, it, expect } from "vitest";
import {
  generateCrashPoint,
  getMultiplierAtTime,
  getTimeForMultiplier,
  calculateCrashProfit,
  formatCrashMultiplier,
  getMultiplierColor,
  GROWTH_RATE,
  MAX_MULTIPLIER,
} from "@/components/games/crash/crashEngine";

describe("crashEngine", () => {
  describe("generateCrashPoint", () => {
    it("always returns >= 1", () => {
      for (let i = 0; i < 200; i++) {
        expect(generateCrashPoint()).toBeGreaterThanOrEqual(1);
      }
    });

    it("never exceeds MAX_MULTIPLIER", () => {
      for (let i = 0; i < 200; i++) {
        expect(generateCrashPoint()).toBeLessThanOrEqual(MAX_MULTIPLIER);
      }
    });

    it("distribution skews toward low values (median < 2x)", () => {
      const points: number[] = [];
      for (let i = 0; i < 10_000; i++) {
        points.push(generateCrashPoint());
      }
      points.sort((a, b) => a - b);
      const median = points[Math.floor(points.length / 2)];
      expect(median).toBeLessThan(2);
    });
  });

  describe("getMultiplierAtTime / getTimeForMultiplier", () => {
    it("returns 1x at t=0", () => {
      expect(getMultiplierAtTime(0)).toBe(1);
    });

    it("multiplier grows exponentially", () => {
      const t1 = getMultiplierAtTime(5);
      const t2 = getMultiplierAtTime(10);
      expect(t2).toBeGreaterThan(t1);
      // e^(0.15*10) / e^(0.15*5) = e^(0.75) ≈ 2.117
      expect(t2 / t1).toBeCloseTo(Math.exp(GROWTH_RATE * 5), 3);
    });

    it("round-trips correctly", () => {
      const mult = 5.5;
      const time = getTimeForMultiplier(mult);
      const recovered = getMultiplierAtTime(time);
      expect(recovered).toBeCloseTo(mult, 5);
    });

    it("getTimeForMultiplier returns 0 for multiplier <= 1", () => {
      expect(getTimeForMultiplier(1)).toBe(0);
      expect(getTimeForMultiplier(0.5)).toBe(0);
    });

    it("caps at MAX_MULTIPLIER", () => {
      expect(getMultiplierAtTime(100_000)).toBe(MAX_MULTIPLIER);
    });
  });

  describe("calculateCrashProfit", () => {
    it("returns -betAmount when crashed (no cashout)", () => {
      expect(calculateCrashProfit(100, false, null)).toBe(-100);
    });

    it("returns profit when cashed out at 2x", () => {
      expect(calculateCrashProfit(100, true, 2)).toBe(100);
    });

    it("returns 0 profit when cashed out at 1x", () => {
      expect(calculateCrashProfit(100, true, 1)).toBe(0);
    });
  });

  describe("formatCrashMultiplier", () => {
    it("formats small multipliers with 2 decimals", () => {
      expect(formatCrashMultiplier(1.5)).toBe("1.50x");
    });

    it("formats large multipliers with comma separators", () => {
      const result = formatCrashMultiplier(1500);
      expect(result).toContain("1,500");
      expect(result.endsWith("x")).toBe(true);
    });
  });

  describe("getMultiplierColor", () => {
    it("returns white for low multipliers", () => {
      expect(getMultiplierColor(1.5)).toBe("#F9FAFB");
    });

    it("returns green for >= 2x", () => {
      expect(getMultiplierColor(2)).toBe("#00E5A0");
    });

    it("returns gold for >= 100x", () => {
      expect(getMultiplierColor(100)).toBe("#F59E0B");
    });
  });
});
