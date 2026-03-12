"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { MinesGameState } from "./minesTypes";
import SessionStats from "@/components/shared/SessionStats";

import GameProviders from "@/components/shared/GameProviders";
import { CASINOS, SITE } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import {
  formatMinesMultiplier,
  getMultiplierColor,
  getMineCountBadgeColor,
} from "./minesCalculator";

interface MinesSidebarProps {
  state: MinesGameState;
  onDismissNudge: () => void;
  onDismissReminder: () => void;
}

export default function MinesSidebar({
  state,
  onDismissNudge,
  onDismissReminder,
}: MinesSidebarProps) {
  const { stats, history, sessionGameCount, showPostSessionNudge } = state;
  const [showMoreStats, setShowMoreStats] = useState(false);

  const topCasino = useMemo(
    () => CASINOS.find((c) => c.games.includes("mines")) ?? null,
    [],
  );

  const biggestWin = useMemo(() => {
    if (!stats.bestWin || stats.bestWin.profit <= 0) return null;
    return {
      multiplier: stats.bestWin.multiplier,
      amount: stats.bestWin.profit,
    };
  }, [stats.bestWin]);

  const visibleHistory = useMemo(() => history.slice(0, 25), [history]);

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Session Stats */}
      <SessionStats
        totalBets={stats.gamesPlayed}
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
              value={stats.gamesPlayed > 0 ? stats.winRate.toFixed(1) + "%" : "—"}
            />
            <StatMini
              label="Avg Gems/Game"
              value={stats.gamesPlayed > 0 ? stats.avgGemsPerGame.toFixed(1) : "—"}
            />
            <StatMini
              label="Longest Streak"
              value={stats.longestGemStreak > 0 ? String(stats.longestGemStreak) : "—"}
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
              label="Biggest Loss"
              value={stats.biggestLoss > 0 ? formatCurrency(stats.biggestLoss) : "—"}
            />
          </div>
        )}
      </div>

      {/* Casinos that offer this game */}
      <GameProviders gameId="mines" gameName="Mines" />

      {/* Spin the Deal Wheel CTA */}
      <a
        href="/deals"
        className="flex items-center gap-2.5 bg-pb-bg-secondary border rounded-lg px-3 py-2 hover:border-pb-accent/60 transition-colors"
        style={{
          borderColor: sessionGameCount >= 10 ? "rgba(0, 229, 160, 0.4)" : "#374151",
          boxShadow: sessionGameCount >= 10 ? "0 0 12px rgba(0, 229, 160, 0.1)" : "none",
        }}
      >
        <span className="text-lg shrink-0">&#127905;</span>
        <div className="flex-1 min-w-0">
          <span className="font-heading font-semibold text-pb-text-primary text-xs">
            Spin the Deal Wheel
          </span>
          <span className="text-[10px] text-pb-text-muted ml-1.5">
            Mines bonuses
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
                  <th className="text-xs text-pb-text-muted uppercase text-center px-2 py-2">
                    Mines
                  </th>
                  <th className="text-xs text-pb-text-muted uppercase text-center px-2 py-2">
                    Gems
                  </th>
                  <th className="text-xs text-pb-text-muted uppercase text-right px-3 py-2">
                    Result
                  </th>
                  <th className="text-xs text-pb-text-muted uppercase text-right px-3 py-2">
                    Profit
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {visibleHistory.map((entry, index) => {
                    const rowNumber = sessionGameCount - index;
                    const isEven = index % 2 === 0;
                    const badgeColor = getMineCountBadgeColor(entry.mineCount);

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
                          borderLeft: `2px solid ${
                            entry.isWin ? "#00E5A0" : "#EF4444"
                          }`,
                        }}
                      >
                        <td className="font-mono-stats text-pb-text-muted px-3 py-1.5 text-left">
                          {rowNumber}
                        </td>
                        <td className="font-mono-stats text-pb-text-primary px-3 py-1.5 text-right">
                          {formatCurrency(entry.amount)}
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <span
                            className="inline-block text-xs font-mono-stats font-medium px-1.5 py-0.5 rounded"
                            style={{
                              color: badgeColor,
                              backgroundColor: `${badgeColor}1A`,
                            }}
                          >
                            {entry.mineCount}
                          </span>
                        </td>
                        <td className="font-mono-stats text-pb-text-primary px-2 py-1.5 text-center">
                          {entry.gemsRevealed}
                        </td>
                        <td className="font-mono-stats px-3 py-1.5 text-right font-bold">
                          {entry.isWin ? (
                            <span
                              style={{
                                color: getMultiplierColor(entry.multiplier),
                              }}
                            >
                              {formatMinesMultiplier(entry.multiplier)}
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-[#EF4444] bg-[rgba(239,68,68,0.1)] px-1.5 py-0.5 rounded">
                              MINE
                            </span>
                          )}
                        </td>
                        <td
                          className={`font-mono-stats px-3 py-1.5 text-right ${
                            entry.isWin ? "text-pb-accent" : "text-pb-danger"
                          }`}
                        >
                          {entry.isWin ? "+" : ""}
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
