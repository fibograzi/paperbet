"use client";

import type { SensitivityRow, MartingaleRuinRow } from "@/lib/roulette/riskOfRuinEngine";

interface RuinResultsProps {
  ruinProbability: number;
  sensitivityData: SensitivityRow[];
  martingaleData: MartingaleRuinRow[];
}

function formatPercent(prob: number, decimals = 2): string {
  return `${(prob * 100).toFixed(decimals)}%`;
}

function getRuinColor(ruin: number): string {
  if (ruin < 0.25) return "text-pb-accent";
  if (ruin < 0.75) return "text-pb-warning";
  return "text-pb-danger";
}

function getRuinBgColor(ruin: number): string {
  if (ruin < 0.25) return "bg-pb-accent/10 border-pb-accent/30";
  if (ruin < 0.75) return "bg-pb-warning/10 border-pb-warning/30";
  return "bg-pb-danger/10 border-pb-danger/30";
}

function getRuinLabel(ruin: number): string {
  if (ruin < 0.1) return "Very Low Risk";
  if (ruin < 0.25) return "Low Risk";
  if (ruin < 0.5) return "Moderate Risk";
  if (ruin < 0.75) return "High Risk";
  return "Very High Risk";
}

export default function RuinResults({
  ruinProbability,
  sensitivityData,
  martingaleData,
}: RuinResultsProps) {
  return (
    <div className="space-y-6">
      {/* Primary result */}
      <div className={`rounded-xl border p-6 ${getRuinBgColor(ruinProbability)}`}>
        <p className="text-sm text-pb-text-muted mb-1">Risk of Ruin</p>
        <div className="flex items-end gap-3">
          <span
            className={`font-mono-stats text-5xl font-bold leading-none ${getRuinColor(ruinProbability)}`}
          >
            {formatPercent(ruinProbability, 1)}
          </span>
          <span className={`text-sm font-semibold mb-1 ${getRuinColor(ruinProbability)}`}>
            {getRuinLabel(ruinProbability)}
          </span>
        </div>
        <div className="mt-3 flex gap-4 text-sm">
          <span className="text-pb-text-muted">
            Survival probability:{" "}
            <span className="text-pb-accent font-mono-stats font-semibold">
              {formatPercent(1 - ruinProbability, 1)}
            </span>
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 bg-pb-bg-primary/50 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              ruinProbability < 0.25
                ? "bg-pb-accent"
                : ruinProbability < 0.75
                ? "bg-pb-warning"
                : "bg-pb-danger"
            }`}
            style={{ width: `${Math.min(100, ruinProbability * 100)}%` }}
          />
        </div>
      </div>

      {/* Sensitivity table */}
      {sensitivityData.length > 0 && (
        <div>
          <h3 className="font-heading text-base font-semibold text-pb-text-primary mb-3">
            Bankroll vs Ruin Probability
          </h3>
          <div className="overflow-x-auto rounded-xl border border-pb-border">
            <table className="w-full text-left min-w-[400px]">
              <thead>
                <tr className="bg-pb-bg-tertiary border-b border-pb-border">
                  <th className="py-2.5 px-4 text-xs font-semibold text-pb-text-muted uppercase tracking-wider">
                    Bankroll (units)
                  </th>
                  <th className="py-2.5 px-4 text-xs font-semibold text-pb-text-muted uppercase tracking-wider">
                    Risk of Ruin
                  </th>
                  <th className="py-2.5 px-4 text-xs font-semibold text-pb-text-muted uppercase tracking-wider">
                    Survival
                  </th>
                </tr>
              </thead>
              <tbody className="bg-pb-bg-secondary divide-y divide-pb-border/30">
                {sensitivityData.map((row) => (
                  <tr
                    key={row.bankrollUnits}
                    className="hover:bg-pb-bg-tertiary/50 transition-colors"
                  >
                    <td className="py-2.5 px-4 font-mono-stats text-sm text-pb-text-primary">
                      {row.bankrollUnits}
                    </td>
                    <td
                      className={`py-2.5 px-4 font-mono-stats text-sm font-semibold ${getRuinColor(row.ruinProbability)}`}
                    >
                      {formatPercent(row.ruinProbability)}
                    </td>
                    <td className="py-2.5 px-4 font-mono-stats text-sm text-pb-accent">
                      {formatPercent(row.survivalProbability)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Martingale table */}
      {martingaleData.length > 0 && (
        <div>
          <h3 className="font-heading text-base font-semibold text-pb-text-primary mb-1">
            Martingale Progression (Red/Black base bet)
          </h3>
          <p className="text-xs text-pb-text-muted mb-3">
            Each consecutive loss doubles your required bet. Table shows required bet size,
            cumulative loss, and probability of reaching that losing streak.
          </p>
          <div className="overflow-x-auto rounded-xl border border-pb-border">
            <table className="w-full text-left min-w-[480px]">
              <thead>
                <tr className="bg-pb-bg-tertiary border-b border-pb-border">
                  <th className="py-2.5 px-4 text-xs font-semibold text-pb-text-muted uppercase tracking-wider">
                    Consecutive Losses
                  </th>
                  <th className="py-2.5 px-4 text-xs font-semibold text-pb-text-muted uppercase tracking-wider">
                    Next Bet
                  </th>
                  <th className="py-2.5 px-4 text-xs font-semibold text-pb-text-muted uppercase tracking-wider">
                    Cumulative Loss
                  </th>
                  <th className="py-2.5 px-4 text-xs font-semibold text-pb-text-muted uppercase tracking-wider">
                    Probability
                  </th>
                </tr>
              </thead>
              <tbody className="bg-pb-bg-secondary divide-y divide-pb-border/30">
                {martingaleData.map((row) => {
                  const probColor =
                    row.probability > 0.1
                      ? "text-pb-danger"
                      : row.probability > 0.01
                      ? "text-pb-warning"
                      : "text-pb-text-muted";

                  return (
                    <tr
                      key={row.consecutiveLosses}
                      className="hover:bg-pb-bg-tertiary/50 transition-colors"
                    >
                      <td className="py-2.5 px-4 font-mono-stats text-sm text-pb-text-primary">
                        {row.consecutiveLosses}
                      </td>
                      <td className="py-2.5 px-4 font-mono-stats text-sm text-pb-text-primary">
                        {row.betSize.toLocaleString()}x
                      </td>
                      <td className="py-2.5 px-4 font-mono-stats text-sm text-pb-danger">
                        {row.cumulativeLoss.toLocaleString()}x
                      </td>
                      <td className={`py-2.5 px-4 font-mono-stats text-sm ${probColor}`}>
                        {formatPercent(row.probability, 3)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
