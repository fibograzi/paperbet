"use client";

import { Download } from "lucide-react";
import Button from "@/components/ui/Button";
import type { SimulationOutput } from "@/lib/roulette/simulationTypes";

interface CsvExportProps {
  output: SimulationOutput;
}

export default function CsvExport({ output }: CsvExportProps) {
  const handleExport = () => {
    const headers = [
      "session",
      "final_bankroll",
      "net_profit",
      "total_spins",
      "total_wagered",
      "went_bankrupt",
      "hit_profit_target",
      "hit_loss_limit",
      "hit_table_limit",
      "peak_bankroll",
      "min_bankroll",
      "max_bet",
      "longest_win_streak",
      "longest_loss_streak",
    ].join(",");

    const rows = output.sessions.map((s, i) =>
      [
        i + 1,
        s.finalBankroll.toFixed(2),
        s.netProfit.toFixed(2),
        s.totalSpins,
        s.totalWagered.toFixed(2),
        s.wentBankrupt ? 1 : 0,
        s.hitProfitTarget ? 1 : 0,
        s.hitLossLimit ? 1 : 0,
        s.hitTableLimit ? 1 : 0,
        s.peakBankroll.toFixed(2),
        s.minBankroll.toFixed(2),
        s.maxBet.toFixed(2),
        s.longestWinStreak,
        s.longestLossStreak,
      ].join(","),
    );

    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const strategy = output.config.strategyId;
    const sessions = output.config.numberOfSessions;
    const filename = `paperbet-simulation-${strategy}-${sessions}sessions.csv`;

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleExport} className="gap-1.5">
      <Download className="w-4 h-4" />
      Export CSV
    </Button>
  );
}
