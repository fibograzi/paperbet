# Deal Wheel Game Math Audit

**Auditor:** Claude (senior game math auditor)
**Date:** 2026-03-09
**Scope:** All Deal Wheel game code — engine, types, animation, hook, controls, result, sidebar, game wrapper, page

---

## Files Audited

| File | Purpose |
|------|---------|
| `components/games/deals/dealWheelEngine.ts` | Core engine — segments, weighted RNG, spin physics, localStorage |
| `components/games/deals/dealWheelTypes.ts` | TypeScript interfaces and action types |
| `components/games/deals/dealWheelAnimation.ts` | Canvas renderer (drawing only, no game logic) |
| `components/games/deals/useDealWheel.ts` | React hook — state management, spin orchestration |
| `components/games/deals/DealWheelControls.tsx` | Controls UI — spin button, email form, spin status |
| `components/games/deals/DealWheelGame.tsx` | Game wrapper — layout, keyboard shortcuts |
| `components/games/deals/DealWheel.tsx` | Canvas component — rAF loop, pointer bounce |
| `components/games/deals/DealWheelSidebar.tsx` | Sidebar — stats, prizes, partner offers |
| `components/games/deals/DealWheelResult.tsx` | Result modal — confetti, deal CTA |
| `app/deals/page.tsx` | Page route — metadata, structured data |

---

## F. Spec vs Code

**RESULT: N/A — No spec file exists.**

No `DEALWHEEL_GAME_SPEC.md` or similar spec file was found in the project root. Unlike Plinko, Crash, and Mines (which each have spec files), the Deal Wheel has no formal specification document.

**Recommendation:** Consider creating `DEALWHEEL_GAME_SPEC.md` to document intended behavior, segment weights, spin mechanics, and email flow — consistent with other games.

---

## A. Wheel Mechanics

### A1. Segment/Prize Definition — PASS

Segments are defined in `dealWheelEngine.ts:buildSegments()` (lines 51-159). There are 8 fixed segments:

| Index | ID | Label | Tier |
|-------|----|-------|------|
| 0 | seg-stake | Stake | rare |
| 1 | seg-rollbit | Rollbit | common |
| 2 | seg-bcgame | BC.Game | jackpot |
| 3 | seg-wildio | Wild.io | medium |
| 4 | seg-respin | Spin Again! | respin |
| 5 | seg-jackbit | Jackbit | common |
| 6 | seg-coincasino | CoinCasino | medium |
| 7 | seg-mystery | Mystery Bonus | rare |

Each segment includes casino ID, label, deal title/description, color, tier, affiliate URL, icon, and emoji. Casino data is pulled from `CASINOS` in `lib/constants.ts` with hardcoded fallbacks. All 6 casino IDs (`stake`, `rollbit`, `bcgame`, `wildio`, `jackbit`, `coincasino`) match between `buildSegments()` and `CASINOS` array. No mismatches found.

**Segment count constant `SEGMENT_COUNT = 8` matches the actual array length (8).** This is only used as a reference — actual code uses `segments.length` everywhere, which is correct.

### A2. Random Selection Fairness — PASS

The engine uses `crypto.getRandomValues()` (line 166-169) via a `cryptoRandom()` helper, which is cryptographically secure. The conversion `array[0] / (0xffffffff + 1)` correctly produces a uniform float in `[0, 1)`:
- `0xffffffff + 1` = `4294967296` (2^32)
- A `Uint32Array` value ranges from 0 to 4294967295
- Division yields `[0, 0.9999999997671694)` — correct uniform distribution

`Math.random()` is NOT used for prize selection. Only used in confetti particle generation (cosmetic, no game impact).

### A3. Probabilities — PASS

Weights are defined in `SEGMENT_WEIGHTS` (lines 32-41):

