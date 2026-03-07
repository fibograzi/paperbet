# Crash — Complete Game Specification for PaperBet.io

## 1. Game Overview

Crash is a multiplier-rising game where a line/rocket launches and the multiplier climbs from 1.00x upward. Players place a bet before the round starts and must decide when to "Cash Out." If they cash out before the crash, they win their bet × the multiplier at cashout. If the game crashes before they cash out, they lose their entire bet.

**Why it's popular in crypto casinos:** Crash is pure tension and timing. Unlike Plinko (which is passive), Crash requires an active decision under pressure. The visible multiplier climbing higher creates "just a little more" greed psychology. The max multiplier of 1,000,000x (theoretical) makes every round feel like it could be life-changing.

**Psychological hooks:** Loss aversion (cashing out too early feels bad when it keeps going), greed spiral (watching the multiplier climb past your cashout target), near-miss effect (crash at 9.87x when you wanted 10x), social proof from seeing other players cash out, and the 1.00x instant crash creating a constant danger baseline.

---

## 2. Exact Game Mechanics

### 2.1 Step-by-Step Game Flow

**Round Lifecycle (4 phases):**

1. **BETTING PHASE (3 seconds countdown)**
   - Timer counts down: "Next round in 3... 2... 1..."
   - Player can place/adjust bet amount
   - Player can set auto-cashout multiplier (optional)
   - Green "Bet" button is active

2. **LAUNCH PHASE (instant)**
   - Betting closes
   - Multiplier starts at 1.00x
   - Chart line begins drawing upward
   - "Cash Out" button becomes active (replaces "Bet" button)

3. **RISING PHASE (variable duration)**
   - Multiplier increases continuously: 1.00x → 1.01x → 1.02x → ...
   - Chart line draws in real-time following the multiplier curve
   - Player can click "Cash Out" at any moment
   - Auto-cashout triggers if multiplier reaches player's set target
   - Duration: 0 seconds (instant crash at 1.00x) to 30+ seconds (high multipliers)

4. **CRASH PHASE (instant + animation)**
   - Multiplier freezes at crash point
   - Screen flashes red
   - Chart line stops, text turns red showing "CRASHED @ X.XXx"
   - If player cashed out: green result shown with profit
   - If player didn't cash out: red result shown with loss
   - Brief pause (2 seconds), then return to BETTING PHASE

### 2.2 Crash Point Generation

**Formula:**
```
crashPoint = Math.max(1, Math.floor(99 / (1 - R)) / 100)
```
Where `R` is a uniformly random number in [0, 0.99).

This produces a distribution where:
- ~1% of rounds crash instantly at 1.00x
- Low multipliers are very common
- High multipliers are exponentially rare

**1% of rounds are "instant crashes" at 1.00x** — this is the house edge mechanism.

### 2.3 Probability of Reaching Multiplier M

```
P(reaching M) = 99 / M     (expressed as percentage)
```

| Target Multiplier | Probability of Reaching | Probability of Crash Before |
|-------------------|------------------------|-----------------------------|
| 1.00x | 99.00% | 1.00% (instant crash) |
| 1.50x | 66.00% | 34.00% |
| 2.00x | 49.50% | 50.50% |
| 3.00x | 33.00% | 67.00% |
| 5.00x | 19.80% | 80.20% |
| 10.00x | 9.90% | 90.10% |
| 20.00x | 4.95% | 95.05% |
| 50.00x | 1.98% | 98.02% |
| 100.00x | 0.99% | 99.01% |
| 1,000.00x | 0.099% | 99.901% |

### 2.4 House Edge & RTP

- **RTP: 99%** (1% house edge)
- The house edge comes from the ~1% instant crash at 1.00x
- Expected Value for any cashout target M: `EV = bet × M × (99/M/100) = bet × 0.99`
- This means regardless of your strategy, you expect to lose 1% long-term
- Maximum multiplier cap: 1,000,000x (for display purposes, our simulator can cap at 10,000x)

