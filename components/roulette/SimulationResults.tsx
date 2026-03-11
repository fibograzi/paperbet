"use client";

import type { SimulationSummary } from "@/lib/roulette/simulationTypes";
import EducationalPanel from "./EducationalPanel";

interface SimulationResultsProps {
  summary: SimulationSummary;
}

interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  color?: "positive" | "negative" | "neutral" | "warning";
}

function StatCard({ label, value, subtext, color = "neutral" }: StatCardProps) {
  const valueColor =
    color === "positive"
      ? "text-pb-accent"
      : color === "negative"
        ? "text-pb-danger"
        : color === "warning"
          ? "text-pb-warning"
          : "text-pb-text-primary";

  return (
    <div className="bg-pb-bg-tertiary rounded-xl p-4 flex flex-col gap-1">
      <p className="text-xs text-pb-text-muted font-medium">{label}</p>
      <p className={`font-mono-stats text-xl font-bold ${valueColor}`}>{value}</p>
      {subtext && <p className="text-xs text-pb-text-muted">{subtext}</p>}
    </div>
  );
}

function fmt(n: number, decimals = 0): string {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtPct(n: number): string {
  return `${fmt(n, 1)}%`;
}

function fmtDollar(n: number): string {
  const sign = n >= 0 ? "+" : "";
  return `${sign}$${fmt(Math.abs(n), 2)}`;
}

export default function SimulationResults({ summary }: SimulationResultsProps) {
  const medianColor =
    summary.medianNetProfit > 0 ? "positive" : summary.medianNetProfit < 0 ? "negative" : "neutral";
  const bankruptColor =
    summary.bankruptcyRate >= 50 ? "negative" : summary.bankruptcyRate >= 20 ? "warning" : "positive";
  const profitRateColor =
    summary.profitRate >= 50 ? "positive" : summary.profitRate >= 30 ? "warning" : "negative";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-bold text-lg text-pb-text-primary">Simulation Results</h3>
        <span className="text-xs text-pb-text-muted font-mono-stats">
          {summary.totalSessions.toLocaleString()} sessions
        </span>
      </div>

      {/* Main stats grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Avg Final Bankroll"
          value={`$${fmt(summary.avgFinalBankroll, 2)}`}
          color={summary.avgNetProfit >= 0 ? "positive" : summary.avgNetProfit < -50 ? "negative" : "neutral"}
        />
        <StatCard
          label="Median Net Profit"
          value={fmtDollar(summary.medianNetProfit)}
          color={medianColor}
        />
        <StatCard
          label="Bankruptcy Rate"
          value={fmtPct(summary.bankruptcyRate)}
          subtext="Sessions went bust"
          color={bankruptColor}
        />
        <StatCard
          label="Profit Rate"
          value={fmtPct(summary.profitRate)}
          subtext="Sessions ended in profit"
          color={profitRateColor}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Max Bet Seen"
          value={`$${fmt(summary.maxBetSeen, 2)}`}
          subtext="Highest single bet placed"
          color="warning"
        />
        <StatCard
          label="Avg Spins / Session"
          value={fmt(summary.avgSpins, 0)}
        />
        <StatCard
          label="Avg Win Streak"
          value={fmt(summary.avgLongestWinStreak, 1)}
          color="positive"
        />
        <StatCard
          label="Avg Loss Streak"
          value={fmt(summary.avgLongestLossStreak, 1)}
          color="negative"
        />
      </div>

      {/* Percentiles */}
      <div className="bg-pb-bg-tertiary rounded-xl p-4">
        <p className="text-xs font-medium text-pb-text-secondary mb-3">
          Net Profit Distribution (percentiles)
        </p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "5th", value: summary.percentile5 },
            { label: "25th", value: summary.percentile25 },
            { label: "75th", value: summary.percentile75 },
            { label: "95th", value: summary.percentile95 },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-xs text-pb-text-muted mb-0.5">{label}%ile</p>
              <p
                className={`font-mono-stats text-sm font-bold ${value >= 0 ? "text-pb-accent" : "text-pb-danger"}`}
              >
                {fmtDollar(value)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* What this means */}
      <EducationalPanel
        variant={summary.profitRate > 50 ? "tip" : "warning"}
        title="What these results mean"
      >
        <ul className="space-y-1.5">
          <li>
            <strong>Avg profit:</strong> {fmtDollar(summary.avgNetProfit)} per session. House edge
            means the average always trends negative over time.
          </li>
          <li>
            <strong>Bankruptcy rate {fmtPct(summary.bankruptcyRate)}:</strong>{" "}
            {summary.bankruptcyRate > 30
              ? "High risk — this strategy frequently depletes the entire bankroll."
              : summary.bankruptcyRate > 10
                ? "Moderate risk — a meaningful portion of sessions end in ruin."
                : "Low bankruptcy rate for this configuration."}
          </li>
          <li>
            <strong>Max bet ${fmt(summary.maxBetSeen, 0)}:</strong> Even with a table limit, the
            strategy can require bets of this size. Ensure your bankroll can sustain it.
          </li>
          <li>
            The 5th percentile outcome ({fmtDollar(summary.percentile5)}) represents the worst 5% of
            sessions — the downside tail you must be prepared for.
          </li>
        </ul>
      </EducationalPanel>
    </div>
  );
}
