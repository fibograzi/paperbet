import type { SimulationConfig, SessionResult } from "./strategyTypes";
import type { SimulationOutput, SimulationSummary, HistogramBucket } from "./simulationTypes";
import { getStrategy } from "./strategyEngine";
import { getBetProbability } from "./rouletteBets";

// ---------------------------------------------------------------------------
// Core: run a single session
// ---------------------------------------------------------------------------

export function runSession(config: SimulationConfig): SessionResult {
  const strategy = getStrategy(config.strategyId, config.customConfig);
  const prob = getBetProbability(config.betType, config.wheelType);
  const { stopConditions, baseBet, startingBankroll } = config;
  const payout = getPayout(config.betType);

  let bankroll = startingBankroll;
  let peakBankroll = startingBankroll;
  let minBankroll = startingBankroll;
  let totalWagered = 0;
  let maxBetSeen = 0;
  let longestWinStreak = 0;
  let longestLossStreak = 0;
  let currentWinStreak = 0;
  let currentLossStreak = 0;

  let state = strategy.init(baseBet);
  const bankrollHistory: number[] = [bankroll];

  let hitProfitTarget = false;
  let hitLossLimit = false;
  let hitTableLimit = false;
  let spin = 0;

  while (spin < stopConditions.maxSpins) {
    const betSize = strategy.getNextBet(state, baseBet);
    const clampedBet = Math.round(Math.min(betSize, bankroll) * 100) / 100;

    // Check table limit
    if (stopConditions.maxBetLimit !== null && clampedBet > stopConditions.maxBetLimit) {
      hitTableLimit = true;
      break;
    }

    // Check bankrupt
    if (clampedBet <= 0 || bankroll < baseBet) {
      break;
    }

    // Spin the wheel (simplified — just check probability)
    const won = cryptoRandom() < prob;

    bankroll -= clampedBet;
    totalWagered += clampedBet;

    if (won) {
      bankroll += clampedBet * (payout + 1); // Return bet + payout
      currentWinStreak++;
      currentLossStreak = 0;
      if (currentWinStreak > longestWinStreak) longestWinStreak = currentWinStreak;
    } else {
      currentLossStreak++;
      currentWinStreak = 0;
      if (currentLossStreak > longestLossStreak) longestLossStreak = currentLossStreak;
    }

    bankroll = Math.round(bankroll * 100) / 100;
    if (clampedBet > maxBetSeen) maxBetSeen = clampedBet;
    if (bankroll > peakBankroll) peakBankroll = bankroll;
    if (bankroll < minBankroll) minBankroll = bankroll;

    state = strategy.applyOutcome(state, won, baseBet);
    bankrollHistory.push(bankroll);
    spin++;

    // Check stop conditions
    const netProfit = bankroll - startingBankroll;

    if (stopConditions.stopOnBankrupt && bankroll < baseBet) break;
    if (stopConditions.stopOnProfit !== null && netProfit >= stopConditions.stopOnProfit) {
      hitProfitTarget = true;
      break;
    }
    if (stopConditions.stopOnLoss !== null && netProfit <= -stopConditions.stopOnLoss) {
      hitLossLimit = true;
      break;
    }
  }

  return {
    finalBankroll: bankroll,
    peakBankroll,
    minBankroll,
    totalSpins: spin,
    totalWagered,
    netProfit: bankroll - startingBankroll,
    wentBankrupt: bankroll < baseBet,
    hitProfitTarget,
    hitLossLimit,
    hitTableLimit,
    bankrollHistory,
    maxBet: maxBetSeen,
    longestWinStreak,
    longestLossStreak,
  };
}

// ---------------------------------------------------------------------------
// Run full Monte Carlo simulation
// ---------------------------------------------------------------------------

export function runSimulation(
  config: SimulationConfig,
  onProgress?: (pct: number, completed: number) => void,
): SimulationOutput {
  const startTime = Date.now();
  const sessions: SessionResult[] = [];
  const progressInterval = Math.max(1, Math.floor(config.numberOfSessions / 100));

  for (let i = 0; i < config.numberOfSessions; i++) {
    sessions.push(runSession(config));

    if (onProgress && (i + 1) % progressInterval === 0) {
      onProgress(((i + 1) / config.numberOfSessions) * 100, i + 1);
    }
  }

  const summary = computeSummary(sessions);
  const histogram = buildHistogram(sessions);
  const samplePathIndices = selectSamplePaths(sessions, 20);

  return {
    config,
    sessions,
    summary,
    histogram,
    samplePathIndices,
    durationMs: Date.now() - startTime,
  };
}

