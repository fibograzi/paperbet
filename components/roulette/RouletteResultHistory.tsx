"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { RoundResult } from "@/lib/roulette/rouletteTypes";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface RouletteResultHistoryProps {
  history: RoundResult[];
}

// ---------------------------------------------------------------------------
// Color map
// ---------------------------------------------------------------------------

const COLOR_MAP = {
  red: { bg: "#DC2626", text: "#FFFFFF" },
  black: { bg: "#374151", text: "#F9FAFB" },
  green: { bg: "#059669", text: "#FFFFFF" },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RouletteResultHistory({ history }: RouletteResultHistoryProps) {
  const displayed = history.slice(0, 20);

  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-body uppercase tracking-wider text-pb-text-muted">
        Recent Results
      </p>

      {displayed.length === 0 ? (
        <div
          className="flex items-center justify-center py-3 rounded-lg"
          style={{ backgroundColor: "rgba(31,41,55,0.3)", border: "1px dashed #374151" }}
        >
          <p className="text-xs font-body text-pb-text-muted">No spins yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-1.5 pb-1" style={{ minWidth: "max-content" }}>
            <AnimatePresence mode="popLayout" initial={false}>
              {displayed.map((round) => {
                const { pocket } = round.spinResult;
                const colors = COLOR_MAP[pocket.color];
                return (
                  <motion.div
                    key={round.id}
                    initial={{ opacity: 0, scale: 0.6, x: -10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 20 }}
                    className="shrink-0 rounded-full flex items-center justify-center font-mono-stats font-bold shadow"
                    style={{
                      width: "28px",
                      height: "28px",
                      backgroundColor: colors.bg,
                      color: colors.text,
                      fontSize: pocket.label.length > 2 ? "9px" : "11px",
                      border: `1px solid rgba(255,255,255,0.15)`,
                    }}
                    title={`${pocket.label} — ${pocket.color}`}
                  >
                    {pocket.label}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Color summary dots */}
      {displayed.length > 0 && (
        <div className="flex items-center gap-3">
          {(["red", "black", "green"] as const).map((color) => {
            const count = displayed.filter((r) => r.spinResult.pocket.color === color).length;
            const pct = Math.round((count / displayed.length) * 100);
            return (
              <div key={color} className="flex items-center gap-1">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLOR_MAP[color].bg }}
                />
                <span className="font-mono-stats text-[10px] text-pb-text-muted">
                  {count}
                  <span className="text-pb-text-muted/60 ml-0.5">({pct}%)</span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
