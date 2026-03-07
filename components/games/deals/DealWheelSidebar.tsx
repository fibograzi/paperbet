"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DealWheelState } from "./dealWheelTypes";
import { FREE_SPINS } from "./dealWheelEngine";
import CasinoCard from "@/components/shared/CasinoCard";
import { CASINOS, GAMES, SITE } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DealWheelSidebarProps {
  state: DealWheelState;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DealWheelSidebar({ state }: DealWheelSidebarProps) {
  const { stats } = state;

  const freeSpinsLeft = Math.max(0, FREE_SPINS - stats.freeSpinsUsed);

  // All available games (for "Play Our Games" section)
  const availableGames = useMemo(
    () => GAMES.filter((g) => g.available),
    []
  );

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 1. Spin Stats — 2x2 grid */}
      <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-4">
        <h3 className="text-sm font-heading font-semibold text-pb-text-secondary mb-3">
          Spin Stats
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <StatBox label="Total Spins" value={stats.totalSpins} />
          <StatBox label="Free Spins Left" value={freeSpinsLeft} />
          <StatBox label="Bonus Spins Left" value={stats.emailSpinsRemaining} />
          <StatBox label="Deals Won" value={stats.prizesWon.filter((p) => p.segment.tier !== "respin").length} />
        </div>
      </div>

      {/* 2. Your Prizes */}
      {stats.prizesWon.length > 0 && (
        <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-4">
          <h3 className="text-sm font-heading font-semibold text-pb-text-secondary mb-3">
            Your Prizes
          </h3>
          <div className="space-y-2 max-h-[240px] overflow-y-auto">
            <AnimatePresence initial={false}>
              {[...stats.prizesWon].reverse().map((prize) => {
                // Skip respins in prize display
                if (prize.segment.tier === "respin") return null;

                const isMystery =
                  prize.segment.id === "seg-mystery" && prize.resolvedCasino;
                const name = isMystery
                  ? prize.resolvedCasino!.name
                  : prize.segment.label;
                const color = isMystery
                  ? prize.resolvedCasino!.color
                  : prize.segment.color;
                const deal = isMystery
                  ? prize.resolvedCasino!.deal
                  : prize.segment.dealTitle;
                const url = isMystery
                  ? prize.resolvedCasino!.url
                  : prize.segment.affiliateUrl;

                return (
                  <motion.div
                    key={prize.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-3 group"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-semibold truncate"
                        style={{ color }}
                      >
                        {name}
                      </p>
                      <p className="text-xs text-pb-text-muted truncate">
                        {deal}
                      </p>
                    </div>
                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="text-xs text-pb-accent hover:underline flex-shrink-0"
                      >
                        View &rarr;
                      </a>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* 3. All Available Deals */}
      <div className="space-y-3">
        <h3 className="text-sm font-heading font-semibold text-pb-text-secondary">
          Crypto Casino Partner Offers
        </h3>
        {CASINOS.map((casino) => (
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

      {/* 4. Play Our Games */}
      <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-4">
        <h3 className="text-sm font-heading font-semibold text-pb-text-secondary mb-2">
          Play Our Games
        </h3>
        <p className="text-xs text-pb-text-muted mb-3">
          Practice strategies before playing for real
        </p>
        <div className="space-y-2">
          {availableGames.map((game) => (
            <a
              key={game.id}
              href={`/${game.slug}`}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-pb-bg-tertiary hover:bg-pb-border/30 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{
                  backgroundColor: `${game.color}20`,
                  color: game.color,
                }}
              >
                {game.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-pb-text-primary">
                  {game.name}
                </p>
                <p className="text-xs text-pb-text-muted">
                  {game.shortDesc}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* 5. Disclaimer */}
      <p className="text-xs text-pb-text-muted leading-relaxed">
        {SITE.disclaimer}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat Box (local helper component)
// ---------------------------------------------------------------------------

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-pb-bg-tertiary rounded-lg p-3 text-center">
      <p className="font-mono-stats text-lg font-bold text-pb-text-primary">
        {value}
      </p>
      <p className="text-xs text-pb-text-muted mt-0.5">{label}</p>
    </div>
  );
}
