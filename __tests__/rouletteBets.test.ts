import { describe, it, expect } from "vitest";
import {
  BET_REGISTRY,
  getBetProbability,
  getBetHouseEdge,
  getBetEV,
  getRedNumbers,
  getBlackNumbers,
  getEvenNumbers,
  getOddNumbers,
  getLowNumbers,
  getHighNumbers,
  getDozenNumbers,
  getColumnNumbers,
  getStreetNumbers,
} from "@/lib/roulette/rouletteBets";

describe("rouletteBets", () => {
  // -------------------------------------------------------------------------
  // Number set helpers
  // -------------------------------------------------------------------------
  describe("number sets", () => {
    it("red numbers has 18 entries", () => {
      expect(getRedNumbers()).toHaveLength(18);
    });

    it("black numbers has 18 entries", () => {
      expect(getBlackNumbers()).toHaveLength(18);
    });

    it("red and black don't overlap", () => {
      const reds = new Set(getRedNumbers());
      const blacks = getBlackNumbers();
      for (const b of blacks) {
        expect(reds.has(b)).toBe(false);
      }
    });

    it("red + black covers 1-36", () => {
      const all = [...getRedNumbers(), ...getBlackNumbers()].sort((a, b) => a - b);
      expect(all).toEqual(Array.from({ length: 36 }, (_, i) => i + 1));
    });

    it("even numbers are all even", () => {
      for (const n of getEvenNumbers()) {
        expect(n % 2).toBe(0);
      }
      expect(getEvenNumbers()).toHaveLength(18);
    });

    it("odd numbers are all odd", () => {
      for (const n of getOddNumbers()) {
        expect(n % 2).toBe(1);
      }
      expect(getOddNumbers()).toHaveLength(18);
    });

    it("low numbers are 1-18", () => {
      const low = getLowNumbers();
      expect(low).toHaveLength(18);
      expect(low[0]).toBe(1);
      expect(low[17]).toBe(18);
    });

    it("high numbers are 19-36", () => {
      const high = getHighNumbers();
      expect(high).toHaveLength(18);
      expect(high[0]).toBe(19);
      expect(high[17]).toBe(36);
    });

    it("dozens each have 12 numbers", () => {
      expect(getDozenNumbers(1)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
      expect(getDozenNumbers(2)).toEqual([13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]);
      expect(getDozenNumbers(3)).toEqual([25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36]);
    });

    it("columns each have 12 numbers", () => {
      expect(getColumnNumbers(1)).toEqual([1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]);
      expect(getColumnNumbers(2)).toEqual([2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35]);
      expect(getColumnNumbers(3)).toEqual([3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36]);
    });

    it("streets each have 3 numbers", () => {
      expect(getStreetNumbers(1)).toEqual([1, 2, 3]);
      expect(getStreetNumbers(4)).toEqual([10, 11, 12]);
      expect(getStreetNumbers(12)).toEqual([34, 35, 36]);
    });
  });

  // -------------------------------------------------------------------------
  // Probabilities
  // -------------------------------------------------------------------------
  describe("probabilities", () => {
    it("even-money European probability is 18/37", () => {
      expect(getBetProbability("redBlack", "european")).toBeCloseTo(18 / 37, 6);
      expect(getBetProbability("evenOdd", "european")).toBeCloseTo(18 / 37, 6);
      expect(getBetProbability("highLow", "european")).toBeCloseTo(18 / 37, 6);
    });

    it("even-money American probability is 18/38", () => {
      expect(getBetProbability("redBlack", "american")).toBeCloseTo(18 / 38, 6);
      expect(getBetProbability("evenOdd", "american")).toBeCloseTo(18 / 38, 6);
      expect(getBetProbability("highLow", "american")).toBeCloseTo(18 / 38, 6);
    });

    it("straight European probability is 1/37", () => {
      expect(getBetProbability("straight", "european")).toBeCloseTo(1 / 37, 6);
    });

    it("straight American probability is 1/38", () => {
      expect(getBetProbability("straight", "american")).toBeCloseTo(1 / 38, 6);
    });

    it("dozen European probability is 12/37", () => {
      expect(getBetProbability("dozen", "european")).toBeCloseTo(12 / 37, 6);
    });

    it("dozen American probability is 12/38", () => {
      expect(getBetProbability("dozen", "american")).toBeCloseTo(12 / 38, 6);
    });
  });

  // -------------------------------------------------------------------------
  // House edge
  // -------------------------------------------------------------------------
  describe("house edge", () => {
    it("European even-money house edge is ~2.703%", () => {
      const edge = getBetHouseEdge("redBlack", "european");
      expect(edge).toBeCloseTo(2.703, 1);
    });

    it("American even-money house edge is ~5.263%", () => {
      const edge = getBetHouseEdge("redBlack", "american");
      expect(edge).toBeCloseTo(5.263, 1);
    });

    it("European straight house edge is ~2.703%", () => {
      const edge = getBetHouseEdge("straight", "european");
      expect(edge).toBeCloseTo(2.703, 1);
    });

    it("American straight house edge is ~5.263%", () => {
      const edge = getBetHouseEdge("straight", "american");
      expect(edge).toBeCloseTo(5.263, 1);
    });

    it("all European bet types have same house edge (~2.703%)", () => {
      const types = Object.keys(BET_REGISTRY) as Array<keyof typeof BET_REGISTRY>;
      for (const type of types) {
        const edge = getBetHouseEdge(type, "european");
        expect(edge).toBeCloseTo(2.703, 0);
      }
    });

    it("all American bet types have same house edge (~5.263%)", () => {
      const types = Object.keys(BET_REGISTRY) as Array<keyof typeof BET_REGISTRY>;
      for (const type of types) {
        const edge = getBetHouseEdge(type, "american");
        expect(edge).toBeCloseTo(5.263, 0);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Expected value
  // -------------------------------------------------------------------------
  describe("expected value", () => {
    it("EV is always negative (house edge)", () => {
      const types = Object.keys(BET_REGISTRY) as Array<keyof typeof BET_REGISTRY>;
      for (const type of types) {
        expect(getBetEV(type, "european", 1)).toBeLessThan(0);
        expect(getBetEV(type, "american", 1)).toBeLessThan(0);
      }
    });

    it("European EV per $1 on red is ~-$0.027", () => {
      expect(getBetEV("redBlack", "european", 1)).toBeCloseTo(-0.027, 2);
    });

    it("American EV per $1 on red is ~-$0.053", () => {
      expect(getBetEV("redBlack", "american", 1)).toBeCloseTo(-0.053, 2);
    });

    it("EV scales linearly with bet amount", () => {
      const ev1 = getBetEV("straight", "european", 1);
      const ev10 = getBetEV("straight", "european", 10);
      expect(ev10).toBeCloseTo(ev1 * 10, 6);
    });
  });

  // -------------------------------------------------------------------------
  // Bet registry
  // -------------------------------------------------------------------------
  describe("bet registry", () => {
    it("has all 10 bet types", () => {
      expect(Object.keys(BET_REGISTRY)).toHaveLength(10);
    });

    it("each bet has valid payout and coverage", () => {
      for (const def of Object.values(BET_REGISTRY)) {
        expect(def.payout).toBeGreaterThan(0);
        expect(def.coverage).toBeGreaterThan(0);
        expect(def.coverage).toBeLessThanOrEqual(18);
      }
    });

    it("payout × coverage relationship is consistent", () => {
      // For fair odds: payout = (36 / coverage) - 1
      // With house edge, payout < fair payout
      for (const def of Object.values(BET_REGISTRY)) {
        const fairPayout = 36 / def.coverage - 1;
        expect(def.payout).toBeLessThanOrEqual(fairPayout);
      }
    });
  });
});
