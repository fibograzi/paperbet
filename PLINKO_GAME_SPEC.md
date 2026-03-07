# Plinko — Complete Game Specification for PaperBet.io

## 1. Game Overview

Plinko is a ball-drop probability game where a ball is released from the top of a pyramid-shaped peg board and bounces down through rows of pegs, landing in one of several multiplier slots at the bottom. Each peg deflects the ball either left or right with equal probability. The further from center the ball lands, the higher (or lower) the multiplier.

**Why it's popular in crypto casinos:** Plinko offers instant results, visual satisfaction from watching the ball path, and highly customizable risk. Low-risk players get frequent small wins, while high-risk chasers hunt for 1,000x payouts.

**Psychological hooks:** The visible ball path creates an illusion of near-misses ("it almost went to the 1,000x!"). The sound/visual of pegs being hit is inherently satisfying (ASMR-like). Instant results + variable reward schedule = high replay rate. Customizable risk lets players feel in control while the house edge remains constant.

---

## 2. Exact Game Mechanics

### 2.1 Step-by-Step Game Flow

1. Player sets **bet amount** (default: $1.00 paper money)
2. Player selects **risk level** (Low / Medium / High)
3. Player selects **number of rows** (8–16, default: 12)
4. Player clicks **"Drop Ball"** (or the ball auto-drops if auto-play is on)
5. Ball appears at the top-center of the peg board
6. Ball falls through each row of pegs, deflecting left or right at each peg (50/50 random per peg)
7. Ball reaches the bottom and lands in a multiplier slot
8. Multiplier is applied to bet amount → result displayed
9. Session stats update (total bets, net profit, etc.)
10. After 5+ bets, "What You Would Have Won" display appears

### 2.2 Physics Model

**NOT a real physics simulation.** Use a pre-calculated path model for consistency and performance:

1. For each drop, generate N random bits (where N = number of rows), each 0 (left) or 1 (right)
2. Sum the bits to determine the landing slot index (0 = far left, N = far right)
3. Animate the ball following this predetermined path

The ball animation is purely visual — the outcome is determined BEFORE the animation begins.

**Animation physics (visual only):**
- Gravity acceleration: ball speeds up as it falls
- Each peg hit: slight random horizontal offset (±2px) for visual variety
- Bounce: ball compresses slightly (scale 0.9) on peg contact, then rebounds
- Final slot landing: ball drops into slot with a small bounce

### 2.3 Configurable Parameters

| Parameter | Range | Default | Step |
|-----------|-------|---------|------|
| Bet Amount | $0.10 – $1,000.00 | $1.00 | $0.10 |
| Risk Level | Low / Medium / High | Medium | — |
| Rows | 8 – 16 | 12 | 1 |
| Auto-play Count | 10 / 25 / 50 / 100 / ∞ | Off | — |

### 2.4 Mathematical Model

The landing position follows a **binomial distribution**:
- N rows = N binary decisions (left/right)
- Landing slot k (0 to N) has probability: `P(k) = C(N, k) / 2^N`
- This creates a bell curve: center slots are most probable, edge slots are rarest

**Probabilities for 8 rows (9 slots):**
| Slot | Left bounces | Probability |
|------|-------------|-------------|
| 0 (far left) | 0 | 0.391% |
| 1 | 1 | 3.125% |
| 2 | 2 | 10.938% |
| 3 | 3 | 21.875% |
| 4 (center) | 4 | 27.344% |
| 5 | 5 | 21.875% |
| 6 | 6 | 10.938% |
| 7 | 7 | 3.125% |
| 8 (far right) | 8 | 0.391% |

### 2.5 House Edge & RTP

- **Target RTP: 99%** (1% house edge)
- House edge is built into the multiplier values, not the physics
- Expected Value per bet: `EV = Σ (P(slot) × Multiplier(slot)) = 0.99`
- All row/risk combinations should produce approximately 99% RTP (±0.1%)

---

## 3. Multiplier Tables

### IMPORTANT: Multipliers are symmetric
The board is symmetric — slot 0 has the same multiplier as slot N, slot 1 same as slot N-1, etc. Tables below show left-to-right (edge → center → edge).

