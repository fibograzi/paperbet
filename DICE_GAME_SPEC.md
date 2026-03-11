# Dice — Complete Game Specification for PaperBet.io

---

## 1. Game Overview

Dice is a number-prediction game where the player bets whether a randomly generated number (0.00 to 99.99) will land **over** or **under** a chosen target threshold. The player controls a slider to set their target, which dynamically adjusts both the win chance and the payout multiplier. Results are instant — each round resolves in under a second.

**Think of it as:** A pure probability machine. No animations to watch (like Crash), no boards to reveal (like Mines), no passive outcomes (like Plinko). Dice is raw math — pick your odds, place your bet, see the result. The slider gives players an unmatched sense of control over their risk/reward ratio.

**Why it's popular in crypto casinos:** Dice is the original crypto casino game and remains the highest-volume game across platforms like Stake, BC.Game, and Primedice. Its appeal is simplicity: one slider, one click, instant result. The continuous win-chance spectrum (0.01% to 98%) means every player finds their comfort zone. Auto-bet strategies (Martingale, Paroli) are easy to configure, making Dice the preferred game for system-testing and high-volume grinding.

**Psychological hooks:** The visible slider creates an illusion of precision control ("I chose exactly 47.5% odds"). The inversely-linked multiplier and win chance create a constant temptation to "push the slider a little higher for more reward." The speed enables rapid-fire sessions where losses blur together and wins feel frequent. The Roll Over / Roll Under toggle adds a "second dimension" that feels like a strategic choice (even though mathematically it's symmetric). Previous results create pattern-seeking behavior ("the last 5 rolls were under 50, it must swing back").

**Design Philosophy — What Makes Dice Unique:**

1. **The Slider IS the Game.** In Plinko, the canvas is the star. In Crash, the chart is. In Mines, the grid is. In Dice, **the slider bar** is the entire visual identity. It must be polished, responsive, and satisfying to interact with. The slider bar should feel as premium as a Bloomberg terminal widget.

2. **Fastest Game in the Library.** Dice rounds are faster than any other game — no counter animation, no card flips, no tile reveals. This means the auto-bet system is the most important feature — more players will use auto-bet in Dice than any other game. The history table fills up fastest — virtualization is essential.

3. **Most Strategic Feel.** Four linked parameters (target, win chance, multiplier, direction) give players the most "knobs to turn." Strategy presets are more varied than any other game. The direction toggle adds a psychological dimension unique to Dice. This makes Dice feel the most "analytical" — matching PaperBet's "Bloomberg meets gaming" positioning.

4. **Best Conversion Tool.** Because Dice is so fast and the math so transparent, it's the best game for demonstrating: "You would have won $X with real money." The slider makes probability intuitive — non-math-savvy players "get it" faster than any other game.

---

## 2. Exact Game Mechanics

### 2.1 Step-by-Step Game Flow — Manual Mode

1. Player sets **bet amount** (default: $1.00 paper money)
2. Player adjusts the **slider** to set a target number (or types into any linked field)
3. Player selects **Roll Over** or **Roll Under** (default: Roll Over)
4. **Win Chance**, **Multiplier**, and **Profit on Win** auto-update based on slider position and direction
5. Player clicks **"Roll"**
6. Game generates a random number between 0.00 and 99.99 (inclusive)
7. Result is displayed on the slider bar with animation
8. **If Roll Over and result > target:** WIN — player receives `bet × multiplier`
9. **If Roll Over and result ≤ target:** LOSS — player loses bet
10. **If Roll Under and result < target:** WIN — player receives `bet × multiplier`
11. **If Roll Under and result ≥ target:** LOSS — player loses bet
12. Stats update, result logged in history, next round can begin immediately

### 2.2 Step-by-Step Game Flow — Auto Mode

1. Player sets **bet amount**
2. Player configures target, direction, and multiplier/win chance as desired
3. Player sets **number of rolls** (10 / 25 / 50 / 100 / 500 / ∞)
4. Player sets **speed** (Normal / Fast / Turbo)
5. Player configures **on win / on loss** adjustments (bet, target, direction)
6. Player sets **stop conditions** (stop on profit ≥ $X, stop on loss ≥ $X)
7. Player clicks **"Start Auto"** → rounds execute automatically
8. Each round: generate result → determine win/loss → apply adjustments → check stops → repeat
9. Auto-bet stops when: all rounds completed, stop condition hit, bankroll depleted, or player clicks **"Stop"**

### 2.3 Number Generation (Outcome Determination)

**NOT a physics simulation.** The outcome is determined BEFORE the animation begins:

1. Generate a random 32-bit unsigned integer using `crypto.getRandomValues()`
2. Map to range 0–9,999 via modulo: `raw = buffer[0] % 10000`
3. Convert to 2-decimal result: `result = raw / 100` → produces 0.00 to 99.99
4. Compare result against target and direction → WIN or LOSS
5. Animate the result indicator to the predetermined position

**Total possible outcomes:** 10,000 (0.00, 0.01, 0.02, ..., 99.98, 99.99)

### 2.4 Win/Loss Determination Rules

**Roll Over target T:**
- WIN if result is **strictly greater than** T
- LOSS if result is **less than or equal to** T

**Roll Under target T:**
- WIN if result is **strictly less than** T
- LOSS if result is **greater than or equal to** T

**Boundary rule:** If the result equals the target exactly, it is **always a LOSS** for both directions. This is by design — it prevents ambiguity and marginally favors the house.

### 2.5 Configurable Parameters

| Parameter | Range | Default | Step |
|-----------|-------|---------|------|
| Bet Amount | $0.10 – $1,000.00 | $1.00 | $0.10 |
| Win Chance | 0.01% – 98.00% | 49.99% | 0.01% |
| Multiplier | 1.0102x – 9,900.00x | 1.9804x | Auto-calculated |
| Direction | Roll Over / Roll Under | Roll Over | Toggle |
| Profit on Win | Auto-calculated | — | Read-only |

**Target number** is derived from win chance and direction:
- Roll Over: `target = 99.99 - winChance`
- Roll Under: `target = winChance`

**Valid target ranges per direction:**
- Roll Over: 1.99 (98% win chance) to 99.98 (0.01% win chance)
- Roll Under: 0.01 (0.01% win chance) to 98.00 (98% win chance)

### 2.6 Linked Fields (4-Way Sync)

All four game parameters are interconnected. Changing ANY one recalculates all others:

- Change **slider / target** → updates win chance, multiplier, profit on win
- Change **direction** → recalculates win chance, target adjusts, multiplier updates
- Change **win chance** (direct input) → moves slider to matching target position, updates multiplier
- Change **multiplier** (direct input) → reverse-calculates win chance → moves slider

**Swap button behavior:**
- Clicking the "⟷" swap icon switches direction AND mirrors the target to preserve the same win chance
- Formula: `newTarget = 99.99 - currentTarget`
- Example: Roll Over 30.00 (win chance 69.99%) → Roll Under 69.99 (win chance 69.99%)
- The player's intended risk level is preserved while switching direction

---

## 3. Mathematical Model

### 3.1 House Edge & RTP

- **RTP: 99.00%** (1% house edge)
- The house edge is embedded in the multiplier formula (`99` instead of `100`)
- This holds for ANY target and ANY direction — the house edge is constant
- Expected Value: `EV = bet × multiplier × (winChance / 100) = bet × (99 / winChance) × (winChance / 100) = bet × 0.99`

### 3.2 Multiplier Formula

```
multiplier = 99 / winChance
```

Where `winChance` is expressed as a percentage (e.g., 49.99 for 49.99%). The `99` represents the 99% RTP — a perfectly fair game would use `100`.

**Inverse:** Given a desired multiplier:
```
winChance = 99 / multiplier
```

### 3.3 Win Chance Formulas

**Roll Over target T:**
```
winChance = 99.99 - T     (percentage)
```
Winning outcomes: T+0.01 through 99.99 → count = (99.99 - T) × 100 out of 10,000

**Roll Under target T:**
```
winChance = T              (percentage)
```
Winning outcomes: 0.00 through T-0.01 → count = T × 100 out of 10,000

### 3.4 Complete Multiplier Table — Roll Over

| Target | Win Chance | Multiplier | Description |
|--------|-----------|------------|-------------|
| 1.99 | 98.00% | 1.0102x | Maximum safety |
| 5.00 | 94.99% | 1.0422x | Very safe |
| 10.00 | 89.99% | 1.1001x | Safe grinder |
| 25.00 | 74.99% | 1.3202x | Moderate-safe |
| 33.33 | 66.66% | 1.4851x | Two-thirds |
| 50.00 | 49.99% | 1.9804x | Classic coin-flip |
| 66.66 | 33.33% | 2.9703x | One-third |
| 75.00 | 24.99% | 3.9616x | Risky |
| 90.00 | 9.99% | 9.9099x | Sniper |
| 95.00 | 4.99% | 19.8397x | High risk |
| 98.00 | 1.99% | 49.7487x | Moon shot |
| 99.00 | 0.99% | 100.0000x | Extreme |
| 99.98 | 0.01% | 9,900.00x | Maximum risk |

### 3.5 Complete Multiplier Table — Roll Under

| Target | Win Chance | Multiplier | Description |
|--------|-----------|------------|-------------|
| 98.00 | 98.00% | 1.0102x | Maximum safety |
| 90.00 | 90.00% | 1.1000x | Very safe |
| 75.00 | 75.00% | 1.3200x | Moderate-safe |
| 50.00 | 50.00% | 1.9800x | Classic coin-flip |
| 33.33 | 33.33% | 2.9703x | One-third |
| 25.00 | 25.00% | 3.9600x | Risky |
| 10.00 | 10.00% | 9.9000x | Sniper |
| 5.00 | 5.00% | 19.8000x | High risk |
| 2.00 | 2.00% | 49.5000x | Moon shot |
| 1.00 | 1.00% | 99.0000x | Extreme |
| 0.10 | 0.10% | 990.0000x | Ultra extreme |
| 0.01 | 0.01% | 9,900.00x | Maximum risk |

### 3.6 EV Proof (Constant Across All Settings)

For any bet amount B, win chance W%, and multiplier M:

```
EV = B × M × (W / 100)
   = B × (99 / W) × (W / 100)
   = B × 99 / 100
   = B × 0.99
```

The expected return is always 99% of the bet, regardless of target, direction, or multiplier chosen. This is mathematically elegant — the player's "strategy" is purely about variance preference, not expected value.

### 3.7 Win Tier Classification

| Tier | Multiplier Range | Win Chance Range | Description |
|------|-----------------|------------------|-------------|
| Penny Win | < 1.5x | > 66% | Frequent, tiny profits |
| Small Win | 1.5x – 3x | 33% – 66% | Standard range |
| Good Win | 3x – 10x | 10% – 33% | Noticeable profit |
| Big Win | 10x – 50x | 2% – 10% | Exciting result |
| Huge Win | 50x – 100x | 1% – 2% | Rare and impactful |
| Jackpot | 100x+ | < 1% | Legendary payout |

---

## 4. Visual Design Specification

### 4.1 Game Accent Color

**Primary accent: Teal `#14B8A6`**

Dice uses teal as its game-specific accent color, distinct from:
- Plinko's green (#00E5A0)
- Crash's cyan (#00B4D8)
- Mines' amber (#F59E0B)
- Keno's purple (#A855F7)
- HiLo's indigo (#6366F1)

Teal conveys analytical precision and mathematical sophistication — matching Dice's identity as the most "Bloomberg terminal" game in the library. It is clearly distinct from the green (#00E5A0) and red (#EF4444) used for the slider's winning/losing zones.

**Teal palette:**
```
--dice-accent: #14B8A6          /* Primary teal — Roll button, active states */
--dice-accent-light: #2DD4BF    /* Light teal — hover states */
--dice-accent-dark: #0D9488     /* Dark teal — pressed states */
--dice-glow: rgba(20, 184, 166, 0.15)  /* Teal glow for hover effects */
```

**Zone colors (NOT the accent — these are game-state colors):**
```
--dice-win-zone: #00E5A0        /* Green — winning range on slider */
--dice-lose-zone: #EF4444       /* Red — losing range on slider (60% opacity) */
```

### 4.2 Overall Layout

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
│            │   │ Multi  │ Profit │   │                        │
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
│   (centered, big)        │
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
├─────────────────────────┤
│ WHAT YOU WOULD HAVE WON  │
└─────────────────────────┘
```

**Tablet (768–1023px):**
```
┌──────────────────────────────────────────┐
│ GAME AREA (full width)                   │
│ Results + Slider + Parameters            │
├───────────────────┬──────────────────────┤
│ CONTROLS          │ SESSION STATS        │
├───────────────────┴──────────────────────┤
│ CASINO CARDS + BET HISTORY               │
└──────────────────────────────────────────┘
```

### 4.3 The Slider Bar (Core Visual Element)

The slider bar is the **signature UI element** of Dice — it's what makes this game visually distinctive.

**Container:**
- Full width of game area
- Height: 56px (desktop), 48px (mobile)
- Background: `#1F2937` (elevated surface)
- Border: 1px `#374151`
- Border-radius: 12px
- Padding: 8px horizontal

**The Bar Track:**
- Height: 12px, rounded-full
- Split into two colored zones by the slider thumb position:
  - **Winning zone:** `#00E5A0` (green) — the range where the result means a WIN
  - **Losing zone:** `#EF4444` (red) at 60% opacity — the range where the result means a LOSS
- **Roll Over:** green is to the RIGHT of the thumb, red to the LEFT
- **Roll Under:** green is to the LEFT of the thumb, red to the RIGHT
- The bar visually shows the probability split — a 75% win chance means 75% of the bar is green
- Zone transition: smooth CSS transitions on `width` property when slider is dragged

**The Slider Thumb:**
- Shape: circle, 28px diameter (desktop), 24px (mobile)
- Fill: white (`#F9FAFB`)
- Border: 3px solid `#14B8A6` (teal accent)
- Shadow: `0 2px 8px rgba(0, 0, 0, 0.3)` for subtle depth
- Hover: border becomes `#2DD4BF` (lighter teal), shadow intensifies
- Active (dragging): scale 1.1, border becomes 4px
- Cursor: grab (hover), grabbing (active)

**Target Number Label (above thumb):**
- Floating label attached to the thumb, always visible when interacting
- Font: JetBrains Mono, 14px, bold, `#F9FAFB`
- Background: `#374151`, rounded-md, px-2 py-1
- Small downward-pointing triangle (CSS arrow) connecting label to thumb
- Shows exact target value: "50.00"

**Scale Labels:**
- Below the bar: "0" on the left, "25", "50", "75", "100" evenly spaced
- Font: JetBrains Mono, 11px, `#6B7280`
- Tick marks: small vertical lines (4px height) at each label position

**Result Marker (after roll):**
- A vertical line/marker appears on the bar at the exact position where the result landed
- Color: bright white (`#F9FAFB`) with color glow
- Width: 3px, full height of the bar track (12px)
- Border-radius: 1.5px
- If result in green zone: `box-shadow: 0 0 8px rgba(0, 229, 160, 0.6)` (green glow)
- If result in red zone: `box-shadow: 0 0 8px rgba(239, 68, 68, 0.6)` (red glow)
- Label above marker: exact result value in JetBrains Mono, 12px
- The result marker stays visible until the next roll
- Appears via slide-in animation (see Section 6)

### 4.4 The Result Display (Above Slider)

**Position:** Centered above the slider bar, within the game area container

**Container:**
- Background: `#0B0F1A`
- Border: 1px `#374151`, rounded-xl
- Padding: 24px (desktop), 16px (mobile)
- Min-height: 160px (desktop), 120px (mobile)

**Result Number:**
- Font: JetBrains Mono, 72px (desktop), 48px (mobile), Bold (700)
- Position: centered in container
- Format: "XX.XX" (always 2 decimal places, e.g., "07.42", "99.01")
- Color by result:
  - WIN: `#00E5A0` (green)
  - LOSS: `#EF4444` (red)
- Text-shadow: matching color at 30% opacity, `0 0 20px`

**Profit/Loss Display (below result number):**
- WIN: "+$X.XX" in `#00E5A0`, JetBrains Mono, 24px
- LOSS: "-$X.XX" in `#EF4444`, JetBrains Mono, 24px
- Appears 100ms after result number

**Win/Loss Label (below profit):**
- "WON" badge in green (`#00E5A0` bg at 15%, text `#00E5A0`) or "LOST" badge in red (`#EF4444` bg at 15%, text `#EF4444`)
- Font: DM Sans, 12px, semibold, uppercase, letter-spacing 1px
- Rounded pill shape, px-3 py-1

**Idle State (before first roll or between rolls):**
- Shows last result at 40% opacity
- Or pulsing placeholder text: "ROLL THE DICE" in `#6B7280`, DM Sans, 20px, semibold
- Subtle opacity animation: 0.3 → 0.7, 2s loop

### 4.5 The Game Parameters Row (Below Slider)

**Layout:** Horizontal row of 4 linked input fields + direction toggle

**Desktop — full row:**
```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────────┐
│  Target   │  │Win Chance│  │Multiplier│  │ Profit   │  │[Over]  ⟷  [Under]│
│  50.00    │  │ 49.99%   │  │ 1.9804x  │  │  $0.98   │  │                    │
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └────────────────────┘
```

**Mobile — 2×2 grid + toggle:**
```
┌────────────┬────────────┐
│  Target    │ Win Chance  │
│  50.00     │  49.99%     │
├────────────┼────────────┤
│ Multiplier │  Profit     │
│  1.9804x   │  $0.98      │
├────────────┴────────────┤
│  [Roll Over] [Roll Under]│
└─────────────────────────┘
```

**Each Field (first three are EDITABLE):**
- Card: `#111827` bg, `#374151` border, rounded-lg, p-3
- Label: DM Sans, 12px, `#6B7280` (above value)
- Value: JetBrains Mono, 16px, `#F9FAFB`
- Focus ring: `#14B8A6` (teal) at 50% opacity
- Target, Win Chance, Multiplier: editable input — clicking enables typing
- Profit on Win: READ-ONLY (displays `bet × (multiplier - 1)`)
- Value formatting: Target = "50.00", Win Chance = "49.99%", Multiplier = "1.9804x", Profit = "$0.98"

**Roll Over / Roll Under Toggle:**
- Segmented control with two options + swap button
- Container: `#1F2937` bg, rounded-lg, p-1
- Active segment: `#14B8A6` bg at 15%, `#14B8A6` text (teal accent)
- Inactive segment: transparent bg, `#9CA3AF` text
- Font: DM Sans, 14px, semibold
- Transition: 200ms ease on background and text color
- **Swap button (⟷):** Small icon button between the two segments
  - Icon: Lucide `ArrowLeftRight`, 16px, `#6B7280`
  - Hover: `#F9FAFB` icon color
  - Clicking mirrors target to preserve win chance while switching direction

### 4.6 Previous Results Row

**Position:** Across the top of the game area (desktop) or above the result display (mobile)

**Each Badge:**
- Rounded pill, height: 28px, px-3
- Font: JetBrains Mono, 12px, bold
- Shows the result number: "47.83", "02.14", "99.01"
- Color:
  - WIN for that roll: `#00E5A0` bg at 10%, `#00E5A0` text
  - LOSS for that roll: `#EF4444` bg at 10%, `#EF4444` text
- Note: color is relative to what the player bet on that specific roll, not absolute
- Shows last 20 results
- Horizontal scroll on mobile with CSS `overflow-x: auto`, `scrollbar-width: none`
- New results animate in from the left with a push animation
- Gap: 6px between badges

**Streak Indicator (below badges, optional):**
- Tiny dots showing win/loss pattern: green dot = win, red dot = loss
- Dot size: 4px, gap: 2px
- Shows at-a-glance streak patterns for the last 20 results

### 4.7 Color Coding Summary

| Element | Color | Usage |
|---------|-------|-------|
| Game accent | `#14B8A6` (teal) | Roll button, active tabs, focus rings, thumb border |
| Win zone (slider) | `#00E5A0` (green) | Winning range on slider bar |
| Lose zone (slider) | `#EF4444` at 60% opacity | Losing range on slider bar |
| Win result | `#00E5A0` (green) | Result number, profit text, result badge |
| Loss result | `#EF4444` (red) | Result number, loss text, result badge |
| Roll Over badge | `#00B4D8` (cyan) at 15% bg | Direction indicator in history |
| Roll Under badge | `#F97316` (orange) at 15% bg | Direction indicator in history |
| Jackpot celebration | `#F59E0B` (gold/amber) | Particles, glow, multiplier text for ≥100x |
| Idle/neutral | `#6B7280` (muted gray) | Placeholder text, scale labels |

---

## 5. Controls Panel Specification

### 5.1 Manual / Auto Tab Toggle

**Position:** Top of the controls panel

**Layout:**
- Container: `#1F2937` bg, rounded-lg, p-1, flex
- Two tabs: "Manual" | "Auto"
- Each tab: flex-1, py-2, rounded-md, centered text
- Active tab: `#0B0F1A` bg, `#F9FAFB` text, font-semibold
- Inactive tab: transparent bg, `#6B7280` text
- Transition: 150ms ease background slide

### 5.2 Bet Amount Control

**Identical to all other PaperBet games** — same card layout, input field, +/- buttons, quick-select buttons.

**Layout:** Card with `#111827` background, `#374151` border, rounded-xl, p-4

**Label:** "Bet Amount" — DM Sans, 14px, `#9CA3AF`

**Input Field:**
- `#1F2937` background, `#374151` border, rounded-lg
- Text: JetBrains Mono, 18px, `#F9FAFB`, right-aligned
- Prefix: "$" in `#6B7280`
- Focus: ring-2 `#14B8A6` at 50% opacity

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

| Parameter | Value |
|-----------|-------|
| Min Bet | $0.10 |
| Max Bet | $1,000.00 |
| Default | $1.00 |
| Step | $0.10 |

### 5.3 Roll Button (Primary Action)

**Normal State:**
- Full-width button within controls panel
- Height: 48px (desktop), 44px (mobile)
- Background: `#14B8A6` (teal accent)
- Text: "Roll" — DM Sans, 16px, bold, `#0B0F1A`
- Icon: Lucide `Dices` icon, 18px, to the left of text
- Border-radius: 10px
- Box-shadow: `0 0 20px rgba(20, 184, 166, 0.2)`
- Cursor: pointer

**Hover:**
- Background: `#2DD4BF` (light teal)
- Box-shadow: `0 0 30px rgba(20, 184, 166, 0.3)`

**Active/Pressed:**
- Scale: 0.98
- Background: `#0D9488` (dark teal)

**During Roll Animation (Disabled):**
- Background: `#374151`
- Text: "Rolling..." with animated ellipsis
- Cursor: not-allowed
- Duration: only disabled for animation length (~600ms normal, ~100ms fast)

**Keyboard shortcut:** Spacebar triggers roll

### 5.4 Animation Speed Toggle

**Position:** Below the Roll button

**Layout:**
- Label: "Speed" — DM Sans, 12px, `#6B7280`
- Segmented control, two options: "Normal" | "Fast"
- Container: `#1F2937` bg, rounded-lg, p-1
- Active: `#14B8A6` bg at 15%, `#14B8A6` text
- Inactive: transparent bg, `#9CA3AF` text

**Behavior:**
- **Normal:** Full slider animation (600ms) — traveling dot, zone flash, bounce
- **Fast:** Instant result (100ms) — marker appears immediately, quick fade-in for result number

### 5.5 Auto-Bet System

When the "Auto" tab is active, the controls panel shows:

**Bet Amount:** Same as manual mode (§5.2)

**Number of Rolls:**
- Label: "Number of Rolls" — DM Sans, 14px, `#9CA3AF`
- Segmented control: 10 | 25 | 50 | 100 | 500 | ∞
- Active: `#14B8A6` bg at 15%, `#14B8A6` text
- Default: 100

**Speed:**
- Segmented control: Normal | Fast | Turbo
- Normal: 1 roll per 1.5s (full animation)
- Fast: 1 roll per 0.8s (abbreviated animation)
- Turbo: 1 roll per 0.3s (instant result, flash only)

**On Win (collapsible section):**

*Bet Adjustment:*
- Radio: "Keep same" (default) | "Increase by ___%" | "Increase by $___" | "Decrease by $___" | "Reset to base bet"
- Input: percentage or dollar field, JetBrains Mono, `#1F2937` bg
- Percentage mode: scales bet (e.g., +100% = double). Flat mode: adds/subtracts fixed amount (e.g., +$0.10)
- Decrease clamps at minimum bet ($0.10)

*Target Adjustment:*
- Radio: "Keep same" (default) | "Increase by ___" (riskier) | "Decrease by ___" (safer)
- Input: numeric field for target adjustment amount

*Direction:*
- Toggle: "Switch direction on win" (default: off)

**On Loss (collapsible section):**

*Bet Adjustment:*
- Radio: "Keep same" (default) | "Increase by ___%" | "Increase by $___" | "Decrease by $___" | "Reset to base bet"
- Same options as On Win

*Target Adjustment:*
- Radio: "Keep same" (default) | "Increase by ___" | "Decrease by ___"

*Direction:*
- Toggle: "Switch direction on loss" (default: off)

**Stop Conditions:**
- "Stop on Profit ≥ $___" — toggle + amount input, default: off
- "Stop on Loss ≥ $___" — toggle + amount input, default: off

**Advanced Conditions (collapsible panel):**
- Stop on win streak ≥ N
- Stop on loss streak ≥ N
- Increase bet after N consecutive losses (delayed Martingale)
- Reset bet after N consecutive wins

**Start/Stop Auto Button:**
- Start: same styling as Roll button but text says "Start Auto"
- Running: changes to "Stop Auto" with `#EF4444` bg, `#F9FAFB` text
- Counter below: "Roll 47 / 100 — W: 28 | L: 19"
- Pulsing teal dot indicator while running

### 5.6 Strategy Presets

**Position:** Collapsible "Strategy" panel below auto-bet settings in Auto tab

**Header:** "Strategy Presets" with chevron toggle, DM Sans, 14px, `#9CA3AF`

**Strategy Grid:** 2-column grid of preset buttons

| Strategy | Description | Target | On Win (Bet) | On Loss (Bet) |
|----------|-------------|--------|--------------|---------------|
| Safe Grinder | Tiny frequent wins | Roll Over 10.00 (89.99%) | Keep same | Keep same |
| Coin Flip | Classic 50/50 | Roll Over 50.00 (49.99%) | Keep same | Keep same |
| Sniper | Long droughts, big hits | Roll Over 90.00 (9.99%) | Keep same | Keep same |
| Moon Shot | Lottery-style | Roll Under 1.00 (1.00%) | Keep same | Keep same |
| Martingale | Double on loss, reset on win | Roll Over 50.00 | Reset to base | Increase by 100% |
| Anti-Martingale | Double on win, reset on loss | Roll Over 50.00 | Increase by 100% | Reset to base |
| D'Alembert | +$0.10 on loss, -$0.10 on win | Roll Over 50.00 | Decrease by $0.10 | Increase by $0.10 |
| Delayed Martingale | Flat for 3 losses, then double | Roll Over 50.00 | Reset to base | Increase by 100% after 3 losses |
| Zigzag | Alternate direction each roll | Roll Over 50.00 | Switch direction | Switch direction |
| Custom | Define everything | User-defined | User-defined | User-defined |

**Each Preset Button:**
- `#111827` bg, `#374151` border, rounded-lg, p-3
- Name: DM Sans, 14px, semibold, `#F9FAFB`
- Description: DM Sans, 11px, `#6B7280`
- Active/selected: `#14B8A6` border (2px), `#14B8A6` bg at 10%
- Hover: `#1F2937` bg

**Active Strategy Indicator:**
- When a strategy is active: small teal badge on the bet amount field showing strategy name
- e.g., "Martingale" badge in `#14B8A6` bg at 15%, `#14B8A6` text, rounded-full, px-2 py-0.5
- Warning text for Martingale-type strategies: "Can lead to rapid bankroll depletion" in `#F59E0B`, DM Sans, 11px

---

## 6. Animations & Transitions

### 6.1 Slider Drag Animation

- Green/red zones resize smoothly in real-time as slider is dragged
- All linked fields (target, win chance, multiplier, profit) update at 60fps
- No lag or jumps — CSS `transition: width 0ms` on zone divs (instant tracking)
- Thumb follows touch/cursor position with `will-change: transform`

### 6.2 Roll Result Animation — Normal Mode (600ms)

**Phase 1 — Anticipation (0–100ms):**
- Slider bar track pulses (brightness increase via filter, 1.0 → 1.15 → 1.0)
- Result display clears previous result, shows brief spinning blur placeholder
- Roll button enters disabled state

**Phase 2 — Travel (100–400ms):**
- A glowing dot/marker travels along the slider bar from one end to the result position
- Direction: alternates randomly (left-to-right or right-to-left) for variety
- The dot moves with ease-out deceleration: fast start, slows toward end
- Dot: 8px circle, white with `box-shadow: 0 0 12px rgba(255, 255, 255, 0.6)`
- Trail: 3 trailing positions at decreasing opacity (0.4, 0.2, 0.1)
- Dot size slightly increases as it decelerates (8px → 10px)

**Phase 3 — Landing (400–600ms):**
- Dot snaps to final position with micro-bounce (overshoot 4px, settle back)
- Dot transforms into the permanent result marker (3px vertical line)
- Zone flash: if WIN, green zone brightness pulses; if LOSS, red zone brightness pulses
- Result number appears in the result display with scale bounce (0.8 → 1.05 → 1.0, ease-out)
- Result label fades in from 0.8 to full opacity

**Phase 4 — Settle (600ms+):**
- Profit/loss text fades in below result (200ms delay, 200ms duration)
- WON/LOST badge appears with slide-up (100ms delay after profit text)
- Result marker remains on slider until next roll
- Roll button re-enables
- Result is added to bet history and previous results row

### 6.3 Roll Result Animation — Fast Mode (100ms)

- No traveling dot or anticipation
- Result marker appears instantly at position with quick opacity fade-in (100ms)
- Result number shows immediately with subtle scale (0.95 → 1.0, 100ms)
- Zone flash is shortened to 50ms
- Profit/loss text appears simultaneously with result

### 6.4 Win Celebration Tiers

| Tier | Condition | Animation |
|------|-----------|-----------|
| Penny Win | Multiplier < 1.5x | Green zone pulses once, profit text shown, subtle |
| Small Win | 1.5x ≤ multi < 3x | Green zone bright pulse, profit floats up 20px then fades, marker glows green |
| Good Win | 3x ≤ multi < 10x | Green flash across full bar track, profit text scales up (1.2x), "+NICE!" micro-text appears above result for 800ms |
| Big Win | 10x ≤ multi < 50x | Green/gold burst particles (8-12) from marker position, screen-edge glow green, result number pulses large (1.15x scale), "BIG WIN" label |
| Huge Win | 50x ≤ multi < 100x | Intense green particle burst (16-20), screen-edge glow intensifies, result text scales to 1.25x with pulsing glow, profit text in gold |
| Jackpot | Multi ≥ 100x | Gold particle explosion from marker (24+), screen shake (2px, 500ms), golden confetti particles from top of game area, result text in `#F59E0B` (gold) with animated text-shadow, entire slider bar briefly tinted gold (300ms) |

### 6.5 Loss Animation

- Red zone brightness briefly dims (200ms pulse down then recover)
- Result number appears in red, slightly muted (opacity 0.85)
- No dramatic animation — losses should feel quick and forgettable
- If in a loss streak ≥ 5: subtle red tint on game area border (200ms), streak dot in results strip emphasizes the streak pattern
- The lack of loss drama is intentional — it reduces pain and encourages replaying

### 6.6 Direction Toggle Animation

- When player switches between Roll Over and Roll Under:
- Green and red zones smoothly swap sides (300ms CSS transition)
- The zones "cross over" like a fluid animation — green shrinks on one side while growing on the other
- Slider thumb stays in its position (if preserving win chance via swap) or moves to new target
- All parameter fields recalculate with subtle counter-up/counter-down animation (200ms)
- Satisfying visual feedback that makes direction switching feel meaningful

### 6.7 Result Badge Entrance (Previous Results Row)

- New result badge slides in from the left with spring animation
- Push effect: existing badges shift right (200ms, ease-out)
- New badge: scale 0.8 → 1.0, opacity 0 → 1 (150ms)
- If more than 20 badges: rightmost badge slides out and fades (150ms)

### 6.8 Idle Animations

- Roll button: subtle breathing glow on box-shadow (opacity 0.15 → 0.25, 2s ease-in-out loop)
- Slider thumb: faint pulse on border opacity (100% → 70% → 100%, 3s loop) when not being interacted with
- Result display placeholder ("ROLL THE DICE"): pulsing opacity (0.3 → 0.7, 2s loop)
- Parameters row: no idle animation (static, always ready for input)

---

## 7. Statistics & History Display

### 7.1 Session Statistics

**Layout:** 2×2 grid of stat cards (uses shared `SessionStats` component)

**Stats tracked:**

| Stat | Format | Font |
|------|--------|------|
| Total Rolls | "247 rolls" | JetBrains Mono, 20px, `#F9FAFB` |
| Total Wagered | "$247.00" | JetBrains Mono, 20px, `#F9FAFB` |
| Net Profit | "+$23.40" or "-$15.20" | JetBrains Mono, 20px, green or red |
| Best Win | "98.72x ($98.72)" | JetBrains Mono, 20px, `#F59E0B` |

Each stat card: `#111827` bg, `#374151` border, rounded-lg, p-3
- Label: DM Sans, 12px, `#6B7280` (above the number)
- Value: JetBrains Mono (as above)
- Update animation: number count-up/down over 300ms when value changes

**Additional stats (expandable "More Stats" section):**
- Total Returns
- Win Rate (%)
- Average Multiplier Played
- Highest Result Rolled (regardless of bet)
- Lowest Result Rolled
- Current Win/Loss Streak
- Best Win Streak
- Best Loss Streak (longest losing streak)
- Average Roll Result
- Biggest Single Loss

### 7.2 Bet History Table

**Layout:** Scrollable table below main game area (uses shared `BetHistory` component with Dice-specific columns)

**Columns:**

| Column | Width | Alignment | Content |
|--------|-------|-----------|---------|
| # | 40px | Center | Row number (most recent first) |
| Bet | 80px | Right | "$1.00" — JetBrains Mono |
| Target | 70px | Right | "50.00" — `#F59E0B` |
| Dir | 55px | Center | "Over" / "Under" badge |
| Roll | 70px | Right | "67.42" — green if win, red if loss |
| Multi | 70px | Right | "1.98x" — JetBrains Mono |
| Profit | 90px | Right | "+$0.98" green or "-$1.00" red |

**Direction Badge Styling:**
- "Over": small pill, `#00B4D8` bg at 15%, `#00B4D8` text, 10px font
- "Under": small pill, `#F97316` bg at 15%, `#F97316` text, 10px font

**Behavior:**
- Shows last 50 bets (higher than other games — Dice generates rapid history)
- New bets insert at top with slide-down animation (200ms)
- Alternating row backgrounds: `#0B0F1A` and `#111827`
- Hover: row highlights to `#1F2937`
- Win rows: subtle left border accent in `#00E5A0` (2px)
- Loss rows: subtle left border accent in `#EF4444` (2px)
- Virtualized rendering for performance (50+ visible rows, 500 max in memory)

### 7.3 "What You Would Have Won" Display

**Trigger:** Appears after 15+ rolls (higher threshold — Dice is fast)

**Layout:** Prominent card, `#111827` bg, teal border (`#14B8A6`), rounded-xl, p-6

**Content:**
```
"If you played with real money..."

$247.00 wagered → $270.40 returned

Net Profit: +$23.40

Top casino for Dice:
[Casino Card — e.g., Stake: 200% up to $2K]
[CTA: "Spin the Deal Wheel →"]
```

Uses shared `RealMoneyDisplay` component.

---

## 8. Sound Design Notes (Visual Equivalents)

Since our simulator has no audio, visual cues replace sound feedback:

| Audio Cue (Real Casino) | Visual Replacement |
|------------------------|-------------------|
| Dice roll "rattle" | Traveling dot animation across slider bar |
| Result "slam" | Marker snaps to position with bounce |
| Small win "ding" | Green zone pulse + profit text pop-in |
| Big win "fanfare" | Gold burst from marker + screen-edge glow |
| Jackpot "explosion" | Gold particle explosion + screen shake + confetti |
| Loss "thud" | Brief red dim, muted — quick and forgettable |
| Slider drag "click" | Real-time zone color update (satisfying visual feedback) |
| Direction switch "flip" | Green/red zone cross-over animation |
| Auto-roll "tick" | Small pulse on roll counter |
| Button click "pop" | Button scale 0.95 → 1.0 micro-animation (50ms) |

**Haptic Feedback (mobile):** If Vibration API is available:
- Roll button: short vibration (50ms)
- Win result: medium vibration (80ms)
- Big win (≥ 10x): pattern vibration (100ms-50ms-100ms)
- Jackpot (≥ 100x): long pattern vibration (200ms-50ms-200ms)
- Slider drag: no vibration (too frequent, would be annoying)
- Loss: no vibration (quick and forgettable)

---

## 9. Edge Cases & Error States

### 9.1 Result Equals Target Exactly

- Always counted as a LOSS (for both Roll Over and Roll Under)
- Example: Target 50.00, Roll Over, Result = 50.00 → LOSS
- Special display message: result number shows in `#F59E0B` (amber) instead of pure red, with micro-text "On the line!" below for 2 seconds
- This is by design — prevents ambiguity and is consistent with real casino implementations

### 9.2 Extreme Slider Positions

**Near minimum win chance:**
- Target near 99.98 (Roll Over) or 0.01 (Roll Under)
- Win chance: 0.01%, Multiplier: 9,900x
- Slider is almost entirely red with a sliver of green (< 1px visible)
- Ensure the green sliver is still rendered (minimum 2px width) so the player sees it exists
- Multiplier display: "9,900.00x" fits within the field at 16px JetBrains Mono

**Near maximum win chance:**
- Target near 1.99 (Roll Over) or 98.00 (Roll Under)
- Win chance: 98%, Multiplier: 1.0102x
- Slider is almost entirely green with a sliver of red
- Same minimum 2px width rule for the red sliver

**Boundary clamping:**
- Target CANNOT result in win chance below 0.01% or above 98.00%
- Slider thumb stops at the clamped position
- Typed values are clamped: typing "100" into win chance becomes "98.00"
- Typed multiplier of "99999" becomes "9,900.00"

### 9.3 Rapid Manual Clicking

- Roll button debounce: 200ms minimum between rolls in normal mode
- In fast mode: debounce reduced to 100ms
- Queue at most 1 pending roll during animation
- Visual: button shows disabled state immediately on click, re-enables when ready

### 9.4 Auto-Bet Edge Cases

- **Martingale exceeds max bet:** If doubling would exceed $1,000, auto-bet stops with warning toast: "Auto-bet stopped: bet would exceed maximum ($1,000)"
- **Bankroll reaches $0:** Stop immediately, show: "Auto-bet stopped: insufficient balance"
- **Direction-switching strategies:** Ensure slider zone colors update correctly each roll (test with rapid turbo)
- **Very high roll counts (500+):** Cap history at 500 entries FIFO, ensure no memory leak
- **Strategy + target adjustment:** If target adjustment pushes target out of valid range, clamp to boundary and continue

### 9.5 Slider Precision

- Must support 0.01 precision for fine control
- On mobile: slider drag may be imprecise — always provide the manual input fields (target, win chance, multiplier) as precise alternative
- Keyboard navigation on slider: arrow keys adjust by 0.01 (fine), Shift+arrow by 1.00 (coarse)
- Touch: provide subtle +/- buttons at each end of the slider for precise mobile adjustment (hidden on desktop)
- Snap: values always round to 2 decimal places

### 9.6 Linked Field Edge Cases

- **Multiplier = 0 typed:** Clamp to minimum (1.0102x)
- **Multiplier > 9,900 typed:** Clamp to maximum (9,900.00x)
- **Win chance = 0% typed:** Clamp to 0.01%
- **Win chance > 98% typed:** Clamp to 98.00%
- **Non-numeric input:** Revert to previous valid value, flash field border red briefly (300ms)
- **Rapid typing in linked fields:** Debounce recalculation by 150ms to prevent jitter
- **Empty field on blur:** Reset to previous valid value

### 9.7 Browser Resize

- Slider bar recalculates width, thumb repositions proportionally
- Result marker repositions proportionally (maintains correct percentage position)
- Touch targets remain adequate on resize
- Layout transitions: debounced 200ms to prevent jitter during drag-resize

### 9.8 Touch vs Click

- All buttons: minimum 44px touch targets
- Roll button: full width on mobile for easy thumb access
- Slider thumb: enlarged touch area (36px around visual center)
- Parameter fields: 48px minimum height for comfortable tapping
- +/- buttons on slider: minimum 36px diameter touch target
- Adequate spacing between Over/Under toggle segments to prevent mis-taps (4px gap minimum)

### 9.9 Performance Under Auto-Bet Load

- During turbo auto-bet, batch display updates: stats update every 500ms (not every roll)
- Previous results row: animate only the most recent badge, skip animation for rapid succession
- History table: virtual scrolling, only render visible rows
- Particle effects: skip celebrations during turbo auto-bet (only show in normal/fast)

---

## 10. Conversion Integration Points

### 10.1 Casino Recommendation Sidebar (Desktop)

- Position: right column, below session stats
- Content: 2-3 casino cards showing Dice-specific offers
- Filter: casinos from CASINOS constant with "dice" in their games array
- Currently matching: **Stake**, **BC.Game**, **Jackbit** (based on constants.ts)
- Each card: casino name (brand colored), offer text, "Claim Deal →" link to /deals
- Uses shared `CasinoCard` component

### 10.2 "Spin the Deal Wheel" CTA

- Position: below casino cards in sidebar
- Trigger: always visible, becomes **PROMINENT** (pulsing teal border, larger) after 25+ rolls
- Higher threshold than other games because Dice rounds are very fast
- Style: `#14B8A6` border, `#111827` bg, with wheel icon (Lucide `RotateCw`)
- Text: "Spin the Deal Wheel" + "Win exclusive Dice bonuses"

### 10.3 "What You Would Have Won" Display

- Trigger: after 15+ rolls (higher threshold for fast game)
- Position: sidebar on desktop, inline card on mobile
- Shows real money equivalent of paper money results
- Emphasizes big wins if any occurred
- Includes casino recommendation and CTA to /deals
- Updates after every roll but display refreshes max every 10 rolls during auto-bet (prevent visual noise)

### 10.4 Post-Session Nudge

- Trigger: 60 seconds inactivity after 25+ rolls
- Subtle slide-in from bottom of game area: "Ready for real stakes? Spin the Deal Wheel →"
- Background: `#111827`, border: `#14B8A6`, rounded-xl
- Dismissable (X button), only shown once per session
- Auto-dismisses after 10 seconds

### 10.5 Integration Rules

- CTAs NEVER interrupt a roll animation (though animations are very short)
- Casino links: `target="_blank" rel="noopener noreferrer"`
- Responsible gambling disclaimer always visible on page
- Conversion elements update max every 10 rolls during turbo auto-bet (prevent visual noise from rapid results)
- All conversion elements should feel like helpful suggestions, not pushy sales

---

## 11. Technical Implementation

### 11.1 Game State Machine

**States:**

| State | Description | Available Actions |
|-------|-------------|-------------------|
| `idle` | Ready for a roll, all controls enabled | Change bet, adjust slider/params, toggle direction, roll |
| `rolling` | Roll animation in progress | None (controls disabled) |
| `result` | Result displayed, brief settle period | None (auto-transitions to idle after 200ms) |
| `auto_running` | Auto-bet in progress | Stop auto-bet only |

**State Transition Diagram:**

```
                    ┌──────────────────┐
                    │                  │
                    ▼                  │
        ┌─────────────────┐           │
   ──── │      idle       │ ◄─────────┘
        └────────┬────────┘
                 │
        click Roll / auto step
                 │
                 ▼
        ┌─────────────────┐
        │    rolling       │
        └────────┬────────┘
                 │
        animation complete
                 │
                 ▼
        ┌─────────────────┐
        │     result       │ ── 200ms timeout ──► idle
        └────────┬────────┘
                 │
          (if auto_running:
           apply adjustments,
           check stops,
           loop back to rolling)


   idle ──── Start Auto ────► auto_running
   auto_running ── Stop / condition met ──► idle
```

### 11.2 Rendering Approach

- **Slider bar:** Custom HTML/CSS — div-based with drag handlers (NOT `<input type="range">` for full styling control)
- **Green/red zones:** Two overlapping divs with dynamic `width` percentages, CSS transitions for smooth resizing
- **Result animation:** CSS transitions + requestAnimationFrame for the traveling dot
- **Result number:** HTML overlay, no Canvas needed
- **Previous results:** HTML badge elements
- **Particle effects:** CSS `@keyframes` animations with absolutely-positioned pseudo-elements
- **Screen shake:** CSS `translate` animation on game container

### 11.3 File Structure

```
components/games/dice/
├── DiceGame.tsx               # Main component, orchestrates 3-column layout
├── DiceGameArea.tsx           # Center panel: results + slider + parameters
├── DiceResultDisplay.tsx      # Central result number display + profit/loss
├── DiceSlider.tsx             # The slider bar with green/red zones + thumb + result marker
├── DiceParameters.tsx         # Target, win chance, multiplier, profit fields (linked)
├── DiceDirectionToggle.tsx    # Roll Over / Roll Under toggle + swap button
├── DiceControls.tsx           # Controls panel (bet amount, roll button, speed toggle)
├── DiceAutoPlay.tsx           # Auto-bet configuration panel + strategy presets
├── DicePreviousResults.tsx    # Previous roll result badges row
├── DiceSidebar.tsx            # Casino cards + session stats + bet history
├── useDiceGame.ts             # Game state hook (useReducer state machine)
├── diceEngine.ts              # Core game logic (RNG, win/loss, multiplier calc)
├── diceCalculator.ts          # Win chance / multiplier / target linked calculations
├── diceTypes.ts               # TypeScript types specific to Dice
└── diceAnimations.ts          # Animation constants, CSS class utilities, celebration logic
```

### 11.4 TypeScript Types

```typescript
// diceTypes.ts

export type DiceDirection = "over" | "under";
export type DiceGameState = "idle" | "rolling" | "result" | "auto_running";
export type DiceAnimationSpeed = "normal" | "fast";
export type DiceAutoBetSpeed = "normal" | "fast" | "turbo";

export type DiceBetAdjustment =
  | "same"
  | "increase_percent"
  | "increase_flat"
  | "decrease_flat"
  | "reset";
export type DiceTargetAdjustment = "same" | "increase" | "decrease";

export type DiceStrategy =
  | "safe_grinder"
  | "coin_flip"
  | "sniper"
  | "moon_shot"
  | "martingale"
  | "anti_martingale"
  | "dalembert"
  | "delayed_martingale"
  | "zigzag"
  | "custom";

export interface DiceParameters {
  target: number;              // derived from win chance + direction
  direction: DiceDirection;
  winChance: number;           // 0.01 to 98.00 (percentage)
  multiplier: number;          // 1.0102 to 9900.00
  profitOnWin: number;         // betAmount × (multiplier - 1)
}

export interface DiceRound {
  id: string;
  betAmount: number;
  target: number;
  direction: DiceDirection;
  result: number;              // 0.00 to 99.99
  multiplier: number;
  winChance: number;
  isWin: boolean;
  profit: number;              // positive for win, negative for loss
  timestamp: number;
}

export interface DiceAutoPlayConfig {
  numberOfRolls: number;       // 10, 25, 50, 100, 500, Infinity
  speed: DiceAutoBetSpeed;
  onWinBetAction: DiceBetAdjustment;
  onWinBetValue: number;       // percentage (e.g., 100 for doubling) or flat dollar amount (e.g., 0.10)
  onLossBetAction: DiceBetAdjustment;
  onLossBetValue: number;      // same as above
  onWinTargetAction: DiceTargetAdjustment;
  onWinTargetValue: number;    // amount to adjust target by
  onLossTargetAction: DiceTargetAdjustment;
  onLossTargetValue: number;
  switchDirectionOnWin: boolean;
  switchDirectionOnLoss: boolean;
  stopOnProfit: number | null;
  stopOnLoss: number | null;
  stopOnWinStreak: number | null;
  stopOnLossStreak: number | null;
  strategy: DiceStrategy;
}

export interface DiceAutoPlayProgress {
  currentRoll: number;
  totalRolls: number;
  wins: number;
  losses: number;
  currentWinStreak: number;
  currentLossStreak: number;
  sessionProfit: number;
}

export interface DiceSessionStats {
  totalRolls: number;
  totalWagered: number;
  totalReturns: number;
  netProfit: number;
  bestWin: { multiplier: number; profit: number } | null;
  biggestLoss: number;
  winCount: number;
  lossCount: number;
  currentStreak: number;       // positive = win streak, negative = loss streak
  bestWinStreak: number;
  bestLossStreak: number;
  highestRoll: number;
  lowestRoll: number;
  averageRoll: number;
  averageMultiplier: number;
}

export interface DiceGameFullState {
  gameState: DiceGameState;
  params: DiceParameters;
  betAmount: number;
  animationSpeed: DiceAnimationSpeed;
  currentResult: number | null;
  isWin: boolean | null;
  balance: number;
  history: DiceRound[];        // max 500, FIFO
  previousResults: DiceRound[]; // last 20 for badge row
  stats: DiceSessionStats;
  autoPlay: DiceAutoPlayConfig | null;
  autoPlayProgress: DiceAutoPlayProgress | null;
}
```

### 11.5 Core Engine Logic

```typescript
// diceEngine.ts

const HOUSE_EDGE = 0.01;
const RTP = 0.99;  // 1 - HOUSE_EDGE
const MIN_WIN_CHANCE = 0.01;  // percentage
const MAX_WIN_CHANCE = 98.00; // percentage
const TOTAL_OUTCOMES = 10000; // 0.00 to 99.99

/**
 * Generate a random dice result between 0.00 and 99.99
 * Uses crypto.getRandomValues for provably-fair-style randomness
 */
export function generateDiceResult(): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  const raw = buffer[0] % TOTAL_OUTCOMES; // 0 to 9999
  return raw / 100; // 0.00 to 99.99
}

/**
 * Calculate multiplier from win chance (percentage)
 * multiplier = 99 / winChance
 */
export function calculateMultiplier(winChance: number): number {
  const clamped = clampWinChance(winChance);
  const raw = (RTP * 100) / clamped;
  return Math.round(raw * 10000) / 10000; // 4 decimal places, rounded
}

/**
 * Calculate win chance from multiplier
 * winChance = 99 / multiplier
 */
export function calculateWinChance(multiplier: number): number {
  const raw = (RTP * 100) / multiplier;
  return clampWinChance(Math.round(raw * 100) / 100); // 2 decimal places, rounded
}

/**
 * Calculate target from win chance and direction
 */
export function calculateTarget(
  winChance: number,
  direction: DiceDirection
): number {
  if (direction === "over") {
    return Math.floor((99.99 - winChance) * 100) / 100;
  }
  return Math.floor(winChance * 100) / 100;
}

/**
 * Calculate win chance from target and direction
 */
export function calculateWinChanceFromTarget(
  target: number,
  direction: DiceDirection
): number {
  if (direction === "over") {
    return clampWinChance(
      Math.floor((99.99 - target) * 100) / 100
    );
  }
  return clampWinChance(target);
}

/**
 * Determine if a roll is a win
 */
export function isWin(
  result: number,
  target: number,
  direction: DiceDirection
): boolean {
  if (direction === "over") {
    return result > target; // strictly greater
  }
  return result < target; // strictly less
}

/**
 * Calculate profit on win (net, not total payout)
 */
export function calculateProfitOnWin(
  betAmount: number,
  multiplier: number
): number {
  return Math.floor(betAmount * (multiplier - 1) * 100) / 100;
}

/**
 * Calculate total payout on win
 */
export function calculatePayout(
  betAmount: number,
  multiplier: number
): number {
  return Math.floor(betAmount * multiplier * 100) / 100;
}

/**
 * Get the swap target (mirrors target to preserve win chance when
 * switching direction)
 */
export function getSwapTarget(currentTarget: number): number {
  return Math.floor((99.99 - currentTarget) * 100) / 100;
}

/**
 * Clamp win chance to valid range
 */
export function clampWinChance(winChance: number): number {
  return Math.max(MIN_WIN_CHANCE, Math.min(MAX_WIN_CHANCE, winChance));
}

/**
 * Clamp multiplier to valid range
 */
export function clampMultiplier(multiplier: number): number {
  const minMultiplier = calculateMultiplier(MAX_WIN_CHANCE); // ~1.0102
  const maxMultiplier = calculateMultiplier(MIN_WIN_CHANCE); // 9900
  return Math.max(minMultiplier, Math.min(maxMultiplier, multiplier));
}

/**
 * Recalculate all linked parameters from a single changed field
 */
export function syncParameters(
  changed: "target" | "winChance" | "multiplier" | "direction",
  value: number | DiceDirection,
  current: DiceParameters,
  betAmount: number
): DiceParameters {
  let { target, direction, winChance, multiplier } = current;

  switch (changed) {
    case "target":
      target = value as number;
      winChance = calculateWinChanceFromTarget(target, direction);
      multiplier = calculateMultiplier(winChance);
      break;

    case "winChance":
      winChance = clampWinChance(value as number);
      multiplier = calculateMultiplier(winChance);
      target = calculateTarget(winChance, direction);
      break;

    case "multiplier":
      multiplier = clampMultiplier(value as number);
      winChance = calculateWinChance(multiplier);
      target = calculateTarget(winChance, direction);
      break;

    case "direction":
      direction = value as DiceDirection;
      // Preserve win chance, recalculate target
      target = calculateTarget(winChance, direction);
      break;
  }

  return {
    target,
    direction,
    winChance,
    multiplier,
    profitOnWin: calculateProfitOnWin(betAmount, multiplier),
  };
}

/**
 * Apply auto-bet adjustments after a roll
 */
export function applyAutoBetAdjustments(
  isWinResult: boolean,
  betAmount: number,
  baseBetAmount: number,
  params: DiceParameters,
  config: DiceAutoPlayConfig
): { newBetAmount: number; newParams: DiceParameters } {
  let newBet = betAmount;
  let newParams = { ...params };

  // Bet adjustment
  const betAction = isWinResult
    ? config.onWinBetAction
    : config.onLossBetAction;
  const betValue = isWinResult
    ? config.onWinBetValue
    : config.onLossBetValue;

  switch (betAction) {
    case "increase_percent":
      newBet = Math.min(1000, betAmount * (1 + betValue / 100));
      break;
    case "increase_flat":
      newBet = Math.min(1000, betAmount + betValue);
      break;
    case "decrease_flat":
      newBet = Math.max(0.10, betAmount - betValue);
      break;
    case "reset":
      newBet = baseBetAmount;
      break;
    case "same":
    default:
      break;
  }

  // Target adjustment
  const targetAction = isWinResult
    ? config.onWinTargetAction
    : config.onLossTargetAction;
  const targetValue = isWinResult
    ? config.onWinTargetValue
    : config.onLossTargetValue;

  if (targetAction === "increase") {
    newParams = syncParameters(
      "target", params.target + targetValue, params, newBet
    );
  } else if (targetAction === "decrease") {
    newParams = syncParameters(
      "target", params.target - targetValue, params, newBet
    );
  }

  // Direction switch
  const shouldSwitch = isWinResult
    ? config.switchDirectionOnWin
    : config.switchDirectionOnLoss;

  if (shouldSwitch) {
    const newDirection: DiceDirection =
      newParams.direction === "over" ? "under" : "over";
    newParams = syncParameters("direction", newDirection, newParams, newBet);
  }

  // Round bet to 2 decimal places
  newBet = Math.floor(newBet * 100) / 100;

  return { newBetAmount: newBet, newParams };
}
```

### 11.6 Performance Targets

- Slider interaction: 60fps during drag (zero-delay CSS updates)
- Roll result animation: completes within stated durations (600ms normal, 100ms fast)
- Linked field sync: < 5ms recalculation on any field change
- Auto-bet turbo: 200 rolls/minute sustained without memory leaks
- Auto-bet minimum gap: 300ms even in Turbo (max ~200 rolls/minute)
- History: virtualized list for 50 visible rows, 500 max entries in memory (FIFO)
- Stats: batch display updates during turbo auto-bet (every 500ms, not every roll)
- State transition: < 16ms (one frame)
- Initial render: < 100ms after component mount

---

## 12. Keyboard Shortcuts

**Activation:** Shortcuts are active by default when the Dice game page is focused. Shortcuts are disabled when any input field is focused (to prevent conflicts with typing).

| Key | Action | Context |
|-----|--------|---------|
| Space | Place roll / trigger dice roll | While idle |
| A | Half (½) current bet amount | Any time |
| S | Double (2×) current bet amount | Any time |
| D | Reset bet to minimum ($0.10) | Any time |
| Q | Toggle direction (Over ↔ Under) | While idle |
| W | Increase target by 1.00 | While idle |
| E | Decrease target by 1.00 | While idle |
| Shift + W | Increase target by 0.01 (fine) | While idle |
| Shift + E | Decrease target by 0.01 (fine) | While idle |
| Arrow Left | Move slider thumb left by 0.01 | While slider focused |
| Arrow Right | Move slider thumb right by 0.01 | While slider focused |
| Shift + Arrow | Move slider thumb by 1.00 | While slider focused |
| Escape | Stop auto-bet | While auto-running |

---

## 13. Accessibility

- **Slider:** `role="slider"`, `aria-valuemin="0.01"`, `aria-valuemax` (dynamic based on direction), `aria-valuenow="50.00"`, `aria-label="Dice target number"`
- **Slider:** Keyboard accessible — arrow keys to move (0.01 step), Shift+arrow for 1.00 steps
- **Roll button:** keyboard accessible (Spacebar / Enter), `aria-label="Roll the dice"`
- **Direction toggle:** `role="radiogroup"` with `aria-checked` on each segment, `aria-label="Roll direction"`
- **All parameter inputs:** proper `aria-label` attributes ("Target number", "Win chance percentage", "Payout multiplier")
- **Result announcement:** `aria-live="assertive"` region announces "Rolled XX.XX. You won $X.XX" or "Rolled XX.XX. You lost $X.XX"
- **Previous results:** `role="list"` with `role="listitem"` for each badge, each with `aria-label="Roll result XX.XX, won/lost"`
- **Reduced motion (`prefers-reduced-motion`):**
  - Skip traveling dot animation — result marker appears instantly at position
  - Disable celebration particles and screen shake
  - Keep only color changes, text updates, and opacity transitions
  - Slider zone transitions remain (they're functional, not decorative)
- **Color contrast:** All text meets WCAG AA (4.5:1 minimum)
- **Color is NOT the only indicator:** Win/loss text labels ("WON" / "LOST") and +/- profit signs accompany the colors
- **Focus management:** After roll resolves, focus returns to Roll button (manual) or stays on Stop button (auto)
- **Tab order:** Bet Amount → Slider → Target Input → Win Chance → Multiplier → Direction Toggle → Roll Button

---

## 14. Responsible Gambling

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
- The linked parameters make the math transparent: players can see exactly how changing one variable affects all others
- This transparency is part of PaperBet's "Test Your Edge" positioning — giving players real probability literacy

**EV transparency:**
- The Game Info Panel (§15) explains that the expected return is always 99% regardless of settings
- This educates players that no strategy changes the house edge — only variance

---

## 15. Game Info Panel

**Position:** Collapsible panel at the bottom of the page (or in a modal triggered by "?" icon)

**"How to Play" section:**
1. Set your bet amount
2. Drag the slider to choose your target number (or type it in directly)
3. Pick Roll Over or Roll Under:
   - **Roll Over:** You win if the result is higher than your target
   - **Roll Under:** You win if the result is lower than your target
4. Click Roll — a number between 0.00 and 99.99 is randomly generated
5. If the number lands in the green zone, you win! Your profit = bet × (multiplier - 1)
6. Adjust the slider to change your risk: more green = more likely to win (lower payout), more red = less likely to win (higher payout)

**"Game Info" section:**

| Property | Value |
|----------|-------|
| Game Type | Number Prediction |
| RTP | 99.00% |
| House Edge | 1.00% |
| Result Range | 0.00 – 99.99 |
| Max Multiplier | 9,900.00x |
| Min Win Chance | 0.01% |
| Max Win Chance | 98.00% |
| Multiplier Formula | 99 ÷ Win Chance (%) |
| Provider | PaperBet Originals |

**"Multiplier Reference" section:** Collapsible table showing key multiplier/win-chance/target combinations:

| Win Chance | Multiplier | Roll Over Target | Roll Under Target |
|-----------|------------|------------------|-------------------|
| 98.00% | 1.0102x | 1.99 | 98.00 |
| 75.00% | 1.3200x | 24.99 | 75.00 |
| 49.99% | 1.9804x | 50.00 | 49.99 |
| 25.00% | 3.9600x | 74.99 | 25.00 |
| 10.00% | 9.9000x | 89.99 | 10.00 |
| 5.00% | 19.8000x | 94.99 | 5.00 |
| 1.00% | 99.0000x | 98.99 | 1.00 |
| 0.01% | 9,900.00x | 99.98 | 0.01 |

**"Strategy Tips" section:**
- **For beginners:** Start with the Coin Flip preset (~50% win chance, 2x multiplier). It's intuitive and the results are easy to understand.
- **For grinders:** The Safe Grinder preset (90% win chance, ~1.10x) produces small, frequent wins. Great for understanding variance over many rolls.
- **For thrill-seekers:** Try the Moon Shot (1% win chance, 99x) or push the slider to extreme positions. Remember: the house edge is the same regardless of where you set the slider.
- **Key insight:** No strategy changes the house edge (1%). Every combination of target, direction, and multiplier produces the same expected return of 99%. The only difference is **variance** — how wild the swings are.
