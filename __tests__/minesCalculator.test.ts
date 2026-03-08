import { describe, it, expect } from "vitest";
import {
  getMultiplier,
  getNextMultiplier,
  getDanger,
  calculateProfit,
  generateMinePositions,
  formatMinesMultiplier,
  maxGems,
  precomputeMultipliers,
} from "@/components/games/mines/minesCalculator";

describe("minesCalculator", () => {
  describe("getMultiplier", () => {
    it("returns 0 for 0 gems revealed", () => {
      expect(getMultiplier(0, 3)).toBe(0);
    });

    it("returns positive multiplier for >= 1 gem", () => {
      expect(getMultiplier(1, 3)).toBeGreaterThan(0);
    });

    it("multiplier increases with more gems revealed", () => {
      const m1 = getMultiplier(1, 5);
      const m2 = getMultiplier(5, 5);
      const m3 = getMultiplier(10, 5);
      expect(m2).toBeGreaterThan(m1);
      expect(m3).toBeGreaterThan(m2);
    });

    it("multiplier increases with more mines", () => {
      const lowRisk = getMultiplier(3, 1);
      const highRisk = getMultiplier(3, 10);
      expect(highRisk).toBeGreaterThan(lowRisk);
    });
  });

  describe("getNextMultiplier", () => {
    it("returns the multiplier for gemsRevealed + 1", () => {
      expect(getNextMultiplier(2, 5)).toBe(getMultiplier(3, 5));
    });
  });

  describe("getDanger", () => {
    it("returns correct probability with no gems revealed", () => {
      // 3 mines out of 25 tiles
      expect(getDanger(0, 3)).toBeCloseTo(3 / 25, 5);
    });

    it("danger increases as gems are revealed", () => {
      const d1 = getDanger(0, 5);
      const d2 = getDanger(10, 5);
      expect(d2).toBeGreaterThan(d1);
    });

    it("returns 0 when no tiles remaining", () => {
      expect(getDanger(25, 3)).toBe(0);
    });

    it("approaches 1 when almost all safe tiles are revealed", () => {
      // 24 mines, 1 safe tile. After revealing the safe tile, danger should be 0 (no tiles left)
      // But at 0 gems with 24 mines: danger = 24/25 = 0.96
      expect(getDanger(0, 24)).toBeCloseTo(24 / 25, 5);
    });
  });

  describe("calculateProfit", () => {
    it("calculates profit correctly", () => {
      expect(calculateProfit(100, 2)).toBe(100);
      expect(calculateProfit(100, 0.5)).toBe(-50);
      expect(calculateProfit(100, 1)).toBe(0);
    });
  });

  describe("generateMinePositions", () => {
    it("returns correct number of mines", () => {
      expect(generateMinePositions(5)).toHaveLength(5);
    });

    it("all positions are within valid range", () => {
      const positions = generateMinePositions(10);
      for (const p of positions) {
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThan(25);
      }
    });

    it("positions are unique", () => {
      const positions = generateMinePositions(20);
      const unique = new Set(positions);
      expect(unique.size).toBe(20);
    });

    it("produces different results across calls (randomness)", () => {
      const results = new Set<string>();
      for (let i = 0; i < 10; i++) {
        results.add(JSON.stringify(generateMinePositions(5).sort()));
      }
      // With 5 mines in 25 tiles, we should get mostly different arrangements
      expect(results.size).toBeGreaterThan(1);
    });
  });

  describe("formatMinesMultiplier", () => {
    it("formats zero", () => {
      expect(formatMinesMultiplier(0)).toBe("0.00x");
    });

    it("formats small multipliers", () => {
      expect(formatMinesMultiplier(1.5)).toBe("1.50x");
    });

    it("formats large multipliers with K suffix", () => {
      const result = formatMinesMultiplier(15_000);
      expect(result).toBe("15.0Kx");
    });

    it("formats very large multipliers with M suffix", () => {
      const result = formatMinesMultiplier(1_500_000);
      expect(result).toBe("1.50Mx");
    });
  });

  describe("maxGems", () => {
    it("returns total tiles minus mine count", () => {
      expect(maxGems(3)).toBe(22);
      expect(maxGems(24)).toBe(1);
    });
  });

  describe("RTP verification", () => {
    it("RTP is close to 99% for standard mine counts", () => {
      // For each mine count, RTP = sum(probability_of_reaching_k * payout_at_k) for optimal strategy
      // With 99% house edge, the theoretical RTP should be ~99% per step
      // Verify multiplier at step 1 × survival probability = ~0.99
      for (const mines of [1, 3, 5, 10]) {
        const mult1 = getMultiplier(1, mines);
        const survivalProb = (25 - mines) / 25;
        const ev = mult1 * survivalProb;
        expect(ev).toBeCloseTo(0.99, 1);
      }
    });
  });
});