### 3.1 — 8 Rows (9 slots)

| Slot | Low Risk | Medium Risk | High Risk |
|------|----------|-------------|-----------|
| 0, 8 | 5.6x | 13x | 29x |
| 1, 7 | 2.1x | 3x | 9x |
| 2, 6 | 1.1x | 1.3x | 2x |
| 3, 5 | 1x | 0.7x | 0.4x |
| 4 (center) | 0.5x | 0.4x | 0.2x |

### 3.2 — 9 Rows (10 slots)

| Slot | Low Risk | Medium Risk | High Risk |
|------|----------|-------------|-----------|
| 0, 9 | 5.6x | 18x | 43x |
| 1, 8 | 2.1x | 4x | 7x |
| 2, 7 | 1.3x | 1.7x | 2x |
| 3, 6 | 1.1x | 0.9x | 0.7x |
| 4, 5 | 1x | 0.5x | 0.4x |

### 3.3 — 10 Rows (11 slots)

| Slot | Low Risk | Medium Risk | High Risk |
|------|----------|-------------|-----------|
| 0, 10 | 8.9x | 22x | 76x |
| 1, 9 | 3x | 5x | 10x |
| 2, 8 | 1.4x | 2x | 3x |
| 3, 7 | 1.1x | 1.4x | 0.9x |
| 4, 6 | 1x | 0.6x | 0.3x |
| 5 (center) | 0.5x | 0.4x | 0.2x |

### 3.4 — 11 Rows (12 slots)

| Slot | Low Risk | Medium Risk | High Risk |
|------|----------|-------------|-----------|
| 0, 11 | 8.4x | 24x | 120x |
| 1, 10 | 3x | 6x | 14x |
| 2, 9 | 1.9x | 2x | 5.2x |
| 3, 8 | 1.3x | 1.6x | 1.4x |
| 4, 7 | 1x | 1x | 0.4x |
| 5, 6 | 0.7x | 0.5x | 0.2x |

### 3.5 — 12 Rows (13 slots)

| Slot | Low Risk | Medium Risk | High Risk |
|------|----------|-------------|-----------|
| 0, 12 | 10x | 33x | 170x |
| 1, 11 | 3x | 11x | 24x |
| 2, 10 | 1.6x | 4x | 8.1x |
| 3, 9 | 1.4x | 2x | 2x |
| 4, 8 | 1.1x | 1.1x | 0.7x |
| 5, 7 | 1x | 0.6x | 0.2x |
| 6 (center) | 0.5x | 0.3x | 0.2x |

### 3.6 — 13 Rows (14 slots)

| Slot | Low Risk | Medium Risk | High Risk |
|------|----------|-------------|-----------|
| 0, 13 | 8.1x | 43x | 284x |
| 1, 12 | 4x | 13x | 28x |
| 2, 11 | 1.9x | 6x | 7x |
| 3, 10 | 1.4x | 3x | 4x |
| 4, 9 | 1.1x | 1.3x | 1.5x |
| 5, 8 | 1x | 0.7x | 0.4x |
| 6, 7 | 0.5x | 0.4x | 0.2x |

### 3.7 — 14 Rows (15 slots)

| Slot | Low Risk | Medium Risk | High Risk |
|------|----------|-------------|-----------|
| 0, 14 | 7.1x | 58x | 420x |
| 1, 13 | 4x | 15x | 36x |
| 2, 12 | 1.9x | 7x | 11x |
| 3, 11 | 1.4x | 4x | 4x |
| 4, 10 | 1.3x | 1.9x | 1.5x |
| 5, 9 | 1.1x | 1x | 0.5x |
| 6, 8 | 1x | 0.5x | 0.3x |
| 7 (center) | 0.5x | 0.2x | 0.2x |

### 3.8 — 15 Rows (16 slots)

