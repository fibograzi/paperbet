"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ArrowLeftRight } from "lucide-react";
import type { DiceDirection, DiceParameters as DiceParametersType } from "./diceTypes";
import { formatCurrency } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DiceParametersProps {
  params: DiceParametersType;
  betAmount: number;
  disabled: boolean;
  onSyncParam: (field: "target" | "winChance" | "multiplier", value: number) => void;
  onSetDirection: (direction: DiceDirection) => void;
  onSwapDirection: () => void;
}

// ---------------------------------------------------------------------------
// Editable field
// ---------------------------------------------------------------------------

function ParameterField({
  label,
  value,
  suffix,
  prefix,
  readOnly,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  suffix?: string;
  prefix?: string;
  readOnly?: boolean;
  disabled?: boolean;
  onChange?: (raw: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setEditValue(value);
  }, [value, editing]);

  const handleFocus = () => {
    if (readOnly || disabled) return;
    setEditing(true);
    // Strip suffix/prefix for editing
    let raw = value;
    if (suffix) raw = raw.replace(suffix, "");
    if (prefix) raw = raw.replace(prefix, "");
    setEditValue(raw.trim());
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleBlur = () => {
    setEditing(false);
    if (onChange && editValue.trim()) {
      const num = parseFloat(editValue);
      if (!isNaN(num)) {
        onChange(editValue);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === "Escape") {
      setEditing(false);
      setEditValue(value);
    }
  };

  return (
    <div
      className="rounded-lg p-3"
      style={{
        backgroundColor: "#111827",
        border: "1px solid #374151",
      }}
    >
      <label className="font-body text-xs block mb-1" style={{ color: "#6B7280" }}>
        {label}
      </label>
      <div className="relative">
        {prefix && !editing && (
          <span
            className="absolute left-0 top-1/2 -translate-y-1/2 font-mono-stats"
            style={{ fontSize: 16, color: "#6B7280" }}
          >
            {prefix}
          </span>
        )}
        <input suppressHydrationWarning
          ref={inputRef}
          type={editing ? "text" : "text"}
          value={editing ? editValue : (prefix ? value.replace(prefix, "").trim() : value)}
          onChange={(e) => setEditValue(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          disabled={disabled}
          className="w-full bg-transparent font-mono-stats font-medium outline-none"
          style={{
            fontSize: 16,
            color: readOnly ? "#9CA3AF" : "#F9FAFB",
            paddingLeft: prefix && !editing ? (prefix.length > 1 ? 20 : 12) : 0,
            cursor: readOnly ? "default" : "text",
          }}
          aria-label={label}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Direction toggle
// ---------------------------------------------------------------------------

function DirectionToggle({
  direction,
  disabled,
  onSetDirection,
  onSwapDirection,
}: {
  direction: DiceDirection;
  disabled: boolean;
  onSetDirection: (d: DiceDirection) => void;
  onSwapDirection: () => void;
}) {
  return (
    <div
      className="flex items-center rounded-lg p-1 gap-0.5"
      style={{ backgroundColor: "#1F2937" }}
      role="radiogroup"
      aria-label="Roll direction"
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSetDirection("over")}
        className="flex-1 py-2 rounded-md text-center font-body text-sm font-semibold transition-colors"
        style={{
          backgroundColor: direction === "over" ? "rgba(20,184,166,0.15)" : "transparent",
          color: direction === "over" ? "#14B8A6" : "#9CA3AF",
        }}
        role="radio"
        aria-checked={direction === "over"}
      >
        Roll Over
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={onSwapDirection}
        className="p-1.5 rounded-md transition-colors hover:bg-white/5"
        aria-label="Swap direction"
      >
        <ArrowLeftRight size={16} style={{ color: disabled ? "#374151" : "#6B7280" }} />
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onSetDirection("under")}
        className="flex-1 py-2 rounded-md text-center font-body text-sm font-semibold transition-colors"
        style={{
          backgroundColor: direction === "under" ? "rgba(20,184,166,0.15)" : "transparent",
          color: direction === "under" ? "#14B8A6" : "#9CA3AF",
        }}
        role="radio"
        aria-checked={direction === "under"}
      >
        Roll Under
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function DiceParametersPanel({
  params,
  betAmount,
  disabled,
  onSyncParam,
  onSetDirection,
  onSwapDirection,
}: DiceParametersProps) {
  const handleTargetChange = useCallback((raw: string) => {
    const num = parseFloat(raw);
    if (!isNaN(num)) onSyncParam("target", num);
  }, [onSyncParam]);

  const handleWinChanceChange = useCallback((raw: string) => {
    const num = parseFloat(raw.replace("%", ""));
    if (!isNaN(num)) onSyncParam("winChance", num);
  }, [onSyncParam]);

  const handleMultiplierChange = useCallback((raw: string) => {
    const num = parseFloat(raw.replace("x", ""));
    if (!isNaN(num)) onSyncParam("multiplier", num);
  }, [onSyncParam]);

  // Format values
  const targetStr = params.target.toFixed(2);
  const winChanceStr = `${params.winChance.toFixed(2)}%`;
  const multiplierStr = params.multiplier >= 100
    ? `${params.multiplier.toFixed(2)}x`
    : `${params.multiplier.toFixed(4)}x`;
  const profitStr = formatCurrency(params.profitOnWin);

  return (
    <div className="space-y-3">
      {/* Desktop: 4-column row + toggle */}
      <div className="hidden md:grid grid-cols-4 gap-2">
        <ParameterField
          label={params.direction === "over" ? "Roll Over" : "Roll Under"}
          value={targetStr}
          disabled={disabled}
          onChange={handleTargetChange}
        />
        <ParameterField
          label="Win Chance"
          value={winChanceStr}
          suffix="%"
          disabled={disabled}
          onChange={handleWinChanceChange}
        />
        <ParameterField
          label="Multiplier"
          value={multiplierStr}
          suffix="x"
          disabled={disabled}
          onChange={handleMultiplierChange}
        />
        <ParameterField
          label="Profit on Win"
          value={profitStr}
          prefix="$"
          readOnly
          disabled={disabled}
        />
      </div>

      {/* Mobile: 2x2 grid */}
      <div className="md:hidden grid grid-cols-2 gap-2">
        <ParameterField
          label={params.direction === "over" ? "Roll Over" : "Roll Under"}
          value={targetStr}
          disabled={disabled}
          onChange={handleTargetChange}
        />
        <ParameterField
          label="Win Chance"
          value={winChanceStr}
          suffix="%"
          disabled={disabled}
          onChange={handleWinChanceChange}
        />
        <ParameterField
          label="Multiplier"
          value={multiplierStr}
          suffix="x"
          disabled={disabled}
          onChange={handleMultiplierChange}
        />
        <ParameterField
          label="Profit on Win"
          value={profitStr}
          prefix="$"
          readOnly
          disabled={disabled}
        />
      </div>

      {/* Direction toggle */}
      <DirectionToggle
        direction={params.direction}
        disabled={disabled}
        onSetDirection={onSetDirection}
        onSwapDirection={onSwapDirection}
      />
    </div>
  );
}
