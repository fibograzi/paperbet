"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PlinkoGameState } from "./plinkoTypes";
import SessionStats from "@/components/shared/SessionStats";
import BetHistory from "@/components/shared/BetHistory";

import GameProviders from "@/components/shared/GameProviders";
import { CASINOS, SITE } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

interface PlinkoSidebarProps {
  state: PlinkoGameState;
  onDismissNudge: () => void;
}

const SESSION_TIME_REMINDER_MS = 30 * 60 * 1000; // 30 minutes

export default function PlinkoSidebar({ state, onDismissNudge }: PlinkoSidebarProps) {
  const { stats, history, sessionBetCount, showPostSessionNudge } = state;
  const [showTimeReminder, setShowTimeReminder] = useState(false);
  const [showMoreStats, setShowMoreStats] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowTimeReminder(true), SESSION_TIME_REMINDER_MS);
    return () => clearTimeout(timer);
  }, []);

  const topCasino = useMemo(
    () => CASINOS.find((c) => c.games.includes("plinko")) ?? null,
    []
  );

  const biggestWin = useMemo(() => {
    if (stats.biggestWin <= 0) return null;
    const entry = history.find((h) => h.profit === stats.biggestWin);
    return entry
      ? { multiplier: entry.multiplier, amount: entry.profit }
      : { multiplier: 0, amount: stats.biggestWin };
  }, [stats.biggestWin, history]);

  const betHistoryEntries = useMemo(
    () =>
      history.map((h) => ({
        id: h.id,
        amount: h.amount,
        multiplier: h.multiplier,
        profit: h.profit,
        risk: h.risk,
        rows: h.rows,
      })),
    [history]
  );

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
              label="Avg Multiplier"
              value={stats.totalBets > 0 ? stats.averageMultiplier.toFixed(2) + "x" : "—"}
            />
            <StatMini
              label="Highest Multi"
              value={stats.highestMultiplier > 0 ? stats.highestMultiplier + "x" : "—"}
              color="#00E5A0"
            />
            <StatMini
              label="Lowest Multi"
              value={stats.lowestMultiplier < Infinity ? stats.lowestMultiplier + "x" : "—"}
              color="#EF4444"
            />
            <StatMini
              label="Current Streak"
              value={
                stats.currentStreak === 0
                  ? "—"
                  : stats.currentStreak > 0
                  ? stats.currentStreak + "W"
                  : Math.abs(stats.currentStreak) + "L"
              }
              color={
                stats.currentStreak > 0
                  ? "#00E5A0"
                  : stats.currentStreak < 0
                  ? "#EF4444"
                  : undefined
              }
            />
            <StatMini
              label="Best Win Streak"
              value={stats.bestStreak > 0 ? String(stats.bestStreak) : "—"}
              color="#00E5A0"
            />
            <StatMini
              label="Worst Loss Streak"
              value={stats.worstLossStreak < 0 ? String(Math.abs(stats.worstLossStreak)) : "—"}
              color="#EF4444"
            />
            <StatMini
              label="Biggest Win"
              value={stats.biggestWin > 0 ? formatCurrency(stats.biggestWin) : "—"}
              color="#00E5A0"
            />
          </div>
        )}
      </div>

      {/* Casinos that offer this game */}
      <GameProviders gameId="plinko" gameName="Plinko" />

      {/* Spin the Deal Wheel CTA */}
      <a
        href="/deals"
        className="flex items-center gap-2.5 bg-pb-bg-secondary border rounded-lg px-3 py-2 hover:border-pb-accent/60 transition-colors"
        style={{
          borderColor: sessionBetCount >= 10 ? "rgba(0, 229, 160, 0.4)" : "#374151",
          boxShadow:
            sessionBetCount >= 10
              ? "0 0 12px rgba(0, 229, 160, 0.1)"
              : "none",
        }}
      >
        <span className="text-lg shrink-0">&#127905;</span>
        <div className="flex-1 min-w-0">
          <span className="font-heading font-semibold text-pb-text-primary text-xs">
            Spin the Deal Wheel
          </span>
          <span className="text-[10px] text-pb-text-muted ml-1.5">
            Plinko bonuses
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
          <BetHistory history={betHistoryEntries} />
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
              Ready to play for real? Discover featured bonuses at top crypto casinos.
            </p>
            <div className="flex items-center gap-3 mt-1.5">
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
          <p className="text-[10px] text-pb-text-secondary leading-relaxed">
            30+ min session. Remember to take breaks and play responsibly.
          </p>
          <button
            type="button"
            onClick={() => setShowTimeReminder(false)}
            className="text-[10px] text-pb-text-muted hover:text-pb-text-secondary mt-0.5"
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