| Slot | Low Risk | Medium Risk | High Risk |
|------|----------|-------------|-----------|
| 0, 15 | 15x | 100x | 620x |
| 1, 14 | 8x | 18x | 56x |
| 2, 13 | 3x | 11x | 18x |
| 3, 12 | 2x | 5x | 5x |
| 4, 11 | 1.5x | 3x | 2x |
| 5, 10 | 1.1x | 1.3x | 0.6x |
| 6, 9 | 1x | 0.5x | 0.3x |
| 7, 8 | 0.5x | 0.3x | 0.2x |

### 3.9 — 16 Rows (17 slots)

| Slot | Low Risk | Medium Risk | High Risk |
|------|----------|-------------|-----------|
| 0, 16 | 16x | 110x | 1000x |
| 1, 15 | 9x | 41x | 130x |
| 2, 14 | 2x | 10x | 26x |
| 3, 13 | 1.4x | 5x | 9x |
| 4, 12 | 1.4x | 3x | 4x |
| 5, 11 | 1.2x | 1.5x | 2x |
| 6, 10 | 1.1x | 1x | 0.2x |
| 7, 9 | 1x | 0.5x | 0.2x |
| 8 (center) | 0.5x | 0.3x | 0.2x |

---

## 4. Visual Design Specification

### 4.1 Overall Layout

**Desktop (≥1024px) — 3-Column Layout:**
```
┌───────────────────────────────────────────────────────────────┐
│ [HEADER — sticky, always visible]                             │
├────────────┬─────────────────────┬────────────────────────────┤
│            │                     │                            │
│  CONTROLS  │    PLINKO BOARD     │    CASINO SIDEBAR          │
│  PANEL     │    (Canvas)         │    (Deals + Stats)         │
│            │                     │                            │
│  Width:    │    Width: flex-1    │    Width: 320px            │
│  300px     │    Min: 400px       │    Scrollable              │
│            │                     │                            │
│  - Bet Amt │    Pegs + Ball      │    - Casino Cards          │
│  - Risk    │    + Multiplier     │    - Session Stats         │
│  - Rows    │      Slots          │    - Bet History           │
│  - Drop    │                     │    - "What You Would       │
│  - Auto    │                     │       Have Won"            │
│            │                     │                            │
├────────────┴─────────────────────┴────────────────────────────┤
│ [BET HISTORY TABLE — full width below on desktop]             │
└───────────────────────────────────────────────────────────────┘
```

**Mobile (<768px) — Single Column, Stacked:**
```
┌─────────────────────────┐
│ PLINKO BOARD (Canvas)   │
│ Full width, 60vh max    │
├─────────────────────────┤
│ CONTROLS (compact)      │
│ Horizontal bet + drop   │
├─────────────────────────┤
│ SESSION STATS (2x2)     │
├─────────────────────────┤
│ CASINO CARDS (scroll)   │
├─────────────────────────┤
│ BET HISTORY (compact)   │
├─────────────────────────┤
│ WHAT YOU WOULD HAVE WON │
└─────────────────────────┘
```

**Tablet (768–1023px):**
```
┌──────────────────────────────────────────┐
│ PLINKO BOARD (centered, max-w: 500px)    │
├───────────────────┬──────────────────────┤
│ CONTROLS          │ SESSION STATS        │
├───────────────────┴──────────────────────┤
│ CASINO CARDS + BET HISTORY               │
└──────────────────────────────────────────┘
```

### 4.2 The Plinko Board (Canvas/SVG)

**Board Structure:**
- Background: `#0B0F1A` (same as page bg, seamless)
- Board boundary: subtle rounded container with `#1F2937` border, no heavy shadow
- Board shape: inverted triangle / pyramid of pegs
- Canvas aspect ratio: approximately 4:5 (width:height including multiplier slots)

**Pegs:**
- Shape: circles, radius 4px (desktop), 3px (mobile)
- Color idle: `#374151` (border color, subtle)
- Color when ball passes nearby: brief flash to `#00E5A0` (accent green) for 150ms, then fade back
- Layout: pyramid pattern — row 1 has 3 pegs, row 2 has 4, row N has N+2
- Spacing: calculated dynamically based on board width and number of rows
- The top peg row should be wider than the ball drop point to ensure realistic deflection