### 2.5 Multiplier Growth Rate

The multiplier increases exponentially over time:
```
multiplier(t) = e^(0.06 * t)    // where t is time in 100ms ticks
```

Approximate timing:
| Multiplier | Time Elapsed |
|-----------|-------------|
| 1.00x | 0.0s |
| 1.50x | ~6.8s |
| 2.00x | ~11.6s |
| 3.00x | ~18.3s |
| 5.00x | ~26.8s |
| 10.00x | ~38.4s |
| 50.00x | ~65.2s |
| 100.00x | ~76.8s |

For our simulator, we can speed this up by 2-3x to keep rounds engaging:
```
multiplier(t) = e^(0.15 * t)    // faster growth for simulator
```

This gives approximately:
| Multiplier | Time Elapsed (fast) |
|-----------|-------------------|
| 2.00x | ~4.6s |
| 5.00x | ~10.7s |
| 10.00x | ~15.4s |
| 100.00x | ~30.7s |

---

## 3. Multiplier Display & Formatting

### 3.1 Display Format

| Multiplier Range | Format | Example |
|-----------------|--------|---------|
| 1.00x – 9.99x | X.XXx | "2.47x" |
| 10.00x – 99.99x | XX.XXx | "47.83x" |
| 100.00x – 999.99x | XXX.XXx | "284.92x" |
| 1,000.00x+ | X,XXX.XXx | "1,284.50x" |

### 3.2 Color Transitions During Rise

The multiplier text smoothly transitions color as it increases:

| Range | Color | Hex |
|-------|-------|-----|
| 1.00x – 1.99x | White | `#F9FAFB` |
| 2.00x – 4.99x | Green | `#00E5A0` |
| 5.00x – 9.99x | Cyan | `#00B4D8` |
| 10.00x – 49.99x | Orange | `#F97316` |
| 50.00x – 99.99x | Red | `#EF4444` |
| 100.00x+ | Gold | `#F59E0B` with pulsing glow |

Transitions between colors: smooth CSS transition over 500ms.

---

## 4. Visual Design Specification

### 4.1 Overall Layout

**Desktop (≥1024px) — 3-Column Layout:**
```
┌───────────────────────────────────────────────────────────────┐
│ [HEADER — sticky]                                             │
├────────────┬─────────────────────────┬────────────────────────┤
│            │                         │                        │
│  CONTROLS  │    CRASH CHART          │  CASINO SIDEBAR        │
│  PANEL     │    (Main Game Area)     │  + STATS               │
│            │                         │                        │
│  Width:    │    Width: flex-1        │  Width: 320px          │
│  300px     │    Min: 500px           │                        │
│            │                         │                        │
│  - Bet Amt │    - Chart with line    │  - Previous Rounds     │
│  - Cashout │    - Live multiplier    │  - Casino Cards        │
│  - Auto    │    - Countdown/Status   │  - Session Stats       │
│  - Bet Btn │                         │  - Bet History         │
│            │                         │  - "What You Would     │
│            │                         │     Have Won"          │
│            │                         │                        │
└────────────┴─────────────────────────┴────────────────────────┘
```

**Mobile (<768px) — Single Column:**
```
┌─────────────────────────┐
│ CRASH CHART              │
│ (Full width, 50vh)       │
├─────────────────────────┤
│ PREVIOUS ROUNDS (scroll) │
├─────────────────────────┤
│ CONTROLS (compact)       │
│ [Bet Amt] [Cashout]      │
│ [====== BET/CASHOUT ====]│
├─────────────────────────┤
│ SESSION STATS (2x2)      │
├─────────────────────────┤
│ CASINO CARDS             │
├─────────────────────────┤
│ BET HISTORY              │
└─────────────────────────┘
```

### 4.2 The Crash Chart (Main Game Area)

