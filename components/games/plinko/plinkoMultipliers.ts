import type { RiskLevel, PlinkoRows } from "@/lib/types";

// Multiplier tables from PLINKO_GAME_SPEC.md sections 3.1–3.9
// Each array represents left-half + center of the symmetric board.
// Full slot array is mirrored: [edge, ..., center, ..., edge]

type MultiplierHalf = number[];

const MULTIPLIER_HALVES: Record<PlinkoRows, Record<RiskLevel, MultiplierHalf>> = {
  8: {
    low:    [5.6, 2.1, 1.1, 1.0, 0.5],
    medium: [13, 3, 1.3, 0.7, 0.4],
    high:   [29, 4, 1.5, 0.3, 0.2],
    expert: [50, 4.6, 1.1, 0.1, 0.1],
  },
  9: {
    low:    [5.6, 2, 1.6, 1, 0.7],
    medium: [18, 4, 1.7, 0.9, 0.5],
    high:   [43, 7, 2, 0.6, 0.2],
    expert: [100, 7.8, 1.5, 0.2, 0.1],
  },
  10: {
    low:    [8.9, 3, 1.4, 1.1, 1.0, 0.5],
    medium: [22, 5, 2, 1.4, 0.6, 0.4],
    high:   [76, 10, 3, 0.9, 0.3, 0.2],
    expert: [201, 11, 2, 0.6, 0.1, 0.1],
  },
  11: {
    low:    [8.4, 3, 1.9, 1.3, 1.0, 0.7],
    medium: [24, 6, 3, 1.8, 0.7, 0.5],
    high:   [120, 14, 5.2, 1.4, 0.4, 0.2],
    expert: [324, 16, 4, 1.1, 0.2, 0.1],
  },
  12: {
    low:    [10, 3, 1.6, 1.4, 1.1, 1.0, 0.5],
    medium: [33, 11, 4, 2, 1.1, 0.6, 0.3],
    high:   [170, 24, 8.1, 2, 0.7, 0.2, 0.2],
    expert: [619, 30, 6, 1.5, 0.4, 0.1, 0.1],
  },
  13: {
    low:    [8.1, 4, 3, 1.9, 1.2, 0.9, 0.7],
    medium: [43, 13, 6, 3, 1.3, 0.7, 0.4],
    high:   [260, 37, 11, 4, 1, 0.2, 0.2],
    expert: [1000, 52, 10, 3, 0.6, 0.1, 0.1],
  },
  14: {
    low:    [7.1, 4, 1.9, 1.4, 1.3, 1.1, 1.0, 0.5],
    medium: [58, 15, 7, 4, 1.9, 1.0, 0.5, 0.2],
    high:   [420, 56, 18, 5, 1.9, 0.3, 0.2, 0.2],
    expert: [2300, 80, 16, 3, 1.2, 0.2, 0.1, 0.1],
  },
  15: {
    low:    [15, 8, 3, 2, 1.5, 1.1, 1, 0.7],
    medium: [88, 18, 11, 5, 3, 1.3, 0.5, 0.3],
    high:   [620, 83, 27, 8, 3, 0.5, 0.2, 0.2],
    expert: [5000, 125, 23, 6, 1.8, 0.2, 0.1, 0.1],
  },
  16: {
    low:    [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1.0, 0.5],
    medium: [110, 41, 10, 5, 3, 1.5, 1.0, 0.5, 0.3],
    high:   [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2],
    expert: [10000, 216, 26, 7, 2.5, 1.1, 0.1, 0.1, 0.1],
  },
};

/**
 * Get the full multiplier array for a given row count and risk level.
 * Returns N+1 values (e.g., 8 rows = 9 slots), symmetric from edge to edge.
 */
export function getMultipliers(rows: PlinkoRows, risk: RiskLevel): number[] {
  const half = MULTIPLIER_HALVES[rows][risk];
  const slotCount = rows + 1;
  const hasCenter = slotCount % 2 === 1;

  if (hasCenter) {
    // Odd slot count: mirror without duplicating center
    const center = half[half.length - 1];
    const left = half.slice(0, -1);
    return [...left, center, ...left.slice().reverse()];
  } else {
    // Even slot count: mirror the full half
    return [...half, ...half.slice().reverse()];
  }
}

/**
 * Get the multiplier for a specific slot index.
 */
export function getMultiplierForSlot(
  rows: PlinkoRows,
  risk: RiskLevel,
  slotIndex: number
): number {
  const multipliers = getMultipliers(rows, risk);
  return multipliers[Math.min(slotIndex, multipliers.length - 1)];
}
