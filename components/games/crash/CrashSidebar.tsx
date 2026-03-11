"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CrashGameState } from "./crashTypes";
import SessionStats from "@/components/shared/SessionStats";

import GameProviders from "@/components/shared/GameProviders";
import { CASINOS, SITE } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import {
  formatCrashMultiplier,
  getMultiplierColor,
  getCrashPointBadgeStyle,
} from "./crashEngine";

interface CrashSidebarProps {
  state: CrashGameState;
  onDismissNudge: () => void;
}

const SESSION_TIME_REMINDER_MS = 30 * 60 * 1000; // 30 minutes

export default function CrashSidebar({ state, onDismissNudge }: CrashSidebarProps) {
  const { stats, history, sessionRoundCount, showPostSessionNudge } = state;
  const [showTimeReminder, setShowTimeReminder] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowTimeReminder(true), SESSION_TIME_REMINDER_MS);
    return () => clearTimeout(timer);
  }, []);

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const topCasino = useMemo(
    () => CASINOS.find((c) => c.games.includes("crash")) ?? null,
    []
  );

  const biggestWin = useMemo(() => {
    if (stats.biggestWin <= 0) return null;
    // Use bestCashout as the multiplier for the biggest win display
    const multiplier = stats.bestCashout > 0 ? stats.bestCashout : 0;
    return { multiplier, amount: stats.biggestWin };
  }, [stats.biggestWin, stats.bestCashout]);

  const visibleHistory = useMemo(() => history.slice(0, 25), [history]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Session Stats */}
      <SessionStats
        totalBets={stats.totalBets}
        totalWagered={stats.totalWagered}
        netProfit={stats.netProfit}
        biggestWin={biggestWin}
      />

      {/* Casinos that offer this game */}
      <GameProviders gameId="crash" gameName="Crash" />

      {/* Spin the Deal Wheel CTA */}
      <div
        className="bg-pb-bg-secondary border border-pb-accent rounded-xl p-4 text-center"
        style={{
          borderWidth: sessionRoundCount >= 10 ? "2px" : "1px",
          boxShadow:
            sessionRoundCount >= 10
              ? "0 0 16px rgba(0, 229, 160, 0.15)"
              : "none",
        }}
      >
        <div className="text-2xl mb-2">&#127905;</div>
        <p className="font-heading font-semibold text-pb-text-primary text-sm">
          Spin the Deal Wheel
        </p>
        <p className="text-xs text-pb-text-muted mt-1">
          Discover featured Crash bonuses
        </p>
        <a
          href="/deals"
          className="inline-block mt-3 text-sm text-pb-accent font-semibold hover:underline"
        >
          Spin Now &rarr;
        </a>
      </div>


      {/* Crash Bet History */}
      {history.length > 0 && (
        <div>
          <h3 className="text-sm font-heading font-semibold text-pb-text-secondary mb-2">
            Bet History
          </h3>
          <div className="max-h-[300px] overflow-y-auto rounded-lg border border-pb-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-pb-bg-secondary">
                <tr>
                  <th className="text-xs text-pb-text-muted uppercase text-left px-3 py-2">
                    #
                  </th>
                  <th className="text-xs text-pb-text-muted uppercase text-right px-3 py-2">
                    Bet
                  </th>
                  <th className="text-xs text-pb-text-muted uppercase text-right px-3 py-2">
                    Crashed At
                  </th>
                  <th className="text-xs text-pb-text-muted uppercase text-right px-3 py-2">
                    Cashout
                  </th>
                  <th className="text-xs text-pb-text-muted uppercase text-right px-3 py-2">
                    Profit
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {visibleHistory.map((entry, index) => {
                    const rowNumber = history.length - index;
                    const isEven = index % 2 === 0;
                    const profitPositive = entry.profit >= 0;
                    const crashStyle = getCrashPointBadgeStyle(entry.crashPoint);

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
                      >
                        {/* Row number */}
                        <td className="font-mono-stats text-pb-text-muted px-3 py-1.5 text-left">
                          {rowNumber}
                        </td>

                        {/* Bet amount */}
                        <td className="font-mono-stats text-pb-text-primary px-3 py-1.5 text-right">
                          {formatCurrency(entry.amount)}
                        </td>

                        {/* Crashed At (colored) */}
                        <td
                          className="font-mono-stats px-3 py-1.5 text-right font-bold"
                          style={{ color: crashStyle.text }}
                        >
                          {formatCrashMultiplier(entry.crashPoint)}
                        </td>

                        {/* Cashout (green if cashed out, dash if not) */}
                        <td
                          className="font-mono-stats px-3 py-1.5 text-right"
                          style={{
                            color: entry.cashedOut
                              ? getMultiplierColor(entry.cashoutMultiplier ?? 0)
                              : "#6B7280",
                          }}
                        >
                          {entry.cashedOut && entry.cashoutMultiplier !== null
                            ? formatCrashMultiplier(entry.cashoutMultiplier)
                            : "\u2014"}
                        </td>

                        {/* Profit */}
                        <td
                          className={`font-mono-stats px-3 py-1.5 text-right ${
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
        </div>
      )}

      {/* Post-Session Nudge */}
      <AnimatePresence>
        {showPostSessionNudge && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="bg-pb-bg-secondary border border-pb-accent/30 rounded-xl p-4"
          >
            <p className="text-sm text-pb-text-secondary">
              Ready to play for real? Spin the Deal Wheel to discover featured bonuses at top crypto casinos.
            </p>
            <div className="flex items-center gap-3 mt-3">
              <a
                href="/deals"
                className="text-sm font-semibold text-pb-accent hover:underline"
              >
                Spin the Wheel &rarr;
              </a>
              <button
                type="button"
                onClick={onDismissNudge}
                className="text-xs text-pb-text-muted hover:text-pb-text-secondary"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session Time Reminder */}
      {showTimeReminder && (
        <div className="bg-pb-bg-secondary border border-pb-warning/30 rounded-xl p-3">
          <p className="text-xs text-pb-text-secondary">
            You&apos;ve been playing for 30+ minutes. Remember to take breaks
            and play responsibly.
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
      <p className="text-xs text-pb-text-muted leading-relaxed">
        {SITE.disclaimer}
      </p>
    </div>
  );
}
