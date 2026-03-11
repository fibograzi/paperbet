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

export default function MartingaleSimulator() {
  const [baseBet, setBaseBet] = useState(5);
  const [simResult, setSimResult] = useState<SimulationSummary | null>(null);
  const [simRunning, setSimRunning] = useState(false);

  const runMiniSim = () => {
    setSimRunning(true);
    // Run inline (small enough — 1000 sessions)
    setTimeout(() => {
      const config: SimulationConfig = {
        strategyId: "martingale",
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

  const maxTableLimit = useMemo(() => {
    // Common table limit: 500x base bet
    return baseBet * 500;
  }, [baseBet]);

  // Find at what step the bet exceeds the bankroll (100x base)
  const ruinStep = useMemo(() => {
    const bankroll = baseBet * 100;
    let cumLoss = 0;
    for (let i = 0; i < 20; i++) {
      const bet = baseBet * Math.pow(2, i);
      if (cumLoss + bet > bankroll) return i + 1;
      cumLoss += bet;
    }
    return null;
  }, [baseBet]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="font-heading text-3xl font-bold text-pb-text-primary">
          Martingale Roulette Simulator
        </h1>
        <p className="text-pb-text-secondary max-w-2xl">
          The Martingale system doubles your bet after every loss. Explore the math behind why it
          fails, and test it with real Monte Carlo simulation.
        </p>
      </div>

      <EducationalPanel variant="warning" title="The Martingale Illusion">
        <p>
          The Martingale feels safe because a win <em>always</em> recovers previous losses.
          But this requires an unlimited bankroll and no table limits — neither of which exist in the
          real world. A streak of just 8–10 consecutive losses (which happens regularly) requires
          bets of $256–$1,024 to recover a single $1 unit of profit.
        </p>
      </EducationalPanel>

      {/* Interactive base bet control */}
      <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-semibold text-pb-text-primary">Bet Progression</h2>
          <div className="flex items-center gap-3">
            <label className="text-sm text-pb-text-secondary">Base Bet: $</label>
            <input
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
          <div className="bg-pb-danger/10 border border-pb-danger/20 rounded-lg p-3 text-sm text-pb-danger">
            With a 100× bankroll (${fmt(baseBet * 100)}), you go bankrupt after{" "}
            <strong>{ruinStep} consecutive losses</strong>.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-pb-text-secondary mb-3">
              Bet size per consecutive loss
            </h3>
            <ProgressionTable baseBet={baseBet} maxRows={15} strategyId="martingale" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-pb-text-secondary mb-3">
              Growth curve (log scale)
            </h3>
            <ExponentialGrowthChart baseBet={baseBet} maxSteps={15} strategyId="martingale" />
          </div>
        </div>
      </div>

      {/* Why it doesn't work */}
      <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-6 space-y-4">
        <h2 className="font-heading font-semibold text-pb-text-primary">
          Why the Martingale Doesn&apos;t Work Long-Term
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-pb-text-secondary">
          <div className="bg-pb-bg-tertiary rounded-xl p-4">
            <p className="font-heading font-semibold text-pb-text-primary mb-2">Table Limits</p>
            <p>
              Casinos set maximum bet limits (typically 200–1,000×). After just {Math.ceil(Math.log2(maxTableLimit / baseBet))} losses,
              your next bet of ${(baseBet * Math.pow(2, Math.ceil(Math.log2(maxTableLimit / baseBet)))).toFixed(0)} exceeds the
              table limit of ${fmt(maxTableLimit)}. You cannot recover your losses.
            </p>
          </div>
          <div className="bg-pb-bg-tertiary rounded-xl p-4">
            <p className="font-heading font-semibold text-pb-text-primary mb-2">Finite Bankroll</p>
            <p>
              No bankroll is infinite. With ${fmt(baseBet * 100)} and a ${baseBet} base bet, you
              can survive at most {ruinStep ?? "~"} consecutive losses before going bankrupt — a
              sequence that occurs with probability ~{fmtPct(Math.pow(19 / 37, (ruinStep ?? 10)) * 100)}.
            </p>
          </div>
          <div className="bg-pb-bg-tertiary rounded-xl p-4">
            <p className="font-heading font-semibold text-pb-text-primary mb-2">
              Negative Expected Value
            </p>
            <p>
              Every spin on a European wheel has a house edge of 2.7%. The Martingale doesn&apos;t
              change the expected value of any spin — it only changes the bet size. You&apos;re still
              losing 2.7 cents per $1 wagered on average, just at much higher stakes.
            </p>
          </div>
        </div>
      </div>

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
              danger
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

      <EducationalPanel variant="tip" title="Better Alternatives">
        <p>
          If you enjoy roulette, flat betting with a set session loss limit gives you more spins,
          lower variance, and a similar expected outcome. The Fibonacci system grows more slowly
          than Martingale and is somewhat safer — though still subject to the same fundamental
          house-edge math.
        </p>
      </EducationalPanel>
    </div>
  );
}