**Ball:**
- Shape: circle, radius 6px (desktop), 5px (mobile)
- Color: `#00E5A0` (accent green) with subtle radial gradient (lighter center)
- Glow: subtle green glow shadow `0 0 8px rgba(0, 229, 160, 0.4)`
- Trail: last 3 positions rendered at decreasing opacity (0.4, 0.2, 0.1) for motion trail effect
- Only ONE ball visible at a time in normal mode; up to 5 in auto-play

**Multiplier Slots (Bottom):**
- Row of colored rectangles at the bottom of the board
- Each slot: rounded rectangle, 2px gap between slots
- Height: 32px (desktop), 24px (mobile)
- Font: JetBrains Mono, 11px bold (desktop), 9px (mobile)
- Text: multiplier value (e.g., "1,000x", "0.2x")
- Text color: white on all slots

**Slot Color Coding (by multiplier value):**

| Multiplier | Slot Background Color | Category |
|-----------|----------------------|----------|
| ≥ 100x | `#F59E0B` (gold/amber) | Jackpot |
| 10x – 99.9x | `#EF4444` (red) | Big win |
| 3x – 9.9x | `#F97316` (orange) | Good win |
| 1.5x – 2.9x | `#00E5A0` (green) | Small win |
| 1x – 1.4x | `#00E5A0` at 60% opacity | Break-even |
| 0.5x – 0.9x | `#6B7280` (muted gray) | Small loss |
| < 0.5x | `#374151` (dark gray) | Loss |

**Active slot highlight:** When ball lands in a slot:
1. Slot background brightens (increase lightness 20%)
2. Slot scales up slightly (1.1x) for 300ms
3. If win ≥ 3x: slot pulses with glow matching its color
4. If win ≥ 100x: golden particle burst from the slot

### 4.3 Animations & Transitions

**Ball Drop Animation:**
- Duration: 1.5s (8 rows) to 3.5s (16 rows) — scales with row count
- Easing: gravity simulation — ball accelerates (quadratic ease-in per row)
- Per-peg bounce: ball briefly compresses (scaleY: 0.85, scaleX: 1.15) for 50ms, then rebounds
- Horizontal deflection: instant snap to new direction at each peg
- Final slot entry: ball drops into slot with damped bounce (2 small bounces over 300ms)

**Peg Hit Feedback:**
- Peg color flashes from `#374151` → `#00E5A0` for 150ms, then fades back over 200ms
- Subtle scale pulse on hit peg (1.2x for 100ms)
- Ripple effect: neighboring pegs glow faintly (0.3 opacity) 50ms after hit

**Win Celebrations by Tier:**

| Tier | Multiplier | Animation |
|------|-----------|-----------|
| Normal | < 2x | Slot highlights, result displays |
| Good Win | 2x – 9.9x | Slot glows, result pulses green, "+$X.XX" floats up |
| Big Win | 10x – 99x | Screen edges flash red/orange, result pulses large, multiplier shakes |
| Jackpot | ≥ 100x | Gold particle explosion from slot, screen shake (2px, 500ms), result text scales up large with gold glow, confetti-like particles from top |

**Loss Animation (< 1x):**
- Result text appears in `#9CA3AF` (muted)
- Slot dims briefly
- No dramatic animation — losses should feel quick and forgettable (encourages replaying)

**Auto-Play Ball Animation:**
- Speed multiplied: balls drop 2x faster in auto-play
- Multiple balls can be in flight simultaneously (max 3)
- Each new ball drops 500ms after the previous one starts

### 4.4 Multiplier/Result Display

**Position:** Centered above the peg board, overlaying the top area
**Visibility:** Shows only during/after each drop, fades out after 2 seconds

**Typography:**
- Font: JetBrains Mono
- Size: 48px (desktop), 32px (mobile)
- Weight: Bold (700)
- Format: "XXx" (e.g., "5.6x", "1,000x")

**Color by Result:**
| Result | Color |
|--------|-------|
| ≥ 100x | `#F59E0B` (gold) with text-shadow glow |
| 10x – 99x | `#EF4444` (red) |
| 2x – 9.9x | `#F97316` (orange) |
| 1x – 1.9x | `#00E5A0` (green) |
| < 1x | `#9CA3AF` (muted gray) |

