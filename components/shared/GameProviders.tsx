"use client";

import { useMemo } from "react";
import { CASINOS, CASINO_GAME_RTP } from "@/lib/constants";

interface GameProvidersProps {
  gameId: string;
  gameName: string;
}

export default function GameProviders({ gameId, gameName }: GameProvidersProps) {
  const providers = useMemo(() => {
    return CASINOS
      .filter((c) => c.games.includes(gameId))
      .map((c) => ({
        id: c.id,
        name: c.name,
        color: c.color,
        url: c.url,
        rtp: CASINO_GAME_RTP[c.id]?.[gameId],
      }))
      .filter((c) => c.rtp !== undefined);
  }, [gameId]);

  if (providers.length === 0) return null;

  return (
    <div>
      <h3 className="text-[10px] font-heading font-semibold text-pb-text-muted uppercase tracking-wider mb-1">
        Casinos with {gameName}
      </h3>
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid #1F2937" }}
      >
        {providers.map((casino, i) => (
          <a
            key={casino.id}
            href={casino.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex items-center justify-between px-2.5 py-1.5 transition-colors"
            style={{
              borderTop: i > 0 ? "1px solid #1F2937" : undefined,
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#1F2937";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <span
              className="font-heading font-semibold text-sm"
              style={{ color: casino.color }}
            >
              {casino.name}
            </span>
            <span className="font-mono-stats text-xs" style={{ color: "#6B7280" }}>
              {casino.rtp}% RTP
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
