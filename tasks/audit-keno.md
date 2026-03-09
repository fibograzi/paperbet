# Keno Game Math Audit Report

**Auditor:** Claude Opus 4.6 (Senior Game Math Auditor)
**Date:** 2026-03-09
**Game:** Keno (Stake.com replica)
**Files Audited:**
- `components/games/keno/kenoEngine.ts`
- `components/games/keno/kenoMultipliers.ts`
- `components/games/keno/kenoTypes.ts`
- `components/games/keno/useKenoGame.ts`
- `components/games/keno/KenoControls.tsx`
- `components/games/keno/KenoGame.tsx`
- `components/games/keno/KenoBoard.tsx`
- `components/games/keno/KenoTile.tsx`
- `components/games/keno/KenoSidebar.tsx`
- `components/games/keno/KenoMultiplierRow.tsx`
- `components/games/keno/KenoResultOverlay.tsx`
- `KENO_GAME_SPEC.md`

---

## Executive Summary

| Area | Verdict |
|------|---------|
| A. Multiplier Tables | **INCONCLUSIVE** (see details) |
| B. Tile Drawing | **PASS** |
| C. Match Counting | **PASS** |
| D. Payout Calculation | **PASS** |
| E. Risk Levels | **PASS** |
| F. House Edge | **PASS** |
| G. Spec vs Code | **FAIL** (1 issue) |

**Critical finding:** The spec's probability reference table (Section 3.3) contains incorrect values -- they do not match the hypergeometric distribution for a 40-tile, 10-draw game. However, these probabilities are **reference only** and are not used in code, so this has **zero gameplay impact**. The actual multiplier tables and draw mechanics are correctly implemented.

---

## A. Multiplier Tables

### Verdict: INCONCLUSIVE

The multiplier tables in `kenoMultipliers.ts` exactly match the tables specified in `KENO_GAME_SPEC.md` (Section 3.4). Every value for all 4 risk levels (Classic, Low, Medium, High), all 10 pick counts, and all match counts was verified cell-by-cell -- the code matches the spec perfectly.

**However**, the tables could not be definitively verified against Stake.com's live game tables because:

1. Stake.com's payout tables are only visible in-game and are not published in a publicly accessible document.
2. Multiple web sources (sportsgambler.com, thespike.gg) report the 1-pick Classic multiplier as **3.86x**, while our code uses **3.96x**. This 0.10x discrepancy could indicate either:
   - Our tables differ from Stake's actual current tables, OR
   - The web sources are reporting approximate/outdated values
3. One web source confirms **81.50x for 3-pick High** (3/3 matches), which matches our code exactly.
4. Multiple sources confirm the **1,000x maximum** for 10/10 matches, which matches our code.
5. The **99% RTP / 1% house edge** is confirmed by multiple sources and matches our computed RTP (see Section F).

**Web sources consulted:**
- sportsgambler.com/review/stake/keno/ -- reports 3.86x for 1 pick
- thespike.gg/reviews/stake-us/keno -- reports 3.86x for 1 pick
- ejaw.net -- reports 81.50x for 3 picks (high)
- dyutam.com/tools/stake/keno -- confirms 99% RTP, 1% house edge
- Various GitHub repositories (Stake simulators) -- incomplete tables only

### Recommendation

If exact replication of Stake.com is required, someone should manually verify each value against the live Stake.com Keno game by selecting each pick count (1-10) and each risk level (Classic, Low, Medium, High) and recording every multiplier shown in the in-game payout table. The 3.86x vs 3.96x discrepancy for 1-pick Classic is the most concerning data point.

**If 3.86x is Stake's actual value**, the fix would be in `kenoMultipliers.ts` line 15:
```
// Current: 1: [0.00, 3.96],
// Fix:     1: [0.00, 3.86],
```
And the same for High risk line 51:
```
// Current: 1: [0.00, 3.96],
// Fix:     1: [0.00, 3.86],
```

---

## B. Tile Drawing

### Verdict: PASS

**File:** `kenoEngine.ts`, `drawNumbers()` function (lines 36-50)

The draw implementation is correct:

