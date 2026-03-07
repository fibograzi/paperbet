# Limbo — Complete Game Specification for PaperBet.io

## 1. Game Overview

Limbo is an instant-result prediction game where the player sets a target multiplier and places a bet. The game generates a random crash point — if the crash point meets or exceeds the target, the player wins their bet multiplied by the target. If not, the bet is lost. There is no timing element, no manual cashout, and no waiting — results are instantaneous.

**Think of it as:** Crash without the suspense. Where Crash asks "when do I cash out?", Limbo asks "how high will it go?" — and answers immediately.

**Why it's popular in crypto casinos:** Limbo is the fastest game in any crypto casino. Rounds resolve in under 2 seconds (or instantly with skip-animation). This makes it the go-to game for high-volume grinders and auto-bet strategists. The simplicity — pick a number, bet, see result — makes it extremely accessible while the configurable target multiplier (1.01x to 1,000,000x) makes it endlessly customizable.

**Psychological hooks:** The speed creates a "just one more" loop stronger than any other game. The visible win-chance percentage creates an illusion of control ("I know I have a 49.5% chance"). The counter animation builds micro-tension even though the result is predetermined. Previous results create pattern-seeking behavior ("it hasn't gone above 5x in 20 rounds, it's due"). The ability to chase astronomical multipliers (1,000x+) with tiny bets appeals to lottery-ticket psychology.

---

## 2. Exact Game Mechanics

### 2.1 Step-by-Step Game Flow

1. Player sets **bet amount** (default: $1.00 paper money)
2. Player sets **target multiplier** (default: 2.00x)
3. Win chance is auto-displayed: `99 / target` percent
4. Potential payout is auto-displayed: `bet × target`
5. Player clicks **"Bet"**
6. Game generates a random crash point (pre-determined)
7. The result multiplier is displayed via rising counter animation (or instantly if animation is skipped)
8. **If result ≥ target:** WIN — player receives `bet × target`
9. **If result < target:** LOSS — player loses bet
10. Result is logged, stats update, next round can begin immediately

**Key difference from Crash:** There is NO rising-in-real-time multiplier to watch and NO cashout button. The player commits to a target BEFORE the round, and the result is revealed all at once.

### 2.2 Result Generation (Crash Point Formula)

**Identical to Crash game formula:**
```
crashPoint = Math.max(1.00, Math.floor(99 / (1 - R)) / 100)
```
Where `R` is a uniformly random number in [0, 0.99) generated via `crypto.getRandomValues()`.

This produces the same distribution as Crash:
- ~1% of results are 1.00x (instant floor)
- Low results are very common
- High results are exponentially rare
- The distribution is unbounded (theoretically infinite max)

### 2.3 Win Probability

For any target multiplier `T`:
```
P(win) = 99 / T     (expressed as percentage)
```

| Target Multiplier | Win Chance | Payout on $1 Bet |
|-------------------|-----------|------------------|
| 1.01x | 98.02% | $1.01 |
| 1.10x | 90.00% | $1.10 |
| 1.25x | 79.20% | $1.25 |
| 1.50x | 66.00% | $1.50 |
| 2.00x | 49.50% | $2.00 |
| 3.00x | 33.00% | $3.00 |
| 5.00x | 19.80% | $5.00 |
| 10.00x | 9.90% | $10.00 |
| 25.00x | 3.96% | $25.00 |
| 50.00x | 1.98% | $50.00 |
| 100.00x | 0.99% | $100.00 |
| 1,000.00x | 0.099% | $1,000.00 |
| 10,000.00x | 0.0099% | $10,000.00 |

### 2.4 House Edge & RTP

- **RTP: 99%** (1% house edge)
- Expected Value: `EV = bet × target × (99 / target / 100) = bet × 0.99`
- This means regardless of target multiplier chosen, the player expects to lose 1% long-term
- The house edge is baked into the `99` numerator in the probability formula (if it were 100, RTP would be 100%)
- Maximum result cap for our simulator: 10,000x (display cap; formula can theoretically produce higher)

### 2.5 Configurable Parameters

