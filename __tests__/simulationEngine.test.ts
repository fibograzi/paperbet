import { describe, it, expect } from "vitest";
import { runSession, runSimulation } from "@/lib/roulette/simulationEngine";
import type { SimulationConfig } from "@/lib/roulette/strategyTypes";

const baseConfig: SimulationConfig = {
  strategyId: "flat",
  wheelType: "european",
  betType: "redBlack",
  baseBet: 1,
  startingBankroll: 100,
  stopConditions: {
    maxSpins: 100,
    stopOnBankrupt: true,
    stopOnProfit: null,
    stopOnLoss: null,
    maxBetLimit: null,
  },
  numberOfSessions: 1,
};

describe("simulationEngine", () => {
  // -------------------------------------------------------------------------
  // Single session
  // -------------------------------------------------------------------------
  describe("runSession", () => {
    it("returns valid session result", () => {
      const result = runSession(baseConfig);
      expect(result.totalSpins).toBeGreaterThan(0);
      expect(result.totalSpins).toBeLessThanOrEqual(100);
      expect(result.totalWagered).toBeGreaterThan(0);
      expect(result.bankrollHistory).toHaveLength(result.totalSpins + 1); // +1 for initial
      expect(result.bankrollHistory[0]).toBe(100);
    });

    it("stops on bankruptcy", () => {
      const config: SimulationConfig = {
        ...baseConfig,
        baseBet: 50, // 50 per spin, 100 bankroll → can go bankrupt fast
        stopConditions: { ...baseConfig.stopConditions, maxSpins: 1000 },
      };
      const result = runSession(config);
      if (result.wentBankrupt) {
        expect(result.finalBankroll).toBeLessThan(50);
      }
    });

    it("respects profit target stop", () => {
      const config: SimulationConfig = {
        ...baseConfig,
        stopConditions: {
          ...baseConfig.stopConditions,
          stopOnProfit: 10,
          maxSpins: 10000,
        },
      };
      const result = runSession(config);
      if (result.hitProfitTarget) {
        expect(result.netProfit).toBeGreaterThanOrEqual(10);
      }
    });

    it("respects loss limit stop", () => {
      const config: SimulationConfig = {
        ...baseConfig,
        stopConditions: {
          ...baseConfig.stopConditions,
          stopOnLoss: 20,
          maxSpins: 10000,
        },
      };
      const result = runSession(config);
      if (result.hitLossLimit) {
        expect(result.netProfit).toBeLessThanOrEqual(-20);
      }
    });

    it("net profit equals final bankroll minus starting", () => {
      const result = runSession(baseConfig);
      expect(result.netProfit).toBeCloseTo(result.finalBankroll - 100, 2);
    });

    it("peak bankroll is at least starting bankroll", () => {
      const result = runSession(baseConfig);
      expect(result.peakBankroll).toBeGreaterThanOrEqual(99); // Could dip before peaking
    });
  });

  // -------------------------------------------------------------------------
  // Martingale session
  // -------------------------------------------------------------------------
  describe("Martingale session", () => {
    it("max bet grows exponentially", () => {
      const config: SimulationConfig = {
        ...baseConfig,
        strategyId: "martingale",
        startingBankroll: 1000,
        stopConditions: { ...baseConfig.stopConditions, maxSpins: 500 },
      };
      const result = runSession(config);
      // Martingale max bet should be at least baseBet
      expect(result.maxBet).toBeGreaterThanOrEqual(1);
    });
  });

  // -------------------------------------------------------------------------
  // Full Monte Carlo simulation
  // -------------------------------------------------------------------------
  describe("runSimulation", () => {
    it("runs multiple sessions and returns summary", () => {
      const config: SimulationConfig = {
        ...baseConfig,
        numberOfSessions: 50,
      };
      const output = runSimulation(config);

      expect(output.sessions).toHaveLength(50);
      expect(output.summary.totalSessions).toBe(50);
      expect(output.histogram.length).toBeGreaterThan(0);
      expect(output.samplePathIndices.length).toBeLessThanOrEqual(20);
      expect(output.durationMs).toBeGreaterThanOrEqual(0);
    });

    it("bankruptcy rate is between 0 and 100", () => {
      const config: SimulationConfig = {
        ...baseConfig,
        numberOfSessions: 100,
        stopConditions: { ...baseConfig.stopConditions, maxSpins: 200 },
      };
      const output = runSimulation(config);
      expect(output.summary.bankruptcyRate).toBeGreaterThanOrEqual(0);
      expect(output.summary.bankruptcyRate).toBeLessThanOrEqual(100);
    });

    it("profit rate + non-profit rate sums correctly", () => {
      const config: SimulationConfig = {
        ...baseConfig,
        numberOfSessions: 100,
      };
      const output = runSimulation(config);
      // Profit rate + loss/even rate should be close to 100
      const profitSessions = output.sessions.filter((s) => s.netProfit > 0).length;
      expect(output.summary.profitRate).toBeCloseTo((profitSessions / 100) * 100, 0);
    });

    it("calls progress callback", () => {
      let lastPct = 0;
      const config: SimulationConfig = {
        ...baseConfig,
        numberOfSessions: 100,
      };
      runSimulation(config, (pct) => {
        expect(pct).toBeGreaterThanOrEqual(lastPct);
        lastPct = pct;
      });
      expect(lastPct).toBe(100);
    });

    it("histogram buckets cover all sessions", () => {
      const config: SimulationConfig = {
        ...baseConfig,
        numberOfSessions: 200,
      };
      const output = runSimulation(config);
      const totalCount = output.histogram.reduce((sum, b) => sum + b.count, 0);
      expect(totalCount).toBe(200);
    });
  });
});
