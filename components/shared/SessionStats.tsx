"use client";

import { formatCurrency, formatMultiplier } from "@/lib/utils";

interface SessionStatsProps {
  totalBets: number;
  totalWagered: number;
  netProfit: number;
  biggestWin: { multiplier: number; amount: number } | null;
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
    <div className="bg-pb-bg-secondary border border-pb-border rounded-lg px-3 py-2">
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-pb-text-muted uppercase tracking-wider">Bets</span>
          <span className="font-mono-stats text-xs text-pb-text-primary">{totalBets}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-pb-text-muted uppercase tracking-wider">Wagered</span>
          <span className="font-mono-stats text-xs text-pb-text-primary">{formatCurrency(totalWagered)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-pb-text-muted uppercase tracking-wider">Profit</span>
          <span className={`font-mono-stats text-xs ${profitColor}`}>{profitPrefix}{formatCurrency(netProfit)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-pb-text-muted uppercase tracking-wider">Best Win</span>
          <span className={`font-mono-stats text-xs ${biggestWin ? "text-pb-warning" : "text-pb-text-muted"}`}>{biggestWinDisplay}</span>
        </div>
      </div>
    </div>
  );
}
