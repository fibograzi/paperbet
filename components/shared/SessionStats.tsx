"use client";

import { formatCurrency, formatMultiplier } from "@/lib/utils";

interface SessionStatsProps {
  totalBets: number;
  totalWagered: number;
  netProfit: number;
  biggestWin: { multiplier: number; amount: number } | null;
}

interface StatCardProps {
  label: string;
  value: string;
  colorClass?: string;
}

function StatCard({ label, value, colorClass = "text-pb-text-primary" }: StatCardProps) {
  return (
    <div className="bg-pb-bg-secondary border border-pb-border rounded-lg p-3">
      <p className="text-xs text-pb-text-muted">{label}</p>
      <p className={`font-mono-stats text-xl ${colorClass}`}>{value}</p>
    </div>
  );
}

export default function SessionStats({
  totalBets,
  totalWagered,
  netProfit,
  biggestWin,
}: SessionStatsProps) {
  const profitColor =
    netProfit > 0
      ? "text-pb-accent"
      : netProfit < 0
        ? "text-pb-danger"
        : "text-pb-text-primary";

  const profitPrefix = netProfit > 0 ? "+" : "";

  const biggestWinDisplay = biggestWin
    ? `${formatMultiplier(biggestWin.multiplier)} (${formatCurrency(biggestWin.amount)})`
    : "—";

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard label="Total Bets" value={String(totalBets)} />
      <StatCard label="Total Wagered" value={formatCurrency(totalWagered)} />
      <StatCard
        label="Net Profit"
        value={`${profitPrefix}${formatCurrency(netProfit)}`}
        colorClass={profitColor}
      />
      <StatCard
        label="Biggest Win"
        value={biggestWinDisplay}
        colorClass={biggestWin ? "text-pb-warning" : "text-pb-text-muted"}
      />
    </div>
  );
}