| Parameter | Range | Default | Step |
|-----------|-------|---------|------|
| Bet Amount | $0.10 – $1,000.00 | $1.00 | $0.10 |
| Target Multiplier | 1.01x – 10,000x | 2.00x | 0.01x |
| Win Chance | 0.0099% – 98.02% | 49.50% | Auto-calculated |
| Payout | $0.10 – $10,000,000 | $2.00 | Auto-calculated |

**Linked fields:** Target Multiplier and Win Chance are inversely linked. Changing one automatically recalculates the other:
```
winChance = 99 / targetMultiplier
targetMultiplier = 99 / winChance
```

---

## 3. Result Display & Formatting

### 3.1 Display Format

| Result Range | Format | Example |
|-------------|--------|---------|
| 1.00x – 9.99x | X.XXx | "2.47x" |
| 10.00x – 99.99x | XX.XXx | "47.83x" |
| 100.00x – 999.99x | XXX.XXx | "284.92x" |
| 1,000.00x+ | X,XXX.XXx | "1,284.50x" |

### 3.2 Result Color (based on win/loss, NOT result value)

**Primary color logic — relative to the player's target:**

| Condition | Result Color | Background Flash |
|-----------|-------------|-----------------|
| Result ≥ Target (WIN) | `#00E5A0` (green) | Subtle green flash |
| Result < Target (LOSS) | `#EF4444` (red) | Subtle red flash |

**Secondary color intensity — based on result magnitude:**

| Result Value | Text Effect |
|-------------|-------------|
| 1.00x | `#EF4444` (red), dim (instant floor — worst outcome) |
| 1.01x – 1.99x | Base color only |
| 2.00x – 4.99x | Base color + subtle glow |
| 5.00x – 9.99x | Base color + medium glow |
| 10.00x – 49.99x | Base color + strong glow + slight scale-up |
| 50.00x – 99.99x | Base color + pulsing glow + scale-up |
| 100.00x+ | Gold (`#F59E0B`) override + particle burst (regardless of win/loss) |

### 3.3 Win/Loss Indicator

Below the result multiplier:
- **WIN:** "+$X.XX" in `#00E5A0`, with "WON" label
- **LOSS:** "-$X.XX" in `#EF4444`, with "LOST" label
- **Near miss (result within 10% of target):** Additional "SO CLOSE!" text in `#F59E0B` — this drives replays

---

## 4. Visual Design Specification

### 4.1 Overall Layout

**Desktop (≥1024px) — 3-Column Layout:**
```
┌───────────────────────────────────────────────────────────────┐
│ [HEADER — sticky]                                             │
├────────────┬─────────────────────────┬────────────────────────┤
│            │                         │                        │
│  CONTROLS  │   RESULT DISPLAY        │  CASINO SIDEBAR        │
│  PANEL     │   (Main Game Area)      │  + STATS               │
│            │                         │                        │
│  Width:    │   Width: flex-1         │  Width: 320px          │
│  300px     │   Min: 400px            │                        │
│            │                         │                        │
│  - Bet Amt │   - Previous Results    │  - Casino Cards        │
│  - Target  │     (badge row)         │  - Session Stats       │
│  - Win %   │   - Animated Counter    │  - Bet History         │
│  - Payout  │     (big number)        │  - "What You Would     │
│  - Bet Btn │   - Win/Loss Display    │     Have Won"          │
│  - Auto    │   - Target Line         │                        │
│            │                         │                        │
└────────────┴─────────────────────────┴────────────────────────┘
```

**Mobile (<768px) — Single Column:**
```
┌─────────────────────────┐
│ PREVIOUS RESULTS (scroll)│
├─────────────────────────┤
│                          │
│   RESULT DISPLAY         │
│   (Big counter number)   │
│   Win/Loss indicator     │
│                          │
├─────────────────────────┤
│ CONTROLS (compact)       │
│ [Bet Amt] [Target Multi] │
│ [Win: 49.5%] [Pay: $2]  │
│ [======== BET ==========]│
├─────────────────────────┤
│ SESSION STATS (2x2)      │
├─────────────────────────┤
│ CASINO CARDS             │
├─────────────────────────┤
│ BET HISTORY              │
└─────────────────────────┘
```

### 4.2 The Result Display Area (Main Game Area)

