"use client";

import { useState } from "react";
import type { BetType, PlacedBet, WheelType } from "@/lib/roulette/rouletteTypes";
import {
  getPocketColor,
} from "@/lib/roulette/rouletteEngine";
import {
  getRedNumbers,
  getBlackNumbers,
  getEvenNumbers,
  getOddNumbers,
  getLowNumbers,
  getHighNumbers,
  getDozenNumbers,
  getColumnNumbers,
  getStreetNumbers,
} from "@/lib/roulette/rouletteBets";
import { formatCurrency } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface RouletteBettingTableProps {
  onPlaceBet: (betType: BetType, numbers: number[], label: string) => void;
  currentBets: PlacedBet[];
  chipValue: number;
  wheelType: WheelType;
  disabled: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getBetTotal(
  currentBets: PlacedBet[],
  numbers: number[],
  betType: BetType,
): number {
  const sameNums = (a: number[], b: number[]) =>
    a.length === b.length && [...a].sort().join(",") === [...b].sort().join(",");

  return currentBets
    .filter((b) => b.type === betType && sameNums(b.numbers, numbers))
    .reduce((s, b) => s + b.amount, 0);
}

function NumberCell({
  num,
  onPlaceBet,
  currentBets,
  disabled,
}: {
  num: number;
  onPlaceBet: (betType: BetType, numbers: number[], label: string) => void;
  currentBets: PlacedBet[];
  disabled: boolean;
}) {
  const color = getPocketColor(num);
  const numbers = [num];
  const betTotal = getBetTotal(currentBets, numbers, "straight");
  const hasBet = betTotal > 0;

  const bgColor =
    color === "red" ? "#DC2626" : color === "black" ? "#1C1C1E" : "#059669";
  const hoverColor =
    color === "red" ? "#FF4444" : color === "black" ? "#3A3A3C" : "#00E5A0";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onPlaceBet("straight", numbers, `${num} Straight`)}
      className="relative rounded text-xs font-mono-stats font-bold text-white transition-all duration-150 flex items-center justify-center h-full w-full"
      style={{
        backgroundColor: bgColor,
        border: hasBet ? "2px solid #00E5A0" : "1px solid rgba(255,255,255,0.1)",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      onMouseEnter={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.backgroundColor = hoverColor;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = bgColor;
      }}
      aria-label={`Bet on number ${num}`}
    >
      {num}
      {hasBet && (
        <span
          className="absolute -top-1.5 -right-1.5 rounded-full font-mono-stats text-[9px] font-bold flex items-center justify-center z-10 shadow"
          style={{
            backgroundColor: "#00E5A0",
            color: "#0B0F1A",
            minWidth: "14px",
            height: "14px",
            padding: "0 2px",
          }}
          title={formatCurrency(betTotal)}
        >
          {betTotal >= 100 ? "99+" : formatCurrency(betTotal).replace("$", "")}
        </span>
      )}
    </button>
  );
}

