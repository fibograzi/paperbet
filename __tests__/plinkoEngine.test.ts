import { describe, it, expect } from "vitest";
import { generateBallPath, calculateProfit, getPegPositions, getSlotPositions } from "@/components/games/plinko/plinkoEngine";

describe("plinkoEngine", () => {
  describe("generateBallPath", () => {
    it("returns a valid path with correct direction count", () => {
      const path = generateBallPath(8, "low");
      expect(path.directions).toHaveLength(8);
      expect(path.directions.every((d) => d === 0 || d === 1)).toBe(true);
    });

    it("slot index equals sum of directions", () => {
      const path = generateBallPath(12, "medium");
      const expectedSlot = path.directions.reduce((s, d) => s + d, 0);
      expect(path.slotIndex).toBe(expectedSlot);
    });

    it("slot index is within valid range", () => {
      for (let i = 0; i < 50; i++) {
        const path = generateBallPath(16, "high");
        expect(path.slotIndex).toBeGreaterThanOrEqual(0);
        expect(path.slotIndex).toBeLessThanOrEqual(16);
      }
    });

    it("multiplier is always positive", () => {
      for (let i = 0; i < 50; i++) {
        const path = generateBallPath(8, "low");
        expect(path.multiplier).toBeGreaterThan(0);
      }
    });
  });

  describe("calculateProfit", () => {
    it("calculates positive profit for winning multiplier", () => {
      expect(calculateProfit(100, 2)).toBe(100);
    });

    it("calculates negative profit for losing multiplier", () => {
      expect(calculateProfit(100, 0.5)).toBe(-50);
    });

    it("returns 0 profit for 1x multiplier", () => {
      expect(calculateProfit(100, 1)).toBe(0);
    });

    it("handles zero bet amount", () => {
      expect(calculateProfit(0, 5)).toBe(0);
    });
  });

  describe("getPegPositions", () => {
    it("returns correct number of pegs for 8 rows", () => {
      const pegs = getPegPositions(8, 500, 600, 60);
      // Rows 0-7: pegs in row i = i+3 → 3+4+5+6+7+8+9+10 = 52
      const expected = Array.from({ length: 8 }, (_, i) => i + 3).reduce((s, n) => s + n, 0);
      expect(pegs).toHaveLength(expected);
    });

    it("all pegs have valid coordinates within bounds", () => {
      const width = 500;
      const height = 600;
      const pegs = getPegPositions(12, width, height, 60);
      for (const peg of pegs) {
        expect(peg.x).toBeGreaterThan(0);
        expect(peg.x).toBeLessThan(width);
        expect(peg.y).toBeGreaterThan(0);
        expect(peg.y).toBeLessThan(height);
      }
    });
  });

  describe("getSlotPositions", () => {
    it("returns rows+1 slots", () => {
      const slots = getSlotPositions(8, 500);
      expect(slots).toHaveLength(9);
    });

    it("slots are evenly spaced and within board width", () => {
      const width = 500;
      const slots = getSlotPositions(12, width);
      for (const x of slots) {
        expect(x).toBeGreaterThan(0);
        expect(x).toBeLessThan(width);
      }
      // Check even spacing
      const spacing = slots[1] - slots[0];
      for (let i = 2; i < slots.length; i++) {
        expect(slots[i] - slots[i - 1]).toBeCloseTo(spacing, 5);
      }
    });
  });
});
