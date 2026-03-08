"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PlinkoGameState } from "./plinkoTypes";
import SessionStats from "@/components/shared/SessionStats";
import BetHistory from "@/components/shared/BetHistory";
import RealMoneyDisplay from "@/components/shared/RealMoneyDisplay";
import CasinoCard from "@/components/shared/CasinoCard";
import { CASINOS, SITE } from "@/lib/constants";

interface PlinkoSidebarProps {
  state: PlinkoGameState;
  onDismissNudge: () => void;
}

const SESSION_TIME_REMINDER_MS = 30 * 60 * 1000; // 30 minutes

export default function PlinkoSidebar({ state, onDismissNudge }: PlinkoSidebarProps) {
  const { stats, history, sessionBetCount, showPostSessionNudge } = state;
  const [showTimeReminder, setShowTimeReminder] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowTimeReminder(true), SESSION_TIME_REMINDER_MS);
    return () => clearTimeout(timer);
  }, []);

  const plinkoCasinos = useMemo(
    () => CASINOS.filter((c) => c.games.includes("plinko")).slice(0, 3),
    []
  );

  const topCasino = plinkoCasinos[0] ?? null;

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
    <div className="flex flex-col gap-4 w-full">
      {/* Session Stats */}
      <SessionStats
        totalBets={stats.totalBets}
        totalWagered={stats.totalWagered}
        netProfit={stats.netProfit}
        biggestWin={biggestWin}
      />

      {/* Casino Recommendations */}
      <div className="space-y-3">
        <h3 className="text-sm font-heading font-semibold text-pb-text-secondary">
          Crypto Casino Partner Offers
        </h3>
        {plinkoCasinos.map((casino) => (
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
          borderWidth: sessionBetCount >= 10 ? "2px" : "1px",
          boxShadow:
            sessionBetCount >= 10
              ? "0 0 16px rgba(0, 229, 160, 0.15)"
              : "none",
        }}
      >
        <div className="text-2xl mb-2">&#127905;</div>
        <p className="font-heading font-semibold text-pb-text-primary text-sm">
          Spin the Deal Wheel
        </p>
        <p className="text-xs text-pb-text-muted mt-1">
          Discover featured Plinko bonuses
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
        visible={sessionBetCount >= 5}
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
          <BetHistory history={betHistoryEntries} />
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
