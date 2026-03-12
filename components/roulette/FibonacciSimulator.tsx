"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import ProgressionTable from "./ProgressionTable";
import EducationalPanel from "./EducationalPanel";

const ExponentialGrowthChart = dynamic(() => import("./ExponentialGrowthChart"), {
  ssr: false,
  loading: () => <div className="h-56 w-full animate-pulse rounded-xl bg-pb-bg-tertiary" />,
});
import { runSimulation } from "@/lib/roulette/simulationEngine";
import type { SimulationConfig } from "@/lib/roulette/strategyTypes";
import type { SimulationSummary } from "@/lib/roulette/simulationTypes";

function fmt(n: number, d = 0): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
}

function fmtPct(n: number): string {
  return `${fmt(n, 1)}%`;
}

function fibAt(n: number): number {
  if (n <= 0) return 1;
  if (n === 1) return 1;
  let a = 1, b = 1;
  for (let i = 2; i <= n; i++) {
    const t = a + b;
    a = b;
    b = t;
  }
  return b;
}

interface QuickStatProps {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  danger?: boolean;
}

function QuickStat({ label, value, sub, highlight, danger }: QuickStatProps) {
  return (
    <div className="bg-pb-bg-tertiary rounded-xl p-4">
      <p className="text-xs text-pb-text-muted mb-1">{label}</p>
      <p
        className={`font-mono-stats text-lg font-bold ${
          danger ? "text-pb-danger" : highlight ? "text-pb-accent" : "text-pb-text-primary"
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-pb-text-muted mt-0.5">{sub}</p>}
    </div>
  );
}

// First N Fibonacci numbers for display
const FIB_SEQUENCE = Array.from({ length: 12 }, (_, i) => fibAt(i));

export default function FibonacciSimulator() {
  const [baseBet, setBaseBet] = useState(5);
  const [simResult, setSimResult] = useState<SimulationSummary | null>(null);
  const [simRunning, setSimRunning] = useState(false);

  const runMiniSim = () => {
    setSimRunning(true);
    setTimeout(() => {
      const config: SimulationConfig = {
        strategyId: "fibonacci",
        wheelType: "european",
        betType: "redBlack",
        baseBet,
        startingBankroll: baseBet * 100,
        numberOfSessions: 1000,
        stopConditions: {
          maxSpins: 300,
          stopOnBankrupt: true,
          stopOnProfit: null,
          stopOnLoss: null,
          maxBetLimit: null,
        },
      };
      const output = runSimulation(config);
      setSimResult(output.summary);
      setSimRunning(false);
    }, 0);
  };

  // Find step at which cumulative loss exceeds 100x bankroll
  const ruinStep = useMemo(() => {
    const bankroll = baseBet * 100;
    let cumLoss = 0;
    for (let i = 0; i < 25; i++) {
      const bet = baseBet * fibAt(i);
      if (cumLoss + bet > bankroll) return i + 1;
      cumLoss += bet;
    }
    return null;
  }, [baseBet]);

  // Compare Fibonacci vs Martingale at step 10
  const fibAt10 = baseBet * fibAt(9); // 0-indexed step 10
  const martiAt10 = baseBet * Math.pow(2, 9);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="font-heading text-3xl font-bold text-pb-text-primary">
          Fibonacci Roulette Simulator
        </h1>
        <p className="text-pb-text-secondary max-w-2xl">
          The Fibonacci system advances one step forward on loss and two steps back on win. Slower
          than Martingale, but still subject to the same fundamental limits.
        </p>
      </div>

      {/* Sequence explanation */}
      <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-6 space-y-4">
        <h2 className="font-heading font-semibold text-pb-text-primary">The Fibonacci Sequence</h2>
        <p className="text-sm text-pb-text-secondary">
          Each number is the sum of the previous two. The sequence starts: 1, 1, 2, 3, 5, 8, 13…
          Your bet advances one step forward after a loss, and two steps backward after a win.
        </p>
        <div className="flex flex-wrap gap-2">
          {FIB_SEQUENCE.map((fib, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1 bg-pb-bg-tertiary rounded-lg px-3 py-2 min-w-[52px]"
            >
              <span className="text-xs text-pb-text-muted">Step {i + 1}</span>
              <span className="font-mono-stats font-bold text-pb-accent text-sm">{fib}</span>
              <span className="text-xs text-pb-text-muted">${fmt(baseBet * fib, 0)}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-pb-text-muted">
          Fibonacci bet at step 10: ${fmt(fibAt10, 2)} vs Martingale: ${fmt(martiAt10, 2)} — Fibonacci grows ~{Math.round(martiAt10 / fibAt10)}× slower at this point.
        </p>
      </div>

      {/* Progression table */}
      <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-semibold text-pb-text-primary">Bet Progression</h2>
          <div className="flex items-center gap-3">
            <label className="text-sm text-pb-text-secondary">Base Bet: $</label>
            <input
              suppressHydrationWarning
              type="number"
              min={1}
              max={100}
              value={baseBet}
              onChange={(e) => setBaseBet(Math.max(1, Number(e.target.value)))}
              className="w-20 bg-pb-bg-tertiary border border-pb-border rounded-lg px-2 py-1.5 text-sm text-pb-text-primary text-right font-mono-stats focus:outline-none focus:ring-2 focus:ring-pb-accent/50"
            />
          </div>
        </div>

        {ruinStep !== null && (
          <div className="bg-pb-warning/10 border border-pb-warning/20 rounded-lg p-3 text-sm text-pb-warning">
            With a 100× bankroll (${fmt(baseBet * 100)}), you approach bankruptcy after approximately{" "}
            <strong>{ruinStep} consecutive losses</strong> — which is more steps than Martingale, but
            still a realistic outcome.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-pb-text-secondary mb-3">
              Bet size per consecutive loss
            </h3>
            <ProgressionTable baseBet={baseBet} maxRows={15} strategyId="fibonacci" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-pb-text-secondary mb-3">
              Growth curve
            </h3>
            <ExponentialGrowthChart baseBet={baseBet} maxSteps={15} strategyId="fibonacci" />
          </div>
        </div>
      </div>

      <EducationalPanel variant="info" title="Fibonacci vs Martingale">
        <p>
          The Fibonacci grows roughly proportional to φ&#x207F; (≈ 1.618 per step) versus Martingale&apos;s
          2&#x207F;. This means bets escalate more gently, giving you more spins before hitting a table
          limit or bankroll crisis. However, the negative expected value per spin (&minus;2.7% European,
          &minus;5.26% American) is identical — neither system changes the casino&apos;s mathematical advantage.
        </p>
      </EducationalPanel>

      {/* Monte Carlo mini-sim */}
      <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-semibold text-pb-text-primary">
              Quick Simulation (1,000 sessions)
            </h2>
            <p className="text-sm text-pb-text-secondary mt-0.5">
              Starting bankroll: ${fmt(baseBet * 100)} · Max 300 spins · European wheel
            </p>
          </div>
          <button
            type="button"
            onClick={runMiniSim}
            disabled={simRunning}
            className="px-5 py-2.5 rounded-lg bg-pb-accent text-pb-bg-primary font-heading font-semibold text-sm hover:shadow-[0_0_20px_rgba(0,229,160,0.3)] hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {simRunning ? "Running…" : "Run Simulation"}
          </button>
        </div>

        {simResult && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <QuickStat
              label="Bankruptcy Rate"
              value={fmtPct(simResult.bankruptcyRate)}
              sub="Sessions went bust"
              danger={simResult.bankruptcyRate > 30}
            />
            <QuickStat
              label="Avg Net Profit"
              value={`${simResult.avgNetProfit >= 0 ? "+" : ""}$${fmt(simResult.avgNetProfit, 2)}`}
              danger={simResult.avgNetProfit < 0}
            />
            <QuickStat
              label="Max Bet Seen"
              value={`$${fmt(simResult.maxBetSeen, 2)}`}
              sub="Highest single bet"
            />
            <QuickStat
              label="Avg Loss Streak"
              value={fmt(simResult.avgLongestLossStreak, 1)}
              sub="Consecutive losses"
            />
          </div>
        )}

        {!simResult && (
          <p className="text-sm text-pb-text-muted text-center py-4">
            Click Run Simulation to see results.
          </p>
        )}
      </div>

      <EducationalPanel variant="tip" title="Use the Full Strategy Tester for deeper analysis">
        <p>
          The quick simulation above runs 1,000 sessions. For more statistically reliable results
          — especially percentiles, distribution charts, and CSV exports — use the{" "}
          <strong>Strategy Tester</strong> which supports up to 10,000 sessions and compares any
          strategy on any bet type.
        </p>
      </EducationalPanel>
    </div>
  );
}
