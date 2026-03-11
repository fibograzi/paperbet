"use client";

import { RotateCcw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface BalanceBarProps {
  balance: number;
  onReset: () => void;
}

export default function BalanceBar({ balance, onReset }: BalanceBarProps) {
  return (
    <div
      className="flex items-center justify-between rounded-lg px-3 py-1.5"
      style={{ backgroundColor: "#111827", border: "1px solid #374151" }}
    >
      <div className="flex items-center gap-2">
        <span
          className="font-body text-[10px] uppercase tracking-wider"
          style={{ color: "#6B7280" }}
        >
          Balance
        </span>
        <span
          className="font-mono-stats text-sm font-bold"
          style={{ color: "#F9FAFB" }}
        >
          {formatCurrency(balance)}
        </span>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-body font-semibold transition-colors hover:bg-white/10"
        style={{
          backgroundColor: "rgba(107, 114, 128, 0.15)",
          color: "#9CA3AF",
          border: "1px solid #374151",
        }}
        aria-label="Reset balance to $1,000"
        title="Reset to $1,000"
      >
        <RotateCcw size={12} />
        Reset
      </button>
    </div>
  );
}
