"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { HiLoGameState } from "./hiloTypes";
import {
  formatHiLoMultiplier,
  formatCard,
  getMultiplierColor,
  SUIT_SYMBOLS,
} from "./hiloEngine";
import SessionStats from "@/components/shared/SessionStats";

import GameProviders from "@/components/shared/GameProviders";
import { CASINOS, SITE } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface HiLoSidebarProps {
  state: HiLoGameState;
  onDismissNudge: () => void;
}

const SESSION_TIME_REMINDER_MS = 30 * 60 * 1000; // 30 minutes

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HiLoSidebar({ state, onDismissNudge }: HiLoSidebarProps) {
  const { stats, history, sessionBetCount, showPostSessionNudge } = state;
  const [showTimeReminder, setShowTimeReminder] = useState(false);
  const [showMoreStats, setShowMoreStats] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowTimeReminder(true), SESSION_TIME_REMINDER_MS);
    return () => clearTimeout(timer);
  }, []);

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const topCasino = useMemo(
    () => CASINOS.find((c) => c.games.includes("hilo")) ?? null,
    []
  );

  const biggestWin = useMemo(() => {
    if (stats.biggestWin <= 0) return null;
    const multiplier = stats.bestMultiplier > 0 ? stats.bestMultiplier : 0;
    return { multiplier, amount: stats.biggestWin };
  }, [stats.biggestWin, stats.bestMultiplier]);

  const visibleHistory = useMemo(() => history.slice(0, 25), [history]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Session Stats */}
      <SessionStats
        totalBets={stats.totalBets}
        totalWagered={stats.totalWagered}
        netProfit={stats.netProfit}
        biggestWin={biggestWin}
      />

      {/* More Stats (expandable) */}
      <div className="rounded-xl" style={{ border: "1px solid #374151" }}>
        <button
          type="button"
          onClick={() => setShowMoreStats(!showMoreStats)}
          className="w-full px-4 py-2 flex items-center justify-between"
        >
          <span className="font-body text-xs" style={{ color: "#9CA3AF" }}>More Stats</span>
          <span className="text-xs" style={{ color: "#6B7280" }}>{showMoreStats ? "▲" : "▼"}</span>
        </button>
        {showMoreStats && (
          <div className="px-4 pb-3 grid grid-cols-2 gap-2">
            <StatMini
              label="Win Rate"
              value={stats.totalBets > 0 ? stats.winRate.toFixed(1) + "%" : "—"}
            />
            <StatMini
              label="Best Multiplier"
              value={stats.bestMultiplier > 1 ? stats.bestMultiplier.toFixed(2) + "x" : "—"}
              color="#00E5A0"
            />
            <StatMini
              label="Avg Cashout"
              value={stats.averageCashout > 0 ? stats.averageCashout.toFixed(2) + "x" : "—"}
            />
            <StatMini
              label="Longest Chain"
              value={stats.longestChain > 0 ? stats.longestChain + " preds" : "—"}
            />
            <StatMini
              label="Best Win Streak"
              value={stats.bestWinStreak > 0 ? String(stats.bestWinStreak) : "—"}
              color="#00E5A0"
            />
            <StatMini
              label="Cur Win Streak"
              value={stats.currentWinStreak > 0 ? String(stats.currentWinStreak) : "—"}
              color="#00E5A0"
            />
            <StatMini
              label="Higher Picks"
              value={stats.totalPredictions > 0 ? ((stats.higherPicks / stats.totalPredictions) * 100).toFixed(0) + "%" : "—"}
            />
            <StatMini
              label="Biggest Win"
              value={stats.biggestWin > 0 ? formatCurrency(stats.biggestWin) : "—"}
              color="#00E5A0"
            />
            <StatMini
              label="Biggest Loss"
              value={stats.biggestLoss > 0 ? formatCurrency(stats.biggestLoss) : "—"}
              color="#EF4444"
            />
          </div>
        )}
      </div>

      {/* Casinos that offer this game */}
      <GameProviders gameId="hilo" gameName="HiLo" />

      {/* Spin the Deal Wheel CTA */}
      <a
        href="/deals"
        className="flex items-center gap-2.5 bg-pb-bg-secondary border rounded-lg px-3 py-2 hover:border-pb-accent/60 transition-colors"
        style={{
          borderColor: sessionBetCount >= 10 ? "rgba(0, 229, 160, 0.4)" : "#374151",
          boxShadow: sessionBetCount >= 10 ? "0 0 12px rgba(0, 229, 160, 0.1)" : "none",
        }}
      >
        <span className="text-lg shrink-0">&#127905;</span>
        <div className="flex-1 min-w-0">
          <span className="font-heading font-semibold text-pb-text-primary text-xs">
            Spin the Deal Wheel
          </span>
          <span className="text-[10px] text-pb-text-muted ml-1.5">
            HiLo bonuses
          </span>
        </div>
        <span className="text-xs text-pb-accent font-semibold shrink-0">&rarr;</span>
      </a>


      {/* HiLo Bet History */}
      {history.length > 0 && (
        <div>
          <h3 className="text-[10px] font-heading font-semibold text-pb-text-muted uppercase tracking-wider mb-1">
            Bet History
          </h3>
          <div className="max-h-[300px] overflow-y-auto rounded-lg border border-pb-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-pb-bg-secondary">
                <tr>
                  <th className="text-xs text-pb-text-muted uppercase text-left px-2 py-2">
                    #
                  </th>
                  <th className="text-xs text-pb-text-muted uppercase text-right px-2 py-2">
                    Bet
                  </th>
                  <th className="text-xs text-pb-text-muted uppercase text-center px-2 py-2">
                    Rnds
                  </th>
                  <th className="text-xs text-pb-text-muted uppercase text-right px-2 py-2">
                    Multi
                  </th>
                  <th className="text-xs text-pb-text-muted uppercase text-right px-2 py-2">
                    Profit
                  </th>
                  <th className="text-xs text-pb-text-muted uppercase text-center px-2 py-2">
                    Start
                  </th>
                  <th className="text-xs text-pb-text-muted uppercase text-center px-2 py-2">
                    End
                  </th>
                  <th className="text-xs text-pb-text-muted uppercase text-center px-2 py-2">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {visibleHistory.map((entry, index) => {
                    const rowNumber = history.length - index;
                    const isEven = index % 2 === 0;
                    const isWin = entry.cashedOut;
                    const profitPositive = entry.profit >= 0;

                    const startColor =
                      entry.startCard.suitColor === "red" ? "#EF4444" : "#9CA3AF";
                    const endColor =
                      entry.endCard.suitColor === "red" ? "#EF4444" : "#9CA3AF";

                    return (
                      <motion.tr
                        key={entry.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`${
                          isEven ? "bg-pb-bg-primary" : "bg-pb-bg-secondary"
                        } hover:bg-pb-bg-tertiary transition-colors`}
                        style={{
                          borderLeft: `3px solid ${isWin ? "#00E5A0" : "#EF4444"}`,
                        }}
                      >
                        {/* Row number */}
                        <td className="font-mono-stats text-pb-text-muted px-2 py-1.5 text-left">
                          {rowNumber}
                        </td>

                        {/* Bet amount */}
                        <td className="font-mono-stats text-pb-text-primary px-2 py-1.5 text-right">
                          {formatCurrency(entry.amount)}
                        </td>

                        {/* Rounds (correct predictions) */}
                        <td className="font-mono-stats text-pb-text-secondary px-2 py-1.5 text-center">
                          {entry.roundCount}
                        </td>

                        {/* Multiplier */}
                        <td
                          className="font-mono-stats px-2 py-1.5 text-right font-bold"
                          style={{
                            color: isWin
                              ? getMultiplierColor(entry.cumulativeMultiplier)
                              : "#6B7280",
                          }}
                        >
                          {isWin
                            ? formatHiLoMultiplier(entry.cumulativeMultiplier)
                            : "\u2014"}
                        </td>

                        {/* Profit */}
                        <td
                          className={`font-mono-stats px-2 py-1.5 text-right ${
                            profitPositive ? "text-pb-accent" : "text-pb-danger"
                          }`}
                        >
                          {profitPositive ? "+" : ""}
                          {formatCurrency(entry.profit)}
                        </td>

                        {/* Start card */}
                        <td className="font-mono-stats px-2 py-1.5 text-center">
                          <span style={{ color: startColor }}>
                            {formatCard(entry.startCard)}
                          </span>
                        </td>

                        {/* End card */}
                        <td className="font-mono-stats px-2 py-1.5 text-center">
                          <span style={{ color: endColor }}>
                            {formatCard(entry.endCard)}
                          </span>
                        </td>

                        {/* Result badge */}
                        <td className="px-2 py-1.5 text-center">
                          <span
                            className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold"
                            style={{
                              backgroundColor: isWin
                                ? "rgba(0,229,160,0.15)"
                                : "rgba(239,68,68,0.15)",
                              color: isWin ? "#00E5A0" : "#EF4444",
                            }}
                          >
                            {isWin ? "Win" : "Loss"}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Post-Session Nudge */}
      <AnimatePresence>
        {showPostSessionNudge && (
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            className="bg-pb-bg-secondary border border-pb-accent/30 rounded-lg px-3 py-2"
          >
            <p className="text-xs text-pb-text-secondary">
              Ready to play for real? Spin the Deal Wheel to discover featured bonuses at top crypto casinos.
            </p>
            <div className="flex items-center gap-3 mt-3">
              <a
                href="/deals"
                className="text-xs font-semibold text-pb-accent hover:underline"
              >
                Spin the Wheel &rarr;
              </a>
              <button
                type="button"
                onClick={onDismissNudge}
                className="text-[10px] text-pb-text-muted hover:text-pb-text-secondary"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session Time Reminder */}
      {showTimeReminder && (
        <div className="bg-pb-bg-secondary border border-pb-warning/30 rounded-lg px-3 py-1.5">
          <p className="text-[10px] text-pb-text-secondary">
            30+ min session — take a break.
          </p>
          <button
            type="button"
            onClick={() => setShowTimeReminder(false)}
            className="text-xs text-pb-text-muted hover:text-pb-text-secondary mt-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-[10px] text-pb-text-muted leading-relaxed">
        {SITE.disclaimer}
      </p>
    </div>
  );
}

function StatMini({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-lg p-2" style={{ backgroundColor: "#111827" }}>
      <span className="font-body text-xs block" style={{ color: "#6B7280" }}>{label}</span>
      <span className="font-mono-stats text-sm font-bold block" style={{ color: color ?? "#F9FAFB" }}>
        {value}
      </span>
    </div>
  );
}
