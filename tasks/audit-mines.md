# Mines Game Math Audit Report

**Auditor:** Claude Opus 4.6 (Game Math Auditor)
**Date:** 2026-03-09
**Scope:** All Mines game calculation logic, game state management, and spec compliance
**Reference Spec:** `MINES_GAME_SPEC.md`
**Verified Against:** Stake.com Mines formula (web research)

---

## Executive Summary

The Mines game implementation is **mathematically correct**. The core multiplier formula, mine placement, payout calculations, house edge, and game state management all pass audit. There are three minor cosmetic/display discrepancies between the spec and code, none of which affect actual payouts or game fairness.

**Overall Verdict: PASS (with 3 minor display notes)**

---

## A. Multiplier Formula

### PASS

**Formula in code** (`minesCalculator.ts`, lines 16-31):
```
survivalProb = product of (25 - m - i) / (25 - i) for i = 0..k-1
multiplier = 0.99 / survivalProb
```

**Formula in spec** (Section 2.3):
```
multiplier(k, m) = 0.99 / P(surviving k reveals)
P(surviving k reveals) = product of (25 - m - i) / (25 - i) for i = 0..k-1
```

**Equivalence to combinatorial formula** (confirmed by web research on Stake.com):
```
multiplier = 0.99 * C(25, k) / C(25-m, k)
```

All three formulas are mathematically equivalent. Verified numerically for all test cases.

### Spot-check results against spec tables:

| Config | Gems | Code (exact) | Spec | Match? |
|--------|------|-------------|------|--------|
| 1 mine | 1 | 1.03125 | 1.03 | Yes (rounds to 1.03) |
| 1 mine | 24 (full clear) | 24.75 | 24.75 | Exact |
| 3 mines | 1 | 1.125 | 1.12 | See Note 1 below |
| 3 mines | 5 | 1.9974 | 2.00 | Yes (rounds to 2.00) |
| 3 mines | 22 (full clear) | 2,277.00 | 2,277.00 | Exact |
| 5 mines | 1 | 1.2375 | 1.24 | Yes (rounds to 1.24) |
| 5 mines | 10 | 17.5154 | 17.52 | Yes (rounds to 17.52) |
| 5 mines | 20 (full clear) | 52,598.70 | 52,598.70 | Exact |
| 10 mines | 1 | 1.65 | 1.65 | Exact |
| 10 mines | 5 | 17.5154 | 17.52 | Yes (rounds to 17.52) |
| 10 mines | 15 (full clear) | 3,236,072.40 | 3,236,072.40 | Exact |
| 24 mines | 1 (full clear) | 24.75 | 24.75 | Exact |

**Note 1 (display rounding):** The exact value for 3 mines / 1 gem is 1.125. The spec table shows `1.12` (truncated), but the code's `toFixed(2)` produces `1.13` (standard rounding). This is a **display-only** difference. The payout is calculated from the exact value (1.125), not the displayed value. Stake.com truncates multipliers for display; the code rounds them. This does not affect payouts.

**File:** `components/games/mines/minesCalculator.ts`, lines 16-31
**Verdict:** Formula is correct. Display rounding differs from Stake's truncation convention but does not impact gameplay.

---

## B. Mine Placement

### PASS

**File:** `components/games/mines/minesCalculator.ts`, lines 67-78

| Check | Result |
|-------|--------|
| Algorithm | Fisher-Yates shuffle -- correct |
| Randomness source | `crypto.getRandomValues(Uint32Array)` -- cryptographically secure |
| Uniform distribution? | Yes. Modulo bias is negligible (< 5e-9 per value) |
| Exactly m mines placed? | Yes. `positions.slice(0, mineCount)` after full shuffle |
| Duplicate mines possible? | No. Array starts as `[0,1,...,24]` (unique), shuffle preserves uniqueness |
| Mines placed before first click? | Yes. `generateMinePositions` is called in `START_GAME` action |

**Modulo bias analysis:**
- Maximum bias occurs at mod 25: `2^32 % 25 = 21`, giving bias of ~4.89e-9 per value
- This is indistinguishable from perfect uniformity in practice
- Industry standard considers this acceptable

---

## C. Payout Calculation

### PASS

**Balance flow:**

| Event | Balance Change | Code Location |
|-------|---------------|---------------|
| Start game | `balance -= betAmount` | `useMinesGame.ts`, line 190 |
| Cash out (win) | `balance += betAmount * currentMultiplier` | `useMinesGame.ts`, line 383 |
| Full clear (win) | `balance += betAmount * currentMultiplier` | `useMinesGame.ts`, line 325 |
| Mine hit (loss) | No change (bet already deducted) | `useMinesGame.ts`, lines 264-279 |

**Profit calculation:**
```
profit = betAmount * multiplier - betAmount
```
- File: `minesCalculator.ts`, line 61
- Used consistently in CASH_OUT (line 357), FULL_CLEAR (line 292), and MINE_HIT (line 244, as `-betAmount`)