**Container:**
- Background: `#0B0F1A` (seamless with page)
- Subtle grid lines: `#1F2937` at 10% opacity, creating a graph-paper effect
- Border: `#374151` border, rounded-xl
- Padding: 24px

**Chart Area:**
- X-axis: time (hidden labels, just grid lines)
- Y-axis: multiplier values (1x, 2x, 5x, 10x, etc.) — labeled in `#6B7280`, JetBrains Mono, 11px
- Y-axis scale: logarithmic for better visual distribution
- Grid: horizontal lines at each Y-axis label, `#374151` at 15% opacity

**The Multiplier Line:**
- Color: gradient from `#00E5A0` (start) to current multiplier color (see §3.2)
- Stroke width: 3px
- Smooth curve (bezier interpolation, not jagged)
- Glow effect: line has a subtle drop-shadow matching its color, `0 0 10px`
- Fill below line: same color at 5% opacity, creating an area chart effect
- Line draws from left-to-right as multiplier increases
- Chart auto-scrolls/scales to keep the current point visible

**Live Multiplier Display (center of chart):**
- Font: JetBrains Mono, 72px (desktop), 48px (mobile), Bold
- Color: per §3.2 color scheme
- Position: centered in the chart area
- Updates every 50ms for smooth counting
- Subtle text-shadow matching the text color

**Countdown Display (BETTING phase):**
- Replaces multiplier display during countdown
- "Starting in 3..." → "2..." → "1..." → "GO!"
- Font: JetBrains Mono, 48px, `#9CA3AF`
- "GO!" flashes in `#00E5A0` for 300ms

**Crash Display (CRASH phase):**
- Multiplier freezes, text turns `#EF4444`
- Below multiplier: "CRASHED" in `#EF4444`, DM Sans, 24px, uppercase
- Background of chart area briefly flashes red (opacity 0 → 0.1 → 0 over 400ms)

### 4.3 Animations & Transitions

**Line Drawing Animation:**
- Line extends from left at a pace matching the multiplier growth
- Uses `requestAnimationFrame` at 60fps
- Smooth bezier curve, not straight segments
- The line "tip" has a brighter glow point (like a rocket tip)

**Crash Animation:**
- Duration: 600ms total
- Frame 0ms: Line stops, multiplier freezes
- Frame 0-100ms: Screen flash red (background `#EF4444` at 10% opacity)
- Frame 100-200ms: Multiplier text shakes (±3px random offset, 4 cycles)
- Frame 200-400ms: Line fades to `#EF4444` (the whole drawn line turns red)
- Frame 400-600ms: "CRASHED" text fades in below multiplier
- Optional: subtle screen shake (CSS transform translate ±2px for 300ms)

**Cash Out Animation (success):**
- Frame 0ms: Button flashes, "Cashed Out!" text appears
- Frame 0-200ms: Green pulse expands from cash-out point on the line
- Frame 200-500ms: Profit display floats up from multiplier: "+$XX.XX" in `#00E5A0`
- The line continues drawing (round is still going), but player's cash-out point is marked with a dot

**Big Win Animations:**
| Multiplier | Extra Animation |
|-----------|----------------|
| ≥ 5x | Green particle burst from multiplier text |
| ≥ 20x | Confetti-like particles + "NICE!" text flash |
| ≥ 100x | Full gold particle explosion + screen-edge glow + text scales up with shadow |

### 4.4 Previous Rounds Display

**Position:** Horizontal row of badges above the chart (desktop) or below (mobile)

**Each badge:**
- Rounded pill shape, height: 28px
- Font: JetBrains Mono, 12px, bold
- Shows crash point: "2.47x", "1.00x", "148.30x"
- Colors by value:
  - 1.00x: `#EF4444` bg at 15%, red text (instant crash)
  - 1.01x – 1.99x: `#374151` bg, `#9CA3AF` text
  - 2.00x – 9.99x: `#00E5A0` bg at 10%, green text
  - 10.00x+: `#F59E0B` bg at 15%, gold text