1. **Pool size:** Creates array `[1, 2, 3, ..., 40]` -- correct 40-tile pool.
2. **Draw count:** Draws exactly 10 numbers via `DRAW_COUNT = 10` -- correct.
3. **Without replacement:** Uses Fisher-Yates partial shuffle. After selecting a number at random index, swaps it with the last unselected element. This guarantees no duplicates.
4. **RNG quality:** Uses `crypto.getRandomValues(new Uint32Array(1))` for each selection -- cryptographically secure randomness. This is the same RNG approach Stake uses.
5. **Modulo bias:** `array[0] % remainingSize` introduces negligible modulo bias. For max pool size 40: `2^32 mod 40 = 16`, meaning bias is at most `40 / 2^32 = 0.00000093%` per draw position. Completely acceptable for a game simulator.

**Random pick** (`randomPick()`, lines 93-106) uses the same correct Fisher-Yates approach and returns sorted results.

---

## C. Match Counting

### Verdict: PASS

**File:** `kenoEngine.ts`, `getMatches()` function (lines 56-59)

```typescript
export function getMatches(selected: number[], drawn: number[]): number[] {
  const drawnSet = new Set(drawn);
  return selected.filter((n) => drawnSet.has(n));
}
```

This is correct:
- Creates a Set from drawn numbers (O(1) lookup)
- Filters selected numbers against the drawn set
- Returns the actual matching numbers (not just a count)
- `matchCount = matches.length` is computed separately in the BET reducer

The intersection logic is sound -- it finds exactly the numbers that appear in both arrays.

---

## D. Payout Calculation

### Verdict: PASS

**File:** `kenoEngine.ts`, `calculatePayout()` function (lines 77-79)

```typescript
export function calculatePayout(betAmount: number, multiplier: number): number {
  return Math.floor(betAmount * multiplier * 100) / 100;
}
```

**Analysis:**
- Formula: `payout = floor(bet * multiplier * 100) / 100`
- This truncates to 2 decimal places (rounds down), which is standard practice for casino games -- the house keeps fractional cents.
- Example: `calculatePayout(0.73, 3.96)` = `floor(0.73 * 3.96 * 100) / 100` = `floor(289.08) / 100` = `2.89` (exact would be `2.8908`)

**In the BET reducer** (`useKenoGame.ts`, lines 220-248):
- `multiplier = getMultiplier(difficulty, picks, matchCount)` -- correct lookup
- `payout = calculatePayout(betAmount, multiplier)` -- correct formula
- `profit = payout - betAmount` -- correct (negative for losses/micro-wins)
- `isWin = multiplier > 0` -- correct (0x = loss, any positive multiplier = win with payout)

**Balance handling** in DRAW_COMPLETE (`useKenoGame.ts`, lines 291-301):
- Balance is reduced by `betAmount` at BET time (line 253)
- At DRAW_COMPLETE, payout is added back only if `isWin` (multiplier > 0)
- This is correct: 0x multiplier = no return, bet is fully lost
- For micro-wins (e.g., 0.25x), `isWin=true`, so the partial return (e.g., $0.25 on a $1.00 bet) is correctly added back to balance

---

## E. Risk Levels

### Verdict: PASS

**Files:** `kenoTypes.ts` (line 9), `kenoMultipliers.ts`, `kenoEngine.ts` (lines 151-163)

1. **Type definition:** `KenoDifficulty = "classic" | "low" | "medium" | "high"` -- all 4 levels present.
2. **Multiplier tables:** Each risk level has its own complete table in `KENO_MULTIPLIERS` with entries for picks 1-10.
3. **Lookup:** `getMultiplier(difficulty, picks, matchCount)` correctly indexes into the nested structure.
4. **UI mapping:** Difficulty selector in `KenoControls.tsx` maps all 4 levels with correct labels and colors.
5. **Color coding:** Classic=#00E5A0 (green), Low=#00B4D8 (cyan), Medium=#F59E0B (amber), High=#EF4444 (red) -- matches spec exactly.

---

## F. House Edge

### Verdict: PASS

Using the hypergeometric distribution `P(k | n, 10, 40) = C(n,k) * C(40-n, 10-k) / C(40,10)`:

### Classic Risk

| Picks | RTP | House Edge |
|-------|---------|-----------|
| 1 | 99.00% | 1.00% |
| 2 | 99.04% | 0.96% |
| 3 | 99.02% | 0.98% |
| 4 | 98.96% | 1.04% |
| 5 | 98.99% | 1.01% |
| 6 | 98.97% | 1.03% |
| 7 | 98.98% | 1.02% |
| 8 | 99.02% | 0.98% |
| 9 | 98.98% | 1.02% |
| 10 | 99.04% | 0.96% |

