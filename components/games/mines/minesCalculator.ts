// ---------------------------------------------------------------------------
// Pure math functions for Mines game
// ---------------------------------------------------------------------------

const TOTAL_TILES = 25;
const HOUSE_EDGE = 0.99; // 1% house edge, 99% RTP

// Cache pre-computed multiplier arrays keyed by mine count
const multiplierCache = new Map<number, number[]>();

/**
 * Pre-compute all multipliers for a given mine count.
 * Returns array where index k = multiplier after revealing k gems.
 * Index 0 = 0 (can't cash out at 0 gems — display only).
 */
export function precomputeMultipliers(mineCount: number): number[] {
  const cached = multiplierCache.get(mineCount);
  if (cached) return cached;

  const maxGems = TOTAL_TILES - mineCount;
  const multipliers: number[] = [0]; // k=0: no gems, can't cash out

  let survivalProb = 1.0;
  for (let k = 1; k <= maxGems; k++) {
    survivalProb *= (TOTAL_TILES - mineCount - (k - 1)) / (TOTAL_TILES - (k - 1));
    multipliers.push(Math.floor((HOUSE_EDGE / survivalProb) * 100) / 100);
  }

  multiplierCache.set(mineCount, multipliers);
  return multipliers;
}

/**
 * Get multiplier after revealing k gems with m mines.
 */
export function getMultiplier(gemsRevealed: number, mineCount: number): number {
  const multipliers = precomputeMultipliers(mineCount);
  return multipliers[gemsRevealed] ?? 0;
}

/**
 * Get next multiplier (what you'd get if you reveal one more gem).
 */
export function getNextMultiplier(gemsRevealed: number, mineCount: number): number {
  return getMultiplier(gemsRevealed + 1, mineCount);
}

/**
 * Get danger % for next click (probability of hitting a mine).
 */
export function getDanger(gemsRevealed: number, mineCount: number): number {
  const remaining = TOTAL_TILES - gemsRevealed;
  if (remaining <= 0) return 0;
  return mineCount / remaining;
}

/**
 * Calculate profit for a given bet amount and multiplier.
 */
export function calculateProfit(betAmount: number, multiplier: number): number {
  return betAmount * multiplier - betAmount;
}

/**
 * Generate mine positions using Fisher-Yates shuffle with crypto.getRandomValues.
 */
export function generateMinePositions(mineCount: number): number[] {
  const positions = Array.from({ length: TOTAL_TILES }, (_, i) => i);

  for (let i = positions.length - 1; i > 0; i--) {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    const j = buffer[0] % (i + 1);
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  return positions.slice(0, mineCount);
}

/**
 * Format multiplier for display.
 */
export function formatMinesMultiplier(mult: number): string {
  if (mult <= 0) return "0.00x";
  if (mult >= 1_000_000) return `${(mult / 1_000_000).toFixed(2)}Mx`;
  if (mult >= 10_000) return `${(mult / 1_000).toFixed(1)}Kx`;
  if (mult >= 1_000) return `${mult.toLocaleString("en-US", { maximumFractionDigits: 2 })}x`;
  return `${mult.toFixed(2)}x`;
}

/**
 * Get multiplier color based on value.
 */
export function getMultiplierColor(mult: number): string {
  if (mult >= 100) return "#F59E0B"; // gold
  if (mult >= 20) return "#EF4444"; // red
  if (mult >= 5) return "#F97316"; // orange
  if (mult >= 2) return "#00E5A0"; // green
  return "#F9FAFB"; // white
}

/**
 * Get danger color based on danger percentage.
 */
export function getDangerColor(danger: number): string {
  if (danger >= 0.75) return "#EF4444"; // extreme — pulsing red
  if (danger >= 0.5) return "#EF4444"; // very dangerous — red
  if (danger >= 0.3) return "#F97316"; // dangerous — orange
  if (danger >= 0.15) return "#F59E0B"; // risky — amber
  return "#00E5A0"; // safe — green
}

/**
 * Get danger label text.
 */
export function getDangerLabel(danger: number): string {
  if (danger >= 0.75) return "Extreme";
  if (danger >= 0.5) return "Very Dangerous";
  if (danger >= 0.3) return "Dangerous";
  if (danger >= 0.15) return "Risky";
  return "Safe";
}

/**
 * Get risk label for mine count.
 */
export function getRiskLabel(mineCount: number): { text: string; color: string } {
  if (mineCount <= 2) return { text: "Low Risk", color: "#00E5A0" };
  if (mineCount <= 5) return { text: "Medium Risk", color: "#F59E0B" };
  if (mineCount <= 12) return { text: "High Risk", color: "#F97316" };
  return { text: "Extreme Risk", color: "#EF4444" };
}

/**
 * Get mine count badge color.
 */
export function getMineCountBadgeColor(mineCount: number): string {
  if (mineCount <= 2) return "#00E5A0";
  if (mineCount <= 5) return "#F59E0B";
  if (mineCount <= 12) return "#F97316";
  return "#EF4444";
}

/**
 * Max gems that can be revealed for a given mine count.
 */
export function maxGems(mineCount: number): number {
  return TOTAL_TILES - mineCount;
}