**Animation:**
- Entrance: scale from 0.5 → 1.0, opacity 0 → 1, duration 200ms, ease-out
- For wins ≥ 10x: after entrance, pulse scale 1.0 → 1.1 → 1.0 twice
- Exit: fade out over 800ms (or immediately replaced by next drop in auto-play)

**Profit Display (below multiplier):**
- Shows "+$X.XX" (green) for wins, "-$X.XX" (red) for losses
- Font: JetBrains Mono, 20px, regular weight
- Appears 200ms after multiplier, same fade-out timing

### 4.5 Color Coding System

**Risk Level Visual Indicators:**

| Risk | Button Color | Board Tint |
|------|-------------|------------|
| Low | `#00E5A0` (green) | Subtle green tint on edge slots |
| Medium | `#F59E0B` (amber) | Subtle amber tint on edge slots |
| High | `#EF4444` (red) | Subtle red tint on edge slots |

**Multiplier Slot Gradient (edge to center):**
- Low Risk: green → green/muted → gray (smooth, most are green-ish)
- Medium Risk: amber → orange → green → gray → dark (wider spread)
- High Risk: red/gold → red → orange → dark → dark → dark (extreme edges vs flat center)

---

## 5. Controls Panel Specification

### 5.1 Bet Amount Control

**Layout:** Card with `#111827` background, `#374151` border, rounded-xl, p-4

**Label:** "Bet Amount" — DM Sans, 14px, `#9CA3AF`

**Input Field:**
- `#1F2937` background, `#374151` border, rounded-lg
- Text: JetBrains Mono, 18px, `#F9FAFB`, right-aligned
- Prefix: "$" in `#6B7280`
- Focus: ring-2 `#00E5A0` at 50% opacity

**+/- Buttons:**
- Circular, 36px diameter
- Background: `#1F2937`, border: `#374151`
- Icon: Minus/Plus from Lucide, `#9CA3AF`
- Hover: background `#374151`, icon `#F9FAFB`
- Click: instant bet amount change, hold for rapid increment

**Quick-Select Buttons Row:**
- Horizontal row of 4 buttons: "½" | "2×" | "Min" | "Max"
- Each: small rounded pill, `#1F2937` bg, `#374151` border
- Font: DM Sans, 12px, `#9CA3AF`
- Hover: `#374151` bg, `#F9FAFB` text
- "½" halves current bet, "2×" doubles, "Min" sets $0.10, "Max" sets $1,000

### 5.2 Risk Level Control

**Label:** "Risk" — DM Sans, 14px, `#9CA3AF`

**Segmented Control (3 buttons in a row):**
- Container: `#1F2937` bg, rounded-lg, p-1
- Each segment: rounded-md, py-2, flex-1
- Inactive: transparent bg, `#9CA3AF` text
- Active states:
  - Low: `#00E5A0` bg at 15% opacity, `#00E5A0` text
  - Medium: `#F59E0B` bg at 15% opacity, `#F59E0B` text
  - High: `#EF4444` bg at 15% opacity, `#EF4444` text
- Font: DM Sans, 14px, semibold
- Transition: 150ms ease background-color change
- When changed: board multiplier slots instantly update colors and values

### 5.3 Rows Control

**Label:** "Rows" — with current value displayed: "Rows: 12"

**Slider:**
- Track: `#374151`, 4px height, rounded-full
- Filled portion: gradient from `#00E5A0` to `#00B4D8`
- Thumb: 20px circle, white fill, 2px `#00E5A0` border
- Range: 8–16
- Snap: integer values only
- Below slider: tick marks showing "8" and "16" at ends

**OR Alternative: Number stepper**
- Same as bet amount +/- but for integers 8-16
- Display current rows number in center

When changed: peg board instantly re-renders with new row count, multiplier slots update.

### 5.4 Drop Ball Button (Primary Action)

**Normal State:**
- Full-width button within controls panel
- Height: 48px (desktop), 44px (mobile)
- Background: `#00E5A0`
- Text: "Drop Ball" — DM Sans, 16px, bold, `#0B0F1A` (dark text on green)
- Border-radius: 10px
- Subtle box-shadow: `0 0 20px rgba(0, 229, 160, 0.2)`
- Cursor: pointer

