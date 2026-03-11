"use client";

import { CHIP_VALUES } from "@/lib/roulette/rouletteEngine";
import { formatCurrency } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Chip colors — each denomination has a distinct color
// ---------------------------------------------------------------------------

const CHIP_STYLES: Record<number, { bg: string; border: string; text: string }> = {
  0.10: { bg: "#374151", border: "#6B7280", text: "#F9FAFB" },
  0.50: { bg: "#1E3A5F", border: "#3B82F6", text: "#93C5FD" },
  1:    { bg: "#1A3A2A", border: "#22C55E", text: "#86EFAC" },
  5:    { bg: "#3B1F1F", border: "#EF4444", text: "#FCA5A5" },
  10:   { bg: "#2D1B4E", border: "#A855F7", text: "#D8B4FE" },
  25:   { bg: "#3B2A1A", border: "#F97316", text: "#FED7AA" },
  50:   { bg: "#1A2D3B", border: "#00B4D8", text: "#7DD3FC" },
  100:  { bg: "#1A2D1A", border: "#00E5A0", text: "#00E5A0" },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface RouletteChipSelectorProps {
  selectedValue: number;
  onSelect: (value: number) => void;
}

// ---------------------------------------------------------------------------
// Chip button
// ---------------------------------------------------------------------------

function ChipButton({
  value,
  isSelected,
  onSelect,
}: {
  value: number;
  isSelected: boolean;
  onSelect: (value: number) => void;
}) {
  const styles = CHIP_STYLES[value] ?? CHIP_STYLES[1];
  const label = value < 1 ? formatCurrency(value) : `$${value >= 1000 ? `${value / 1000}k` : value}`;

  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className="relative shrink-0 rounded-full flex items-center justify-center font-mono-stats font-bold transition-all duration-150"
      style={{
        width: "44px",
        height: "44px",
        backgroundColor: styles.bg,
        border: `2px solid ${isSelected ? styles.border : "rgba(255,255,255,0.1)"}`,
        color: styles.text,
        fontSize: value >= 100 ? "11px" : value >= 10 ? "12px" : "10px",
        boxShadow: isSelected
          ? `0 0 12px ${styles.border}66, inset 0 0 8px rgba(0,0,0,0.4)`
          : "inset 0 0 8px rgba(0,0,0,0.4)",
        transform: isSelected ? "scale(1.15)" : "scale(1)",
        outline: isSelected ? `2px solid ${styles.border}` : "none",
        outlineOffset: "2px",
      }}
      aria-label={`Select ${formatCurrency(value)} chip`}
      aria-pressed={isSelected}
      title={formatCurrency(value)}
    >
      {/* Chip crosshatch lines */}
      <span
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 4px,
            rgba(255,255,255,0.03) 4px,
            rgba(255,255,255,0.03) 5px
          )`,
        }}
      />
      {/* Chip border detail */}
      <span
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: "4px",
          border: `1px dashed ${styles.border}44`,
        }}
      />
      <span className="relative z-10 leading-none">{label}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function RouletteChipSelector({
  selectedValue,
  onSelect,
}: RouletteChipSelectorProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-body uppercase tracking-wider text-pb-text-muted">
        Chip Value
      </p>
      <div
        className="flex gap-2 overflow-x-auto pb-1 no-scrollbar"
        role="radiogroup"
        aria-label="Select chip denomination"
      >
        {CHIP_VALUES.map((value) => (
          <ChipButton
            key={value}
            value={value}
            isSelected={selectedValue === value}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
