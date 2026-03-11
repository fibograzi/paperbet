import { describe, it, expect } from "vitest";
import {
  flatStrategy,
  martingaleStrategy,
  fibonacciStrategy,
  dalembertStrategy,
  labouchereStrategy,
  oscarsGrindStrategy,
  paroliStrategy,
  getStrategy,
  getAllStrategies,
} from "@/lib/roulette/strategyEngine";

const BASE = 10; // $10 base bet

describe("strategyEngine", () => {
  // -------------------------------------------------------------------------
  // Flat
  // -------------------------------------------------------------------------
  describe("Flat", () => {
    it("always returns base bet", () => {
      let state = flatStrategy.init(BASE);
      expect(flatStrategy.getNextBet(state, BASE)).toBe(BASE);

      state = flatStrategy.applyOutcome(state, false, BASE);
      expect(flatStrategy.getNextBet(state, BASE)).toBe(BASE);

      state = flatStrategy.applyOutcome(state, true, BASE);
      expect(flatStrategy.getNextBet(state, BASE)).toBe(BASE);
    });
  });

  // -------------------------------------------------------------------------
  // Martingale
  // -------------------------------------------------------------------------
  describe("Martingale", () => {
    it("doubles after loss", () => {
      let state = martingaleStrategy.init(BASE);
      expect(martingaleStrategy.getNextBet(state, BASE)).toBe(10);

      state = martingaleStrategy.applyOutcome(state, false, BASE);
      expect(martingaleStrategy.getNextBet(state, BASE)).toBe(20);

      state = martingaleStrategy.applyOutcome(state, false, BASE);
      expect(martingaleStrategy.getNextBet(state, BASE)).toBe(40);

      state = martingaleStrategy.applyOutcome(state, false, BASE);
      expect(martingaleStrategy.getNextBet(state, BASE)).toBe(80);
    });

    it("resets after win", () => {
      let state = martingaleStrategy.init(BASE);
      state = martingaleStrategy.applyOutcome(state, false, BASE); // step 1
      state = martingaleStrategy.applyOutcome(state, false, BASE); // step 2
      expect(martingaleStrategy.getNextBet(state, BASE)).toBe(40);

      state = martingaleStrategy.applyOutcome(state, true, BASE); // win resets
      expect(martingaleStrategy.getNextBet(state, BASE)).toBe(10);
    });

    it("progression follows 2^n pattern", () => {
      let state = martingaleStrategy.init(BASE);
      for (let i = 0; i < 10; i++) {
        expect(martingaleStrategy.getNextBet(state, BASE)).toBe(BASE * Math.pow(2, i));
        state = martingaleStrategy.applyOutcome(state, false, BASE);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Fibonacci
  // -------------------------------------------------------------------------
  describe("Fibonacci", () => {
    it("follows Fibonacci sequence on consecutive losses", () => {
      let state = fibonacciStrategy.init(BASE);
      const expected = [1, 1, 2, 3, 5, 8, 13, 21];

      for (let i = 0; i < expected.length; i++) {
        expect(fibonacciStrategy.getNextBet(state, BASE)).toBe(BASE * expected[i]);
        state = fibonacciStrategy.applyOutcome(state, false, BASE);
      }
    });

    it("goes back 2 steps on win", () => {
      let state = fibonacciStrategy.init(BASE);
      // Lose 5 times: step = 5 (bet = base * 8)
      for (let i = 0; i < 5; i++) {
        state = fibonacciStrategy.applyOutcome(state, false, BASE);
      }
      expect(fibonacciStrategy.getNextBet(state, BASE)).toBe(BASE * 8);

      // Win: step 5 -> 3 (bet = base * 3)
      state = fibonacciStrategy.applyOutcome(state, true, BASE);
      expect(fibonacciStrategy.getNextBet(state, BASE)).toBe(BASE * 3);
    });

    it("doesn't go below step 0", () => {
      let state = fibonacciStrategy.init(BASE);
      state = fibonacciStrategy.applyOutcome(state, true, BASE); // Can't go below 0
      expect(fibonacciStrategy.getNextBet(state, BASE)).toBe(BASE * 1);
    });
  });

  // -------------------------------------------------------------------------
  // D'Alembert
  // -------------------------------------------------------------------------
  describe("D'Alembert", () => {
    it("increases by 1 unit after loss", () => {
      let state = dalembertStrategy.init(BASE);
      expect(dalembertStrategy.getNextBet(state, BASE)).toBe(BASE * 1);

      state = dalembertStrategy.applyOutcome(state, false, BASE);
      expect(dalembertStrategy.getNextBet(state, BASE)).toBe(BASE * 2);

      state = dalembertStrategy.applyOutcome(state, false, BASE);
      expect(dalembertStrategy.getNextBet(state, BASE)).toBe(BASE * 3);
    });

    it("decreases by 1 unit after win", () => {
      let state = dalembertStrategy.init(BASE);
      // Lose twice
      state = dalembertStrategy.applyOutcome(state, false, BASE);
      state = dalembertStrategy.applyOutcome(state, false, BASE);
      expect(dalembertStrategy.getNextBet(state, BASE)).toBe(BASE * 3);

      // Win
      state = dalembertStrategy.applyOutcome(state, true, BASE);
      expect(dalembertStrategy.getNextBet(state, BASE)).toBe(BASE * 2);
    });

    it("doesn't go below base bet (step 0)", () => {
      let state = dalembertStrategy.init(BASE);
      state = dalembertStrategy.applyOutcome(state, true, BASE);
      expect(dalembertStrategy.getNextBet(state, BASE)).toBe(BASE * 1);
    });
  });

  // -------------------------------------------------------------------------
  // Labouchere
  // -------------------------------------------------------------------------
  describe("Labouchere", () => {
    it("initial bet is first + last of sequence [1,2,3] = 4 units", () => {
      const state = labouchereStrategy.init(BASE);
      expect(labouchereStrategy.getNextBet(state, BASE)).toBe(BASE * 4);
    });

    it("win removes first and last", () => {
      let state = labouchereStrategy.init(BASE);
      // Sequence: [1,2,3], bet = 4 units
      state = labouchereStrategy.applyOutcome(state, true, BASE);
      // After win: [2], bet = 2 units
      expect(labouchereStrategy.getNextBet(state, BASE)).toBe(BASE * 2);
    });

    it("loss appends bet amount", () => {
      let state = labouchereStrategy.init(BASE);
      // Sequence: [1,2,3], bet = 4 units
      state = labouchereStrategy.applyOutcome(state, false, BASE);
      // After loss: [1,2,3,4], bet = 1+4 = 5 units
      expect(labouchereStrategy.getNextBet(state, BASE)).toBe(BASE * 5);
    });
  });

  // -------------------------------------------------------------------------
  // Oscar's Grind
  // -------------------------------------------------------------------------
  describe("Oscar's Grind", () => {
    it("keeps same bet after loss", () => {
      let state = oscarsGrindStrategy.init(BASE);
      expect(oscarsGrindStrategy.getNextBet(state, BASE)).toBe(BASE * 1);

      state = oscarsGrindStrategy.applyOutcome(state, false, BASE);
      expect(oscarsGrindStrategy.getNextBet(state, BASE)).toBe(BASE * 1);
    });

    it("increases by 1 unit after win", () => {
      let state = oscarsGrindStrategy.init(BASE);
      // Lose then win
      state = oscarsGrindStrategy.applyOutcome(state, false, BASE);
      state = oscarsGrindStrategy.applyOutcome(state, true, BASE);
      expect(oscarsGrindStrategy.getNextBet(state, BASE)).toBe(BASE * 2);
    });

    it("resets when cycle profit reaches +1 unit", () => {
      let state = oscarsGrindStrategy.init(BASE);
      // Win immediately (profit = 1 unit)
      state = oscarsGrindStrategy.applyOutcome(state, true, BASE);
      // Should reset to 1 unit
      expect(oscarsGrindStrategy.getNextBet(state, BASE)).toBe(BASE * 1);
      expect(state.cycleProfit).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // Paroli
  // -------------------------------------------------------------------------
  describe("Paroli", () => {
    it("doubles after win", () => {
      let state = paroliStrategy.init(BASE);
      expect(paroliStrategy.getNextBet(state, BASE)).toBe(BASE * 1);

      state = paroliStrategy.applyOutcome(state, true, BASE);
      expect(paroliStrategy.getNextBet(state, BASE)).toBe(BASE * 2);

      state = paroliStrategy.applyOutcome(state, true, BASE);
      expect(paroliStrategy.getNextBet(state, BASE)).toBe(BASE * 4);
    });

    it("resets after loss", () => {
      let state = paroliStrategy.init(BASE);
      state = paroliStrategy.applyOutcome(state, true, BASE);
      expect(paroliStrategy.getNextBet(state, BASE)).toBe(BASE * 2);

      state = paroliStrategy.applyOutcome(state, false, BASE);
      expect(paroliStrategy.getNextBet(state, BASE)).toBe(BASE * 1);
    });

    it("resets after 3 consecutive wins", () => {
      let state = paroliStrategy.init(BASE);
      state = paroliStrategy.applyOutcome(state, true, BASE); // step 1 → 2x
      state = paroliStrategy.applyOutcome(state, true, BASE); // step 2 → 4x
      state = paroliStrategy.applyOutcome(state, true, BASE); // step 3 → reset
      expect(paroliStrategy.getNextBet(state, BASE)).toBe(BASE * 1);
    });
  });

  // -------------------------------------------------------------------------
  // Custom Strategy
  // -------------------------------------------------------------------------
  describe("Custom", () => {
    it("applies double on loss, reset on win", () => {
      const strategy = getStrategy("custom", {
        onWin: "reset",
        onLoss: "double",
        maxBetUnits: 100,
        resetAfterWins: null,
        resetAfterLosses: null,
      });

      let state = strategy.init(BASE);
      expect(strategy.getNextBet(state, BASE)).toBe(BASE);

      state = strategy.applyOutcome(state, false, BASE);
      expect(strategy.getNextBet(state, BASE)).toBe(BASE * 2);

      state = strategy.applyOutcome(state, true, BASE);
      expect(strategy.getNextBet(state, BASE)).toBe(BASE);
    });
  });

  // -------------------------------------------------------------------------
  // Registry
  // -------------------------------------------------------------------------
  describe("registry", () => {
    it("has 7 built-in strategies", () => {
      expect(getAllStrategies()).toHaveLength(7);
    });

    it("each strategy has required fields", () => {
      for (const strategy of getAllStrategies()) {
        expect(strategy.id).toBeTruthy();
        expect(strategy.name).toBeTruthy();
        expect(strategy.description).toBeTruthy();
        expect(typeof strategy.init).toBe("function");
        expect(typeof strategy.getNextBet).toBe("function");
        expect(typeof strategy.applyOutcome).toBe("function");
        expect(typeof strategy.reset).toBe("function");
      }
    });
  });
});