| Index | Segment | Weight | Probability |
|-------|---------|--------|-------------|
| 0 | Stake | 10 | 10% |
| 1 | Rollbit | 14 | 14% |
| 2 | BC.Game | 5 | 5% |
| 3 | Wild.io | 18 | 18% |
| 4 | Spin Again | 13 | 13% |
| 5 | Jackbit | 14 | 14% |
| 6 | CoinCasino | 16 | 16% |
| 7 | Mystery Bonus | 10 | 10% |

The Mystery Bonus weight is calculated as `100 - sum(SEGMENT_WEIGHTS)` = `100 - 90 = 10`. The `totalWeight` is then recalculated as `sum(all weights)` = `100`. This is correct and elegant — ensures weights always sum to 100.

The `selectPrizeSegment()` function (lines 172-187) implements a standard cumulative weighted random selection:
1. Generate random `[0, 100)`
2. Walk cumulative weights
3. Return first index where `rand < cumulative`
4. Fallback to last segment (should never be reached with correct weights)

This is mathematically correct. The `rand < cumulative` (strict less-than) is proper — avoids off-by-one. The fallback on line 186 is unreachable with valid weights but is a safe guard.

### A4. Visual Landing Accuracy — PASS

The pointer is at `3*PI/2` (12 o'clock / top of canvas). `calculateSpinTarget()` (lines 193-231) computes:
1. `segmentCenter = segmentIndex * segmentArc + segmentArc / 2` — center of the winning segment
2. `variance` within 70% of segment width (avoids pointer landing on edges)
3. `landingAngle = (3*PI/2 - segmentCenter - variance) mod 2*PI` — the wheel rotation that places the selected segment under the pointer
4. Full rotations (3-5) added for visual effect
5. `angleToAdd` correctly handles modular arithmetic to reach the target from current position

`getSegmentAtAngle()` (lines 272-283) uses the same `3*PI/2` pointer convention and identical math to determine which segment the pointer is on — this is consistent with `calculateSpinTarget()`.

Cross-verified: both functions use `(3*PI/2 - wheelAngle) mod 2*PI` for the pointer-to-segment mapping. The math is consistent.

---

## B. Prize/Payout Logic

### B1. Prize Awarding — PASS

When a spin completes:
1. The `SpinResult` is created with `segmentIndex`, the full `WheelSegment`, a timestamp, and a generated ID
2. For Mystery Bonus segments, `resolveMysteryBonus()` selects a random casino from the pool (excluding previously won casinos if possible)
3. The result is dispatched via `SPIN_COMPLETE` action
4. Result is saved to `localStorage` via `saveWheelSession()`
5. A modal (`DealWheelResult.tsx`) shows the prize with the correct casino name, deal description, color, and affiliate link

### B2. Payout Calculation — PASS (N/A)

There are no monetary payouts. The Deal Wheel awards affiliate deal offers (casino bonuses), not currency. Users click through to partner casinos to claim deals. The "payout" is an affiliate link redirect, which works correctly for all segment types.

### B3. All Prizes Functional — PASS

All 8 segment types produce valid results:
- **Casino segments (6):** Show casino name, deal description, and a "View This Deal" CTA linking to the affiliate URL
- **Spin Again (respin):** Auto-dismisses after 1200ms, triggers another spin via `dismissResult()` callback with `consecutiveRespinRef` counter
- **Mystery Bonus:** Resolves to a random casino via `resolveMysteryBonus()`, displays the resolved casino's name/deal/URL. Falls back to full casino pool if all have been won.

---

## C. Balance Impact

### C1. Spin Cost — PASS (N/A)

The Deal Wheel has NO balance/currency system. It does not interact with PaperBet's paper money balance at all. Spins are gated by a count system:
- 1 free spin (no email required)
- 2 bonus spins (after email capture)
- Respins do NOT consume a spin count

This is correct for a conversion mechanism. There is nothing to deduct or add.

### C2. Balance Deduction/Addition — PASS (N/A)

No balance operations exist. Confirmed by searching all files — no reference to `balance`, `bankroll`, `useBankroll`, or any currency state.

---

## D. Animation vs Logic

### D1. Animation Matches Result — PASS

The result is determined BEFORE the animation starts:
1. `selectPrizeSegment()` picks the winning segment index (line 244 in `useDealWheel.ts`)
2. `calculateSpinTarget()` computes the exact `targetAngle` that will land on that segment (line 245)
3. The animation is purely visual interpolation from `currentAngle` to `targetAngle` via `getAngleAtTime()`

The wheel cannot land on a different segment than what was pre-determined. The `targetAngle` is computed to place the pointer exactly within the winning segment (with variance for visual realism).

### D2. Result Determined Before Animation — PASS

Confirmed. The call order in `spin()` (useDealWheel.ts, lines 235-314):
1. `selectPrizeSegment()` — determines winner
2. `calculateSpinTarget()` — computes target angle for that winner
3. `dispatch({ type: "START_SPIN" })` — begins animation
4. `requestAnimationFrame(tick)` — runs the visual interpolation

The result is locked in at step 1, before any frames are drawn.

### D3. Visual Mismatch Potential — PASS (with minor note)

The `SPIN_COMPLETE` dispatch on line 286 uses the pre-computed `targetAngle` as `finalAngle`, not the actual angle from the rAF loop. This is correct because:
- `getAngleAtTime()` converges to `targetAngle` when `elapsed >= duration` (returns `startAngle + totalDelta * 1.0 = targetAngle`)
- The compound easing function reaches exactly `easedT = 0.95 + 0.05 = 1.0` at `t = 1.0`

**Verified easing continuity:** At `t = 0.8`, the cubic branch gives `easedT = easeOutCubic(1.0) * 0.95 = 1.0 * 0.95 = 0.95`. At `t = 0.8+epsilon`, the quint branch gives `easedT = 0.95 + easeOutQuint(epsilon) * 0.05 ~ 0.95`. The easing is continuous at the transition point. At `t = 1.0`, `easedT = 0.95 + easeOutQuint(1.0) * 0.05 = 0.95 + 0.05 = 1.0`. Correct.

**Minor note:** The `drawHighlight()` function in `dealWheelAnimation.ts` (line 421) draws the highlight at `currentAngle + segmentIndex * segmentArc`. This assumes segments are rendered starting from angle 0 (which they are — see `drawWheel` line 209). The highlight correctly matches the rendered segment position.

---

## E. Edge Cases

### E1. Spinning with 0 Spins Available — PASS

The `canSpin` guard in `useDealWheel.ts` (lines 227-229) checks:
```
phase === "idle" && (freeSpinsUsed < FREE_SPINS || emailSpinsRemaining > 0)
```

The `spin()` callback (lines 236-241) duplicates this check using `stateRef.current` to avoid stale closures. This double-guard is correct and prevents spinning when out of spins.

The spin button in `DealWheelControls.tsx` (line 167) is disabled when `!buttonEnabled && !needsEmail`, and `buttonEnabled` mirrors the `canSpin` prop. When all spins are used and email is captured, the button shows "ALL SPINS USED" and is disabled.

### E2. Spam Clicking the Spin Button — PASS

Multiple protections:
1. **Phase check:** `canSpin` requires `phase === "idle"`. During spinning, phase is `"spinning"`, blocking new spins.
2. **Button disabled:** The button is disabled when `phase === "spinning"` (line 72-76 in Controls).
3. **State-based guard:** The `spin()` function checks `s.phase === "idle"` from the ref-based state before proceeding.

### E3. Rapid Successive Spins — PASS

After a spin completes:
1. Phase transitions to `"revealing"` (not `"idle"`), blocking new spins
2. The user must dismiss the result modal (clicking "Spin Again" or pressing Escape) to return to `"idle"`
3. For respins, there's an 800ms delay (`setTimeout` in `dismissResult()`, line 340) before auto-triggering the next spin
4. Consecutive respins are capped at `MAX_RESPINS = 3` (line 174), preventing infinite respin loops

**Respin loop analysis:** If a user gets 3 consecutive respins, the counter resets and they go back to idle. This correctly prevents an infinite loop. The probability of 3 consecutive respins is `(13/100)^3 = 0.22%`, which is very rare.

### E4. Auto-dismiss Respin Timer — PASS

`DealWheelResult.tsx` (lines 191-204) auto-dismisses respin results after 1200ms. The cleanup function properly clears the timeout if the component unmounts before the timer fires.

### E5. Keyboard Shortcut Safety — PASS

`DealWheelGame.tsx` (lines 17-39):
- Spacebar calls `spin()` which has its own `canSpin` guard
- Input/textarea focus is checked to avoid conflicts with email typing
- Escape dismisses the result modal

### E6. localStorage Corruption — PASS

`loadWheelSession()` (lines 335-354) validates the parsed JSON:
- Checks for null/undefined
- Checks that it's an object
- Checks that `spins` is an array
- Returns null if validation fails (graceful degradation)
- Resets spins (but preserves email) on new day

### E7. Session Restoration Edge Case — PASS (minor note)

When restoring from localStorage, `INIT_SESSION` (useDealWheel.ts lines 57-83) counts paid spins vs respins correctly:
- `paidSpins = restoredSpins.filter(s => s.segment.tier !== "respin").length`
- `freeSpinsUsed = Math.min(paidSpins, FREE_SPINS)` — caps at 1
- `emailSpinsUsed = Math.max(0, paidSpins - FREE_SPINS)` — excess goes to email spins

**Minor note:** `queueMicrotask` is used (useDealWheel.ts line 291) to defer localStorage save until after React processes the `SPIN_COMPLETE` dispatch. This is a correct pattern, but there's a subtle race: `queueMicrotask` fires before the next render, so `stateRef.current` may not yet reflect the `SPIN_COMPLETE` update. However, since the new `prizesWon` array is constructed inside the reducer and React batches state updates, the actual write may use the old state. This is a **minor reliability concern** — the save could miss the latest spin result.

**Impact:** Low. On the next spin or email submit, `saveWheelSession` is called again with the correct state. The worst case is the last spin is lost if the user closes the tab immediately after spinning.

---

## Summary

| Category | Item | Result |
|----------|------|--------|
| **A. Wheel Mechanics** | Segment definition | PASS |
| | Random selection fairness | PASS |
| | Probability definition | PASS |
| | Visual landing accuracy | PASS |
| **B. Prize/Payout** | Prize awarding | PASS |
| | Payout calculation | PASS (N/A) |
| | All prizes functional | PASS |
| **C. Balance Impact** | Spin cost | PASS (N/A) |
| | Balance operations | PASS (N/A) |
| **D. Animation vs Logic** | Animation matches result | PASS |
| | Result pre-determined | PASS |
| | Visual mismatch potential | PASS |
| **E. Edge Cases** | Zero-spin guard | PASS |
| | Spam protection | PASS |
| | Rapid spin protection | PASS |
| | Respin auto-dismiss | PASS |
| | Keyboard safety | PASS |
| | localStorage corruption | PASS |
| | Session restoration | PASS (minor note) |
| **F. Spec vs Code** | Spec compliance | N/A (no spec exists) |

---

## Overall Verdict: ALL PASS

The Deal Wheel implementation is mathematically sound, uses cryptographically secure randomness, has consistent animation-to-logic coupling, and handles all tested edge cases correctly.

### Minor Recommendations (non-blocking)

1. **Create a spec file** (`DEALWHEEL_GAME_SPEC.md`) — consistent with other games
2. **localStorage save timing** — The `queueMicrotask` pattern in `useDealWheel.ts:291` could miss the latest result if the tab closes immediately. Consider saving the result directly (passing it as a parameter) rather than reading from state ref.
3. **Duplicate draw loops** — `DealWheel.tsx` has two `useEffect` blocks that both set up rAF draw loops (one on mount at line 152, one on phase change at line 46). The mount-based loop runs continuously; the phase-change loop is a restart mechanism. This is redundant but harmless — both read from refs and produce identical output. Could be simplified to a single loop.

---

*Audit complete. No critical or major issues found.*
