"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { MinesGameState } from "./minesTypes";
import SessionStats from "@/components/shared/SessionStats";
import RealMoneyDisplay from "@/components/shared/RealMoneyDisplay";
import CasinoCard from "@/components/shared/CasinoCard";
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

  const minesCasinos = useMemo(
    () => CASINOS.filter((c) => c.games.includes("mines")).slice(0, 3),
    [],
  );

  const topCasino = minesCasinos[0] ?? null;

  const biggestWin = useMemo(() => {
    if (!stats.bestWin || stats.bestWin.profit <= 0) return null;
    return {
      multiplier: stats.bestWin.multiplier,
      amount: stats.bestWin.profit,
    };
  }, [stats.bestWin]);

  const visibleHistory = useMemo(() => history.slice(0, 25), [history]);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Session Stats */}
      <SessionStats
        totalBets={stats.gamesPlayed}
        totalWagered={stats.totalWagered}
        netProfit={stats.netProfit}
        biggestWin={biggestWin}
      />

      {/* Casino Recommendations */}
      <div className="space-y-3">
        <h3 className="text-sm font-heading font-semibold text-pb-text-secondary">
          Crypto Casino Partner Offers
        </h3>
        {minesCasinos.map((casino) => (
          <CasinoCard
            key={casino.id}
            name={casino.name}
            color={casino.color}
            offer={casino.offerShort}
            features={casino.features}
            url={casino.url}
            termsUrl={casino.termsUrl}
            regionNote={casino.regionNote}
            compact
          />
        ))}
      </div>

      {/* Spin the Deal Wheel CTA */}
      <div
        className="bg-pb-bg-secondary border border-pb-accent rounded-xl p-4 text-center"
        style={{
          borderWidth: sessionGameCount >= 10 ? "2px" : "1px",
          boxShadow:
            sessionGameCount >= 10
              ? "0 0 16px rgba(0, 229, 160, 0.15)"
              : "none",
        }}
      >
        <div className="text-2xl mb-2">&#127905;</div>
        <p className="font-heading font-semibold text-pb-text-primary text-sm">
          Spin the Deal Wheel
        </p>
        <p className="text-xs text-pb-text-muted mt-1">
          Discover featured Mines bonuses
        </p>
        <a
          href="/deals"
          className="inline-block mt-3 text-sm text-pb-accent font-semibold hover:underline"
        >
          Spin Now &rarr;
        </a>
      </div>

      {/* "What You Would Have Won" */}
      <RealMoneyDisplay
        totalWagered={stats.totalWagered}
        totalReturns={stats.totalReturns}
        netProfit={stats.netProfit}
        visible={sessionGameCount >= 5}
        topCasino={
          topCasino
            ? {
                name: topCasino.name,
                color: topCasino.color,
                offer: topCasino.offerShort,
                url: topCasino.url,
                termsUrl: topCasino.termsUrl,
              }
            : undefined
        }
      />

      {/* Bet History */}
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

      {/* Session Reminder */}
      {state.showSessionReminder && (
        <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-3">
          <p className="text-xs text-pb-text-secondary">
            You&apos;ve played {sessionGameCount} rounds. Remember, this is
            practice mode — take a break if needed.
          </p>
          <button
            type="button"
            onClick={onDismissReminder}
            className="text-xs text-pb-text-muted mt-1 hover:text-pb-text-secondary"
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