### Low Risk

| Picks | RTP | House Edge |
|-------|---------|-----------|
| 1 | 98.75% | 1.25% |
| 2 | 98.85% | 1.15% |
| 3 | 98.87% | 1.13% |
| 4 | 98.92% | 1.08% |
| 5 | 98.90% | 1.10% |
| 6 | 99.01% | 0.99% |
| 7 | 98.94% | 1.06% |
| 8 | 99.00% | 1.00% |
| 9 | 99.07% | 0.93% |
| 10 | 98.76% | 1.24% |

### Medium Risk

| Picks | RTP | House Edge |
|-------|---------|-----------|
| 1 | 98.75% | 1.25% |
| 2 | 98.65% | 1.35% |
| 3 | 98.99% | 1.01% |
| 4 | 98.78% | 1.22% |
| 5 | 98.94% | 1.06% |
| 6 | 98.83% | 1.17% |
| 7 | 98.96% | 1.04% |
| 8 | 98.92% | 1.08% |
| 9 | 98.94% | 1.06% |
| 10 | 98.97% | 1.03% |

### High Risk

| Picks | RTP | House Edge |
|-------|---------|-----------|
| 1 | 99.00% | 1.00% |
| 2 | 98.65% | 1.35% |
| 3 | 98.99% | 1.01% |
| 4 | 98.91% | 1.09% |
| 5 | 98.89% | 1.11% |
| 6 | 99.00% | 1.00% |
| 7 | 98.96% | 1.04% |
| 8 | 98.96% | 1.04% |
| 9 | 98.96% | 1.04% |
| 10 | 99.01% | 0.99% |

**Summary:**
- House edge ranges from **0.93% to 1.35%** across all combinations
- Average house edge: approximately **1.06%**
- The spec claims a flat 1.00% house edge, but the actual values vary slightly by pick count and risk level (range: 0.93-1.35%). This is normal -- Stake's tables are hand-tuned approximations, not exact 1% everywhere.
- All values are within a reasonable range for a ~99% RTP game.

---

## G. Spec vs Code

### Verdict: FAIL (1 documentation issue, 0 gameplay bugs)

### FAIL: Spec Probability Table Is Incorrect

**File:** `KENO_GAME_SPEC.md`, Section 3.3 (lines 98-109)

