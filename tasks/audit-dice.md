# Dice Game Math Audit Report

**Auditor:** Claude Opus 4.6 (Senior Game Math Auditor)
**Date:** 2026-03-09
**Scope:** All calculation logic in the PaperBet.io Dice game vs. Stake.com reference implementation
**Reference:** `DICE_GAME_SPEC.md`, web research on Stake.com Dice formulas

---

## Executive Summary

The Dice game implementation is **mathematically correct** on all critical paths. The multiplier formula, win chance calculation, win/loss determination, payout logic, and house edge are all properly implemented and match Stake.com's model. There is **one minor bias issue** in the random number generator (modulo bias) which is negligible in practice, and **one spec-vs-code discrepancy** in the `calculateTarget` function for "Roll Over" that is technically correct but uses a different derivation path than expected. Overall verdict: **PASS with minor notes**.

---

## A. Multiplier Formula

**Expected:** `multiplier = 99 / winChance` (where winChance is a percentage, e.g., 49.99)

**Implementation** (`diceEngine.ts`, line 52-56):
```ts
export function calculateMultiplier(winChance: number): number {
  const clamped = clampWinChance(winChance);
  const raw = (RTP * 100) / clamped;  // (0.99 * 100) / winChance = 99 / winChance
  return Math.round(raw * 10000) / 10000; // 4 decimal places
}
```

**Analysis:** `RTP * 100 = 0.99 * 100 = 99`. So `raw = 99 / clamped`. This is correct.

### Spot-check verification:

| Target | Direction | Win Chance | Expected Multiplier | Code Result | Status |
|--------|-----------|-----------|---------------------|-------------|--------|
| 50.00 | Roll Over | 49.99% | 99/49.99 = 1.98040 | 1.9804 | PASS |
| 50.00 | Roll Under | 50.00% | 99/50.00 = 1.98000 | 1.9800 | PASS |
| 95.00 | Roll Over | 4.99% | 99/4.99 = 19.83968 | 19.8397 | PASS |
| 2.00 | Roll Under | 2.00% | 99/2.00 = 49.50000 | 49.5000 | PASS |
| 99.98 | Roll Over | 0.01% | 99/0.01 = 9900.00 | 9900.0000 | PASS |
| 0.01 | Roll Under | 0.01% | 99/0.01 = 9900.00 | 9900.0000 | PASS |

**Inverse function** (`diceEngine.ts`, line 59-62):
```ts
export function calculateWinChance(multiplier: number): number {
  const raw = (RTP * 100) / multiplier;  // 99 / multiplier
  return clampWinChance(Math.round(raw * 100) / 100);
}
```
This correctly inverts: `winChance = 99 / multiplier`. **PASS.**

**Rounding:** Multiplier rounded to 4 decimal places, win chance to 2 decimal places. This matches Stake's display precision.

### Verdict: PASS

---

## B. Win Chance Calculation

**Expected:**
- Roll Over target T: `winChance = 99.99 - T`
- Roll Under target T: `winChance = T`

**Implementation** (`diceEngine.ts`, line 80-85):
```ts
export function calculateWinChanceFromTarget(target: number, direction: DiceDirection): number {
  if (direction === "over") {
    return clampWinChance(Math.round((99.99 - target) * 100) / 100);
  }
  return clampWinChance(Math.round(target * 100) / 100);
}
```

**Analysis:**
- Roll Over: `99.99 - target` -- correct. For target=50.00, winChance = 49.99%. This means results 50.01 through 99.99 win (4999 outcomes out of 10000 = 49.99%).
- Roll Under: `target` -- correct. For target=50.00, winChance = 50.00%. This means results 0.00 through 49.99 win (5000 outcomes out of 10000 = 50.00%).

**Reverse function** (`diceEngine.ts`, line 72-77):
```ts
export function calculateTarget(winChance: number, direction: DiceDirection): number {
  if (direction === "over") {
    return Math.round((99.99 - winChance) * 100) / 100;
  }
  return Math.round(winChance * 100) / 100;
}
```
- Roll Over: `target = 99.99 - winChance`. For winChance=49.99, target=50.00. Correct.
- Roll Under: `target = winChance`. For winChance=50.00, target=50.00. Correct.

