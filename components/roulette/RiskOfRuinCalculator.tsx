"use client";

import { useState, useMemo } from "react";
import type { WheelType, BetType } from "@/lib/roulette/rouletteTypes";
import {
  calculateRiskOfRuin,
  sensitivityAnalysis,
  martingaleRuinTable,
  generateSamplePaths,
} from "@/lib/roulette/riskOfRuinEngine";
import type { SensitivityRow, MartingaleRuinRow } from "@/lib/roulette/riskOfRuinEngine";
import dynamic from "next/dynamic";
import EducationalPanel from "./EducationalPanel";

const SamplePathsChart = dynamic(() => import("./SamplePathsChart"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full animate-pulse rounded-xl bg-pb-bg-tertiary" />
  ),
});

const BET_OPTIONS: { value: BetType; label: string }[] = [
  { value: "redBlack", label: "Red / Black (1:1)" },
  { value: "evenOdd", label: "Even / Odd (1:1)" },
  { value: "highLow", label: "High / Low (1:1)" },
  { value: "dozen", label: "Dozen (2:1)" },
  { value: "column", label: "Column (2:1)" },
  { value: "straight", label: "Straight Up (35:1)" },
];

const BANKROLL_RANGE = [10, 25, 50, 100, 200, 500, 1000];

export default function RiskOfRuinCalculator() {
  const [wheelType, setWheelType] = useState<WheelType>("european");
  const [betType, setBetType] = useState<BetType>("redBlack");
  const [bankrollUnits, setBankrollUnits] = useState(100);
  const [targetProfitUnits, setTargetProfitUnits] = useState<number | null>(50);
  const [hasCalculated, setHasCalculated] = useState(false);

  const results = useMemo(() => {
    if (!hasCalculated) return null;
    const ruin = calculateRiskOfRuin(wheelType, betType, bankrollUnits, targetProfitUnits);
    const sensitivity = sensitivityAnalysis(wheelType, betType, BANKROLL_RANGE, targetProfitUnits);
    const martingale = martingaleRuinTable(wheelType, 1, 12);
    const paths = generateSamplePaths(wheelType, betType, bankrollUnits, targetProfitUnits, 500, 10);
    return { ruin, sensitivity, martingale, paths };
  }, [hasCalculated, wheelType, betType, bankrollUnits, targetProfitUnits]);

  function handleCalculate() {
    setHasCalculated(true);
  }

  function getRuinColor(ruin: number) {
    if (ruin < 0.25) return "text-green-400";
    if (ruin < 0.75) return "text-amber-400";
    return "text-red-400";
  }

  return (
    <div className="space-y-8">
      <EducationalPanel variant="warning" title="Understanding Risk of Ruin">
        Risk of Ruin is the probability that you will lose your entire bankroll before
        reaching your profit target. For negative EV games like roulette, playing
        indefinitely guarantees ruin — the only question is how long it takes.
      </EducationalPanel>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-6 space-y-4">
          <h3 className="font-heading font-bold text-pb-text-primary">Configuration</h3>

          <div>
            <label className="text-sm text-pb-text-secondary block mb-1">Wheel Type</label>
            <div className="flex gap-2">
              {(["european", "american"] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => { setWheelType(w); setHasCalculated(false); }}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    wheelType === w
                      ? "bg-pb-accent text-pb-bg-primary"
                      : "bg-pb-bg-tertiary text-pb-text-secondary hover:text-pb-text-primary"
                  }`}
                >
                  {w === "european" ? "European" : "American"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-pb-text-secondary block mb-1">Bet Type</label>
            <select
              value={betType}
              onChange={(e) => { setBetType(e.target.value as BetType); setHasCalculated(false); }}
              className="w-full bg-pb-bg-tertiary border border-pb-border rounded-lg px-3 py-2 text-sm text-pb-text-primary"
            >
              {BET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-pb-text-secondary block mb-1">Bankroll (units)</label>
            <input
              type="number"
              value={bankrollUnits}
              onChange={(e) => { setBankrollUnits(Math.max(1, Number(e.target.value))); setHasCalculated(false); }}
              className="w-full bg-pb-bg-tertiary border border-pb-border rounded-lg px-3 py-2 text-sm text-pb-text-primary font-mono-stats"
              min={1}
              max={10000}
            />
          </div>

          <div>
            <label className="text-sm text-pb-text-secondary block mb-1">
              Profit Target (units)
              <span className="text-pb-text-muted ml-1">— optional</span>
            </label>
            <input
              type="number"
              value={targetProfitUnits ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setTargetProfitUnits(v === "" ? null : Math.max(1, Number(v)));
                setHasCalculated(false);
              }}
              placeholder="Leave empty for infinite play"
              className="w-full bg-pb-bg-tertiary border border-pb-border rounded-lg px-3 py-2 text-sm text-pb-text-primary font-mono-stats"
              min={1}
            />
          </div>

          <button
            onClick={handleCalculate}
            className="w-full py-3 bg-pb-accent text-pb-bg-primary rounded-lg font-heading font-bold text-sm hover:brightness-110 transition cursor-pointer"
          >
            Calculate Risk of Ruin
          </button>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {results ? (
            <>
              {/* Main ruin probability */}
              <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-6 text-center">
                <p className="text-sm text-pb-text-secondary mb-2">Risk of Ruin</p>
                <p className={`font-mono-stats text-5xl font-bold ${getRuinColor(results.ruin)}`}>
                  {(results.ruin * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-pb-text-muted mt-2">
                  {results.ruin >= 0.99
                    ? "Ruin is virtually certain with indefinite play"
                    : results.ruin < 0.25
                      ? "Relatively safe with this bankroll/target combination"
                      : "Significant risk — consider a larger bankroll or smaller target"}
                </p>
              </div>

              {/* Sensitivity Table */}
              <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-6">
                <h4 className="font-heading font-bold text-pb-text-primary mb-4">Bankroll Sensitivity</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-pb-text-muted border-b border-pb-border">
                        <th className="text-left py-2 pr-4">Bankroll</th>
                        <th className="text-right py-2 pr-4">Ruin %</th>
                        <th className="text-right py-2">Survival %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.sensitivity.map((row: SensitivityRow) => (
                        <tr
                          key={row.bankrollUnits}
                          className={`border-b border-pb-border/50 ${
                            row.bankrollUnits === bankrollUnits ? "bg-pb-accent/10" : ""
                          }`}
                        >
                          <td className="py-2 pr-4 font-mono-stats text-pb-text-primary">
                            {row.bankrollUnits} units
                          </td>
                          <td className={`text-right py-2 pr-4 font-mono-stats ${getRuinColor(row.ruinProbability)}`}>
                            {(row.ruinProbability * 100).toFixed(1)}%
                          </td>
                          <td className="text-right py-2 font-mono-stats text-pb-text-secondary">
                            {(row.survivalProbability * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sample Paths Chart */}
              <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-6">
                <h4 className="font-heading font-bold text-pb-text-primary mb-4">Sample Bankroll Paths</h4>
                <SamplePathsChart paths={results.paths} bankrollUnits={bankrollUnits} />
              </div>

              {/* Martingale Progression Table */}
              <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-6">
                <h4 className="font-heading font-bold text-pb-text-primary mb-4">
                  Martingale Risk (Even-Money Bets)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-pb-text-muted border-b border-pb-border">
                        <th className="text-left py-2 pr-4">Losses</th>
                        <th className="text-right py-2 pr-4">Bet Size</th>
                        <th className="text-right py-2 pr-4">Total Lost</th>
                        <th className="text-right py-2">Probability</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.martingale.map((row: MartingaleRuinRow) => (
                        <tr key={row.consecutiveLosses} className="border-b border-pb-border/50">
                          <td className="py-2 pr-4 font-mono-stats text-pb-text-primary">
                            {row.consecutiveLosses}
                          </td>
                          <td className="text-right py-2 pr-4 font-mono-stats text-pb-text-primary">
                            ${row.betSize.toLocaleString()}
                          </td>
                          <td className={`text-right py-2 pr-4 font-mono-stats ${
                            row.cumulativeLoss > 1000 ? "text-red-400" : "text-pb-text-primary"
                          }`}>
                            ${row.cumulativeLoss.toLocaleString()}
                          </td>
                          <td className="text-right py-2 font-mono-stats text-pb-text-secondary">
                            {(row.probability * 100).toFixed(3)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-12 text-center">
              <p className="text-pb-text-muted">
                Configure your parameters and click Calculate to see results.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