function OutsideBetCell({
  label,
  betType,
  numbers,
  onPlaceBet,
  currentBets,
  disabled,
  className = "",
  style = {},
}: {
  label: string;
  betType: BetType;
  numbers: number[];
  onPlaceBet: (betType: BetType, numbers: number[], label: string) => void;
  currentBets: PlacedBet[];
  disabled: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const betTotal = getBetTotal(currentBets, numbers, betType);
  const hasBet = betTotal > 0;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onPlaceBet(betType, numbers, label)}
      className={`relative rounded text-xs font-body font-semibold text-pb-text-primary transition-all duration-150 flex items-center justify-center h-full w-full ${className}`}
      style={{
        backgroundColor: hasBet ? "rgba(0,229,160,0.15)" : "rgba(31,41,55,0.8)",
        border: hasBet ? "1px solid #00E5A0" : "1px solid #374151",
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(0,229,160,0.2)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#00E5A0";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = hasBet
          ? "rgba(0,229,160,0.15)"
          : "rgba(31,41,55,0.8)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = hasBet ? "#00E5A0" : "#374151";
      }}
      aria-label={`Bet on ${label}`}
    >
      {label}
      {hasBet && (
        <span
          className="absolute -top-1.5 -right-1.5 rounded-full font-mono-stats text-[9px] font-bold flex items-center justify-center z-10 shadow"
          style={{
            backgroundColor: "#00E5A0",
            color: "#0B0F1A",
            minWidth: "14px",
            height: "14px",
            padding: "0 2px",
          }}
        >
          {formatCurrency(betTotal).replace("$", "")}
        </span>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Mobile simplified picker
// ---------------------------------------------------------------------------

type BetCategory = "straight" | "dozens" | "columns" | "even-money";

function MobileBettingTable({
  onPlaceBet,
  currentBets,
  wheelType,
  disabled,
}: RouletteBettingTableProps) {
  const [category, setCategory] = useState<BetCategory>("even-money");

  const redNums = getRedNumbers();
  const blackNums = getBlackNumbers();
  const evenNums = getEvenNumbers();
  const oddNums = getOddNumbers();
  const lowNums = getLowNumbers();
  const highNums = getHighNumbers();

  const categories: { id: BetCategory; label: string }[] = [
    { id: "even-money", label: "Even Money" },
    { id: "dozens", label: "Dozens" },
    { id: "columns", label: "Columns" },
    { id: "straight", label: "Numbers" },
  ];

  return (
    <div className="space-y-3">
      {/* Category tabs */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategory(cat.id)}
            className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-body font-semibold transition-colors"
            style={{
              backgroundColor: category === cat.id ? "#00E5A0" : "#1F2937",
              color: category === cat.id ? "#0B0F1A" : "#9CA3AF",
              border: "1px solid #374151",
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Even money bets */}
      {category === "even-money" && (
        <div className="grid grid-cols-2 gap-2" style={{ height: "100px" }}>
          {[
            { label: "Red", type: "redBlack" as BetType, nums: redNums, color: "#DC2626" },
            { label: "Black", type: "redBlack" as BetType, nums: blackNums, color: "#1C1C1E" },
            { label: "Even", type: "evenOdd" as BetType, nums: evenNums, color: undefined },
            { label: "Odd", type: "evenOdd" as BetType, nums: oddNums, color: undefined },
            { label: "1–18", type: "highLow" as BetType, nums: lowNums, color: undefined },
            { label: "19–36", type: "highLow" as BetType, nums: highNums, color: undefined },
          ].map((bet) => (
            <OutsideBetCell
              key={`${bet.type}-${bet.label}`}
              label={bet.label}
              betType={bet.type}
              numbers={bet.nums}
              onPlaceBet={onPlaceBet}
              currentBets={currentBets}
              disabled={disabled}
              style={
                bet.color
                  ? {
                      backgroundColor: getBetTotal(currentBets, bet.nums, bet.type) > 0
                        ? "rgba(0,229,160,0.15)"
                        : bet.color,
                      border: getBetTotal(currentBets, bet.nums, bet.type) > 0
                        ? "1px solid #00E5A0"
                        : "1px solid rgba(255,255,255,0.1)",
                    }
                  : {}
              }
            />
          ))}
        </div>
      )}

      {/* Dozens */}
      {category === "dozens" && (
        <div className="grid grid-cols-3 gap-2" style={{ height: "60px" }}>
          {([1, 2, 3] as const).map((d) => (
            <OutsideBetCell
              key={`dozen-${d}`}
              label={`${(d - 1) * 12 + 1}–${d * 12}`}
              betType="dozen"
              numbers={getDozenNumbers(d)}
              onPlaceBet={onPlaceBet}
              currentBets={currentBets}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      {/* Columns */}
      {category === "columns" && (
        <div className="grid grid-cols-3 gap-2" style={{ height: "60px" }}>
          {([1, 2, 3] as const).map((c) => (
            <OutsideBetCell
              key={`col-${c}`}
              label={`Col ${c}`}
              betType="column"
              numbers={getColumnNumbers(c)}
              onPlaceBet={onPlaceBet}
              currentBets={currentBets}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      {/* Numbers grid */}
      {category === "straight" && (
        <div>
          {/* Zero(s) */}
          <div className="flex gap-1 mb-1">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onPlaceBet("straight", [0], "0 Straight")}
              className="rounded text-xs font-mono-stats font-bold text-white flex items-center justify-center"
              style={{
                backgroundColor: "#059669",
                border: "1px solid rgba(255,255,255,0.1)",
                height: "28px",
                minWidth: "40px",
                cursor: disabled ? "not-allowed" : "pointer",
              }}
            >
              0
            </button>
            {wheelType === "american" && (
              <button
                type="button"
                disabled={disabled}
                onClick={() => onPlaceBet("straight", [-1], "00 Straight")}
                className="rounded text-xs font-mono-stats font-bold text-white flex items-center justify-center"
                style={{
                  backgroundColor: "#059669",
                  border: "1px solid rgba(255,255,255,0.1)",
                  height: "28px",
                  minWidth: "40px",
                  cursor: disabled ? "not-allowed" : "pointer",
                }}
              >
                00
              </button>
            )}
          </div>
          {/* 1–36 grid 6 columns */}
          <div className="grid grid-cols-6 gap-1">
            {Array.from({ length: 36 }, (_, i) => i + 1).map((num) => {
              const betTotal = getBetTotal(currentBets, [num], "straight");
              const color = getPocketColor(num);
              const bgColor = color === "red" ? "#DC2626" : "#1C1C1E";
              return (
                <button
                  key={num}
                  type="button"
                  disabled={disabled}
                  onClick={() => onPlaceBet("straight", [num], `${num} Straight`)}
                  className="relative rounded text-[10px] font-mono-stats font-bold text-white flex items-center justify-center"
                  style={{
                    backgroundColor: bgColor,
                    border: betTotal > 0 ? "1px solid #00E5A0" : "1px solid rgba(255,255,255,0.08)",
                    height: "24px",
                    cursor: disabled ? "not-allowed" : "pointer",
                  }}
                  aria-label={`Bet on ${num}`}
                >
                  {num}
                  {betTotal > 0 && (
                    <span
                      className="absolute -top-1 -right-1 rounded-full text-[8px] font-bold flex items-center justify-center"
                      style={{
                        backgroundColor: "#00E5A0",
                        color: "#0B0F1A",
                        width: "12px",
                        height: "12px",
                      }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Desktop full table
// ---------------------------------------------------------------------------

function DesktopBettingTable({
  onPlaceBet,
  currentBets,
  wheelType,
  disabled,
}: RouletteBettingTableProps) {
  const redNums = getRedNumbers();
  const blackNums = getBlackNumbers();
  const evenNums = getEvenNumbers();
  const oddNums = getOddNumbers();
  const lowNums = getLowNumbers();
  const highNums = getHighNumbers();

  // Build rows: each row contains numbers [col1, col2, col3] going 3→2→1
  // Standard table layout: row 1 = 3,2,1; row 2 = 6,5,4; etc.
  const rows: number[][] = [];
  for (let row = 0; row < 12; row++) {
    const base = row * 3;
    rows.push([base + 3, base + 2, base + 1]);
  }

  const cellHeight = 36;
  const cellWidth = 32;

  return (
    <div className="overflow-x-auto">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `48px repeat(12, ${cellWidth}px) auto`,
          gridTemplateRows: `repeat(3, ${cellHeight}px) repeat(3, auto)`,
          gap: "2px",
          minWidth: "520px",
        }}
      >
        {/* Row 0: 0 (and 00) */}
        <div
          style={{
            gridColumn: "1",
            gridRow: "1 / span 3",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          {wheelType === "american" ? (
            <>
              <div style={{ flex: 1 }}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onPlaceBet("straight", [0], "0 Straight")}
                  className="w-full h-full rounded text-xs font-mono-stats font-bold text-white flex items-center justify-center"
                  style={{
                    backgroundColor: "#059669",
                    border: getBetTotal(currentBets, [0], "straight") > 0 ? "2px solid #00E5A0" : "1px solid rgba(255,255,255,0.1)",
                    cursor: disabled ? "not-allowed" : "pointer",
                  }}
                  aria-label="Bet on 0"
                >
                  0
                </button>
              </div>
              <div style={{ flex: 1 }}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onPlaceBet("straight", [-1], "00 Straight")}
                  className="w-full h-full rounded text-xs font-mono-stats font-bold text-white flex items-center justify-center"
                  style={{
                    backgroundColor: "#059669",
                    border: getBetTotal(currentBets, [-1], "straight") > 0 ? "2px solid #00E5A0" : "1px solid rgba(255,255,255,0.1)",
                    cursor: disabled ? "not-allowed" : "pointer",
                  }}
                  aria-label="Bet on 00"
                >
                  00
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onPlaceBet("straight", [0], "0 Straight")}
              className="w-full h-full rounded text-xs font-mono-stats font-bold text-white flex items-center justify-center"
              style={{
                backgroundColor: "#059669",
                border: getBetTotal(currentBets, [0], "straight") > 0 ? "2px solid #00E5A0" : "1px solid rgba(255,255,255,0.1)",
                cursor: disabled ? "not-allowed" : "pointer",
              }}
              aria-label="Bet on 0"
            >
              0
            </button>
          )}
        </div>

        {/* Main number grid: 12 columns, 12 rows */}
        {rows.map((row, rowIdx) =>
          row.map((num, colIdx) => (
            <div
              key={`num-${num}`}
              style={{
                gridColumn: `${rowIdx + 2}`,
                gridRow: `${colIdx + 1}`,
                height: cellHeight,
              }}
            >
              <NumberCell
                num={num}
                onPlaceBet={onPlaceBet}
                currentBets={currentBets}
                disabled={disabled}
              />
            </div>
          )),
        )}

        {/* Column bets (right side) — row 1 is column 3 (top), row 3 is column 1 (bottom) */}
        {([3, 2, 1] as const).map((col, rowIdx) => (
          <div
            key={`col-bet-${col}`}
            style={{
              gridColumn: "14",
              gridRow: `${rowIdx + 1}`,
              height: cellHeight,
            }}
          >
            <OutsideBetCell
              label={`C${col}`}
              betType="column"
              numbers={getColumnNumbers(col)}
              onPlaceBet={onPlaceBet}
              currentBets={currentBets}
              disabled={disabled}
            />
          </div>
        ))}

        {/* Street bets — below each column of 3 numbers */}
        {rows.map((row, rowIdx) => {
          const streetNums = getStreetNumbers(rowIdx + 1);
          return (
            <div
              key={`street-${rowIdx}`}
              style={{
                gridColumn: `${rowIdx + 2}`,
                gridRow: "4",
                height: cellHeight,
              }}
            >
              <OutsideBetCell
                label={`S${rowIdx + 1}`}
                betType="street"
                numbers={streetNums}
                onPlaceBet={onPlaceBet}
                currentBets={currentBets}
                disabled={disabled}
                className="text-[10px]"
              />
            </div>
          );
        })}

        {/* Dozens row */}
        {([1, 2, 3] as const).map((dozen) => {
          const colStart = (dozen - 1) * 4 + 2;
          const colSpan = 4;
          return (
            <div
              key={`dozen-${dozen}`}
              style={{
                gridColumn: `${colStart} / span ${colSpan}`,
                gridRow: "5",
                height: cellHeight,
              }}
            >
              <OutsideBetCell
                label={`${(dozen - 1) * 12 + 1}–${dozen * 12}`}
                betType="dozen"
                numbers={getDozenNumbers(dozen)}
                onPlaceBet={onPlaceBet}
                currentBets={currentBets}
                disabled={disabled}
              />
            </div>
          );
        })}

        {/* Even-money bets row */}
        {[
          { label: "1–18", type: "highLow" as BetType, nums: lowNums },
          { label: "Even", type: "evenOdd" as BetType, nums: evenNums },
          {
            label: "Red",
            type: "redBlack" as BetType,
            nums: redNums,
            style: { backgroundColor: "#DC2626", border: "1px solid rgba(255,255,255,0.1)" },
          },
          {
            label: "Black",
            type: "redBlack" as BetType,
            nums: blackNums,
            style: { backgroundColor: "#1C1C1E", border: "1px solid rgba(255,255,255,0.2)" },
          },
          { label: "Odd", type: "evenOdd" as BetType, nums: oddNums },
          { label: "19–36", type: "highLow" as BetType, nums: highNums },
        ].map((bet, idx) => (
          <div
            key={`evenbet-${idx}`}
            style={{
              gridColumn: `${idx * 2 + 2} / span 2`,
              gridRow: "6",
              height: cellHeight,
            }}
          >
            <OutsideBetCell
              label={bet.label}
              betType={bet.type}
              numbers={bet.nums}
              onPlaceBet={onPlaceBet}
              currentBets={currentBets}
              disabled={disabled}
              style={(bet as { style?: React.CSSProperties }).style}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export — responsive
// ---------------------------------------------------------------------------

export default function RouletteBettingTable(props: RouletteBettingTableProps) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden sm:block">
        <DesktopBettingTable {...props} />
      </div>

      {/* Mobile */}
      <div className="sm:hidden">
        <MobileBettingTable {...props} />
      </div>
    </>
  );
}
