"use client";

import { useMemo } from "react";
import { buildOddsTable } from "@/lib/roulette/oddsCalculator";
import type { WheelType } from "@/lib/roulette/rouletteTypes";

interface OddsTableProps {
  wheelType: WheelType;
}

function formatProbability(prob: number): string {
  return `${(prob * 100).toFixed(2)}%`;
}

function formatEV(ev: number): string {
  return ev.toFixed(3);
}

function formatHouseEdge(edge: number): string {
  return `${edge.toFixed(3)}%`;
}

export default function OddsTable({ wheelType }: OddsTableProps) {
  const rows = useMemo(() => buildOddsTable(), []);

  const insideBets = rows.filter((r) => r.category === "inside");
  const outsideBets = rows.filter((r) => r.category === "outside");

  const isEuropean = wheelType === "european";

  const renderRows = (bets: typeof rows, isInside: boolean) =>
    bets.map((row) => {
      const prob = isEuropean ? row.probabilityEuro : row.probabilityAmerican;
      const houseEdge = isEuropean ? row.houseEdgeEuro : row.houseEdgeAmerican;
      const ev = isEuropean ? row.evPerDollarEuro : row.evPerDollarAmerican;

      const houseEdgeColor =
        houseEdge > 4 ? "text-pb-danger" : houseEdge > 3 ? "text-pb-warning" : "text-pb-accent";

      return (
        <tr
          key={row.betType}
          className="border-b border-pb-border/50 hover:bg-pb-bg-tertiary/50 transition-colors"
        >
          <td className="py-3 px-4 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                  isInside ? "bg-pb-accent-secondary" : "bg-pb-accent"
                }`}
                aria-hidden
              />
              <span className="font-medium text-pb-text-primary text-sm">{row.name}</span>
            </div>
          </td>
          <td className="py-3 px-4 whitespace-nowrap">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                isInside
                  ? "bg-pb-accent-secondary/10 text-pb-accent-secondary"
                  : "bg-pb-accent/10 text-pb-accent"
              }`}
            >
              {isInside ? "Inside" : "Outside"}
            </span>
          </td>
          <td className="py-3 px-4 font-mono-stats text-pb-text-primary text-sm whitespace-nowrap">
            {row.payout}
          </td>
          <td className="py-3 px-4 font-mono-stats text-pb-text-secondary text-sm whitespace-nowrap">
            {row.coverage}
          </td>
          <td className="py-3 px-4 font-mono-stats text-pb-text-primary text-sm whitespace-nowrap">
            {formatProbability(prob)}
          </td>
          <td className="py-3 px-4 font-mono-stats text-pb-danger text-sm whitespace-nowrap">
            {formatEV(ev)}
          </td>
          <td className={`py-3 px-4 font-mono-stats text-sm whitespace-nowrap ${houseEdgeColor}`}>
            {formatHouseEdge(houseEdge)}
          </td>
        </tr>
      );
    });

  return (
    <div className="overflow-x-auto rounded-xl border border-pb-border">
      <table className="w-full text-left min-w-[640px]">
        <thead>
          <tr className="bg-pb-bg-tertiary border-b border-pb-border">
            <th className="py-3 px-4 text-xs font-semibold text-pb-text-muted uppercase tracking-wider">
              Bet Type
            </th>
            <th className="py-3 px-4 text-xs font-semibold text-pb-text-muted uppercase tracking-wider">
              Category
            </th>
            <th className="py-3 px-4 text-xs font-semibold text-pb-text-muted uppercase tracking-wider">
              Payout
            </th>
            <th className="py-3 px-4 text-xs font-semibold text-pb-text-muted uppercase tracking-wider">
              Numbers
            </th>
            <th className="py-3 px-4 text-xs font-semibold text-pb-text-muted uppercase tracking-wider">
              Probability
            </th>
            <th className="py-3 px-4 text-xs font-semibold text-pb-text-muted uppercase tracking-wider">
              EV / $1
            </th>
            <th className="py-3 px-4 text-xs font-semibold text-pb-text-muted uppercase tracking-wider">
              House Edge
            </th>
          </tr>
        </thead>
        <tbody className="bg-pb-bg-secondary divide-y divide-pb-border/30">
          {/* Inside bets header */}
          <tr className="bg-pb-accent-secondary/5">
            <td
              colSpan={7}
              className="py-2 px-4 text-xs font-semibold text-pb-accent-secondary uppercase tracking-wider"
            >
              Inside Bets
            </td>
          </tr>
          {renderRows(insideBets, true)}

          {/* Outside bets header */}
          <tr className="bg-pb-accent/5">
            <td
              colSpan={7}
              className="py-2 px-4 text-xs font-semibold text-pb-accent uppercase tracking-wider"
            >
              Outside Bets
            </td>
          </tr>
          {renderRows(outsideBets, false)}
        </tbody>
      </table>
    </div>
  );
}