**Hover State:**
- Background lightens slightly (`#1AFFA8`)
- Box-shadow intensifies: `0 0 30px rgba(0, 229, 160, 0.3)`

**Active/Pressed:**
- Scale: 0.98
- Background: `#00CC8E`

**During Ball Drop (Disabled):**
- Background: `#374151`
- Text: "Dropping..." with animated ellipsis
- Cursor: not-allowed
- Re-enables when ball lands (or immediately in auto-play mode)

**Keyboard shortcut:** Spacebar triggers drop

### 5.5 Auto-Play System

**Toggle:** Switch or button below the Drop button
- Off state: `#1F2937` bg, "Auto" text in `#9CA3AF`
- On state: `#00E5A0` bg at 15%, "Auto" text in `#00E5A0`, pulsing dot indicator

**Auto-Play Options (dropdown/popover):**
- Number of drops: 10 / 25 / 50 / 100 / ∞
- Speed: Normal (1x) / Fast (2x) / Turbo (3x)
- Stop on win ≥ Xx: optional multiplier threshold
- Stop on profit ≥ $X: optional profit threshold
- Stop on loss ≥ $X: optional loss threshold

**Visual Indicator:**
- When auto-play is running, a small pulsing green dot appears next to "Auto"
- Drop counter shown: "15 / 50 drops"
- "Stop" button replaces "Drop Ball" button during auto-play

**Auto-play behavior:**
- In Normal speed: 1 ball at a time, next drops when previous lands
- In Fast: balls overlap, next drops 500ms after previous starts
- In Turbo: balls drop rapidly, next 300ms after previous, up to 3 in flight

---

## 6. Statistics & History Display

### 6.1 Session Statistics

**Layout:** 2×2 or 1×4 grid of stat cards

**Stats tracked:**
| Stat | Format | Font |
|------|--------|------|
| Total Bets | "47 bets" | JetBrains Mono, 20px, `#F9FAFB` |
| Total Wagered | "$47.00" | JetBrains Mono, 20px, `#F9FAFB` |
| Net Profit | "+$12.30" or "-$5.20" | JetBrains Mono, 20px, green or red |
| Best Win | "29x ($29.00)" | JetBrains Mono, 20px, `#F59E0B` |

Each stat:
- Card: `#111827` bg, `#374151` border, rounded-lg, p-3
- Label: DM Sans, 12px, `#6B7280` (above the number)
- Value: JetBrains Mono (as above)
- Update animation: number count-up/down over 300ms when value changes

**Additional stats (expandable "More Stats" section):**
- Total Returns
- Biggest Loss
- Current Streak (wins in a row)
- Best Streak
- Average Multiplier
- Win Rate %

### 6.2 Bet History Table

**Layout:** Scrollable table below the main game area (desktop) or in a collapsible section (mobile)

**Columns:**
| Column | Width | Alignment | Content |
|--------|-------|-----------|---------|
| # | 40px | Center | Row number (most recent first) |
| Bet | 80px | Right | "$1.00" — JetBrains Mono |
| Multi | 80px | Right | "5.6x" — colored by tier |
| Profit | 100px | Right | "+$4.60" green or "-$0.50" red |
| Risk | 60px | Center | Badge (Low/Med/High) |
| Rows | 40px | Center | "12" |

**Behavior:**
- Shows last 25 bets (scrollable for more)
- New bets insert at top with slide-down animation (200ms)
- Alternating row backgrounds: `#0B0F1A` and `#111827`
- Hover: row highlights to `#1F2937`

### 6.3 "What You Would Have Won" Display

**Trigger:** Appears after 5+ bets in a session

**Layout:** Prominent card, `#111827` bg, green border (`#00E5A0`), rounded-xl, p-6

**Content:**
```
"If you played with real money..."

$47.00 wagered → $59.30 returned

Net Profit: +$12.30

Top casino for Plinko:
[Casino Card — e.g., Stake: 200% up to $2K]
[CTA: "Spin the Deal Wheel →"]
```

