"use client";

import { X, RotateCcw, Trash2, RefreshCw, TrendingUp } from "lucide-react";
import type { PlacedBet } from "@/lib/roulette/rouletteTypes";
import { formatCurrency } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface RouletteBetSlipProps {
  bets: PlacedBet[];
  onUndo: () => void;
  onClear: () => void;
  onRepeat: () => void;
  onDouble: () => void;
  onRemoveBet: (betId: string) => void;
  totalBetAmount: number;
  disabled: boolean;
  hasPreviousBets: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RouletteBetSlip({
  bets,
  onUndo,
  onClear,
  onRepeat,
  onDouble,
  onRemoveBet,
  totalBetAmount,
  disabled,
  hasPreviousBets,
}: RouletteBetSlipProps) {
  const hasBets = bets.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-body uppercase tracking-wider text-pb-text-muted">
          Bet Slip
        </p>
        {hasBets && (
          <span className="font-mono-stats text-xs text-pb-text-secondary">
            {bets.length} bet{bets.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Bet list */}
      {hasBets ? (
        <div
          className="space-y-1 overflow-y-auto"
          style={{ maxHeight: "160px" }}
        >
          {bets.map((bet) => (
            <div
              key={bet.id}
              className="flex items-center justify-between rounded-lg px-2.5 py-1.5"
              style={{
                backgroundColor: "rgba(31,41,55,0.6)",
                border: "1px solid #374151",
              }}
            >
              <span className="text-xs font-body text-pb-text-secondary truncate flex-1 mr-2">
                {bet.label}
              </span>
              <span className="font-mono-stats text-xs text-pb-text-primary shrink-0 mr-1.5">
                {formatCurrency(bet.amount)}
              </span>
              <button
                type="button"
                onClick={() => onRemoveBet(bet.id)}
                disabled={disabled}
                className="shrink-0 rounded p-0.5 transition-colors hover:bg-pb-danger/20 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ color: "#6B7280" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#EF4444";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#6B7280";
                }}
                aria-label={`Remove bet: ${bet.label}`}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center py-4 rounded-lg"
          style={{ backgroundColor: "rgba(31,41,55,0.3)", border: "1px dashed #374151" }}
        >
          <p className="text-xs font-body text-pb-text-muted text-center">
            No bets placed
          </p>
          <p className="text-[10px] text-pb-text-muted mt-0.5">
            Click numbers or bet zones to add
          </p>
        </div>
      )}

      {/* Total */}
      {hasBets && (
        <div
          className="flex items-center justify-between rounded-lg px-2.5 py-2"
          style={{ backgroundColor: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.25)" }}
        >
          <span className="text-xs font-body text-pb-text-secondary">Total wagered</span>
          <span className="font-mono-stats text-sm font-bold text-pb-accent">
            {formatCurrency(totalBetAmount)}
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={onUndo}
          disabled={disabled || !hasBets}
          className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-body font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10"
          style={{
            backgroundColor: "rgba(107,114,128,0.15)",
            color: "#9CA3AF",
            border: "1px solid #374151",
          }}
          title="Undo last bet"
        >
          <RotateCcw size={12} />
          Undo
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={disabled || !hasBets}
          className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-body font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-pb-danger/10"
          style={{
            backgroundColor: "rgba(239,68,68,0.1)",
            color: "#EF4444",
            border: "1px solid rgba(239,68,68,0.25)",
          }}
          title="Clear all bets"
        >
          <Trash2 size={12} />
          Clear
        </button>
        <button
          type="button"
          onClick={onRepeat}
          disabled={disabled || !hasPreviousBets}
          className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-body font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10"
          style={{
            backgroundColor: "rgba(107,114,128,0.15)",
            color: "#9CA3AF",
            border: "1px solid #374151",
          }}
          title="Repeat last round bets"
        >
          <RefreshCw size={12} />
          Repeat
        </button>
        <button
          type="button"
          onClick={onDouble}
          disabled={disabled || !hasBets}
          className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-body font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: hasBets && !disabled ? "rgba(0,180,216,0.15)" : "rgba(107,114,128,0.1)",
            color: hasBets && !disabled ? "#00B4D8" : "#6B7280",
            border: `1px solid ${hasBets && !disabled ? "rgba(0,180,216,0.3)" : "#374151"}`,
          }}
          title="Double all bets"
        >
          <TrendingUp size={12} />
          Double
        </button>
      </div>
    </div>
  );
}