**Verification example:**
- Bet $10, 3 mines, reveal 5 gems: multiplier = 1.9974
- Payout = $10 * 1.9974 = $19.974 (added to balance)
- Net profit = $19.974 - $10 = $9.974
- Code calculates this correctly using exact (unrounded) multiplier values

---

## D. Game State

### PASS

| Check | Result | Code Location |
|-------|--------|---------------|
| Click tile after mine hit? | Blocked. `phase !== "PLAYING"` guard | `useMinesGame.ts`, line 207 |
| Click already-revealed tile? | Blocked. `tileStates[idx] !== "hidden"` guard | `useMinesGame.ts`, line 211 |
| Click during reveal animation? | Blocked. `revealingTile !== null` guard | `useMinesGame.ts`, line 208 |
| Cash out with 0 gems? | Blocked. `gemsRevealed < 1` guard | `useMinesGame.ts`, line 354 |
| Cash out mid-game? | Works correctly. Returns bet * multiplier | `useMinesGame.ts`, lines 352-391 |
| Full clear auto-cashout? | Works correctly. `isFullClear` triggers auto-cashout | `useMinesGame.ts`, lines 290-333 |
| New game from PLAYING? | Blocked. `phase !== "GAME_OVER"` guard | `useMinesGame.ts`, line 408 |
| Start game from PLAYING? | Blocked. `phase !== "IDLE"` guard | `useMinesGame.ts`, line 179 |
| Debounce rapid clicks? | Yes. 100ms debounce via `lastClickRef` | `useMinesGame.ts`, lines 559-561 |
| Beforeunload warning? | Yes. Active during PLAYING phase | `useMinesGame.ts`, lines 797-806 |

---

## E. House Edge

### PASS

**Theoretical house edge: exactly 1% (99% RTP)**

**Proof:**
```
EV = P(survive k) * multiplier(k) * bet
   = P(survive k) * (0.99 / P(survive k)) * bet
   = 0.99 * bet
```

This holds for ANY value of k (gems revealed) and ANY mine count m. The 0.99 factor in the multiplier formula algebraically guarantees a 1% house edge regardless of strategy.

**Numerical verification:**

| Config | P(survive) | Multiplier | EV per $1 bet |
|--------|-----------|------------|---------------|
| 3 mines, cashout at 1 gem | 0.8800 | 1.125 | $0.99 |
| 10 mines, cashout at 3 gems | 0.1978 | 5.004 | $0.99 |
| 24 mines, cashout at 1 gem | 0.0400 | 24.75 | $0.99 |
| 1 mine, cashout at 24 gems | 0.0400 | 24.75 | $0.99 |

**Key insight (matches spec Section 2.6):** Changing the mine count changes **volatility** (variance), not the house edge. The expected return is always 99% of the bet, regardless of mine count or cashout strategy.

---

## F. Edge Cases

### PASS

| Edge Case | Expected | Actual | Verdict |
|-----------|----------|--------|---------|
| **1 mine (24 safe)** | Multipliers from 1.03x to 24.75x | Correct. Full table verified | PASS |
| **24 mines (1 safe)** | Single multiplier: 24.75x | Correct. `mult(1, 24) = 24.75` | PASS |
| **All safe tiles revealed** | Auto-cashout at full-clear multiplier | Correct. `isFullClear` check triggers `"full_clear"` game over | PASS |
| **Bet = 0** | Not allowed | Clamped to $0.10 minimum by `clampBet()` | PASS |
| **Bet = negative** | Not allowed | Clamped to $0.10 minimum by `clampBet()` | PASS |
| **Bet > balance** | Game doesn't start | `balance < betAmount` guard in `START_GAME` | PASS |
| **Mine count = 0** | Not allowed | Clamped to 1 by `Math.max(1, ...)` in `SET_MINE_COUNT` | PASS |
| **Mine count = 25** | Not allowed | Clamped to 24 by `Math.min(24, ...)` in `SET_MINE_COUNT` | PASS |
| **Double-click same tile** | Second click ignored | Tile state changes from `"hidden"` to `"revealing"` on first click; guard rejects non-hidden | PASS |
| **Click during animation** | Ignored | `revealingTile !== null` guard in `REVEAL_TILE` | PASS |

---

## G. Spec vs Code Discrepancies

### 3 items found -- all cosmetic/display-only, no payout impact

#### 1. k=0 Multiplier Display Value -- MINOR

**Spec says** (Section 2.3, line 95):
```typescript
if (gemsRevealed === 0) return 0.99; // no gems = base (for display only, can't cash out)
```

**Code does** (`minesCalculator.ts`, line 21):
```typescript
const multipliers: number[] = [0]; // k=0: no gems, can't cash out
```