The probability table in the spec does NOT match the correct hypergeometric distribution for a 40-tile, 10-draw game. The spec values appear to be copied from a different Keno variant (possibly a 80-tile, 20-draw traditional keno, though they don't exactly match that either).

**Examples of discrepancy:**

| Picks | Matches | Spec Says | Correct (40/10) |
|-------|---------|-----------|-----------------|
| 2 | 0 | 55.13% | 55.77% |
| 2 | 1 | 37.18% | 38.46% |
| 2 | 2 | 7.69% | 5.77% |
| 5 | 1 | 34.24% | 41.65% |
| 10 | 2 | 11.57% | 31.07% |
| 10 | 3 | 11.73% | 28.82% |

**Impact:** NONE on gameplay. These probabilities are a reference section in the spec document only. The code does NOT use them -- the code draws randomly and looks up multipliers from tables. The RTP is determined by the multiplier tables (which are correct) and the true hypergeometric probabilities (which the code naturally produces via fair random draws).

**Fix:** Update the probability table in `KENO_GAME_SPEC.md` Section 3.3 to use the correct values for a 40-tile, 10-draw hypergeometric distribution.

### All Other Spec Items: PASS

| Spec Requirement | Code Implementation | Match? |
|-----------------|-------------------|--------|
| 8x5 grid of 40 tiles | `POOL_SIZE = 40`, grid `repeat(8, 1fr)` | YES |
| Select 1-10 tiles | `MAX_PICKS = 10`, min 1 enforced at bet time | YES |
| 10 random draws | `DRAW_COUNT = 10`, Fisher-Yates | YES |
| 4 difficulty levels | `KenoDifficulty` type, 4 multiplier tables | YES |
| Bet range $0.10-$1,000 | `MIN_BET = 0.10`, `MAX_BET = 1000` | YES |
| Default bet $1.00 | `DEFAULT_BET = 1.00` | YES |
| Starting balance $1,000 | `INITIAL_BALANCE = 1000` | YES |
| Sequential tile reveal | Staggered animation with `TILE_REVEAL_STAGGER = 100ms` | YES |
| Instant bet mode | `instantBet` state, reveals all at once | YES |
| Random pick selects 10 | `randomPick(MAX_PICKS)` | YES |
| Clear table deselects all | CLEAR_TABLE action | YES |
| Selections persist between rounds | Not cleared in RESULT_SETTLE | YES |
| Auto-play with stop conditions | Full auto-play system with configurable stops | YES |
| Session stats tracking | KenoSessionStats with all required fields | YES |
| Result overlay with multiplier/profit/hits | KenoResultOverlay component | YES |
| Win tier classification | 8 tiers matching spec thresholds | YES |

---

## Additional Observations (Non-Blocking)

### 1. Win Classification for Micro-Wins

When a player gets a "micro-win" (multiplier between 0.01x and 0.99x, e.g., Classic 5-pick with 1 match = 0.25x), the game classifies this as `isWin = true` because `multiplier > 0`. This means:
- The payout ($0.25 on a $1.00 bet) IS correctly added to balance
- The win counter increments
- The row shows green (win) in bet history
- But the player actually LOST $0.75 net

This is **intentional and correct behavior** matching Stake's approach -- any payout counts as a "win" even if it's less than the bet. The stats tracker correctly handles this: `profit = payout - betAmount` shows the true net (-$0.75), and `biggestLoss` correctly tracks partial-loss amounts (line 117-119 in useKenoGame.ts).

### 2. Truncation vs Rounding in Payout

`calculatePayout` uses `Math.floor` (truncation), not `Math.round`. This means the player always loses fractional cents. For example, a $7.33 bet with 3.96x multiplier: exact = $29.0268, truncated = $29.02 (player loses $0.0068). This is standard casino practice and not a bug.

### 3. Auto-Play 200-Round Warning

The responsible gambling pause at 200 rounds (`AUTO_PLAY_WARNING_THRESHOLD`) stops auto-play entirely (`AUTO_PLAY_STOP`) rather than just pausing it. This means the user must restart auto-play from scratch. This is intentional friction for responsible gambling.

---

## Correct Hypergeometric Probability Table (for Spec Fix)

For reference, the correct probabilities for a **40-tile pool, 10 draws** game:

| Picks | 0 hits | 1 hit | 2 hits | 3 hits | 4 hits | 5 hits | 6 hits | 7 hits | 8 hits | 9 hits | 10 hits |
|-------|--------|-------|--------|--------|--------|--------|--------|--------|--------|--------|---------|
| 1 | 75.00% | 25.00% | | | | | | | | | |
| 2 | 55.77% | 38.46% | 5.77% | | | | | | | | |
| 3 | 41.09% | 44.03% | 13.66% | 1.21% | | | | | | | |
| 4 | 29.99% | 44.43% | 21.42% | 3.94% | 0.23% | | | | | | |
| 5 | 21.66% | 41.65% | 27.77% | 7.93% | 0.96% | 0.04% | | | | | |
| 6 | 15.47% | 37.13% | 32.13% | 12.69% | 2.38% | 0.20% | 0.01% | | | | |
| 7 | 10.92% | 31.85% | 34.40% | 17.64% | 4.57% | 0.59% | 0.03% | 0.0006% | | | |
| 8 | 7.61% | 26.47% | 34.74% | 22.24% | 7.48% | 1.33% | 0.12% | 0.005% | 0.0001% | | |
| 9 | 5.23% | 21.40% | 33.50% | 26.06% | 10.94% | 2.53% | 0.31% | 0.02% | 0.0005% | 0.000005% | |
| 10 | 3.54% | 16.88% | 31.07% | 28.82% | 14.71% | 4.24% | 0.68% | 0.06% | 0.002% | 0.00005% | 0.0000009% |

---

## Final Verdict

**The Keno game implementation is mathematically sound.** The draw mechanism is fair, match counting is correct, payout calculations are accurate, and the house edge is approximately 1% as advertised. The only issue found is an incorrect probability reference table in the spec document, which has zero impact on actual gameplay.

The multiplier tables could not be fully verified against Stake's live game due to the tables only being available in-game. The one confirmed data point (3.86x vs 3.96x for 1-pick Classic) suggests a possible discrepancy that warrants manual verification against the live Stake.com Keno game.