### Edge cases:

| Scenario | Win Chance | Multiplier | Valid? |
|----------|-----------|------------|--------|
| Target 0.01, Roll Under | 0.01% | 9900x | Yes (minimum) |
| Target 98.00, Roll Under | 98.00% | 1.0102x | Yes (maximum) |
| Target 99.98, Roll Over | 0.01% | 9900x | Yes (minimum) |
| Target 1.99, Roll Over | 98.00% | 1.0102x | Yes (maximum) |

Clamping at `MIN_WIN_CHANCE = 0.01` and `MAX_WIN_CHANCE = 98.00` is correctly applied. **PASS.**

### Verdict: PASS

---

## C. Random Number Generation

**Expected:** Uniformly distributed in [0.00, 99.99] with exactly 2 decimal places (10,000 possible values).

**Implementation** (`diceEngine.ts`, line 35-40):
```ts
export function generateDiceResult(): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  const raw = buffer[0] % TOTAL_OUTCOMES; // 0 to 9999
  return raw / 100; // 0.00 to 99.99
}
```

**Analysis:**

1. **Crypto-secure RNG:** Uses `crypto.getRandomValues()` instead of `Math.random()`. This is *better* than the minimum requirement -- it's cryptographically secure. **PASS.**

2. **Range:** `raw` is 0 to 9999, `raw / 100` is 0.00 to 99.99. **PASS.**

3. **Precision:** Division by 100 produces exactly 2 decimal places for all integer inputs 0-9999. **PASS.**

4. **Modulo bias (minor note):** `Uint32Array` produces values 0 to 2^32-1 (4,294,967,295). When taking `% 10000`, values 0-5295 have a very slightly higher probability than values 5296-9999 because `4,294,967,296 / 10000 = 429,496.7296`. The bias is approximately `5296 / 4,294,967,296 = 0.000123%`. This is negligible for a casino simulator and matches the spec's approach. Not a practical concern.

### Verdict: PASS (with negligible modulo bias note)

---

## D. Win/Loss Determination

**Expected:**
- Roll Over: WIN if `result > target` (strictly greater)
- Roll Under: WIN if `result < target` (strictly less)
- Result === target: LOSS for both directions

**Implementation** (`diceEngine.ts`, line 88-93):
```ts
export function isWin(result: number, target: number, direction: DiceDirection): boolean {
  if (direction === "over") {
    return result > target; // strictly greater
  }
  return result < target; // strictly less
}
```

**Analysis:**
- Roll Over uses `>` (strictly greater). **PASS.**
- Roll Under uses `<` (strictly less). **PASS.**
- If `result === target`, both `>` and `<` return `false`. **PASS.** This matches Stake.com's boundary rule.

**Spec cross-check** (DICE_GAME_SPEC.md, Section 2.4):
> - Roll Over: WIN if result is **strictly greater than** T; LOSS if result is **less than or equal to** T
> - Roll Under: WIN if result is **strictly less than** T; LOSS if result is **greater than or equal to** T
> - If the result equals the target exactly, it is **always a LOSS** for both directions

Code matches spec exactly. **PASS.**

**Floating-point concern:** Since both `result` and `target` are derived from integer operations (dividing integers by 100), there are no floating-point precision issues with the comparison. Both values are exact IEEE 754 representations. **PASS.**

### Verdict: PASS

---

## E. Payout Calculation

**Expected:** `payout = bet * multiplier` (on win); `profit = payout - bet = bet * (multiplier - 1)`

**Implementation** (`diceEngine.ts`, lines 101-108):
```ts
export function calculateProfitOnWin(betAmount: number, multiplier: number): number {
  return Math.floor(betAmount * (multiplier - 1) * 100) / 100;
}

export function calculatePayout(betAmount: number, multiplier: number): number {
  return Math.floor(betAmount * multiplier * 100) / 100;
}
```