**Impact:** None. You cannot cash out at 0 gems. The multiplier at k=0 is never used for payout calculations. It only affects what the multiplier bar might show before any tiles are revealed. The code shows "0.00x" whereas the spec intends "0.99x" at this stage. However, the `MinesMultiplierBar` component shows "Click a tile to reveal" text instead of a multiplier value when `gemsRevealed === 0`, so the k=0 multiplier value is effectively invisible to the user.

**Verdict:** No fix needed. Display is handled differently (text prompt instead of number).

#### 2. Multiplier Display Rounding Convention -- MINOR

**Spec uses:** Truncation (floor to 2 decimal places), matching Stake.com's convention.
- Example: 1.125 displays as `1.12x`

**Code uses:** Standard rounding via `toFixed(2)`.
- Example: 1.125 displays as `1.13x`

**File:** `minesCalculator.ts`, line 88: `mult.toFixed(2)`

**Impact:** Purely cosmetic. Payouts are calculated from exact (unrounded) multiplier values. The displayed multiplier may differ by 0.01x in edge cases compared to Stake.com.

**Potential fix (optional):**
```typescript
// Change line 88 in minesCalculator.ts from:
return `${mult.toFixed(2)}x`;
// To:
return `${(Math.floor(mult * 100) / 100).toFixed(2)}x`;
```

**Verdict:** Optional cosmetic fix. Not a math error.

#### 3. "Profit on Next Tile" at 0 Gems -- MINOR

**Spec says** (Section 2.8 table): At 0 gems with 5 mines, "Profit on Next Tile = $1.24 (initial)" -- this appears to show the total return (not profit delta).

**Code computes** (`MinesMultiplierBar.tsx`, lines 34-39):
```typescript
nextMultiplier * betAmount - betAmount  // when currentMultiplier is 0
// = 1.2375 * 1 - 1 = $0.24 (actual profit)
```

**Impact:** The code's calculation is arguably more accurate (it shows actual profit, not total return). However, this state is only visible momentarily before the player's first click and the actual "Profit on Next Tile" display only appears when `gemsRevealed >= 1` and `currentMultiplier > 0`, so this code path where `currentMultiplier === 0` is effectively never reached in the UI (the multiplier bar shows "Click a tile to reveal" instead).

**Verdict:** No fix needed. The code path is unreachable in practice.

---

## Files Audited

| File | Lines | Purpose |
|------|-------|---------|
| `components/games/mines/minesCalculator.ts` | 150 | Core math: multipliers, mine placement, formatting |
| `components/games/mines/minesTypes.ts` | 135 | Type definitions, game state interface |
| `components/games/mines/useMinesGame.ts` | 818 | Game state reducer, auto-play logic |
| `components/games/mines/MinesControls.tsx` | 760 | Bet/mine controls, auto-play panel |
| `components/games/mines/MinesGame.tsx` | 192 | Main game orchestrator |
| `components/games/mines/MinesBoard.tsx` | 56 | 5x5 grid renderer |
| `components/games/mines/MinesTile.tsx` | 165 | Individual tile with 6 visual states |
| `components/games/mines/MinesSidebar.tsx` | 283 | Stats, history, casino cards |
| `components/games/mines/MinesMultiplierBar.tsx` | 150 | Multiplier display, profit info |
| `components/games/mines/MinesDangerMeter.tsx` | 53 | Danger % progress bar |
| `app/mines/page.tsx` | 102 | Page wrapper, SEO, structured data |

---

## Summary Table

| Audit Item | Verdict | Notes |
|------------|---------|-------|
| A. Multiplier Formula | **PASS** | Exact match to Stake formula. Verified numerically. |
| B. Mine Placement | **PASS** | Fisher-Yates + crypto.getRandomValues. Uniform, unique, correct count. |
| C. Payout Calculation | **PASS** | `bet * multiplier` on cashout. Balance correctly updated. |
| D. Game State | **PASS** | All guards in place. No illegal state transitions possible. |
| E. House Edge | **PASS** | Exactly 1% (99% RTP). Algebraically guaranteed by formula. |
| F. Edge Cases | **PASS** | All boundary conditions handled correctly. |
| G. Spec vs Code | **3 MINOR** | Display-only differences. Zero impact on payouts or fairness. |

---

## Web Research Sources

Formula verification was cross-referenced with:
- [Dyutam Mines Calculator](https://dyutam.com/tools/mines-calculator) -- confirms `0.99 * C(25, k) / C(25-m, k)` formula
- [PlayOnStake Mines Calculator](https://playonstake.eu/stake-mines-calculator.html) -- confirms 1% house edge, 99% RTP
- [Smart Gambling Edge - Mines](https://www.smartgamblingedge.com/p/mines.html) -- confirms combinatorial probability approach
- [Stake Community Forum](https://stakecommunity.com/topic/28457-mines-multiplier-and-win-chance/) -- community verification of multiplier values
- [BetVerdict Mines Calculator](https://betverdict.com/game/stake-mines-guide/calculator/) -- confirms formula structure
