import { describe, it, expect } from "vitest";
import {
  getPocketColor,
  getWheelPockets,
  getPocketCount,
  getHouseEdge,
  generateSpin,
  evaluateBet,
  evaluateAllBets,
  getWheelOrder,
} from "@/lib/roulette/rouletteEngine";
import type { PlacedBet, SpinResult } from "@/lib/roulette/rouletteTypes";

describe("rouletteEngine", () => {
  // -------------------------------------------------------------------------
  // Pocket color mapping
  // -------------------------------------------------------------------------
  describe("getPocketColor", () => {
    it("returns green for 0", () => {
      expect(getPocketColor(0)).toBe("green");
    });

    it("returns green for 00 (-1)", () => {
      expect(getPocketColor(-1)).toBe("green");
    });

    it("returns red for known red numbers", () => {
      const reds = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
      for (const n of reds) {
        expect(getPocketColor(n)).toBe("red");
      }
    });

    it("returns black for known black numbers", () => {
      const blacks = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
      for (const n of blacks) {
        expect(getPocketColor(n)).toBe("black");
      }
    });

    it("has exactly 18 red and 18 black numbers", () => {
      let reds = 0, blacks = 0;
      for (let i = 1; i <= 36; i++) {
        if (getPocketColor(i) === "red") reds++;
        if (getPocketColor(i) === "black") blacks++;
      }
      expect(reds).toBe(18);
      expect(blacks).toBe(18);
    });
  });

  // -------------------------------------------------------------------------
  // Wheel configurations
  // -------------------------------------------------------------------------
  describe("wheel configurations", () => {
    it("European wheel has 37 pockets", () => {
      expect(getPocketCount("european")).toBe(37);
      expect(getWheelPockets("european")).toHaveLength(37);
    });

    it("American wheel has 38 pockets", () => {
      expect(getPocketCount("american")).toBe(38);
      expect(getWheelPockets("american")).toHaveLength(38);
    });

    it("European house edge is ~2.70%", () => {
      expect(getHouseEdge("european")).toBeCloseTo(2.7027, 2);
    });

    it("American house edge is ~5.26%", () => {
      expect(getHouseEdge("american")).toBeCloseTo(5.2632, 2);
    });

    it("European wheel order has 37 entries", () => {
      expect(getWheelOrder("european")).toHaveLength(37);
    });

    it("American wheel order has 38 entries", () => {
      expect(getWheelOrder("american")).toHaveLength(38);
    });

    it("European wheel contains no -1 (00)", () => {
      const pockets = getWheelPockets("european");
      expect(pockets.find((p) => p.number === -1)).toBeUndefined();
    });

    it("American wheel contains -1 (00)", () => {
      const pockets = getWheelPockets("american");
      expect(pockets.find((p) => p.number === -1)).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // RNG
  // -------------------------------------------------------------------------
  describe("generateSpin", () => {
    it("generates valid European spin results", () => {
      for (let i = 0; i < 100; i++) {
        const result = generateSpin("european");
        expect(result.winningNumber).toBeGreaterThanOrEqual(0);
        expect(result.winningNumber).toBeLessThanOrEqual(36);
        expect(result.pocket.color).toMatch(/^(red|black|green)$/);
      }
    });

    it("generates valid American spin results", () => {
      for (let i = 0; i < 100; i++) {
        const result = generateSpin("american");
        expect(result.winningNumber).toBeGreaterThanOrEqual(-1);
        expect(result.winningNumber).toBeLessThanOrEqual(36);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Bet evaluation
  // -------------------------------------------------------------------------
  describe("evaluateBet", () => {
    const makeBet = (type: PlacedBet["type"], numbers: number[], amount: number): PlacedBet => ({
      id: "test",
      type,
      amount,
      numbers,
      label: "test bet",
    });

    const makeResult = (num: number): SpinResult => ({
      pocket: { number: num, label: String(num), color: getPocketColor(num) },
      winningNumber: num,
    });

    it("straight bet pays 35:1 on win", () => {
      const bet = makeBet("straight", [17], 10);
      const result = evaluateBet(bet, makeResult(17));
      expect(result.won).toBe(true);
      expect(result.payout).toBe(360); // 10 * (35 + 1)
      expect(result.profit).toBe(350);
    });

    it("straight bet loses if number doesn't match", () => {
      const bet = makeBet("straight", [17], 10);
      const result = evaluateBet(bet, makeResult(5));
      expect(result.won).toBe(false);
      expect(result.payout).toBe(0);
      expect(result.profit).toBe(-10);
    });

    it("red/black bet pays 1:1 on win", () => {
      const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
      const bet = makeBet("redBlack", redNumbers, 10);
      const result = evaluateBet(bet, makeResult(1)); // 1 is red
      expect(result.won).toBe(true);
      expect(result.payout).toBe(20); // 10 * (1 + 1)
      expect(result.profit).toBe(10);
    });

    it("dozen bet pays 2:1 on win", () => {
      const firstDozen = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      const bet = makeBet("dozen", firstDozen, 10);
      const result = evaluateBet(bet, makeResult(5));
      expect(result.won).toBe(true);
      expect(result.payout).toBe(30); // 10 * (2 + 1)
      expect(result.profit).toBe(20);
    });

    it("corner bet pays 8:1 on win", () => {
      const bet = makeBet("corner", [1, 2, 4, 5], 10);
      const result = evaluateBet(bet, makeResult(4));
      expect(result.won).toBe(true);
      expect(result.payout).toBe(90); // 10 * (8 + 1)
      expect(result.profit).toBe(80);
    });
  });

  describe("evaluateAllBets", () => {
    it("evaluates multiple bets correctly", () => {
      const bets: PlacedBet[] = [
        { id: "1", type: "straight", amount: 5, numbers: [17], label: "17" },
        { id: "2", type: "redBlack", amount: 10, numbers: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36], label: "Red" },
      ];
      const result: SpinResult = {
        pocket: { number: 17, label: "17", color: "black" },
        winningNumber: 17,
      };

      const outcomes = evaluateAllBets(bets, result);
      expect(outcomes).toHaveLength(2);
      expect(outcomes[0].won).toBe(true);  // Straight on 17
      expect(outcomes[1].won).toBe(false); // Red bet, 17 is black
    });
  });
});