// ---------------------------------------------------------------------------
// Summary statistics
// ---------------------------------------------------------------------------

function computeSummary(sessions: SessionResult[]): SimulationSummary {
  const n = sessions.length;
  const profits = sessions.map((s) => s.netProfit).sort((a, b) => a - b);
  const bankrolls = sessions.map((s) => s.finalBankroll).sort((a, b) => a - b);

  return {
    totalSessions: n,
    avgFinalBankroll: avg(sessions.map((s) => s.finalBankroll)),
    medianFinalBankroll: median(bankrolls),
    avgNetProfit: avg(profits),
    medianNetProfit: median(profits),
    avgSpins: avg(sessions.map((s) => s.totalSpins)),
    bankruptcyRate: (sessions.filter((s) => s.wentBankrupt).length / n) * 100,
    profitRate: (sessions.filter((s) => s.netProfit > 0).length / n) * 100,
    avgPeakBankroll: avg(sessions.map((s) => s.peakBankroll)),
    avgMinBankroll: avg(sessions.map((s) => s.minBankroll)),
    maxBetSeen: Math.max(...sessions.map((s) => s.maxBet)),
    avgMaxBet: avg(sessions.map((s) => s.maxBet)),
    avgLongestWinStreak: avg(sessions.map((s) => s.longestWinStreak)),
    avgLongestLossStreak: avg(sessions.map((s) => s.longestLossStreak)),
    percentile5: percentile(profits, 5),
    percentile25: percentile(profits, 25),
    percentile75: percentile(profits, 75),
    percentile95: percentile(profits, 95),
  };
}

// ---------------------------------------------------------------------------
// Histogram
// ---------------------------------------------------------------------------

function buildHistogram(sessions: SessionResult[]): HistogramBucket[] {
  const profits = sessions.map((s) => s.netProfit);
  const min = Math.min(...profits);
  const max = Math.max(...profits);
  const range = max - min || 1;
  const bucketCount = Math.min(30, Math.max(10, Math.ceil(Math.sqrt(sessions.length))));
  const bucketWidth = range / bucketCount;

  const buckets: HistogramBucket[] = [];
  for (let i = 0; i < bucketCount; i++) {
    const rangeStart = min + i * bucketWidth;
    const rangeEnd = min + (i + 1) * bucketWidth;
    const count = profits.filter((p) => {
      if (i === bucketCount - 1) return p >= rangeStart && p <= rangeEnd;
      return p >= rangeStart && p < rangeEnd;
    }).length;
    buckets.push({
      rangeStart: Math.round(rangeStart * 100) / 100,
      rangeEnd: Math.round(rangeEnd * 100) / 100,
      count,
      percentage: (count / sessions.length) * 100,
    });
  }

  return buckets;
}

// ---------------------------------------------------------------------------
// Sample path selection — pick diverse outcomes for charting
// ---------------------------------------------------------------------------

function selectSamplePaths(sessions: SessionResult[], maxPaths: number): number[] {
  if (sessions.length <= maxPaths) {
    return sessions.map((_, i) => i);
  }

  // Select evenly spaced sessions sorted by final bankroll
  const indexed = sessions.map((s, i) => ({ profit: s.netProfit, index: i }));
  indexed.sort((a, b) => a.profit - b.profit);

  const step = indexed.length / maxPaths;
  const indices: number[] = [];
  for (let i = 0; i < maxPaths; i++) {
    indices.push(indexed[Math.floor(i * step)].index);
  }

  return indices;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cryptoRandom(): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0] / 4294967296; // 0 to 1 (exclusive)
}

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, v) => sum + v, 0) / arr.length;
}

function median(sorted: number[]): number {
  if (sorted.length === 0) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

function getPayout(betType: string): number {
  const payouts: Record<string, number> = {
    straight: 35,
    split: 17,
    street: 11,
    corner: 8,
    sixLine: 5,
    dozen: 2,
    column: 2,
    redBlack: 1,
    evenOdd: 1,
    highLow: 1,
  };
  return payouts[betType] ?? 1;
}
