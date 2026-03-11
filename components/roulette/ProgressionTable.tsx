"use client";

interface ProgressionTableProps {
  baseBet: number;
  maxRows?: number;
  strategyId: "martingale" | "fibonacci";
}

function fibonacci(n: number): number {
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

function martingale(step: number): number {
  return Math.pow(2, step);
}

const BANKROLL_MILESTONES = [100, 500, 1000, 5000, 10000];

export default function ProgressionTable({
  baseBet,
  maxRows = 15,
  strategyId,
}: ProgressionTableProps) {
  const rows = Array.from({ length: maxRows }, (_, i) => {
    const multiplier = strategyId === "martingale" ? martingale(i) : fibonacci(i);
    const betSize = baseBet * multiplier;

    // Cumulative loss = sum of all previous bets
    let cumulativeLoss = 0;
    for (let j = 0; j < i; j++) {
      const prevMult = strategyId === "martingale" ? martingale(j) : fibonacci(j);
      cumulativeLoss += baseBet * prevMult;
    }

    // Probability of reaching this step (consecutive losses)
    // Loss probability for even-money bet on European roulette = 19/37
    const prob = Math.pow(19 / 37, i);

    return { step: i + 1, betSize, cumulativeLoss, prob };
  });

  const milestoneHit = (cumLoss: number): number | null => {
    for (const m of BANKROLL_MILESTONES) {
      if (Math.abs(cumLoss - m) / m < 0.15) return m;
      if (cumLoss > m * 0.85 && cumLoss < m * 1.15) return m;
    }
    return null;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-pb-border">
            <th className="text-left py-2 px-3 text-xs font-medium text-pb-text-muted">
              Loss #
            </th>
            <th className="text-right py-2 px-3 text-xs font-medium text-pb-text-muted">
              Next Bet
            </th>
            <th className="text-right py-2 px-3 text-xs font-medium text-pb-text-muted">
              Total Lost
            </th>
            <th className="text-right py-2 px-3 text-xs font-medium text-pb-text-muted">
              Probability
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ step, betSize, cumulativeLoss, prob }) => {
            const milestone = milestoneHit(cumulativeLoss);
            const isHighRisk = betSize > 200;

            return (
              <tr
                key={step}
                className={`border-b border-pb-border/50 transition-colors ${
                  milestone
                    ? "bg-pb-warning/10"
                    : isHighRisk
                      ? "bg-pb-danger/5"
                      : "hover:bg-pb-bg-tertiary/50"
                }`}
              >
                <td className="py-2 px-3 font-mono-stats text-pb-text-secondary">{step}</td>
                <td className="py-2 px-3 font-mono-stats text-right">
                  <span
                    className={
                      betSize > 100
                        ? "text-pb-danger font-semibold"
                        : betSize > 50
                          ? "text-pb-warning"
                          : "text-pb-text-primary"
                    }
                  >
                    ${betSize.toFixed(2)}
                  </span>
                </td>
                <td className="py-2 px-3 font-mono-stats text-right">
                  <span className="text-pb-danger">-${cumulativeLoss.toFixed(2)}</span>
                  {milestone && (
                    <span className="ml-2 text-xs text-pb-warning">(≈${milestone})</span>
                  )}
                </td>
                <td className="py-2 px-3 font-mono-stats text-right text-pb-text-muted text-xs">
                  1 in {Math.round(1 / prob).toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-xs text-pb-text-muted mt-3 px-1">
        Probability based on European roulette loss rate (19/37). Yellow rows indicate when
        cumulative losses approach common bankroll sizes.
      </p>
    </div>
  );
}
