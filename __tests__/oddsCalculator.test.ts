import { describe, it, expect } from "vitest";
import {
  buildOddsTable,
  streakProbability,
  expectedSpinsToWin,
  cumulativeMartingaleLoss,
  martingaleBetAtStep,
  expectedLoss,
  probabilityOfProfit,
} from "@/lib/roulette/oddsCalculator";

describe("oddsCalculator", () => {
  // -------------------------------------------------------------------------
  // Odds table
  // -------------------------------------------------------------------------
  describe("buildOddsTable", () => {
    it("returns 10 rows (one per bet type)", () => {
      const table = buildOddsTable();
      expect(table).toHaveLength(10);
    });

    it("each row has valid fields", () => {
      const table = buildOddsTable();
      for (const row of table) {
        expect(row.betType).toBeTruthy();
        expect(row.name).toBeTruthy();
        expect(row.payout).toMatch(/^\d+:1$/);
        expect(row.coverage).toBeGreaterThan(0);
        expect(row.probabilityEuro).toBeGreaterThan(0);
        expect(row.probabilityEuro).toBeLessThan(1);
        expect(row.probabilityAmerican).toBeGreaterThan(0);
        expect(row.probabilityAmerican).toBeLessThan(1);
        expect(row.houseEdgeEuro).toBeGreaterThan(0);
        expect(row.houseEdgeAmerican).toBeGreaterThan(0);
        expect(row.evPerDollarEuro).toBeLessThan(0);
        expect(row.evPerDollarAmerican).toBeLessThan(0);
      }
    });

    it("European probabilities are slightly higher than American", () => {
      const table = buildOddsTable();
      for (const row of table) {
        expect(row.probabilityEuro).toBeGreaterThan(row.probabilityAmerican);
      }
    });

    it("American house edge is higher than European", () => {
      const table = buildOddsTable();
      for (const row of table) {
        expect(row.houseEdgeAmerican).toBeGreaterThan(row.houseEdgeEuro);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Streak probability
  // -------------------------------------------------------------------------
  describe("streakProbability", () => {
    it("probability of 1 win on even-money Euro = 18/37", () => {
      const p = streakProbability("redBlack", "european", 1, "win");
      expect(p).toBeCloseTo(18 / 37, 6);
    });

    it("probability of 5 consecutive losses on Euro even-money", () => {
      const q = 1 - 18 / 37;
      const p = streakProbability("redBlack", "european", 5, "loss");
      expect(p).toBeCloseTo(Math.pow(q, 5), 6);
    });

    it("probability decreases with longer streaks", () => {
      const p3 = streakProbability("redBlack", "european", 3, "loss");
      const p5 = streakProbability("redBlack", "european", 5, "loss");
      const p10 = streakProbability("redBlack", "european", 10, "loss");
      expect(p5).toBeLessThan(p3);
      expect(p10).toBeLessThan(p5);
    });
  });

  // -------------------------------------------------------------------------
  // Expected spins to win
  // -------------------------------------------------------------------------
  describe("expectedSpinsToWin", () => {
    it("even-money European = ~2.056 spins", () => {
      expect(expectedSpinsToWin("redBlack", "european")).toBeCloseTo(37 / 18, 2);
    });

    it("straight European = 37 spins", () => {
      expect(expectedSpinsToWin("straight", "european")).toBeCloseTo(37, 0);
    });

    it("dozen European = ~3.083 spins", () => {
      expect(expectedSpinsToWin("dozen", "european")).toBeCloseTo(37 / 12, 2);
    });
  });

  // -------------------------------------------------------------------------
  // Martingale math
  // -------------------------------------------------------------------------
  describe("Martingale math", () => {
    it("cumulative loss after 5 losses with $1 base = $31", () => {
      expect(cumulativeMartingaleLoss(1, 5)).toBe(31);
    });

    it("cumulative loss after 10 losses with $1 base = $1023", () => {
      expect(cumulativeMartingaleLoss(1, 10)).toBe(1023);
    });

    it("bet at step 0 = base", () => {
      expect(martingaleBetAtStep(10, 0)).toBe(10);
    });

    it("bet at step 3 = base * 8", () => {
      expect(martingaleBetAtStep(10, 3)).toBe(80);
    });
  });

  // -------------------------------------------------------------------------
  // Expected loss over N spins
  // -------------------------------------------------------------------------
  describe("expectedLoss", () => {
    it("expected loss is negative (player loses)", () => {
      const loss = expectedLoss("redBlack", "european", 1, 100);
      expect(loss).toBeLessThan(0);
    });

    it("scales with number of spins", () => {
      const loss100 = expectedLoss("redBlack", "european", 1, 100);
      const loss1000 = expectedLoss("redBlack", "european", 1, 1000);
      expect(loss1000).toBeCloseTo(loss100 * 10, 2);
    });

    it("scales with bet amount", () => {
      const loss1 = expectedLoss("redBlack", "european", 1, 100);
      const loss10 = expectedLoss("redBlack", "european", 10, 100);
      expect(loss10).toBeCloseTo(loss1 * 10, 2);
    });
  });

  // -------------------------------------------------------------------------
  // Probability of profit
  // -------------------------------------------------------------------------
  describe("probabilityOfProfit", () => {
    it("probability of profit decreases with more spins", () => {
      const p10 = probabilityOfProfit("redBlack", "european", 10);
      const p100 = probabilityOfProfit("redBlack", "european", 100);
      const p1000 = probabilityOfProfit("redBlack", "european", 1000);
      // Due to house edge, longer play means less likely to be ahead
      expect(p100).toBeLessThan(p10);
      expect(p1000).toBeLessThan(p100);
    });

    it("probability is between 0 and 1", () => {
      const p = probabilityOfProfit("redBlack", "european", 100);
      expect(p).toBeGreaterThan(0);
      expect(p).toBeLessThan(1);
    });

    it("short sessions have near 50% chance on even-money", () => {
      const p = probabilityOfProfit("redBlack", "european", 10);
      // Should be close to 50% for short sessions
      expect(p).toBeGreaterThan(0.35);
      expect(p).toBeLessThan(0.55);
    });
  });
});