**Container:**
- Background: `#0B0F1A` (seamless with page)
- Border: `#374151` border, rounded-xl
- Padding: 32px (desktop), 20px (mobile)
- Min-height: 300px (desktop), 200px (mobile)
- Position: relative (for particle effects and overlays)

**Background Elements:**
- Subtle radial gradient: dark center, slightly lighter edges
- Optional: very faint grid lines at 5% opacity (gives it a "digital readout" feel)
- The background should feel like a display panel / digital scoreboard

**The Target Line:**
- A thin horizontal dashed line positioned vertically in the result area
- Represents the player's target multiplier
- Color: `#F59E0B` (amber) at 50% opacity
- Label on the right edge: "Target: X.XXx" in `#F59E0B`, JetBrains Mono, 12px
- The counter animation number passes through this line (or doesn't) — creating visual drama
- Position: calculated proportionally based on target vs max expected result
  - For targets ≤ 2x: line at ~60% height
  - For targets 2x–10x: line at ~40% height
  - For targets 10x+: line at ~20% height (near the top — "reaching for it")

**The Result Counter (center stage):**
- Font: JetBrains Mono, 80px (desktop), 56px (mobile), Bold
- Position: centered both vertically and horizontally in the display area
- This is the LARGEST visual element on the page
- Color: transitions during animation (see §4.3)
- Text-shadow matching the text color at 40% opacity
- Suffix "x" in slightly smaller font (60px desktop, 40px mobile)

**Previous Results Row:**
- Position: across the top of the result display area, inside the border
- Horizontal row of badges (same as Crash spec)
- Each badge: rounded pill, height 28px, JetBrains Mono 12px bold
- Colors:
  - 1.00x: `#EF4444` bg at 15%, red text
  - 1.01x – 1.99x: `#374151` bg, `#9CA3AF` text
  - 2.00x – 9.99x: `#00E5A0` bg at 10%, green text
  - 10.00x – 99.99x: `#F97316` bg at 10%, orange text
  - 100.00x+: `#F59E0B` bg at 15%, gold text
- Shows last 20 results
- Scrollable horizontally on mobile
- New results animate in from the left, pushing older ones right

### 4.3 Animations & Transitions

**Result Counter Animation (Normal Mode):**

The counter performs a quick "spin-up" animation from 1.00x to the final result:

1. **Duration:** 800ms total
2. **Phase 1 — Spin (0–600ms):**
   - Counter rapidly cycles through random numbers (blur effect)
   - Numbers change every 50ms (12 changes total)
   - Color: `#9CA3AF` (neutral gray) during spin
   - Numbers shown are random but biased toward the final magnitude range
   - Slight scale pulse (1.0 → 1.02 → 1.0) each tick
3. **Phase 2 — Reveal (600–800ms):**
   - Counter snaps to final result
   - Scale: 0.9 → 1.1 → 1.0 (bounce effect, ease-out)
   - Color transitions to win (green) or loss (red)
   - Background flash: win = green at 5% opacity, loss = red at 5% opacity, 200ms fade
4. **Phase 3 — Settle (800ms+):**
   - Result holds for 1.5s before fading to idle (or immediately if auto-bet is running)
   - Win/loss text appears below: "+$2.00" or "-$1.00"
   - Profit text: scale 0 → 1.0, 200ms ease-out

**Alternative Animation — Rising Counter Mode:**

Optional mode the player can enable for more Crash-like visual drama:

1. Counter starts at 1.00x and rises toward the result
2. Speed: accelerates as it approaches the result (ease-in)
3. Duration: 1.0s for results ≤ 5x, 1.5s for results > 5x, 2.0s for results > 50x
4. Color transitions as the number climbs: white → green → cyan → orange → red → gold
5. When counter reaches the target line: brief flash of amber on the line
6. Counter continues past target (win) or stops short (loss)
7. Final number locks in with same bounce/reveal as normal mode

**Skip Animation Mode (Fast/Turbo):**
- Result appears instantly, no counter animation
- Just the final number with a quick fade-in (100ms)
- Essential for auto-bet at high speed

**Win Celebration Tiers:**

| Tier | Condition | Animation |
|------|-----------|-----------|
| Normal Win | Target ≤ 2x, result ≥ target | Green flash, profit display |
| Good Win | Target 2x–9.9x, result ≥ target | Green pulse, profit float-up, "NICE" text |
| Big Win | Target 10x–99x, result ≥ target | Orange/green burst, screen-edge glow, large profit display |
| Jackpot Win | Target ≥ 100x, result ≥ target | Gold particle explosion, screen shake (2px, 500ms), confetti, "JACKPOT" text scales up |
| Moon Shot | Result ≥ 1,000x (regardless of target) | Full gold particle explosion, pulsing gold glow on result, "TO THE MOON!" text |

**Loss Animation:**
- Result text in `#EF4444`, but NO dramatic animation
- Quick subtle red flash on background (100ms)
- Loss text appears in muted style
- Losses should feel quick and forgettable — encourages immediate replay

**Near Miss Animation (result within 10% of target, but loss):**
- Result shows in `#F59E0B` (amber) instead of red
- "SO CLOSE!" text flashes briefly below result
- Subtle shake (1px, 200ms) — frustration feedback drives replay

### 4.4 Idle State (Between Rounds)

When no round is active:
- Result display shows the last result at 50% opacity
- Or shows a pulsing "PLACE YOUR BET" text in `#6B7280`, DM Sans, 24px
- Target line remains visible as a reference
- Previous results row is always visible

---

## 5. Controls Panel Specification

### 5.1 Bet Amount Control

**Identical to Plinko/Crash/Mines** — same card layout, input, +/- buttons, quick-select.

| Parameter | Value |
|-----------|-------|
| Min Bet | $0.10 |
| Max Bet | $1,000.00 |
| Default | $1.00 |
| Step | $0.10 |

### 5.2 Target Multiplier Control

**Label:** "Target Multiplier" — DM Sans, 14px, `#9CA3AF`

**Input Field:**
- `#1F2937` background, `#374151` border, rounded-lg
- Text: JetBrains Mono, 18px, `#F9FAFB`, right-aligned
- Suffix: "x" in `#6B7280`
- Default: 2.00
- Min: 1.01, Max: 10,000
- Focus: ring-2 `#00E5A0` at 50% opacity

**+/- Buttons:** Same circular style as bet amount
- Step: 0.10x per click, hold for rapid increment
- Below 2x: step 0.01x for fine control
- Above 100x: step 1.0x for faster adjustment

**Quick-Select Row:**
- 4 buttons: "1.5x" | "2x" | "10x" | "100x"
- Same pill styling as bet amount quick-selects
- Click: instantly sets target multiplier and updates win chance

### 5.3 Win Chance Display (Linked to Target)

**Label:** "Win Chance" — DM Sans, 14px, `#9CA3AF`

**Display/Input:**
- Same input styling as target multiplier
- Text: JetBrains Mono, 18px
- Suffix: "%" in `#6B7280`
- Editable! Player can TYPE a win chance and the target multiplier auto-adjusts
- Formula: `winChance = 99 / targetMultiplier`

**Color by win chance:**
| Win Chance | Text Color |
|-----------|------------|
| 75%+ | `#00E5A0` (green — safe) |
| 50%–74.99% | `#F9FAFB` (white — moderate) |
| 25%–49.99% | `#F59E0B` (amber — risky) |
| 10%–24.99% | `#F97316` (orange — high risk) |
| < 10% | `#EF4444` (red — extreme risk) |

**Visual connector:** A subtle arrow or ↔ icon between Target Multiplier and Win Chance to indicate they are linked.

### 5.4 Payout Display

**Label:** "Payout on Win" — DM Sans, 14px, `#9CA3AF`

**Display (read-only):**
- Text: JetBrains Mono, 18px, `#F9FAFB`
- Prefix: "$"
- Formula: `payout = betAmount × targetMultiplier`
- Updates in real-time when bet or target changes
- Background: `#1F2937` (same as inputs, but not editable — slightly dimmer border)

### 5.5 Bet Button (Primary Action)

**Normal State:**
- Full width, height: 48px (desktop), 44px (mobile)
- Background: `#00E5A0`
- Text: "Bet" — DM Sans, 16px, bold, `#0B0F1A`
- Border-radius: 10px
- Box-shadow: `0 0 20px rgba(0, 229, 160, 0.2)`

**Hover:**
- Background: `#1AFFA8`
- Box-shadow intensifies

**Active/Pressed:**
- Scale: 0.98
- Background: `#00CC8E`

**During Animation (Disabled):**
- Background: `#374151`
- Text: "..." with animated ellipsis
- Re-enables when result animation completes (or instantly in skip-animation mode)

**Keyboard shortcut:** Spacebar or Enter triggers bet

### 5.6 Animation Speed Toggle

**Position:** Small toggle below the Bet button

**Three modes (segmented control):**
- **Normal** — Full counter animation (800ms)
- **Fast** — Abbreviated animation (300ms)
- **Skip** — Instant result (0ms animation)

**Styling:** Same as risk-level segmented control from Plinko spec
- Inactive: transparent bg, `#9CA3AF` text
- Active: `#00E5A0` bg at 15%, `#00E5A0` text

### 5.7 Auto-Bet System

**Toggle:** "Auto Bet" switch below animation toggle

**Auto-Bet Options:**
- Number of bets: 10 / 25 / 50 / 100 / ∞
- Speed: Normal (1 bet/2s) / Fast (1 bet/1s) / Turbo (1 bet/0.5s)
- On Win: Keep same bet / Increase by X% / Reset to base bet
- On Loss: Keep same bet / Increase by X% / Reset to base bet
- Stop on Profit ≥ $X: optional threshold
- Stop on Loss ≥ $X: optional threshold
- Stop on Win Multiplier ≥ Xx: optional (stop if result is above threshold)
- Change target: optional (on win/loss, adjust target multiplier)

**Visual Indicator:**
- Pulsing green dot + "Auto-betting" label
- Bet counter: "Bet 15 / 50"
- "Stop" button replaces "Bet" during auto-play
- During auto-bet, result display shows rapid-fire results

**Auto-bet behavior:**
1. Place bet automatically
2. Show result (animation speed based on setting)
3. Apply on-win/on-loss adjustments
4. Check stop conditions
5. Repeat or stop

---

## 6. Statistics & History Display

### 6.1 Session Statistics

**Same 2×2/1×4 grid as other games, Limbo-specific stats:**

| Stat | Format | Font |
|------|--------|------|
| Total Bets | "142 bets" | JetBrains Mono, 20px, `#F9FAFB` |
| Total Wagered | "$142.00" | JetBrains Mono, 20px, `#F9FAFB` |
| Net Profit | "+$18.40" or "-$12.50" | JetBrains Mono, 20px, green or red |
| Best Win | "847.30x ($847.30)" | JetBrains Mono, 20px, `#F59E0B` |

Each stat card: `#111827` bg, `#374151` border, rounded-lg, p-3
- Label: DM Sans, 12px, `#6B7280`
- Value: JetBrains Mono
- Update animation: number count-up/down over 300ms

**Additional stats (expandable "More Stats" section):**
- Win Rate (%)
- Average Result Multiplier
- Highest Result (regardless of win/loss)
- Current Win Streak
- Best Win Streak
- Average Target Used
- Biggest Loss
- Total Returns

### 6.2 Bet History Table

**Columns:**
| Column | Width | Alignment | Content |
|--------|-------|-----------|---------|
| # | 40px | Center | Row number (most recent first) |
| Bet | 80px | Right | "$1.00" — JetBrains Mono |
| Target | 80px | Right | "2.00x" — `#F59E0B` text |
| Result | 80px | Right | "3.47x" — green/red based on win/loss |
| Profit | 100px | Right | "+$1.00" green or "-$1.00" red |

**Behavior:**
- Shows last 25 bets (scrollable for more)
- New bets insert at top with slide-down animation (200ms)
- Alternating row backgrounds: `#0B0F1A` and `#111827`
- Hover: row highlights to `#1F2937`
- Win rows: left border accent in `#00E5A0` (2px)
- Loss rows: no left border accent

### 6.3 "What You Would Have Won" Display

**Trigger:** Appears after 10+ bets in a session (higher threshold than other games because Limbo rounds are faster)

**Layout:** Same as Plinko/Crash/Mines — prominent card with green border

**Content:**
```
"If you played with real money..."

$142.00 wagered → $159.30 returned

Net Profit: +$17.30

Biggest Win: 847.30x on a $1.00 bet = $847.30

Top casino for Limbo:
[Casino Card — e.g., Stake: 200% up to $2K]
[CTA: "Spin the Deal Wheel →"]
```

**Animation:** Slides in from right (desktop) or bottom (mobile)

---

## 7. Sound Design Notes (Visual Equivalents)

| Audio Cue (Real Casino) | Visual Replacement |
|------------------------|-------------------|
| Counter spin "whirring" | Numbers rapidly cycling (blur effect) during animation |
| Result reveal "slam" | Number snaps into place with scale bounce |
| Small win "ding" | Green flash on result + profit floats up |
| Big win "fanfare" | Gold particle burst + screen-edge glow |
| Loss "thud" | Brief red flash, muted — no dramatic feedback |
| Near miss "whoosh" | Amber flash + "SO CLOSE!" text |
| Auto-bet "tick" | Small pulse on bet counter |
| Button click "pop" | Button scale 0.95 → 1.0 micro-animation |

**Haptic Feedback (mobile):**
- Bet button: short vibration (50ms)
- Win: medium vibration (100ms)
- Big win (≥ 10x target): pattern vibration (100ms-50ms-100ms)
- Loss: no vibration (keep it forgettable)

---

## 8. Edge Cases & Error States

### 8.1 Result is 1.00x (Floor)

- ~1% of rounds generate 1.00x (the absolute minimum)
- Always a loss (minimum target is 1.01x)
- Display: "1.00x" in `#EF4444`, dim
- Counter animation: number barely moves from 1.00x, dies immediately
- Brief display: "Floor hit" text in `#6B7280`

### 8.2 Extremely High Results (>1,000x)

- Rare but exciting for any spectating player
- If result exceeds 1,000x: special "TO THE MOON!" celebration regardless of win/loss
- If the player's target was lower and they won: show both "You won X.XXx" AND "Result was Y,YYYx" to create "I should have aimed higher" regret → drives target increases

### 8.3 Target Multiplier Equals Result Exactly

- Count as a WIN (result ≥ target includes equality)
- Display should emphasize: "EXACT HIT!" in `#F59E0B`

### 8.4 Very Low Target (1.01x)

- 98% win chance — almost always wins
- Tiny profit per round ($0.01 on $1 bet)
- Common in auto-bet grind strategies
- Ensure the UI handles high-volume low-value results cleanly
- History table won't be exciting — consider grouping in auto-bet mode

### 8.5 Very High Target (10,000x)

- 0.0099% win chance — almost never wins
- When it DOES win: must be an absolutely spectacular celebration
- Counter animation should build maximum drama at high targets

### 8.6 Auto-Bet at Turbo Speed

- Results every 0.5 seconds = 120 bets per minute
- Skip all animation; show only: result number flash + profit/loss
- History table must handle rapid insertions (virtualized list)
- Stats update every bet but animation should batch (update display every 500ms)
- Memory management: only keep last 500 bets in memory, older bets summary only

### 8.7 Rapid Manual Clicking

- Debounce bet button: 200ms minimum between bets
- While animation is playing, queue at most 1 pending bet
- If skip-animation is enabled: no queue needed, instant re-bet

### 8.8 Browser Resize

- Result display area recalculates
- No persistent state to worry about (unlike grid or canvas games)
- Responsive text size for result counter

### 8.9 Linked Field Edge Cases

- Player types 0 in win chance → clamp to minimum (0.0099% → target 10,000x)
- Player types 100 in win chance → clamp to maximum (98.02% → target 1.01x)
- Player types 0.5 in target → clamp to minimum (1.01x)
- Non-numeric input → revert to previous valid value

---

## 9. Strategy Preset Specifications

### 9.1 Safe Grinder (Low Risk)
- Target: 1.10x (90% win chance)
- Flat bet
- Goal: very consistent small profits
- Stop on loss: 20× base bet
- Expected: many tiny wins, occasional loss wipes several wins

### 9.2 Coin Flip (Moderate)
- Target: 2.00x (49.5% win chance)
- Flat bet
- Most popular strategy — even-money feel
- Mathematically simple for players to understand

### 9.3 Sniper (High Risk)
- Target: 10.00x (9.9% win chance)
- Flat bet
- Big payoffs when they hit, but long losing streaks
- Stop on loss: 25× base bet

### 9.4 Moon Shot (Extreme)
- Target: 100.00x (0.99% win chance)
- Small bets ($0.10)
- Lottery-ticket approach: tiny bets, huge potential payout
- Stop on profit: 50× base bet (if a hit happens, take it)

### 9.5 Martingale
- Target: 2.00x
- On loss: double bet
- On win: reset to base bet
- Auto-stop at max bet ($1,000) or bankroll limit
- Warning: "Martingale can lead to rapid bankroll depletion"

### 9.6 Anti-Martingale (Paroli)
- Target: 2.00x
- On win: double bet
- On loss: reset to base bet
- Take profit after 3 consecutive wins (8× base bet if all hit)

### 9.7 D'Alembert
- On loss: increase bet by 1 unit ($0.10)
- On win: decrease bet by 1 unit (minimum: base bet)
- Gentler progression, smaller bankroll swings

### 9.8 Custom
- Player sets all parameters:
  - Target multiplier
  - On win: multiply bet by ___ / increase target by ___
  - On loss: multiply bet by ___ / decrease target by ___
  - Stop conditions (profit, loss, bet count)

**Strategy Controls Location:** Collapsible panel below auto-bet settings
**Strategy Active Indicator:** Small badge on bet amount field showing active strategy name

---

## 10. Conversion Integration Points

### 10.1 Casino Recommendation Sidebar (Desktop)
- Position: right column, below session stats
- Content: 2-3 casino cards showing Limbo-specific offers
- Filter: only show casinos from CASINOS constant that have "limbo" in their games array
- Currently: Stake, BC.Game (based on constants.ts)
- Each card: casino name (brand colored), offer, "Claim Deal →" link to /deals

### 10.2 "Spin the Deal Wheel" CTA
- Position: below casino cards in sidebar
- Trigger: always visible, but becomes PROMINENT (pulsing border, larger text) after 20+ bets
- Higher threshold than other games because Limbo bets are faster
- Style: `#00E5A0` border, `#111827` bg, with wheel icon
- Text: "Spin the Deal Wheel" + "Win exclusive Limbo bonuses"

### 10.3 "What You Would Have Won" Display
- Trigger: after 10+ bets
- Position: sidebar on desktop, inline card on mobile
- Shows real money equivalent of paper money results
- Emphasizes big wins: "Your 847.30x hit would have paid $847.30 on a $1 bet at Stake"
- Includes casino recommendation and CTA to /deals
- Updates in real-time after each bet

### 10.4 Post-Session Nudge
- Trigger: when user hasn't placed a bet for 60 seconds after 20+ bets
- Subtle slide-in from bottom
- "Ready to play for real? Spin the Deal Wheel to unlock exclusive bonuses at top Limbo casinos."
- Dismissable, only shown once per session

### 10.5 Integration Rules
- CTAs should NEVER interrupt a result animation
- Casino links must open in new tab: `target="_blank" rel="noopener noreferrer"`
- Responsible gambling disclaimer must be visible on the page at all times
- All conversion elements should feel like helpful suggestions, not pushy sales
- Because Limbo is so fast, conversion elements should NOT update with every bet — update max every 5 bets to prevent visual noise

---

## 11. Technical Implementation Notes

### 11.1 Rendering Approach
- **Result display:** Pure HTML/CSS — no Canvas needed (unlike Plinko/Crash)
- **Counter animation:** CSS + JS `requestAnimationFrame` for smooth number cycling
- **Particle effects:** CSS keyframes or lightweight canvas overlay for celebrations
- **Previous results:** HTML badges
- **Controls:** Standard React components

### 11.2 Game Loop Architecture
```
Each round:
  1. Read bet amount and target from state
  2. Generate crash point: Math.max(1, Math.floor(99 / (1 - Math.random() * 0.99)) / 100)
     (Use crypto.getRandomValues() for proper randomness)
  3. Determine win/loss: result >= target
  4. Start result animation (or skip if fast mode)
  5. After animation completes:
     - Update session stats
     - Add to bet history
     - If auto-bet: apply strategy adjustments, check stop conditions, start next round
     - If manual: return to idle state
```

### 11.3 Performance Targets
- Result animation: 60fps (CSS transforms handle this natively)
- Auto-bet turbo: handle 120 bets/minute without memory leaks
- State update: < 5ms per bet (no blocking renders)
- History list: virtualized (only render visible rows)
- Particle effects: max 50 particles per celebration, auto-cleanup

### 11.4 State Management
```typescript
interface LimboState {
  // Round
  phase: 'IDLE' | 'ANIMATING' | 'RESULT';
  betAmount: number;
  targetMultiplier: number;
  currentResult: number | null;
  isWin: boolean | null;

  // Animation
  animationSpeed: 'normal' | 'fast' | 'skip';

  // Auto-bet
  autoBetEnabled: boolean;
  autoBetCount: number;        // 0 = infinite
  autoBetCurrent: number;
  autoBetSpeed: 'normal' | 'fast' | 'turbo';
  onWinAction: 'same' | 'increase' | 'reset';
  onWinValue: number;          // percentage increase
  onLossAction: 'same' | 'increase' | 'reset';
  onLossValue: number;
  stopOnProfit: number | null;
  stopOnLoss: number | null;

  // Session
  stats: SessionStats;
  history: BetResult[];        // last 500
}
```

### 11.5 File Structure Suggestion
```
components/games/limbo/
├── LimboGame.tsx             # Main component, orchestrates layout
├── LimboResultDisplay.tsx    # Central result area (counter animation + celebrations)
├── LimboPreviousResults.tsx  # Previous round badges
├── LimboControls.tsx         # Bet amount, target, win chance, payout, bet button
├── LimboAutoPlay.tsx         # Auto-bet configuration panel
├── LimboStats.tsx            # Session statistics
├── LimboBetHistory.tsx       # Bet history table
├── LimboSidebar.tsx          # Casino cards + conversion CTAs
├── useLimboGame.ts           # Game logic hook (result generation, state machine)
├── limboAnimation.ts         # Counter animation utilities + particle effects
├── limboCalculator.ts        # Win chance / target / payout calculations
└── limboTypes.ts             # TypeScript types specific to Limbo
```

### 11.6 Key Derived Types
```typescript
// In limboTypes.ts
export interface LimboRound {
  id: string;
  betAmount: number;
  targetMultiplier: number;
  resultMultiplier: number;
  isWin: boolean;
  profit: number;              // positive for win, negative for loss
  timestamp: number;
}

export type AnimationSpeed = 'normal' | 'fast' | 'skip';
export type AutoBetSpeed = 'normal' | 'fast' | 'turbo';
export type BetAdjustAction = 'same' | 'increase' | 'reset';
```

---

## 12. Accessibility

- Bet button: keyboard accessible (Spacebar / Enter)
- Target multiplier input: keyboard navigable, arrow keys to adjust
- Win chance input: same keyboard behavior
- Result announcement: `aria-live="assertive"` region announces "Result: X.XXx. You won/lost $X.XX"
- Previous results: `role="list"` with each badge as `role="listitem"`
- Auto-bet controls: proper `aria-label` on all toggle switches
- Animation speed control: `role="radiogroup"` with `aria-checked`
- Reduced motion (`prefers-reduced-motion`):
  - Skip counter animation entirely — show result instantly
  - Disable particle effects
  - Disable screen flash/shake
  - Keep only color changes and text updates
- Color contrast: all text meets WCAG AA (4.5:1 minimum)
- Tab order: Bet Amount → Target → Win Chance → Bet Button (logical flow)

---

## 13. Responsible Gambling

**Footer disclaimer (always visible):**
> "18+ | Gambling involves risk. Only bet what you can afford to lose. PaperBet.io is a free simulator for educational purposes. We are not a gambling site."

**Session limit indicator:**
- After 200 bets in a session (higher than other games — Limbo is fast), show a gentle reminder: "You've played 200 rounds. Remember, this is practice mode."
- Non-intrusive: small banner below the controls panel, dismissable

**Speed limit:**
- Auto-bet has a minimum 500ms gap between rounds even in Turbo mode
- After 500 consecutive auto-bets, auto-bet pauses and requires manual re-start
- This prevents infinite unattended sessions

**Win chance display:**
- The always-visible win chance percentage serves as built-in responsible gambling education
- Players can see exactly how unlikely their target is — no hidden odds
