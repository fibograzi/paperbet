import { describe, it, expect } from "vitest";
import {
  calculateRiskOfRuin,
  sensitivityAnalysis,
  martingaleRuinTable,
  generateSamplePaths,
} from "@/lib/roulette/riskOfRuinEngine";

describe("riskOfRuinEngine", () => {
  // -------------------------------------------------------------------------
  // Even-money ruin (analytical formula)
  // -------------------------------------------------------------------------
  describe("calculateRiskOfRuin (even-money)", () => {
    it("ruin probability is 1 for infinite play on negative EV game", () => {
      // European roulette even-money: house always wins eventually
      const ruin = calculateRiskOfRuin("european", "redBlack", 50);
      expect(ruin).toBe(1);
    });

    it("ruin decreases with larger bankroll (with profit target)", () => {
      const ruin10 = calculateRiskOfRuin("european", "redBlack", 10, 10);
      const ruin50 = calculateRiskOfRuin("european", "redBlack", 50, 10);
      expect(ruin50).toBeLessThan(ruin10);
    });

    it("ruin is between 0 and 1", () => {
      const ruin = calculateRiskOfRuin("european", "redBlack", 100, 50);
      expect(ruin).toBeGreaterThanOrEqual(0);
      expect(ruin).toBeLessThanOrEqual(1);
    });

    it("American wheel has higher ruin than European", () => {
      const ruinEuro = calculateRiskOfRuin("european", "redBlack", 50, 50);
      const ruinAmerican = calculateRiskOfRuin("american", "redBlack", 50, 50);
      expect(ruinAmerican).toBeGreaterThanOrEqual(ruinEuro);
    });
  });

  // -------------------------------------------------------------------------
  // Sensitivity analysis
  // -------------------------------------------------------------------------
  describe("sensitivityAnalysis", () => {
    it("returns correct number of rows", () => {
      const rows = sensitivityAnalysis("european", "redBlack", [10, 25, 50, 100]);
      expect(rows).toHaveLength(4);
    });

    it("survival probability = 1 - ruin probability", () => {
      const rows = sensitivityAnalysis("european", "redBlack", [10, 50], 20);
      for (const row of rows) {
        expect(row.survivalProbability).toBeCloseTo(1 - row.ruinProbability, 6);
      }
    });

    it("larger bankroll has better survival rate (with target)", () => {
      const rows = sensitivityAnalysis("european", "redBlack", [10, 100], 10);
      expect(rows[1].survivalProbability).toBeGreaterThanOrEqual(rows[0].survivalProbability);
    });
  });

  // -------------------------------------------------------------------------
  // Martingale ruin table
  // -------------------------------------------------------------------------
  describe("martingaleRuinTable", () => {
    it("returns correct number of rows", () => {
      const table = martingaleRuinTable("european", 1, 10);
      expect(table).toHaveLength(10);
    });

    it("bet doubles each row", () => {
      const table = martingaleRuinTable("european", 10, 5);
      expect(table[0].betSize).toBe(10);
      expect(table[1].betSize).toBe(20);
      expect(table[2].betSize).toBe(40);
      expect(table[3].betSize).toBe(80);
      expect(table[4].betSize).toBe(160);
    });

    it("cumulative loss follows 2^n - 1 formula", () => {
      const table = martingaleRuinTable("european", 5, 8);
      for (const row of table) {
        const expected = 5 * (Math.pow(2, row.consecutiveLosses) - 1);
        expect(row.cumulativeLoss).toBeCloseTo(expected, 2);
      }
    });

    it("probability decreases with more consecutive losses", () => {
      const table = martingaleRuinTable("european", 1, 10);
      for (let i = 1; i < table.length; i++) {
        expect(table[i].probability).toBeLessThan(table[i - 1].probability);
      }
    });

    it("probability is q^n for European even-money", () => {
      const q = 1 - 18 / 37; // ~0.5135
      const table = martingaleRuinTable("european", 1, 5);
      for (const row of table) {
        expect(row.probability).toBeCloseTo(Math.pow(q, row.consecutiveLosses), 4);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Sample paths
  // -------------------------------------------------------------------------
  describe("generateSamplePaths", () => {
    it("generates correct number of paths", () => {
      const paths = generateSamplePaths("european", "redBlack", 100, 50, 200, 10);
      expect(paths).toHaveLength(10);
    });

    it("each path starts at initial bankroll", () => {
      const paths = generateSamplePaths("european", "redBlack", 100, null, 50, 5);
      for (const path of paths) {
        expect(path.bankrollHistory[0]).toBe(100);
      }
    });

    it("bankroll history length <= maxSpins + 1", () => {
      const paths = generateSamplePaths("european", "redBlack", 100, null, 50, 5);
      for (const path of paths) {
        expect(path.bankrollHistory.length).toBeLessThanOrEqual(51);
      }
    });

    it("bankrupt paths end at or below 0", () => {
      const paths = generateSamplePaths("european", "redBlack", 10, null, 1000, 20);
      for (const path of paths) {
        if (path.wentBankrupt) {
          expect(path.finalBankroll).toBeLessThanOrEqual(0);
        }
      }
    });
  });
});
