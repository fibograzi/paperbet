import type { PlinkoRows, RiskLevel } from "@/lib/types";
import type { PlinkoBallPath, PegPosition } from "./plinkoTypes";
import { getMultiplierForSlot } from "./plinkoMultipliers";

/**
 * Generate a ball path using crypto-random bits.
 * Each bit determines left (0) or right (1) at each peg row.
 * The sum of bits determines the landing slot (binomial distribution).
 */
export function generateBallPath(
  rows: PlinkoRows,
  risk: RiskLevel
): PlinkoBallPath {
  const directions = generateRandomDirections(rows);
  const slotIndex = directions.reduce((sum, dir) => sum + dir, 0);
  const multiplier = getMultiplierForSlot(rows, risk, slotIndex);

  return { directions, slotIndex, multiplier };
}

/**
 * Generate N random bits using crypto.getRandomValues for fair randomness.
 */
function generateRandomDirections(count: number): number[] {
  const bytes = new Uint8Array(count);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => (byte & 1) as number);
}

/**
 * Calculate peg positions for the pyramid layout.
 * Row i has (i + 3) pegs (row 0 has 3 pegs, row 1 has 4, etc.)
 * Positions are normalized 0–1 in both axes.
 */
export function getPegPositions(
  rows: PlinkoRows,
  boardWidth: number,
  boardHeight: number,
  slotHeight: number
): PegPosition[] {
  const pegs: PegPosition[] = [];
  const usableHeight = boardHeight - slotHeight;
  const topPadding = usableHeight * 0.06;
  const bottomPadding = usableHeight * 0.04;
  const availableHeight = usableHeight - topPadding - bottomPadding;
  const rowSpacing = availableHeight / rows;

  // The widest row (last row) determines horizontal spacing
  const maxPegsInRow = rows + 2;
  const horizontalPadding = boardWidth * 0.06;
  const availableWidth = boardWidth - horizontalPadding * 2;

  for (let row = 0; row < rows; row++) {
    const pegsInRow = row + 3;
    const y = topPadding + rowSpacing * (row + 0.5);

    // Center each row, spacing matches the widest row
    const pegSpacing = availableWidth / (maxPegsInRow - 1);
    const rowWidth = pegSpacing * (pegsInRow - 1);
    const startX = (boardWidth - rowWidth) / 2;

    for (let col = 0; col < pegsInRow; col++) {
      pegs.push({
        x: startX + col * pegSpacing,
        y,
        row,
        col,
      });
    }
  }

  return pegs;
}

/**
 * Get slot positions (x-coordinates of slot centers) at the bottom of the board.
 */
export function getSlotPositions(
  rows: PlinkoRows,
  boardWidth: number
): number[] {
  const slotCount = rows + 1;
  const horizontalPadding = boardWidth * 0.06;
  const availableWidth = boardWidth - horizontalPadding * 2;
  const maxPegsInRow = rows + 2;
  const pegSpacing = availableWidth / (maxPegsInRow - 1);

  // Slots sit between the pegs of the last row
  // Last row has (rows+2) pegs, so (rows+1) gaps = (rows+1) slots
  const lastRowPegs = rows + 2;
  const lastRowWidth = pegSpacing * (lastRowPegs - 1);
  const lastRowStartX = (boardWidth - lastRowWidth) / 2;

  const positions: number[] = [];
  for (let i = 0; i < slotCount; i++) {
    // Slot center is between peg i and peg i+1 of last row
    positions.push(lastRowStartX + pegSpacing * i + pegSpacing / 2);
  }

  return positions;
}

/**
 * Get the ball position at a specific row based on the path taken so far.
 * Returns the x-coordinate of the ball after bouncing through `row` peg rows.
 */
export function getBallXAtRow(
  directions: number[],
  row: number,
  rows: PlinkoRows,
  boardWidth: number
): number {
  const horizontalPadding = boardWidth * 0.06;
  const availableWidth = boardWidth - horizontalPadding * 2;
  const maxPegsInRow = rows + 2;
  const pegSpacing = availableWidth / (maxPegsInRow - 1);

  // Ball starts at center of row 0's peg range
  // After each direction, ball shifts left or right by half a peg spacing
  const rightBounces = directions.slice(0, row).reduce((sum, d) => sum + d, 0);
  const leftBounces = row - rightBounces;

  // Starting position: between the pegs, centered
  // Row 0 has 3 pegs, ball enters between peg 1 and peg 1 (center)
  // The ball position corresponds to peg positions of the NEXT row
  const nextRowPegs = row + 3;
  const nextRowWidth = pegSpacing * (nextRowPegs - 1);
  const nextRowStartX = (boardWidth - nextRowWidth) / 2;

  // Ball lands between pegs based on cumulative direction
  // If row directions give us slotIndex = rightBounces at this point,
  // the ball is at position rightBounces in the next row's peg gaps
  // Actually, the ball hits peg at index (1 + rightBounces) in the current row
  // and bounces to a position between pegs in the gap

  // Simpler: ball x = center of the gap it's heading to
  // After `row` bounces with `rightBounces` rights, ball is at horizontal position:
  const currentRowPegs = row + 3;
  const currentRowWidth = pegSpacing * (currentRowPegs - 1);
  const currentRowStartX = (boardWidth - currentRowWidth) / 2;

  // The ball position aligns with a specific peg in the current row
  // Ball enters at the center (peg index 1 for row 0 which has 3 pegs)
  // Each right bounce shifts +1 peg position, each left keeps same
  // After row bounces, ball is at peg index (1 + rightBounces) in row (row)
  // which has (row + 3) pegs, so peg index ranges from 1 to row+1
  const pegIndex = 1 + rightBounces;

  return currentRowStartX + pegIndex * pegSpacing;
}

/**
 * Get the ball's landing x-coordinate in the slot.
 */
export function getBallSlotX(
  slotIndex: number,
  rows: PlinkoRows,
  boardWidth: number
): number {
  const positions = getSlotPositions(rows, boardWidth);
  return positions[slotIndex];
}

/**
 * Calculate profit from a bet result.
 */
export function calculateProfit(betAmount: number, multiplier: number): number {
  return betAmount * multiplier - betAmount;
}