- Shows last 15-20 rounds
- Scrollable horizontally on mobile
- New rounds animate in from the right, pushing older ones left

---

## 5. Controls Panel Specification

### 5.1 Bet Amount Control

**Identical to Plinko spec** — same card layout, input field, +/- buttons, quick-select buttons (½, 2×, Min, Max).

| Parameter | Value |
|-----------|-------|
| Min Bet | $0.10 |
| Max Bet | $1,000.00 |
| Default | $1.00 |
| Step | $0.10 |

### 5.2 Cashout At Control

**Label:** "Cashout At" — DM Sans, 14px, `#9CA3AF`

**Input Field:**
- Same styling as bet amount input
- Text: JetBrains Mono, 18px, `#F9FAFB`
- Suffix: "x" in `#6B7280`
- Placeholder: "2.00"
- Default: 2.00x
- Min: 1.01x, Max: 10,000x

**+/- Buttons:** Same as bet amount, but step by 0.10x per click

**Quick-Select Row:**
- 4 buttons: "1.5x" | "2x" | "5x" | "10x"
- Same pill styling as bet amount quick-selects

**Behavior:**
- When set, auto-cashout triggers at this multiplier
- If left empty or 0: manual cashout only
- During round: this field is disabled (can't change mid-round)

### 5.3 Action Button (BET / CASH OUT)

This button changes between game phases:

**BETTING Phase — "Bet" Button:**
- Full width, height: 52px
- Background: `#00E5A0`
- Text: "Bet (Next Round)" — DM Sans, 16px, bold, `#0B0F1A`
- Hover: lighter green + shadow
- If already bet: changes to "Cancel Bet" in `#EF4444` bg

**RISING Phase — "Cash Out" Button:**
- Full width, height: 52px
- Background: `#F59E0B` (amber/gold — urgency color, NOT green)
- Text: "Cash Out @ X.XXx" — updates in real-time with current multiplier
- Below text: "+$X.XX" showing current potential profit
- Font: DM Sans, 16px, bold + JetBrains Mono for numbers
- PULSING animation: subtle scale 1.0 → 1.02 → 1.0, every 1s
- This button MUST be massive and impossible to miss

**If auto-cashout is set during RISING phase:**
- Button text: "Auto @ X.XXx" with countdown
- Less urgent styling (no pulsing)
- Player can still manually click to cash out earlier

**CRASH Phase — Disabled:**
- Gray out (`#374151` bg)
- Text: "Round Over" or "Next round in Xs"

**Keyboard shortcut:** Spacebar to Bet or Cash Out

### 5.4 Auto-Play System

**Toggle:** "Auto Bet" switch below main controls

**Auto-Play Options:**
- Number of rounds: 10 / 25 / 50 / 100 / ∞
- Cashout at: (required for auto-play) — multiplier target
- On Win: Keep same bet / Increase by X% / Reset to base
- On Loss: Keep same bet / Increase by X% / Reset to base
- Stop on Profit: optional threshold
- Stop on Loss: optional threshold

**Visual Indicator:**
- Pulsing green dot + "Auto-betting" label
- Round counter: "Round 7 / 25"
- "Stop Auto" button replaces "Bet" during auto-play

---

## 6. Statistics & History Display

### 6.1 Session Statistics

**Same 2×2/1×4 grid as Plinko, but crash-specific stats:**

| Stat | Format |
|------|--------|
| Rounds Played | "32 rounds" |
| Total Wagered | "$32.00" |
| Net Profit | "+$18.40" (green) or "-$12.50" (red) |
| Best Cashout | "47.83x ($47.83)" |
| Average Cashout | "3.24x" |
| Win Rate | "62%" |

### 6.2 Bet History Table

**Columns:**
| Column | Content |
|--------|---------|
| # | Round number |
| Bet | "$1.00" |
| Crashed At | "8.42x" (colored by crash value) |
| Cashout | "5.00x" (green if cashed out, "—" if not) |
| Profit | "+$4.00" green / "-$1.00" red |

**Behavior:** Same as Plinko — last 25 rows, scrollable, new entries slide in from top.

### 6.3 "What You Would Have Won" Display

**Same structure as Plinko spec**, but crash-specific text:
- "If you played with real money on Stake..."
- Shows total wagered → total returned → net profit
- Recommends crash-specific casinos
- CTA to Deal Wheel

---

## 7. Sound Design Notes (Visual Equivalents)

| Audio Cue | Visual Replacement |
|-----------|-------------------|
| Countdown beep | Countdown numbers pulse/scale on each tick |
| Launch whoosh | "GO!" flash in green + line starts drawing |
| Rising tension hum | Multiplier text subtly increases font-weight as it grows |
| Cash out "cha-ching" | Green burst + profit floats up |
| Crash explosion | Red flash + screen shake + text shake |
| Multiplier tick | Multiplier number has smooth counting animation (not jumpy) |

**Haptic Feedback (mobile):**
- Cash Out button: short vibration (50ms)
- Crash: strong vibration (200ms)
- Big win (≥ 10x): pattern vibration

---

## 8. Edge Cases & Error States

### 8.1 Instant Crash (1.00x)
- ~1% of rounds crash immediately
- Chart shows a flat line (or micro-rise), then red
- Cash Out button never becomes pressable (round ends before user can react)
- Display: "CRASHED @ 1.00x" — "Bad luck! Instant crash."
- This is the house edge in action

### 8.2 Very High Multipliers
- Cap display at 10,000x for our simulator
- If multiplier exceeds chart scale, Y-axis rescales with smooth zoom-out animation
- At very high multipliers (>100x), speed up visual growth to prevent boring wait

### 8.3 Rapid Clicking Cash Out
- Cash out button: debounce 200ms
- Once clicked, immediately register the cashout — don't wait for animation
- Show "Cashed Out!" immediately even if crash animation hasn't finished

### 8.4 Auto-Play Edge Cases
- If cashout target is 1.01x and round crashes at 1.00x: loss (not a win)
- If cashout target matches exact crash point: count as a WIN (cashed out at or before crash)
- Auto-play continues through instant crashes

### 8.5 Browser Resize
- Chart redraws at new dimensions
- If round is in progress: continue with rescaled chart
- Previous line drawing is re-rendered for new dimensions

### 8.6 Mobile Considerations
- Cash Out button: minimum 56px height on mobile (extra large for thumb)
- Chart takes full width but max 50vh height
- Multiplier text large enough to read without zooming (48px minimum)
- Previous rounds: horizontal scroll with momentum

---

## 9. Strategy Preset Specifications

### 9.1 Conservative (Low Risk)
- Auto-cashout at 1.50x
- Flat bet (same amount each round)
- Win rate: ~66%, but small wins
- Stop on loss: 10× base bet

### 9.2 Moderate
- Auto-cashout at 2.00x
- Flat bet
- Win rate: ~49.5%
- Balanced risk/reward

### 9.3 Aggressive (High Risk)
- Auto-cashout at 10.00x
- Flat bet
- Win rate: ~9.9%, but big payoffs
- Stop on loss: 20× base bet

### 9.4 Martingale
- Auto-cashout at 2.00x
- On loss: double bet
- On win: reset to base bet
- Auto-stop at max bet or bankroll limit
- Warning displayed about risks

### 9.5 Anti-Martingale
- Auto-cashout at 2.00x
- On win: double bet
- On loss: reset to base bet
- Take profit after 3 consecutive wins

### 9.6 Custom
- Player sets all parameters:
  - Cashout target
  - On win behavior
  - On loss behavior
  - Stop conditions

---

## 10. Conversion Integration Points

### 10.1 Casino Sidebar
- Show 2-3 casinos with crash-specific offers
- Filter CASINOS constant for entries with "crash" in games array
- Each card: name, offer, "Claim Deal →" link

### 10.2 "Spin the Deal Wheel" CTA
- Below casino cards in sidebar
- Becomes prominent (pulsing border) after 10+ rounds
- "Win exclusive Crash bonuses"

### 10.3 "What You Would Have Won"
- Appears after 5+ rounds
- Shows real money equivalent of paper profit
- Emphasizes big wins: "Your 47.83x would have paid $47.83 on a $1 bet at Stake"

### 10.4 Post-Session Nudge
- After 60 seconds of inactivity (no new round) post 10+ rounds
- "Ready for real stakes? Spin the Deal Wheel →"
- Dismissable, once per session

### 10.5 Integration Rules
- NEVER interrupt a live round with a CTA
- Casino links: `target="_blank" rel="noopener noreferrer"`
- Responsible gambling disclaimer always visible
- No pop-ups or modals during gameplay

---

## 11. Technical Implementation Notes

### 11.1 Rendering Approach
- **Chart:** HTML5 Canvas for the rising line (smooth, performant)
- **Multiplier text:** HTML overlay on top of canvas (easier to style)
- **Controls:** Standard React components
- **Previous rounds:** HTML badges, not canvas

### 11.2 Game Loop Architecture
```
Round Start:
  1. Generate crash point (pre-determined)
  2. Start countdown (3s)
  3. Accept bets

Launch:
  1. Start animation loop (requestAnimationFrame)
  2. Each frame:
     - Calculate current multiplier based on elapsed time
     - Draw line extension on canvas
     - Update multiplier display
     - Check if multiplier >= crash point → trigger crash
     - Check if multiplier >= auto-cashout → trigger cashout
  3. If player clicks Cash Out:
     - Record cashout multiplier
     - Show cashout animation
     - Continue round for visual effect

Crash:
  1. Stop animation loop
  2. Play crash animation (600ms)
  3. Calculate results
  4. Update stats and history
  5. Wait 2s
  6. Start next round
```

### 11.3 Performance Targets
- Chart rendering: 60fps
- Multiplier update: every 50ms (smooth counting)
- Total round memory: minimal (only current line data, not historical)
- Previous rounds: only last 20 stored

### 11.4 File Structure Suggestion
```
components/games/crash/
├── CrashGame.tsx           # Main component, orchestrates layout
├── CrashChart.tsx          # Canvas chart (line + grid + multiplier)
├── CrashControls.tsx       # Bet amount, cashout, buttons
├── CrashPreviousRounds.tsx # Previous crash point badges
├── CrashStats.tsx          # Session statistics
├── CrashBetHistory.tsx     # Bet history table
├── CrashSidebar.tsx        # Casino cards + conversion CTAs
├── useCrashGame.ts         # Game logic hook (round lifecycle, crash generation)
├── crashAnimation.ts       # Canvas drawing utilities
└── crashTypes.ts           # TypeScript types
```

---

## 12. Accessibility

- Cash Out button: keyboard accessible (Spacebar)
- Countdown: screen reader announcement ("Round starting in 3 seconds")
- Crash result: announce to screen reader ("Crashed at 8.42x. You cashed out at 5.00x, profit $4.00")
- Reduced motion: skip line animation, show result instantly
- High contrast: all text meets WCAG AA (4.5:1)
- Auto-cashout: allows players who can't react quickly to participate fully

---

## 13. Responsible Gambling

**Footer disclaimer (always visible):**
> "18+ | Gambling involves risk. Only bet what you can afford to lose. PaperBet.io is a free simulator for educational purposes. We are not a gambling site."

**Session reminder:** After 50 rounds, gentle reminder: "You've played 50 rounds. This is practice mode — take a break if needed."

**Speed limit:** Auto-play has a minimum 2-second round gap to prevent rapid-fire sessions that encourage reckless behavior.