**Analysis:**
- Profit calculation: `floor(bet * (mult - 1) * 100) / 100` -- rounds DOWN to 2 decimals. This is standard casino practice (always floor in the house's favor). **PASS.**
- Payout calculation: `floor(bet * mult * 100) / 100` -- also rounds down. **PASS.**

**Roll flow** (`useDiceGame.ts`, line 402-413):
```ts
const result = generateDiceResult();
const won = isWin(result, s.params.target, s.params.direction);
const payout = won ? calculatePayout(s.betAmount, s.params.multiplier) : 0;
const profit = won ? calculateProfitOnWin(s.betAmount, s.params.multiplier) : -s.betAmount;
```

- On win: payout = `calculatePayout(bet, mult)`, profit = `calculateProfitOnWin(bet, mult)`. **PASS.**
- On loss: payout = 0, profit = `-betAmount`. **PASS.**

**Balance update** (`useDiceGame.ts`, lines 213-249):

In `ROLL` action (line 219):
```ts
balance: state.balance - state.betAmount,  // Deduct bet immediately
```

In `ROLL_COMPLETE` action (line 247-249):
```ts
if (action.isWin) {
  newBalance += action.payout;  // Add full payout (bet + profit)
}
```

- On loss: balance was already reduced by bet, nothing added back. Net change = `-bet`. **PASS.**
- On win: balance reduced by bet, then payout added. Net change = `payout - bet = profit`. **PASS.**

### Spot-check:
- Bet $1.00, mult 1.9804x: payout = `floor(1.00 * 1.9804 * 100) / 100 = floor(198.04) / 100 = 1.98`. Profit = `floor(1.00 * 0.9804 * 100) / 100 = floor(98.04) / 100 = 0.98`. **PASS.**
- Bet $10.00, mult 49.50x: payout = `floor(10.00 * 49.50 * 100) / 100 = floor(49500) / 100 = 495.00`. Profit = `floor(10.00 * 48.50 * 100) / 100 = floor(48500) / 100 = 485.00`. **PASS.**

### Verdict: PASS

---

## F. House Edge Verification

**Expected:** Exactly 1% house edge. `E[return] = winChance * multiplier = winChance * (99/winChance) = 99% = 0.99`

**Proof from code:**
```
multiplier = (RTP * 100) / winChance = 99 / winChance
E[return per $1] = (winChance / 100) * multiplier
                 = (winChance / 100) * (99 / winChance)
                 = 99 / 100
                 = 0.99
```

This holds for ALL valid win chance values (0.01% to 98.00%) and BOTH directions. The house edge is exactly 1%, constant across all parameter combinations.

**Edge case -- floor rounding:** The `Math.floor` in `calculatePayout` can add a tiny additional edge in the house's favor (up to $0.01 per bet). For example:
- Bet $1.00, mult 1.9804x: payout = $1.98 (not $1.9804). The house gains an extra $0.0004.
- This micro-rounding is standard practice and matches real casino implementations.

### Verdict: PASS

---

## G. Spec vs. Code Compliance

### Checked items:

| Spec Requirement | Code Implementation | Status |
|---|---|---|
| RTP 99%, house edge 1% | `RTP = 0.99`, `HOUSE_EDGE = 0.01` | PASS |
| Multiplier = 99 / winChance | `(RTP * 100) / clamped` = `99 / clamped` | PASS |
| Win chance 0.01% - 98.00% | `MIN_WIN_CHANCE = 0.01`, `MAX_WIN_CHANCE = 98.00` | PASS |
| 10,000 possible outcomes | `TOTAL_OUTCOMES = 10000` | PASS |
| Result range 0.00 - 99.99 | `raw / 100` where raw is 0-9999 | PASS |
| crypto.getRandomValues() | Used correctly | PASS |
| Roll Over: result > target | `result > target` | PASS |
| Roll Under: result < target | `result < target` | PASS |
| Result === target is LOSS | `>` and `<` exclude equality | PASS |
| Bet range $0.10 - $1,000 | `MIN_BET = 0.10`, `MAX_BET = 1000.00` | PASS |
| Default bet $1.00 | `DEFAULT_BET = 1.00` | PASS |
| Default win chance 49.99% | `winChance = 49.99` in `getDefaultParameters` | PASS |
| Default direction "over" | `direction: "over"` in `getDefaultParameters` | PASS |
| Swap mirrors target | `getSwapTarget: 99.99 - currentTarget` | PASS |
| Profit on win = bet * (mult - 1) | `calculateProfitOnWin` implementation | PASS |
| Max history 500 | `MAX_HISTORY = 500` | PASS |
| Previous results 20 | `MAX_PREVIOUS_RESULTS = 20` | PASS |
| Auto-play max 1000 consecutive | `AUTO_PLAY_MAX_CONSECUTIVE = 1000` | PASS |
| 4-way parameter sync | `syncParameters` handles all 4 fields | PASS |
| Win tiers (penny through jackpot) | `getWinTier` function matches spec table | PASS |
| Session reminder at 300 rolls | `SESSION_REMINDER_THRESHOLD = 300` | PASS |
| Balance deducted on roll, payout on win | Reducer logic in ROLL and ROLL_COMPLETE | PASS |
| isOnTheLine detection | `Math.abs(result - target) < 0.005` (tolerance for float) | PASS |
| Result formatting XX.XX with zero-pad | `result.toFixed(2).padStart(5, "0")` | PASS |
| Auto-play adjustments | All bet/target/direction adjustments implemented | PASS |
| Stop conditions | Profit, loss, win streak, loss streak, roll count | PASS |

### Verdict: PASS -- Code fully matches spec

---

## Summary of Findings

| Area | Verdict | Notes |
|------|---------|-------|
| A. Multiplier Formula | **PASS** | `99 / winChance` correctly implemented |
| B. Win Chance Calculation | **PASS** | Both directions correct, edge cases handled |
| C. Random Number Generation | **PASS** | Crypto-secure, negligible modulo bias (0.000123%) |
| D. Win/Loss Determination | **PASS** | Strict comparisons, tie = loss |
| E. Payout | **PASS** | Floor rounding (house-favorable, standard) |
| F. House Edge | **PASS** | Exactly 1% for all configurations |
| G. Spec vs. Code | **PASS** | Full compliance |

---

## Notes (Non-blocking)

### 1. Modulo Bias in RNG (Negligible)
**File:** `diceEngine.ts`, line 38
**Issue:** `buffer[0] % 10000` introduces a theoretical bias of ~0.000123% toward lower values.
**Impact:** Negligible. For a play-money simulator, this is irrelevant.
**Fix if desired:** Use rejection sampling:
```ts
export function generateDiceResult(): number {
  const buffer = new Uint32Array(1);
  const limit = 4294960000; // largest multiple of 10000 below 2^32
  let raw: number;
  do {
    crypto.getRandomValues(buffer);
    raw = buffer[0];
  } while (raw >= limit);
  return (raw % 10000) / 100;
}
```

### 2. Asymmetry Between Over/Under at Target 50.00
This is by design and matches Stake.com:
- Roll Over 50.00: winChance = 49.99% (4999 outcomes: 50.01-99.99)
- Roll Under 50.00: winChance = 50.00% (5000 outcomes: 0.00-49.99)

The 0.01% difference exists because the result === target case is always a loss, and the number space has an even count (10,000 values). This is correct behavior.

### 3. Web Research Confirmation
Stake.com's dice game confirmed to use:
- Multiplier = 99 / win chance (1% house edge, 99% RTP)
- Roll Over: result must be strictly greater than target to win
- Roll Under: result must be strictly less than target to win
- Range: 0.00 to 99.99 (10,000 discrete outcomes)
- Max multiplier: 9,900x (at 0.01% win chance)

All of these match PaperBet's implementation exactly.

---

## Final Verdict: PASS

The Dice game implementation is mathematically sound, correctly implements the Stake.com-style dice formula with a 1% house edge, and fully complies with the game specification. No bugs or calculation errors were found. The game is ready for production.

---

*Sources consulted:*
- [Stake.com - How to Play Dice](https://stake.com/blog/how-to-play-dice-on-stake)
- [Stake Dice Calculator - CalculatorsCity](https://calculatorscity.com/stake-dice-calculator/)
- [Stake Dice 2026 Guide - StakeLotus](https://stakeslotus.org/stake-dice/)
- [Stake Dice Strategy - Strafe](https://www.strafe.com/esports-betting/crypto/games/stake/dice/)
- [Stake.com Dice Guide - TheSpikeGG](https://www.thespike.gg/reviews/stake-com/dice)
- [Stake Dice - SportsGambler](https://www.sportsgambler.com/review/stake/dice/)
