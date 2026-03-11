"use client";

import { AnimatePresence, motion } from "framer-motion";
import { getResultColor, formatCurrency, formatMultiplier } from "@/lib/utils";

interface BetHistoryEntry {
  id: string;
  amount: number;
  multiplier: number;
  profit: number;
  risk: string;
  rows: number;
}

interface BetHistoryProps {
  history: BetHistoryEntry[];
  maxVisible?: number;
}

export default function BetHistory({ history, maxVisible = 25 }: BetHistoryProps) {
  const visibleHistory = history.slice(0, maxVisible);
  const totalCount = history.length;

  return (
    <div className="max-h-[200px] overflow-auto rounded-lg border border-pb-border">
      <table className="w-full text-xs" aria-label="Bet history">
        <thead className="sticky top-0 z-10 bg-pb-bg-secondary">
          <tr>
            <th className="text-[10px] text-pb-text-muted uppercase text-left px-2 py-1">#</th>
            <th className="text-[10px] text-pb-text-muted uppercase text-right px-2 py-1">Bet</th>
            <th className="text-[10px] text-pb-text-muted uppercase text-right px-2 py-1">Multi</th>
            <th className="text-[10px] text-pb-text-muted uppercase text-right px-2 py-1">Profit</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {visibleHistory.map((entry, index) => {
              const rowNumber = totalCount - index;
              const isEven = index % 2 === 0;
              const profitPositive = entry.profit >= 0;

              return (
                <motion.tr
                  key={entry.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`${
                    isEven ? "bg-pb-bg-primary" : "bg-pb-bg-secondary"
                  } hover:bg-pb-bg-tertiary transition-colors`}
                >
                  <td className="font-mono-stats text-pb-text-muted px-2 py-0.5 text-left">
                    {rowNumber}
                  </td>
                  <td className="font-mono-stats text-pb-text-primary px-2 py-0.5 text-right">
                    {formatCurrency(entry.amount)}
                  </td>
                  <td
                    className="font-mono-stats px-2 py-0.5 text-right"
                    style={{ color: getResultColor(entry.multiplier) }}
                  >
                    {formatMultiplier(entry.multiplier)}
                  </td>
                  <td
                    className={`font-mono-stats px-2 py-0.5 text-right ${
                      profitPositive ? "text-pb-accent" : "text-pb-danger"
                    }`}
                  >
                    {profitPositive ? "+" : ""}
                    {formatCurrency(entry.profit)}
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