**Typography:**
- Headline: DM Sans, 16px, `#9CA3AF`
- Wagered/Returned: JetBrains Mono, 24px, `#F9FAFB`
- Net Profit: JetBrains Mono, 28px, green or red
- Casino recommendation: standard casino card component

**Animation:** Slides in from right (desktop) or bottom (mobile) on first appearance

---

## 7. Sound Design Notes (Visual Equivalents)

Since our simulator has no audio, visual cues replace sound feedback:

| Audio Cue (Real Casino) | Visual Replacement |
|------------------------|-------------------|
| Peg hit "tick" sound | Peg flashes green, 150ms |
| Ball landing "thud" | Slot scale pulse + ball bounce |
| Small win "ding" | Green flash on result text |
| Big win "fanfare" | Screen-edge glow + particle burst |
| Jackpot "explosion" | Full gold particle explosion + screen shake |
| Auto-play "tick" | Small pulse on drop counter |
| Button click "pop" | Button scale 0.95 → 1.0 micro-animation |

**Haptic Feedback (mobile):** If Vibration API is available:
- Drop button: short vibration (50ms)
- Win ≥ 10x: medium vibration (100ms)
- Jackpot: pattern vibration (100ms-50ms-100ms)

---

## 8. Edge Cases & Error States

### 8.1 Rapid Clicking
- Drop button disabled during ball flight
- If auto-play is off, queue max 1 pending drop
- Visual: button shows disabled state immediately on click

### 8.2 Auto-Play at Max Speed
- Cap at 3 balls in flight simultaneously
- If device FPS drops below 30, automatically reduce to 2 balls
- Stats update after each ball lands, not during flight

### 8.3 Browser Resize Mid-Game
- Board re-renders on resize (debounced 200ms)
- Ball in flight: complete current animation at old dimensions, next ball uses new dimensions
- Multiplier slots always recalculate positions on resize

### 8.4 Mobile Orientation Changes
- Board recalculates to fill available width
- Controls panel reflows to horizontal layout in landscape
- No content cut off during transition

### 8.5 Touch vs Click
- All buttons must have minimum 44px touch targets
- Drop button: full width on mobile for easy thumb access
- Bet amount: large enough tap targets for +/- buttons
- Slider: enlarged touch area (32px around track)

### 8.6 Extreme Values
- Bet at $0.10 with 1,000x win: display "$100.00" correctly
- Very long auto-play sessions: reset display periodically to prevent number overflow
- Net profit display: handle "$-999.99" to "+$99,999.99" range

### 8.7 Connection/Performance
- Since this is client-side only (no server), no connection issues
- If canvas rendering is slow: reduce ball trail effect, disable peg glow animations
- Fallback: if canvas not supported, show simplified CSS-only version with just result

---

## 9. Strategy Preset Specifications

### 9.1 Flat Betting (Default)
- Bet amount stays the same every drop
- No automatic adjustments
- Best for: learning the game, steady play

### 9.2 Martingale
- After a LOSS (< 1x): double the bet
- After a WIN (≥ 1x): reset to base bet
- Auto-stop if bet exceeds max ($1,000) or bankroll is insufficient
- Display warning: "Martingale can lead to rapid bankroll depletion"

### 9.3 Anti-Martingale (Paroli)
- After a WIN (≥ 1x): double the bet
- After a LOSS (< 1x): reset to base bet
- Auto-stop after 3 consecutive wins (take profit)

### 9.4 D'Alembert
- After a LOSS: increase bet by 1 unit ($0.10)
- After a WIN: decrease bet by 1 unit (minimum: base bet)
- Gentler progression than Martingale

### 9.5 Custom
- User defines: "On win, multiply bet by ___" and "On loss, multiply bet by ___"
- User defines: reset conditions, stop conditions

**Strategy Controls Location:** Collapsible panel below bet amount in controls panel
**Strategy Active Indicator:** Small badge on bet amount field showing active strategy name

---

## 10. Conversion Integration Points

