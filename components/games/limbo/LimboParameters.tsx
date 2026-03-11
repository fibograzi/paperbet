"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { LimboAction } from "./limboTypes";
import { getWinChanceColor } from "./limboEngine";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface LimboParametersProps {
  targetMultiplier: number;
  winChance: number;
  disabled: boolean;
  dispatch: React.Dispatch<LimboAction>;
}

// ---------------------------------------------------------------------------
// Editable field
// ---------------------------------------------------------------------------

function ParameterField({
  label,
  value,
  suffix,
  color,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  suffix?: string;
  color?: string;
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
    if (disabled) return;
    setEditing(true);
    let raw = value;
    if (suffix) raw = raw.replace(suffix, "");
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
        <input
          suppressHydrationWarning
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={editing ? editValue : value}
          onChange={(e) => setEditValue(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="w-full bg-transparent font-mono-stats font-medium outline-none"
          style={{
            fontSize: 16,
            color: color || "#F9FAFB",
            cursor: disabled ? "default" : "text",
          }}
          aria-label={label}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function LimboParameters({
  targetMultiplier,
  winChance,
  disabled,
  dispatch,
}: LimboParametersProps) {
  const handleTargetChange = useCallback((raw: string) => {
    const num = parseFloat(raw.replace("x", ""));
    if (!isNaN(num)) dispatch({ type: "SET_TARGET", target: num });
  }, [dispatch]);

  const handleWinChanceChange = useCallback((raw: string) => {
    const num = parseFloat(raw.replace("%", ""));
    if (!isNaN(num)) dispatch({ type: "SET_WIN_CHANCE", winChance: num });
  }, [dispatch]);

  const targetStr = `${targetMultiplier.toFixed(2)}x`;
  const winChanceStr = `${winChance.toFixed(winChance < 1 ? 4 : 2)}%`;
  const wcColor = getWinChanceColor(winChance);

  const TARGET_PRESETS = [1.5, 2, 10, 100];

  return (
    <div className="space-y-3">
      {/* 2-column grid: Target Multiplier | Win Chance */}
      <div className="grid grid-cols-2 gap-2 items-end">
        <ParameterField
          label="Target Multiplier"
          value={targetStr}
          suffix="x"
          disabled={disabled}
          onChange={handleTargetChange}
        />

        {/* Linked indicator */}
        <div className="hidden" />

        <ParameterField
          label="Win Chance"
          value={winChanceStr}
          suffix="%"
          color={wcColor}
          disabled={disabled}
          onChange={handleWinChanceChange}
        />
      </div>

      {/* Linked fields indicator between the two columns */}
      <div className="flex items-center justify-center gap-1.5 -mt-2 -mb-1">
        <div className="h-px flex-1" style={{ backgroundColor: "#374151" }} />
        <span className="font-mono-stats text-xs px-1.5" style={{ color: "#6B7280" }}>&harr;</span>
        <div className="h-px flex-1" style={{ backgroundColor: "#374151" }} />
      </div>

      {/* Preset row */}
      <div className="grid grid-cols-4 gap-2">
        {TARGET_PRESETS.map((t) => (
          <button
            key={t}
            type="button"
            disabled={disabled}
            onClick={() => dispatch({ type: "SET_TARGET", target: t })}
            className="py-1.5 rounded-md font-body text-xs font-semibold transition-colors"
            style={{
              backgroundColor: targetMultiplier === t ? "rgba(0,229,160,0.15)" : "#1F2937",
              border: targetMultiplier === t ? "1px solid rgba(0,229,160,0.3)" : "1px solid #374151",
              color: targetMultiplier === t ? "#00E5A0" : "#9CA3AF",
              opacity: disabled ? 0.5 : 1,
            }}
          >
            {t}x
          </button>
        ))}
      </div>
    </div>
  );
}
