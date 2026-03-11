"use client";

import Link from "next/link";
import type { RouletteGameState, RouletteAction, RoundResult } from "@/lib/roulette/rouletteTypes";
import { formatCurrency } from "@/lib/utils";
import { POST_SESSION_NUDGE_THRESHOLD } from "@/lib/roulette/rouletteEngine";
import SessionStats from "@/components/shared/SessionStats";
import RouletteResultHistory from "./RouletteResultHistory";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface RouletteSidebarProps {
  state: RouletteGameState;
  dispatch: (action: RouletteAction) => void;
}

// ---------------------------------------------------------------------------
// Color helpers
// ---------------------------------------------------------------------------

const colorMap: Record<string, string> = {
  red: "#DC2626",
  black: "#374151",
  green: "#059669",
};

function ResultRow({ round, index }: { round: RoundResult; index: number }) {
  const { pocket } = round.spinResult;
  const isProfit = round.totalProfit > 0;
  const isLoss = round.totalProfit < 0;

  return (
    <tr
      style={{
        backgroundColor: index % 2 === 0 ? "rgba(31,41,55,0.3)" : "transparent",
      }}
    >
      <td className="px-2 py-1.5 font-mono-stats text-[11px] text-pb-text-muted">
        #{round.id.slice(0, 4)}
      </td>
      <td className="px-2 py-1.5 text-center">
        <span
          className="inline-flex items-center justify-center rounded-full font-mono-stats font-bold text-[10px]"
          style={{
            width: "22px",
            height: "22px",
            backgroundColor: colorMap[pocket.color] ?? "#374151",
            color: "#FFFFFF",
          }}
        >
          {pocket.label}
        </span>
      </td>
      <td className="px-2 py-1.5 font-mono-stats text-[11px] text-pb-text-secondary text-right">
        {formatCurrency(round.totalWagered)}
      </td>
      <td
        className="px-2 py-1.5 font-mono-stats text-[11px] text-right"
        style={{
          color: isProfit ? "#00E5A0" : isLoss ? "#EF4444" : "#9CA3AF",
        }}
      >
        {isProfit ? "+" : ""}
        {formatCurrency(round.totalProfit)}
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RouletteSidebar({ state, dispatch }: RouletteSidebarProps) {
  const { stats, history, showPostSessionNudge, sessionSpinCount } = state;

  const recentRounds = history.slice(0, 10);

  return (
    <div className="space-y-4">
      {/* Session stats */}
      <SessionStats
        totalBets={stats.totalSpins}
        totalWagered={stats.totalWagered}
        netProfit={stats.netProfit}
        biggestWin={
          stats.biggestWin > 0
            ? { multiplier: 1, amount: stats.biggestWin }
            : null
        }
      />

      {/* Result history badges */}
      <div
        className="rounded-xl p-4"
        style={{ backgroundColor: "#111827", border: "1px solid #374151" }}
      >
        <RouletteResultHistory history={history} />
      </div>

      {/* Bet history table */}
      {recentRounds.length > 0 && (
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "#111827", border: "1px solid #374151" }}
        >
          <div className="px-4 py-3 border-b border-pb-border">
            <h3 className="font-heading text-sm font-semibold text-pb-text-primary">
              Round History
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid #374151" }}>
                  <th className="px-2 py-1.5 text-left text-[9px] font-body uppercase tracking-wider text-pb-text-muted">
                    ID
                  </th>
                  <th className="px-2 py-1.5 text-center text-[9px] font-body uppercase tracking-wider text-pb-text-muted">
                    #
                  </th>
                  <th className="px-2 py-1.5 text-right text-[9px] font-body uppercase tracking-wider text-pb-text-muted">
                    Bet
                  </th>
                  <th className="px-2 py-1.5 text-right text-[9px] font-body uppercase tracking-wider text-pb-text-muted">
                    P/L
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentRounds.map((round, i) => (
                  <ResultRow key={round.id} round={round} index={i} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Post-session nudge */}
      {showPostSessionNudge && (
        <div
          className="rounded-xl p-4 space-y-2"
          style={{
            backgroundColor: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.3)",
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="font-heading text-sm font-semibold text-pb-warning">
              Ready to play for real?
            </p>
            <button
              type="button"
              onClick={() => dispatch({ type: "DISMISS_POST_SESSION_NUDGE" })}
              className="text-pb-text-muted hover:text-pb-text-primary transition-colors shrink-0 text-xs"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
          <p className="text-xs font-body text-pb-text-secondary leading-relaxed">
            You&apos;ve played {sessionSpinCount} rounds. Compare your results to what
            real casinos would offer with actual bonuses.
          </p>
          <Link
            href="/deals"
            className="block text-center rounded-lg py-2 text-xs font-heading font-semibold transition-colors"
            style={{ backgroundColor: "#F59E0B", color: "#0B0F1A" }}
          >
            See Real Casino Bonuses
          </Link>
          <p className="text-[9px] text-pb-text-muted text-center">
            18+ | Real gambling involves financial risk
          </p>
        </div>
      )}

      {/* Progress to nudge */}
      {!showPostSessionNudge &&
        !state.postSessionNudgeDismissed &&
        sessionSpinCount > 0 &&
        sessionSpinCount < POST_SESSION_NUDGE_THRESHOLD && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-pb-text-muted font-body">
                Session progress
              </p>
              <p className="text-[10px] font-mono-stats text-pb-text-muted">
                {sessionSpinCount}/{POST_SESSION_NUDGE_THRESHOLD}
              </p>
            </div>
            <div
              className="rounded-full overflow-hidden"
              style={{ height: "3px", backgroundColor: "#374151" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(sessionSpinCount / POST_SESSION_NUDGE_THRESHOLD) * 100}%`,
                  backgroundColor: "#00E5A0",
                }}
              />
            </div>
          </div>
        )}

      {/* Educational disclaimer */}
      <div
        className="rounded-xl p-4 space-y-1.5"
        style={{ backgroundColor: "rgba(31,41,55,0.5)", border: "1px solid #374151" }}
      >
        <p className="font-heading text-xs font-semibold text-pb-text-secondary">
          Educational Simulator
        </p>
        <p className="text-[10px] font-body text-pb-text-muted leading-relaxed">
          This is a free-to-play simulator using paper money. No real money is
          involved. Results use casino-accurate mathematics (RNG).
        </p>
        <Link
          href="/responsible-gambling"
          className="text-[10px] font-body text-pb-accent-secondary underline hover:text-pb-accent transition-colors"
        >
          Learn about responsible gambling
        </Link>
      </div>
    </div>
  );
}