### 10.1 Casino Recommendation Sidebar (Desktop)
- Position: right column, below session stats
- Content: 2-3 casino cards showing Plinko-specific offers
- Filter: only show casinos from CASINOS constant that have "plinko" in their games array
- Each card: casino name (colored), offer, "Claim Deal →" link to /deals

### 10.2 "Spin the Deal Wheel" CTA
- Position: below casino cards in sidebar
- Trigger: always visible, but becomes PROMINENT (pulsing border, larger) after 10+ bets
- Style: `#00E5A0` border, `#111827` bg, with wheel icon
- Text: "Spin the Deal Wheel" + "Win exclusive Plinko bonuses"

### 10.3 "What You Would Have Won" Display
- Trigger: after 5+ bets
- Position: sidebar on desktop, inline card on mobile
- Shows real money equivalent of paper money results
- Includes casino recommendation and CTA to /deals
- Updates in real-time after each bet

### 10.4 Post-Session Nudge
- Trigger: when user hasn't dropped a ball for 60 seconds after 10+ bets
- Subtle slide-in from bottom: "Ready to play for real? Spin the Deal Wheel to unlock exclusive bonuses at top Plinko casinos."
- Dismissable, only shown once per session

### 10.5 Integration Rules
- CTAs should NEVER interrupt gameplay (no modals during a drop)
- Casino links must open in new tab: `target="_blank" rel="noopener noreferrer"`
- Responsible gambling disclaimer must be visible on the page at all times
- All conversion elements should feel like helpful suggestions, not pushy sales

---

## 11. Technical Implementation Notes

### 11.1 Recommended Tech Stack
- **Canvas rendering:** HTML5 Canvas API (not Matter.js — too heavy for a visual-only simulation)
- **Animation loop:** `requestAnimationFrame` for smooth 60fps ball animation
- **State management:** React useState/useReducer for game state, useRef for canvas
- **Random number generation:** `crypto.getRandomValues()` for provably fair-style randomness

### 11.2 Performance Targets
- Ball drop animation: 60fps on mid-range mobile (iPhone 12, Pixel 6)
- Initial render: < 100ms after component mount
- Re-render on config change (risk/rows): < 50ms
- Auto-play mode: handle 100+ drops without memory leaks

### 11.3 Canvas Rendering Strategy
- Draw pegs once on config change (static layer)
- Draw ball on animation layer (redrawn each frame)
- Draw multiplier slots as HTML elements positioned below canvas (easier styling)
- Use `will-change: transform` on canvas container

### 11.4 File Structure Suggestion
```
components/games/plinko/
├── PlinkoGame.tsx          # Main component, orchestrates layout
├── PlinkoBoard.tsx         # Canvas rendering (pegs + ball)
├── PlinkoControls.tsx      # Controls panel (bet, risk, rows, drop)
├── PlinkoSlots.tsx         # Multiplier slots display
├── PlinkoStats.tsx         # Session statistics
├── PlinkoBetHistory.tsx    # Bet history table
├── PlinkoSidebar.tsx       # Casino cards + conversion CTAs
├── usePlinkoGame.ts        # Game logic hook (state, calculations)
├── plinkoMultipliers.ts    # Multiplier tables data
├── plinkoAnimation.ts      # Canvas animation utilities
└── plinkoTypes.ts          # TypeScript types specific to Plinko
```

---

## 12. Accessibility

- Drop button: keyboard accessible (Space/Enter)
- All controls: proper `aria-label` attributes
- Risk level: `role="radiogroup"` with `aria-checked`
- Screen reader: announce result after each drop ("You won 5.6x, profit $4.60")
- Reduced motion: respect `prefers-reduced-motion` — skip ball animation, show result instantly
- Color contrast: all text meets WCAG AA (4.5:1 minimum)

---

## 13. Responsible Gambling

The following must be present on the Plinko page at all times:

**Footer disclaimer (always visible):**
> "18+ | Gambling involves risk. Only bet what you can afford to lose. PaperBet.io is a free simulator for educational purposes. We are not a gambling site."

**Session limit indicator:**
- After 100 bets in a session, show a gentle reminder: "You've played 100 rounds. Remember, this is practice mode."
- Non-intrusive: small banner below the controls panel, dismissable
