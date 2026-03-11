"use client";

import { useMemo } from "react";
import type { FlipGameState } from "./flipTypes";
import FlipCoin from "./FlipCoin";
import FlipChainTracker from "./FlipChainTracker";
import FlipResultOverlay from "./FlipResultOverlay";
import FlipCashOutPanel from "./FlipCashOutPanel";
import { getFlipWinTier } from "./flipEngine";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface FlipArenaProps {
  state: FlipGameState;
  onCashOut: () => void;
  onFlipAgain: () => void;
}

// ---------------------------------------------------------------------------
// Result history strip
// ---------------------------------------------------------------------------

function ResultHistoryStrip({
  history,
}: {
  history: FlipGameState["history"];
}) {
  const recent = useMemo(() => history.slice(0, 20), [history]);

  if (recent.length === 0) return null;

  return (
    <div className="flex items-center gap-1 justify-center overflow-x-auto py-2 px-1 max-w-full">
      {recent
        .slice()
        .reverse()
        .map((entry) => (
          <div
            key={entry.id}
            className="w-2.5 h-2.5 rounded-full shrink-0 transition-all duration-200"
            style={{
              backgroundColor: entry.cashedOut
                ? entry.result === "heads"
                  ? "#F59E0B"
                  : "#00B4D8"
                : "#EF4444",
              opacity: entry.cashedOut ? 1 : 0.5,
            }}
            title={`${entry.result === "heads" ? "Heads" : "Tails"} — ${
              entry.cashedOut
                ? `${entry.multiplier.toFixed(2)}x — +$${entry.profit.toFixed(2)}`
                : `Loss — -$${entry.amount.toFixed(2)}`
            }`}
          />
        ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Streak warning (10+ flips without cashing out)
// ---------------------------------------------------------------------------

function StreakWarning({ flips }: { flips: number }) {
  if (flips < 10) return null;

  return (
    <p
      className="text-center font-body text-xs px-4 py-1"
      style={{ color: "#F59E0B" }}
    >
      Hot streak! Remember: each flip is still 50/50.
    </p>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FlipArena({
  state,
  onCashOut,
  onFlipAgain,
}: FlipArenaProps) {
  const { phase, streak, lastResult, config, history } = state;
  const isAutoPlaying = state.autoPlay.active;

  // Win tier for screen edge effects
  const winTier =
    (phase === "won" || phase === "cashing_out") && streak
      ? getFlipWinTier(streak.flips)
      : null;

  // Screen edge glow color
  const edgeGlowColor = useMemo(() => {
    if (!winTier) return "transparent";
    switch (winTier) {
      case "big":
        return "rgba(249, 115, 22, 0.08)";
      case "epic":
        return "rgba(239, 68, 68, 0.08)";
      case "jackpot":
        return "rgba(245, 158, 11, 0.12)";
      default:
        return "transparent";
    }
  }, [winTier]);

  return (
    <div
      className="relative rounded-xl p-4 md:p-6 flex flex-col items-center gap-4"
      style={{
        backgroundColor: "#0B0F1A",
        border: "1px solid #1F2937",
        minHeight: "300px",
        boxShadow:
          edgeGlowColor !== "transparent"
            ? `inset 0 0 60px ${edgeGlowColor}`
            : undefined,
        transition: "box-shadow 0.5s ease",
      }}
    >
      {/* Multiplier display (above coin on desktop) */}
      <div className="hidden md:block min-h-[80px]">
        <FlipResultOverlay
          phase={phase}
          streak={streak}
          betAmount={config.betAmount}
        />
      </div>

      {/* The Coin */}
      <FlipCoin
        phase={phase}
        lastResult={lastResult}
        pendingResult={state.pendingResult}
        instantBet={config.instantBet}
      />

      {/* Multiplier display (below coin on mobile) */}
      <div className="md:hidden min-h-[60px]">
        <FlipResultOverlay
          phase={phase}
          streak={streak}
          betAmount={config.betAmount}
        />
      </div>

      {/* Cash Out / Flip Again buttons (in arena during streak) */}
      {phase === "won" && streak && (
        <FlipCashOutPanel
          phase={phase}
          streak={streak}
          betAmount={config.betAmount}
          onCashOut={onCashOut}
          onFlipAgain={onFlipAgain}
          disabled={isAutoPlaying}
        />
      )}

      {/* Chain tracker (shows during active streak or after result) */}
      {streak && streak.flips > 0 && (
        <FlipChainTracker
          phase={phase}
          streak={streak}
          targetFlips={
            state.autoPlay.active && state.autoPlay.config
              ? state.autoPlay.config.flipsPerRound
              : undefined
          }
        />
      )}

      {/* Streak warning */}
      {streak && phase === "won" && (
        <StreakWarning flips={streak.flips} />
      )}

      {/* Result history strip */}
      <ResultHistoryStrip history={history} />
    </div>
  );
}
