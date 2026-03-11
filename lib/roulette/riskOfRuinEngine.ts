import type { WheelType, BetType } from "./rouletteTypes";
import { getBetProbability } from "./rouletteBets";
import { BET_REGISTRY } from "./rouletteBets";

// ---------------------------------------------------------------------------
// Risk of Ruin calculation (analytical formula for even-money bets)
// ---------------------------------------------------------------------------

/**
 * Classic Risk of Ruin formula for even-money bets:
 * R = ((1 - p) / p) ^ n
 * where p = probability of winning, n = bankroll in units
 *
 * For non-even-money bets, we use an approximation based on
 * the gambler's ruin problem with weighted wins/losses.
 */
export function calculateRiskOfRuin(
  wheelType: WheelType,
  betType: BetType,
  bankrollUnits: number,
  targetProfitUnits: number | null = null,
): number {
  const p = getBetProbability(betType, wheelType);
  const q = 1 - p;
  const payout = BET_REGISTRY[betType].payout;

  // For even-money bets (payout = 1:1), use classic formula
  if (payout === 1) {
    if (Math.abs(p - q) < 1e-10) {
      // Fair game — ruin is bankroll/(bankroll + target) or 1 if no target
      if (targetProfitUnits === null) return 1;
      return bankrollUnits / (bankrollUnits + targetProfitUnits);
    }

    const ratio = q / p;

    if (targetProfitUnits === null) {
      // Infinite play — ruin probability
      if (ratio >= 1) return 1; // House edge means certain ruin eventually
      return Math.pow(ratio, bankrollUnits);
    }

    // Finite target — gambler's ruin formula
    const ratioN = Math.pow(ratio, bankrollUnits);
    const ratioNT = Math.pow(ratio, bankrollUnits + targetProfitUnits);
    return (ratioNT - ratioN) / (ratioNT - 1);
  }

  // For non-even-money bets, use Monte Carlo approximation
  return monteCarloRuin(wheelType, betType, bankrollUnits, targetProfitUnits, 10000);
}

// ---------------------------------------------------------------------------
// Monte Carlo ruin estimation (for non-even-money bets)
// ---------------------------------------------------------------------------

function monteCarloRuin(
  wheelType: WheelType,
  betType: BetType,
  bankrollUnits: number,
  targetProfitUnits: number | null,
  simulations: number,
): number {
  const p = getBetProbability(betType, wheelType);
  const payout = BET_REGISTRY[betType].payout;
  const maxSpins = 10000; // Cap per session

  let ruinCount = 0;

  for (let i = 0; i < simulations; i++) {
    let bankroll = bankrollUnits;
    let spins = 0;

    while (bankroll > 0 && spins < maxSpins) {
      if (targetProfitUnits !== null && bankroll >= bankrollUnits + targetProfitUnits) {
        break; // Hit target — not ruined
      }

      const won = cryptoRandom() < p;
      if (won) {
        bankroll += payout; // Win payout units
      } else {
        bankroll -= 1; // Lose 1 unit
      }
      spins++;
    }

    if (bankroll <= 0) ruinCount++;
  }

  return ruinCount / simulations;
}

// ---------------------------------------------------------------------------
// Sensitivity analysis — ruin probability for various bankroll sizes
// ---------------------------------------------------------------------------

export interface SensitivityRow {
  bankrollUnits: number;
  ruinProbability: number;
  survivalProbability: number;
}

export function sensitivityAnalysis(
  wheelType: WheelType,
  betType: BetType,
  bankrollRange: number[], // e.g. [10, 25, 50, 100, 200, 500]
  targetProfitUnits: number | null = null,
): SensitivityRow[] {
  return bankrollRange.map((units) => {
    const ruin = calculateRiskOfRuin(wheelType, betType, units, targetProfitUnits);
    return {
      bankrollUnits: units,
      ruinProbability: ruin,
      survivalProbability: 1 - ruin,
    };
  });
}

// ---------------------------------------------------------------------------
// Martingale-specific ruin analysis
// ---------------------------------------------------------------------------

export interface MartingaleRuinRow {
  consecutiveLosses: number;
  betSize: number;
  cumulativeLoss: number;
  probability: number;
}

export function martingaleRuinTable(
  wheelType: WheelType,
  baseBet: number,
  maxRows: number = 15,
): MartingaleRuinRow[] {
  const p = getBetProbability("redBlack", wheelType); // Even-money
  const q = 1 - p;

  const rows: MartingaleRuinRow[] = [];
  for (let n = 1; n <= maxRows; n++) {
    rows.push({
      consecutiveLosses: n,
      betSize: baseBet * Math.pow(2, n - 1),
      cumulativeLoss: baseBet * (Math.pow(2, n) - 1),
      probability: Math.pow(q, n),
    });
  }

  return rows;
}

// ---------------------------------------------------------------------------
// Sample bankroll paths (for charting)
// ---------------------------------------------------------------------------

export interface SamplePath {
  bankrollHistory: number[];
  finalBankroll: number;
  wentBankrupt: boolean;
}

export function generateSamplePaths(
  wheelType: WheelType,
  betType: BetType,
  bankrollUnits: number,
  targetProfitUnits: number | null,
  maxSpins: number,
  numberOfPaths: number,
): SamplePath[] {
  const p = getBetProbability(betType, wheelType);
  const payout = BET_REGISTRY[betType].payout;
  const paths: SamplePath[] = [];

  for (let i = 0; i < numberOfPaths; i++) {
    let bankroll = bankrollUnits;
    const history: number[] = [bankroll];
    let wentBankrupt = false;

    for (let spin = 0; spin < maxSpins; spin++) {
      if (bankroll <= 0) {
        wentBankrupt = true;
        break;
      }
      if (targetProfitUnits !== null && bankroll >= bankrollUnits + targetProfitUnits) {
        break;
      }

      const won = cryptoRandom() < p;
      if (won) {
        bankroll += payout;
      } else {
        bankroll -= 1;
      }
      history.push(bankroll);
    }

    paths.push({
      bankrollHistory: history,
      finalBankroll: bankroll,
      wentBankrupt,
    });
  }

  return paths;
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function cryptoRandom(): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0] / 4294967296;
}
