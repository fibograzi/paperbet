# Dice — Complete Game Specification for PaperBet.io

## 1. Game Overview

Dice is a number-prediction game where the player bets whether a randomly generated number (0.00 to 99.99) will land **over** or **under** a chosen target threshold. The player controls a slider to set their target, which dynamically adjusts both the win chance and the payout multiplier. Results are instant — each round resolves in under a second.

**Think of it as:** A pure probability machine. No animations to watch (like Crash), no boards to reveal (like Mines), no passive outcomes (like Plinko). Dice is raw math — pick your odds, place your bet, see the result. The slider gives players an unmatched sense of control over their risk/reward ratio.

**Why it's popular in crypto casinos:** Dice is the original crypto casino game and remains the highest-volume game across platforms like Stake, BC.Game, and Primedice. Its appeal is simplicity: one slider, one click, instant result. The continuous win-chance spectrum (0.01% to 98%) means every player finds their comfort zone. Auto-bet strategies (Martingale, Paroli) are easy to configure, making Dice the preferred game for system-testing and high-volume grinding.

**Psychological hooks:** The visible slider creates an illusion of precision control ("I chose exactly 47.5% odds"). The inversely-linked multiplier and win chance create a constant temptation to "push the slider a little higher for more reward." The speed enables rapid-fire sessions where losses blur together and wins feel frequent. The Roll Over / Roll Under toggle adds a "second dimension" that feels like a strategic choice (even though mathematically it's symmetric). Previous results create pattern-seeking behavior ("the last 5 rolls were under 50, it must swing back").

---

## 2. Exact Game Mechanics

### 2.1 Step-by-Step Game Flow

1. Player sets **bet amount** (default: $1.00 paper money)
2. Player adjusts the **slider** to set a target number (0.01 to 98.00, default: 50.00)
3. Player selects **Roll Over** or **Roll Under** (default: Roll Over)
4. **Win Chance** and **Multiplier** auto-update based on slider position and direction
5. Player clicks **"Roll"**
6. Game generates a random number between 0.00 and 99.99 (inclusive)
7. Result is displayed on the slider bar with animation
8. **If Roll Over and result > target:** WIN — player receives `bet × multiplier`
9. **If Roll Over and result ≤ target:** LOSS — player loses bet
10. **If Roll Under and result < target:** WIN — player receives `bet × multiplier`
11. **If Roll Under and result ≥ target:** LOSS — player loses bet
12. Stats update, result logged, next round can begin immediately

### 2.2 Number Generation

- Random number: uniformly distributed in [0.00, 99.99] with 2 decimal precision
- Total possible outcomes: 10,000 (0.00, 0.01, 0.02, ... 99.98, 99.99)
- Generated using `crypto.getRandomValues()` for provably-fair-style randomness
- Result is determined BEFORE any animation begins

### 2.3 Win Chance Calculation

**Roll Over target T:**
```
winChance = (99.99 - T) / 100 × 100%
```
Simplified: `winChance% = 99.99 - T`

Example: Roll Over 50.00 → win chance = 99.99 - 50.00 = 49.99%
(Numbers 50.01 through 99.99 win = 4,999 out of 10,000 outcomes)

**Roll Under target T:**
```
winChance = T / 100 × 100%
```
Simplified: `winChance% = T`

Example: Roll Under 50.00 → win chance = 50.00%
(Numbers 0.00 through 49.99 win = 5,000 out of 10,000 outcomes)

**Edge case note:** The boundary number (T itself) is a LOSS for both Roll Over and Roll Under:
- Roll Over T: result must be STRICTLY greater than T
- Roll Under T: result must be STRICTLY less than T
- If result equals T exactly: always a loss

### 2.4 Multiplier Formula

```
multiplier = 99 / winChance
```

Where `winChance` is expressed as a percentage (not decimal) and the `99` represents the 99% RTP (1% house edge).

**Roll Over examples:**
| Target (Roll Over) | Win Chance | Multiplier |
|--------------------|-----------|------------|
| 2.00 | 97.99% | 1.0103x |
| 10.00 | 89.99% | 1.1001x |
| 25.00 | 74.99% | 1.3202x |
| 33.33 | 66.66% | 1.4851x |
| 50.00 | 49.99% | 1.9804x |
| 66.66 | 33.33% | 2.9703x |
| 75.00 | 24.99% | 3.9616x |
| 90.00 | 9.99% | 9.9099x |
| 95.00 | 4.99% | 19.8397x |
| 98.00 | 1.99% | 49.7487x |
| 98.99 | 1.00% | 99.0000x |

**Roll Under examples:**
| Target (Roll Under) | Win Chance | Multiplier |
|---------------------|-----------|------------|
| 98.00 | 98.00% | 1.0102x |
| 75.00 | 75.00% | 1.3200x |
| 50.00 | 50.00% | 1.9800x |
| 25.00 | 25.00% | 3.9600x |
| 10.00 | 10.00% | 9.9000x |
| 5.00 | 5.00% | 19.8000x |
| 2.00 | 2.00% | 49.5000x |
| 1.00 | 1.00% | 99.0000x |
| 0.10 | 0.10% | 990.0000x |
| 0.01 | 0.01% | 9,900.00x |

### 2.5 House Edge & RTP

- **RTP: 99%** (1% house edge)
- The `99` in the multiplier formula IS the house edge (a fair game would use `100`)
- EV = `bet × multiplier × (winChance / 100)` = `bet × 99 / winChance × winChance / 100` = `bet × 0.99`
- This holds for ANY target and ANY direction — the house edge is constant
- Maximum multiplier: **9,900x** (at 0.01% win chance — rolling under 0.01 or over 99.98)
- Minimum multiplier: **~1.0102x** (at ~98% win chance)

### 2.6 Configurable Parameters

| Parameter | Range | Default | Step |
|-----------|-------|---------|------|
| Bet Amount | $0.10 – $1,000.00 | $1.00 | $0.10 |
| Target Number | 0.01 – 98.00 | 50.00 | 0.01 |
| Direction | Roll Over / Roll Under | Roll Over | Toggle |
| Win Chance | 0.01% – 98.00% | 49.99% | 0.01% |
| Multiplier | 1.0102x – 9,900x | 1.9804x | Auto-calculated |

**Linked fields (4-way sync):**
All four game parameters (target, direction, win chance, multiplier) are interconnected. Changing ANY one recalculates all others:
- Change **target** → updates win chance and multiplier
- Change **direction** → recalculates win chance based on same target
- Change **win chance** → moves slider to matching target position
- Change **multiplier** → reverse-calculates win chance → moves slider

---

## 3. Visual Design Specification

### 3.1 Overall Layout

**Desktop (≥1024px) — 3-Column Layout:**
```
┌───────────────────────────────────────────────────────────────┐
│ [HEADER — sticky]                                             │
├────────────┬─────────────────────────┬────────────────────────┤
│            │                         │                        │
│  CONTROLS  │   DICE GAME AREA        │  CASINO SIDEBAR        │
│  PANEL     │                         │  + STATS               │
│            │   ┌─────────────────┐   │                        │
│  Width:    │   │ Previous Results│   │  Width: 320px          │
│  300px     │   │ (badge row)     │   │                        │
│            │   ├─────────────────┤   │  - Casino Cards        │
│  - Bet Amt │   │                 │   │  - Session Stats       │
│  - Roll Btn│   │  RESULT NUMBER  │   │  - Bet History         │
│  - Auto    │   │  (big display)  │   │  - "What You Would     │
│            │   │                 │   │     Have Won"          │
│            │   ├─────────────────┤   │                        │
│            │   │ ═══════●═══════ │   │                        │
│            │   │   SLIDER BAR    │   │                        │
│            │   ├─────────────────┤   │                        │
│            │   │ Target │ Win %  │   │                        │
│            │   │ Multi  │ Payout │   │                        │
│            │   │ [Over] [Under]  │   │                        │
│            │   └─────────────────┘   │                        │
│            │                         │                        │
└────────────┴─────────────────────────┴────────────────────────┘
```

**Mobile (<768px) — Single Column:**
```
┌─────────────────────────┐
│ PREVIOUS RESULTS (scroll)│
├─────────────────────────┤
│                          │
│   RESULT NUMBER          │
│   (big display)          │
│                          │
├─────────────────────────┤
│ ═════════●═════════      │
│     SLIDER BAR           │
├─────────────────────────┤
│ [Target] [Win%] [Multi]  │
│ [Roll Over] [Roll Under] │
├─────────────────────────┤
│ CONTROLS (compact)       │
│ [Bet Amount]             │
│ [======== ROLL =========]│
├─────────────────────────┤
│ SESSION STATS (2x2)      │
├─────────────────────────┤
│ CASINO CARDS             │
├─────────────────────────┤
│ BET HISTORY              │
└─────────────────────────┘
```

### 3.2 The Slider Bar (Core Visual Element)

The slider bar is the **signature UI element** of Dice — it's what makes this game visually distinctive from Limbo (which looks similar on paper but feels completely different).

**Container:**
- Full width of game area
- Height: 56px (desktop), 48px (mobile)
- Background: `#1F2937` (elevated surface)
- Border: 1px `#374151`
- Border-radius: 12px
- Padding: 8px horizontal

**The Bar Track:**
- Height: 12px, rounded-full
- Split into two colored zones by the slider position:
  - **Winning zone:** `#00E5A0` (green) — the range where the result means a WIN
  - **Losing zone:** `#EF4444` (red) at 60% opacity — the range where the result means a LOSS
- Roll Over: green is to the RIGHT of the slider, red to the LEFT
- Roll Under: green is to the LEFT of the slider, red to the RIGHT
- The bar visually shows the probability split — a 75% win chance means 75% of the bar is green

**The Slider Thumb:**
- Shape: circle, 28px diameter (desktop), 24px (mobile)
- Fill: white (`#F9FAFB`)
- Border: 3px solid `#00E5A0` (matches the accent)
- Shadow: `0 2px 8px rgba(0, 0, 0, 0.3)` for subtle depth
- Hover: border becomes `#1AFFA8`, shadow intensifies
- Active (dragging): scale 1.1, border becomes 4px
- Cursor: grab (hover), grabbing (dragging)

**Scale Labels:**
- Below the bar: "0" on the left, "25", "50", "75", "100" evenly spaced
- Font: JetBrains Mono, 11px, `#6B7280`
- Tick marks: small vertical lines (4px height) at each label position

**Target Number Display:**
- Above the slider thumb: floating label showing the exact target value
- Font: JetBrains Mono, 14px, bold, `#F9FAFB`
- Background: `#374151`, rounded-md, px-2 py-1
- Small downward-pointing triangle connecting to the thumb
- Always visible while interacting with the slider

**Result Indicator (after roll):**
- A vertical line/marker appears on the bar at the exact position where the result landed
- Color: bright white (`#F9FAFB`) with glow
- Width: 3px, full height of the bar
- Appears with a quick slide-in animation from the left or a "bounce" to position
- If result is in the green zone: marker has a green glow pulse
- If result is in the red zone: marker has a red glow pulse
- Label above the marker: "XX.XX" showing the exact result
- The result marker stays visible until the next roll

### 3.3 The Result Display (Above Slider)

**Position:** Centered above the slider bar, within the game area container

**Container:**
- Background: `#0B0F1A`
- Border: `#374151`, rounded-xl
- Padding: 24px (desktop), 16px (mobile)
- Min-height: 160px (desktop), 120px (mobile)

**Result Number:**
- Font: JetBrains Mono, 72px (desktop), 48px (mobile), Bold
- Position: centered
- Color:
  - WIN: `#00E5A0` (green)
  - LOSS: `#EF4444` (red)
- Format: "XX.XX" (always 2 decimal places)
- Text-shadow: matching color at 30% opacity

**Profit/Loss Display (below result number):**
- WIN: "+$X.XX" in `#00E5A0`, JetBrains Mono, 24px
- LOSS: "-$X.XX" in `#EF4444`, JetBrains Mono, 24px
- Appears 100ms after result number

**Idle State:**
- Shows last result at 40% opacity
- Or pulsing "ROLL THE DICE" in `#6B7280`, DM Sans, 20px

### 3.4 The Game Parameters Row (Below Slider)

**Layout:** Horizontal row of 4 linked input fields + direction toggle

**Desktop — full row:**
```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────────┐
│  Target   │  │Win Chance│  │Multiplier│  │  Payout  │  │[Over]  ⟷  [Under]│
│  50.00    │  │ 49.99%   │  │ 1.9804x  │  │  $1.98   │  │                    │
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └────────────────────┘
```

**Mobile — 2x2 grid + toggle:**
```
┌────────────┬────────────┐
│  Target    │ Win Chance  │
│  50.00     │  49.99%     │
├────────────┼────────────┤
│ Multiplier │  Payout     │
│  1.9804x   │  $1.98      │
├────────────┴────────────┤
│  [Roll Over] [Roll Under]│
└─────────────────────────┘
```

**Each Field:**
- Card: `#111827` bg, `#374151` border, rounded-lg, p-3
- Label: DM Sans, 12px, `#6B7280` (above)
- Value: JetBrains Mono, 16px, `#F9FAFB`
- Target, Win Chance, Multiplier: EDITABLE (click to type, updates all linked fields)
- Payout: READ-ONLY (auto-calculated from bet × multiplier)
- Focus ring: `#00E5A0` at 50% opacity

**Roll Over / Roll Under Toggle:**
- Segmented control with two options
- Container: `#1F2937` bg, rounded-lg, p-1
- Active segment: `#00E5A0` bg at 15%, `#00E5A0` text
- Inactive segment: transparent bg, `#9CA3AF` text
- Font: DM Sans, 14px, semibold
- Transition: 200ms ease
- When toggled: slider colors flip (green/red zones swap), win chance and multiplier recalculate

**Swap Button (between Over/Under):**
- Small "⟷" icon button between the two segments
- Clicking it is equivalent to toggling direction AND mirroring the target
- Example: Roll Over 30 (70% win) → Roll Under 70 (70% win, same odds)
- This preserves the player's intended risk level while switching direction

### 3.5 Animations & Transitions

**Slider Drag Animation:**
- Green/red zones resize smoothly in real-time as slider is dragged
- All linked fields update in real-time (60fps)
- No lag or jumps — smooth CSS transitions on zone widths

**Roll Result Animation (Normal Mode):**
1. **Duration:** 600ms total
2. **Phase 1 — Anticipation (0–100ms):**
   - Slider bar pulses (subtle brightness increase)
   - Result display clears, shows spinning/blur placeholder
3. **Phase 2 — Travel (100–400ms):**
   - A glowing dot/marker travels along the slider bar from one end
   - Direction: from left to right (or right to left, alternating randomly for variety)
   - The dot moves with easing: fast start, decelerates, lands at final position
   - Trail: brief glow trail behind the moving dot (3 trailing positions at decreasing opacity)
4. **Phase 3 — Landing (400–600ms):**
   - Dot snaps to final position with a micro-bounce
   - Marker line appears at result position
   - Zone flash: if win, green zone briefly brightens; if loss, red zone briefly brightens
   - Result number appears in display with scale bounce (0.8 → 1.05 → 1.0)
5. **Phase 4 — Settle (600ms+):**
   - Profit/loss text fades in below result
   - Result marker remains on slider
   - Ready for next roll

**Skip Animation Mode (Fast):**
- Result marker appears instantly at position
- Number shows immediately with quick fade-in (100ms)
- No traveling dot or anticipation

**Win Celebration Tiers:**

| Tier | Condition | Animation |
|------|-----------|-----------|
| Small Win | Multiplier < 2x | Green zone pulses, profit shown |
| Good Win | 2x ≤ multiplier < 10x | Green flash, profit floats up, marker glows |
| Big Win | 10x ≤ multiplier < 100x | Green/gold burst from marker position, "NICE!" text |
| Jackpot | Multiplier ≥ 100x | Gold particle explosion from marker, screen shake, full confetti, result scales up large |

**Loss Animation:**
- Red zone briefly dims
- Result shows in red, muted
- No dramatic animation — quick, forgettable

**Direction Toggle Animation:**
- Green and red zones smoothly swap sides (300ms transition)
- Slider thumb stays in place, but the zones cross over like a fluid animation
- All numbers recalculate with a subtle counter-animation

### 3.6 Previous Results Row

**Position:** Across the top of the game area (desktop) or above the result display (mobile)

**Each Badge:**
- Rounded pill, height: 28px
- Font: JetBrains Mono, 12px, bold
- Shows the result number: "47.83", "02.14", "99.01"
- Color: green bg at 10% if that roll was a WIN for the player, red bg at 10% if LOSS
- Note: color is relative to what the player bet, not absolute
- Shows last 20 results
- Horizontal scroll on mobile
- New results animate in from the left

**Pattern Indicator (optional enhancement):**
- Below the badges: tiny dots showing win/loss streak (green dot = win, red = loss)
- Shows at-a-glance streak patterns

---

## 4. Controls Panel Specification

### 4.1 Bet Amount Control

**Identical to all other games** — same card layout, input field, +/- buttons, quick-select buttons (½, 2×, Min, Max).

| Parameter | Value |
|-----------|-------|
| Min Bet | $0.10 |
| Max Bet | $1,000.00 |
| Default | $1.00 |
| Step | $0.10 |

### 4.2 Roll Button (Primary Action)

**Normal State:**
- Full width within controls panel
- Height: 48px (desktop), 44px (mobile)
- Background: `#00E5A0`
- Text: "Roll" — DM Sans, 16px, bold, `#0B0F1A`
- Icon: 🎲 dice icon (Lucide: `Dice5` or `Dices`) to the left of text
- Border-radius: 10px
- Box-shadow: `0 0 20px rgba(0, 229, 160, 0.2)`

**Hover:**
- Background: `#1AFFA8`
- Box-shadow intensifies

**Active/Pressed:**
- Scale: 0.98
- Background: `#00CC8E`

**During Roll Animation (Disabled):**
- Background: `#374151`
- Text: "Rolling..." with animated ellipsis
- Duration: only disabled for animation length (~600ms in normal mode, ~100ms in fast)

**Keyboard shortcut:** Spacebar or Enter triggers roll

### 4.3 Animation Speed Toggle

**Position:** Small toggle below Roll button

**Two modes:**
- **Normal** — Full slider animation (600ms)
- **Fast** — Instant result (100ms)

Same segmented control styling as Limbo spec.

### 4.4 Auto-Bet System

**Toggle:** "Auto Roll" switch below animation toggle

**Auto-Bet Options:**
- Number of rolls: 10 / 25 / 50 / 100 / 500 / ∞
- Speed: Normal (1 roll/1.5s) / Fast (1 roll/0.8s) / Turbo (1 roll/0.3s)
- **On Win adjustments:**
  - Bet amount: Keep same / Increase by X% / Reset to base
  - Target: Keep same / Increase by X (riskier) / Decrease by X (safer)
- **On Loss adjustments:**
  - Bet amount: Keep same / Increase by X% / Reset to base
  - Target: Keep same / Increase by X / Decrease by X
- Stop on Profit ≥ $X
- Stop on Loss ≥ $X
- **Switch direction on loss:** toggle (Roll Over → Roll Under after each loss)
- **Switch direction on win:** toggle

**Advanced Conditions (collapsible panel):**
- Stop on win streak ≥ N
- Stop on loss streak ≥ N
- Increase bet after N consecutive losses (delayed Martingale)
- Reset bet after N consecutive wins

**Visual Indicator:**
- Pulsing green dot + "Auto-rolling" label
- Roll counter: "Roll 47 / 100"
- "Stop" button replaces "Roll" during auto-bet
- Results flash rapidly during turbo auto-bet

**Auto-bet behavior:**
1. Place roll automatically
2. Show result (speed based on setting)
3. Apply on-win/on-loss adjustments to bet AND target
4. Check stop conditions
5. Repeat or stop

---

## 5. Statistics & History Display

### 5.1 Session Statistics

| Stat | Format | Font |
|------|--------|------|
| Total Rolls | "247 rolls" | JetBrains Mono, 20px, `#F9FAFB` |
| Total Wagered | "$247.00" | JetBrains Mono, 20px, `#F9FAFB` |
| Net Profit | "+$23.40" or "-$15.20" | JetBrains Mono, 20px, green or red |
| Best Win | "98.72x ($98.72)" | JetBrains Mono, 20px, `#F59E0B` |

Each stat card: `#111827` bg, `#374151` border, rounded-lg, p-3
- Label: DM Sans, 12px, `#6B7280`
- Value: JetBrains Mono
- Update animation: number count-up/down over 300ms

**Additional stats (expandable "More Stats" section):**
- Win Rate (%)
- Average Multiplier Played
- Highest Result Rolled (regardless of bet)
- Lowest Result Rolled
- Current Win/Loss Streak
- Best Win Streak
- Average Roll Result
- Total Returns
- Biggest Single Loss

### 5.2 Bet History Table

**Columns:**
| Column | Width | Alignment | Content |
|--------|-------|-----------|---------|
| # | 40px | Center | Row number |
| Bet | 80px | Right | "$1.00" — JetBrains Mono |
| Target | 70px | Right | "50.00" — `#F59E0B` |
| Dir | 50px | Center | "Over" / "Under" badge |
| Roll | 70px | Right | "67.42" — green if win, red if loss |
| Multi | 70px | Right | "1.98x" |
| Profit | 90px | Right | "+$0.98" green or "-$1.00" red |

**Direction Badge Styling:**
- "Over": small pill, `#00B4D8` bg at 15%, `#00B4D8` text
- "Under": small pill, `#F97316` bg at 15%, `#F97316` text

**Behavior:**
- Shows last 50 bets (higher than other games — Dice generates rapid history)
- New bets insert at top with slide-down animation (200ms)
- Alternating row backgrounds: `#0B0F1A` and `#111827`
- Hover: row highlights to `#1F2937`
- Win rows: left border accent in `#00E5A0` (2px)

### 5.3 "What You Would Have Won" Display

**Trigger:** Appears after 15+ rolls (higher threshold — Dice is fast)

**Content:**
```
"If you played with real money..."

$247.00 wagered → $270.40 returned

Net Profit: +$23.40

Top casino for Dice:
[Casino Card — e.g., Stake: 200% up to $2K]
[CTA: "Spin the Deal Wheel →"]
```

---

## 6. Sound Design Notes (Visual Equivalents)

| Audio Cue (Real Casino) | Visual Replacement |
|------------------------|-------------------|
| Dice roll "rattle" | Traveling dot animation across slider bar |
| Result "slam" | Marker snaps to position with bounce |
| Small win "ding" | Green zone pulse + profit text |
| Big win "fanfare" | Gold burst from marker + screen-edge glow |
| Loss "thud" | Brief red dim, muted — quick and forgettable |
| Slider drag "click" | Real-time zone color update (satisfying visual feedback) |
| Auto-roll "tick" | Small pulse on roll counter |
| Direction switch "flip" | Green/red zone cross-over animation |

**Haptic Feedback (mobile):**
- Roll button: short vibration (50ms)
- Win result: medium vibration (80ms)
- Big win (≥ 10x): pattern vibration (100ms-50ms-100ms)
- Slider drag: subtle continuous vibration on some devices
- Loss: no vibration

---

## 7. Edge Cases & Error States

### 7.1 Result Equals Target Exactly

- Always counted as a LOSS (for both Over and Under)
- Example: Target 50.00, Roll Over, Result = 50.00 → LOSS
- Display message: "On the line! Bad luck." in `#F59E0B`
- This is by design — prevents ambiguity and slightly favors the house

### 7.2 Extreme Slider Positions

**Near 0 (e.g., target = 0.50, Roll Under):**
- Win chance: 0.50%
- Multiplier: 198x
- Very rare wins but massive payoffs
- Slider is almost entirely red with a sliver of green on the far left

**Near 100 (e.g., target = 97.00, Roll Over):**
- Win chance: 2.99%
- Multiplier: 33.11x
- Slider is almost entirely red with a sliver of green on the far right

**At absolute extremes:**
- Target 0.01, Roll Under: 0.01% win chance, 9,900x multiplier
- Target 98.00, Roll Over: 1.99% win chance, 49.75x multiplier
- Target CANNOT go below 0.01 or above 98.00 (ensures win chance stays in 0.01%–98.00% range)

### 7.3 Rapid Manual Clicking

- Roll button debounce: 200ms minimum between rolls
- Queue at most 1 pending roll during animation
- If fast mode: minimal debounce needed (~100ms)

### 7.4 Auto-Bet Edge Cases

- If Martingale doubles bet above max ($1,000): auto-stop with warning
- If bankroll reaches $0 during auto-bet: stop immediately
- Direction-switching strategies: ensure slider zone colors update correctly each roll
- Very high roll counts (500+): ensure no memory leak in history — cap at 500 entries

### 7.5 Slider Precision

- Must support 0.01 precision for fine control
- On mobile: slider drag might be imprecise — provide manual input fields as alternative
- Keyboard: arrow keys adjust slider by 0.01 (fine), Shift+arrow by 1.00 (coarse)
- Touch: provide +/- buttons alongside the slider for precise mobile adjustment

### 7.6 Linked Field Edge Cases

- Player types multiplier of 0: clamp to minimum (1.0102x)
- Player types multiplier of 99999: clamp to maximum (9,900x)
- Player types win chance of 0%: clamp to 0.01%
- Player types win chance of 100%: clamp to 98.00%
- Non-numeric input: revert to previous valid value
- Rapid typing in linked fields: debounce recalculation by 100ms

### 7.7 Browser Resize

- Slider bar recalculates width
- Result marker repositions proportionally
- Touch targets remain adequate on resize

---

## 8. Strategy Preset Specifications

### 8.1 Safe Grinder (Low Risk)
- Target: Roll Over 10.00 (89.99% win chance)
- Multiplier: ~1.10x
- Flat bet
- Tiny but frequent wins, occasional loss wipes several
- Best for: demonstrating bankroll management concepts

### 8.2 Coin Flip (Moderate)
- Target: Roll Over 50.00 (49.99% win chance)
- Multiplier: ~1.98x
- Flat bet
- Classic 50/50 — most intuitive for new players
- The "default" experience

### 8.3 Sniper (High Risk)
- Target: Roll Over 90.00 (9.99% win chance)
- Multiplier: ~9.91x
- Flat bet
- Long losing streaks punctuated by big wins
- Exciting but bankroll-intensive

### 8.4 Moon Shot (Extreme)
- Target: Roll Under 1.00 (1.00% win chance)
- Multiplier: ~99x
- Small bets ($0.10)
- Lottery-style: 99% chance of losing each roll
- When it hits: 99× payout on display is spectacular

### 8.5 Martingale
- Target: Roll Over 50.00 (≈50% win chance)
- On loss: double bet amount
- On win: reset to base bet
- Auto-stop at max bet or bankroll limit
- Warning: "Martingale can lead to rapid bankroll depletion"

### 8.6 Anti-Martingale (Paroli)
- Target: Roll Over 50.00
- On win: double bet amount
- On loss: reset to base bet
- Take profit after 3 consecutive wins

### 8.7 D'Alembert
- On loss: increase bet by 1 unit ($0.10)
- On win: decrease bet by 1 unit (min: base bet)
- Gentler curve than Martingale

### 8.8 Delayed Martingale
- Target: Roll Over 50.00
- Flat bet for first 3 consecutive losses
- After 3+ losses in a row: double bet on each additional loss
- On win: reset to base bet
- Less aggressive start than pure Martingale

### 8.9 Zigzag
- Alternate between Roll Over and Roll Under each roll
- Same target, same bet
- Feels like a "different strategy" but mathematically identical to flat betting
- Included because players enjoy the feeling of switching

### 8.10 Custom
- Player defines all parameters:
  - Target, direction
  - On win: bet adjustment (% increase / flat increase / reset)
  - On loss: bet adjustment
  - On win: target adjustment (optional)
  - On loss: target adjustment (optional)
  - Direction switching rules
  - Stop conditions

**Strategy Controls Location:** Collapsible "Strategy" panel below auto-bet settings
**Strategy Active Indicator:** Small colored badge on bet amount showing active strategy name

---

## 9. Conversion Integration Points

### 9.1 Casino Recommendation Sidebar (Desktop)
- Position: right column
- Content: 2-3 casino cards showing Dice-specific offers
- Filter: casinos from CASINOS constant with "dice" in their games array
- Currently: Stake, BC.Game, Jackbit (based on constants.ts)
- Each card: casino name (brand colored), offer, "Claim Deal →" link to /deals

### 9.2 "Spin the Deal Wheel" CTA
- Position: below casino cards in sidebar
- Trigger: always visible, PROMINENT (pulsing border) after 25+ rolls
- Higher threshold because Dice rounds are very fast
- Style: `#00E5A0` border, `#111827` bg, with wheel icon
- Text: "Spin the Deal Wheel" + "Win exclusive Dice bonuses"

### 9.3 "What You Would Have Won" Display
- Trigger: after 15+ rolls
- Shows real money equivalent
- Emphasizes big wins if any occurred
- Includes casino recommendation + CTA to /deals

### 9.4 Post-Session Nudge
- Trigger: 60 seconds inactivity after 25+ rolls
- "Ready for real stakes? Spin the Deal Wheel →"
- Dismissable, once per session

### 9.5 Integration Rules
- CTAs NEVER interrupt a roll animation (though animations are very short)
- Casino links: `target="_blank" rel="noopener noreferrer"`
- Responsible gambling disclaimer always visible
- Conversion elements update max every 10 rolls (prevent visual noise from rapid auto-bet)

---

## 10. Technical Implementation Notes

### 10.1 Rendering Approach
- **Slider bar:** Pure HTML/CSS — `<input type="range">` styled with CSS, or custom div with drag handlers
- **Result animation:** CSS transitions + JS for the traveling dot
- **Green/red zones:** Two overlapping divs with `width` set by percentage, CSS transitions for smooth resizing
- **Result number:** HTML overlay — no Canvas needed
- **Previous results:** HTML badges
- **Particle effects:** CSS keyframes for celebration animations

### 10.2 Game Loop Architecture
```
Each roll:
  1. Read bet, target, direction from state
  2. Calculate win chance and multiplier
  3. Generate random result: Math.floor(crypto.getRandomValues()[0] / 2^32 * 10000) / 100
     (This gives 0.00 to 99.99 with uniform distribution)
  4. Determine win/loss:
     - Roll Over: result > target → win
     - Roll Under: result < target → win
  5. Start result animation (or skip in fast mode)
  6. After animation:
     - Update session stats
     - Add to bet history
     - If auto-bet: apply strategy, check stops, continue or stop
     - If manual: idle
```

### 10.3 Random Number Generation (Detailed)
```typescript
function generateDiceResult(): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  // Map 0..4294967295 to 0..9999, then divide by 100 for 2 decimal places
  const raw = buffer[0] % 10000;  // 0 to 9999
  return raw / 100;                // 0.00 to 99.99
}
```

Note: `% 10000` on a 32-bit integer has negligible bias (< 0.0001%).

### 10.4 Performance Targets
- Slider interaction: 60fps during drag (CSS transitions handle this)
- Roll result: animation completes within stated durations
- Auto-bet turbo: 200 rolls/minute sustained without memory leaks
- Linked field sync: < 5ms recalculation on any field change
- History: virtualized list for 500+ entries
- Stats: batch display updates during turbo auto-bet (every 500ms)

### 10.5 State Management
```typescript
interface DiceState {
  // Game parameters
  target: number;          // 0.01 to 98.99
  direction: 'over' | 'under';
  winChance: number;       // auto-calculated
  multiplier: number;      // auto-calculated

  // Round
  phase: 'IDLE' | 'ROLLING' | 'RESULT';
  betAmount: number;
  currentResult: number | null;
  isWin: boolean | null;

  // Animation
  animationSpeed: 'normal' | 'fast';

  // Auto-bet
  autoBetEnabled: boolean;
  autoBetCount: number;
  autoBetCurrent: number;
  autoBetSpeed: 'normal' | 'fast' | 'turbo';
  onWinBetAction: 'same' | 'increase' | 'reset';
  onWinBetValue: number;
  onLossBetAction: 'same' | 'increase' | 'reset';
  onLossBetValue: number;
  onWinTargetAdjust: number;     // 0 = no change
  onLossTargetAdjust: number;
  switchDirectionOnWin: boolean;
  switchDirectionOnLoss: boolean;
  stopOnProfit: number | null;
  stopOnLoss: number | null;

  // Session
  stats: SessionStats;
  history: DiceRound[];    // last 500
}
```

### 10.6 File Structure Suggestion
```
components/games/dice/
├── DiceGame.tsx              # Main component, orchestrates layout
├── DiceResultDisplay.tsx     # Central result number display
├── DiceSlider.tsx            # The slider bar with green/red zones + result marker
├── DiceParameters.tsx        # Target, win chance, multiplier, payout fields (linked)
├── DiceControls.tsx          # Bet amount, roll button, direction toggle
├── DiceAutoPlay.tsx          # Auto-bet configuration panel
├── DicePreviousResults.tsx   # Previous roll badges
├── DiceStats.tsx             # Session statistics
├── DiceBetHistory.tsx        # Bet history table
├── DiceSidebar.tsx           # Casino cards + conversion CTAs
├── useDiceGame.ts            # Game logic hook (roll, calculations, state)
├── diceCalculator.ts         # Win chance / multiplier / payout linked calculations
├── diceAnimation.ts          # Slider animation + traveling dot + celebrations
└── diceTypes.ts              # TypeScript types specific to Dice
```

### 10.7 Key Derived Types
```typescript
// In diceTypes.ts
export type DiceDirection = 'over' | 'under';

export interface DiceRound {
  id: string;
  betAmount: number;
  target: number;
  direction: DiceDirection;
  result: number;
  multiplier: number;
  winChance: number;
  isWin: boolean;
  profit: number;
  timestamp: number;
}

export interface DiceParameters {
  target: number;
  direction: DiceDirection;
  winChance: number;       // percentage
  multiplier: number;
  payout: number;          // betAmount × multiplier
}
```

---

## 11. Accessibility

- Slider: keyboard accessible (arrow keys to move, Shift+arrow for large steps)
- Slider: `role="slider"`, `aria-valuemin="0.01"`, `aria-valuemax="98.00"`, `aria-valuenow="50.00"`, `aria-label="Target number"`
- Roll button: keyboard accessible (Spacebar / Enter)
- Direction toggle: `role="radiogroup"` with `aria-checked`
- All parameter inputs: proper `aria-label` attributes
- Result announcement: `aria-live="assertive"` region announces "Rolled XX.XX. You won/lost $X.XX"
- Previous results: `role="list"` with `role="listitem"` for each badge
- Reduced motion (`prefers-reduced-motion`):
  - Skip traveling dot animation — show result marker instantly
  - Disable celebration particles
  - Keep only color changes and text
- Color contrast: all text meets WCAG AA (4.5:1 minimum)
- Color is not the ONLY indicator of win/loss — text labels ("WON" / "LOST") accompany the colors
- Tab order: Bet Amount → Slider → Target Input → Win Chance → Multiplier → Direction Toggle → Roll Button

---

## 12. Responsible Gambling

**Footer disclaimer (always visible):**
> "18+ | Gambling involves risk. Only bet what you can afford to lose. PaperBet.io is a free simulator for educational purposes. We are not a gambling site."

**Session limit indicator:**
- After 300 rolls, show gentle reminder: "You've played 300 rounds. Remember, this is practice mode."
- Highest threshold of any game because Dice is the fastest
- Non-intrusive: small banner below the controls panel, dismissable

**Speed limit:**
- Auto-bet minimum gap: 300ms even in Turbo (max ~200 rolls/minute)
- After 1,000 consecutive auto-rolls: auto-bet pauses, requires manual re-start
- This prevents infinite unattended sessions

**Probability education:**
- The always-visible Win Chance percentage is inherently educational
- The inverse relationship between risk and reward is visible on every screen
- The slider physically shows what "75% chance" looks like (75% green bar)
- This transparency is part of PaperBet's "Test Your Edge" positioning — giving players real probability literacy

---

## 13. What Makes Dice Unique (Design Philosophy)

Dice is different from the other four PaperBet games in several important ways that should inform its implementation:

**1. The Slider IS the Game**
- In Plinko, the canvas is the star. In Crash, the chart is. In Mines, the grid is. In Limbo, the counter is.
- In Dice, **the slider bar** is the entire visual identity. It must be polished, responsive, and satisfying to interact with. The slider bar should feel as premium as a Bloomberg terminal widget.

**2. Fastest Game in the Library**
- Dice rounds are even faster than Limbo (no counter animation needed — just a dot sliding to position)
- This means the auto-bet system is the most important feature — more players will use auto-bet in Dice than any other game
- The history table will fill up fastest — virtualization is essential

**3. Most Strategic Feel**
- Four linked parameters (target, win chance, multiplier, direction) give players the most "knobs to turn"
- Strategy presets are more varied (10 presets vs 7-8 for other games)
- The direction toggle adds a psychological dimension that no other game has
- This makes Dice feel the most "analytical" — matching PaperBet's "Bloomberg meets gaming" positioning

**4. Best Conversion Tool**
- Because Dice is so fast and the math is so transparent, it's the best game for demonstrating: "You would have won $X with real money"
- The slider makes probability intuitive — non-math-savvy players "get it" faster than any other game
- Casino sidebar should emphasize Dice-specific bonuses prominently
