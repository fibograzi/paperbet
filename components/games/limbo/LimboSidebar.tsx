"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LimboGameState } from "./limboTypes";
import { formatLimboResult } from "./limboEngine";
import SessionStats from "@/components/shared/SessionStats";

import GameProviders from "@/components/shared/GameProviders";
import { CASINOS, SITE } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface LimboSidebarProps {
  state: LimboGameState;
  onDismissNudge: () => void;
  onDismissReminder?: () => void;
}

const SESSION_TIME_REMINDER_MS = 30 * 60 * 1000; // 30 minutes

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LimboSidebar({ state, onDismissNudge, onDismissReminder }: LimboSidebarProps) {
  const { stats, history, sessionBetCount, showPostSessionNudge, showSessionReminder } = state;
  const [showTimeReminder, setShowTimeReminder] = useState(false);
  const [showMoreStats, setShowMoreStats] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowTimeReminder(true), SESSION_TIME_REMINDER_MS);
    return () => clearTimeout(timer);
  }, []);

  const topCasino = useMemo(
    () => CASINOS.find((c) => c.games.includes("limbo")) ?? null,
    [],
  );

  const biggestWin = useMemo(() => {
    if (!stats.bestWin) return null;
    // Show payout amount (profit + bet), not just net profit
    return { multiplier: stats.bestWin.multiplier, amount: stats.bestWin.profit };
  }, [stats.bestWin]);

  const visibleHistory = useMemo(() => history.slice(0, 25), [history]);

  // Average calculations
  const averageResult = stats.totalBets > 0
    ? (stats.resultSum / stats.totalBets).toFixed(2) + "x"
    : "\u2014";
  const averageTarget = stats.totalBets > 0
    ? (stats.targetSum / stats.totalBets).toFixed(2) + "x"
    : "\u2014";
  const winRate = stats.totalBets > 0
    ? ((stats.winCount / stats.totalBets) * 100).toFixed(1) + "%"
    : "\u2014";

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
          <span className="text-xs" style={{ color: "#6B7280" }}>{showMoreStats ? "\u25B2" : "\u25BC"}</span>
        </button>
        {showMoreStats && (
          <div className="px-4 pb-3 grid grid-cols-2 gap-2">
            <StatMini label="Win Rate" value={winRate} />
            <StatMini label="Avg Result" value={averageResult} />
            <StatMini label="Avg Target" value={averageTarget} />
            <StatMini label="Highest Result" value={stats.highestResult > 0 ? stats.highestResult.toFixed(2) + "x" : "\u2014"} />
            <StatMini label="Lowest Result" value={isFinite(stats.lowestResult) ? stats.lowestResult.toFixed(2) + "x" : "\u2014"} />
            <StatMini
              label="Current Streak"
              value={
                stats.currentStreak === 0
                  ? "\u2014"
                  : stats.currentStreak > 0
                    ? `${stats.currentStreak}W`
                    : `${Math.abs(stats.currentStreak)}L`
              }
              color={stats.currentStreak > 0 ? "#00E5A0" : stats.currentStreak < 0 ? "#EF4444" : undefined}
            />
            <StatMini label="Best Win Streak" value={stats.bestWinStreak > 0 ? `${stats.bestWinStreak}` : "\u2014"} color="#00E5A0" />
            <StatMini label="Worst Loss Streak" value={stats.bestLossStreak > 0 ? `${stats.bestLossStreak}` : "\u2014"} color="#EF4444" />
          </div>
        )}
      </div>

      {/* Casinos that offer this game */}
      <GameProviders gameId="limbo" gameName="Limbo" />

      {/* Spin the Deal Wheel CTA */}
      <a
        href="/deals"
        className="flex items-center gap-2.5 bg-pb-bg-secondary border rounded-lg px-3 py-2 hover:border-pb-accent/60 transition-colors"
        style={{
          borderColor: sessionBetCount >= 20 ? "rgba(0, 229, 160, 0.4)" : "#374151",
          boxShadow: sessionBetCount >= 20 ? "0 0 12px rgba(0, 229, 160, 0.1)" : "none",
        }}
      >
        <span className="text-lg shrink-0">&#127905;</span>
        <div className="flex-1 min-w-0">
          <span className="font-heading font-semibold text-pb-text-primary text-xs">
            Spin the Deal Wheel
          </span>
          <span className="text-[10px] text-pb-text-muted ml-1.5">
            Limbo bonuses
          </span>
        </div>
        <span className="text-xs text-pb-accent font-semibold shrink-0">&rarr;</span>
      </a>



      {/* Bet History */}
      {history.length > 0 && (
        <div>
          <h3 className="text-[10px] font-heading font-semibold text-pb-text-muted uppercase tracking-wider mb-1">
            Bet History
          </h3>
          <div className="max-h-[340px] overflow-y-auto rounded-lg border border-pb-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-pb-bg-secondary">
                <tr>
                  <th className="text-xs text-pb-text-muted uppercase text-center px-1.5 py-2" style={{ width: 32 }}>#</th>
                  <th className="text-xs text-pb-text-muted uppercase text-right px-1.5 py-2" style={{ width: 64 }}>Bet</th>
                  <th className="text-xs text-pb-text-muted uppercase text-right px-1.5 py-2" style={{ width: 64 }}>Target</th>
                  <th className="text-xs text-pb-text-muted uppercase text-right px-1.5 py-2" style={{ width: 72 }}>Result</th>
                  <th className="text-xs text-pb-text-muted uppercase text-right px-1.5 py-2" style={{ width: 72 }}>Profit</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {visibleHistory.map((entry, index) => {
                    const rowNumber = history.length - index;
                    const isEven = index % 2 === 0;

                    return (
                      <motion.tr
                        key={entry.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`${isEven ? "bg-pb-bg-primary" : "bg-pb-bg-secondary"} hover:bg-pb-bg-tertiary transition-colors`}
                        style={{
                          borderLeft: entry.isWin ? "3px solid #00E5A0" : "3px solid transparent",
                        }}
                      >
                        <td className="font-mono-stats text-pb-text-muted px-1.5 py-1.5 text-center">
                          {rowNumber}
                        </td>
                        <td className="font-mono-stats text-pb-text-primary px-1.5 py-1.5 text-right">
                          {formatCurrency(entry.betAmount)}
                        </td>
                        <td className="font-mono-stats px-1.5 py-1.5 text-right" style={{ color: "#F59E0B" }}>
                          {entry.targetMultiplier.toFixed(2)}x
                        </td>
                        <td
                          className="font-mono-stats px-1.5 py-1.5 text-right font-bold"
                          style={{ color: entry.isWin ? "#00E5A0" : "#EF4444" }}
                        >
                          {entry.resultMultiplier.toFixed(2)}x
                        </td>
                        <td
                          className="font-mono-stats px-1.5 py-1.5 text-right"
                          style={{ color: entry.isWin ? "#00E5A0" : "#EF4444" }}
                        >
                          {entry.isWin ? "+" : ""}{formatCurrency(entry.profit)}
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
            className="bg-pb-bg-secondary rounded-lg px-3 py-2"
            style={{ border: "1px solid rgba(0,229,160,0.3)" }}
          >
            <p className="text-xs text-pb-text-secondary">
              Ready to play for real? Spin the Deal Wheel to unlock exclusive bonuses at top Limbo casinos.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <a
                href="/deals"
                className="text-xs font-semibold hover:underline"
                style={{ color: "#00E5A0" }}
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
            className="text-[10px] text-pb-text-muted hover:text-pb-text-secondary mt-1"
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

// ---------------------------------------------------------------------------
// Mini stat display
// ---------------------------------------------------------------------------

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
