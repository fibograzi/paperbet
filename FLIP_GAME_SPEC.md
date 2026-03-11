# Flip — Complete Game Specification for PaperBet.io

---

## 1. Game Overview

Flip is a coin-toss probability game where a player picks Heads or Tails, then a coin is flipped. Correct prediction pays 1.96x. The player can then choose to **cash out** or **flip again** — each consecutive winning flip doubles the multiplier. One wrong guess and the entire bet is lost.

**Why it's popular in crypto casinos:** Flip offers the purest form of gambling — a binary 50/50 decision with instant results. The "double or nothing" mechanic after each win creates extreme tension and addictive replay loops.

**Psychological hooks:** The cash-out-or-continue decision after each win triggers loss aversion ("I already won, I should take it") vs greed ("just one more flip doubles my money"). Near-miss psychology is powerful — losing on flip 5 after building to 31.36x feels devastating, driving revenge bets. The simplicity makes it accessible to everyone, while the 1,000,000x theoretical max appeals to high-risk chasers.

---

## 2. Exact Game Mechanics

### 2.1 Step-by-Step Game Flow — Manual Mode

1. Player sets **bet amount** (default: $1.00 paper money)
2. Player selects a side: **Heads** or **Tails** (or clicks **"Random Pick"**)
3. Player clicks **"Flip"** → the coin spins
4. Coin lands:
   - **Correct prediction** → multiplier displays (1.96x on first flip), player sees two buttons: **"Cash Out ($X.XX)"** and **"Flip Again"**
   - **Wrong prediction** → bet is lost, game resets
5. If player clicks **"Flip Again"**:
   - Player can optionally change their Heads/Tails pick
   - Coin flips again with the same bet at stake
   - Correct → multiplier doubles (3.92x, 7.84x, 15.68x, ...)
   - Wrong → entire accumulated win + original bet is lost
6. If player clicks **"Cash Out"** → winnings are added to balance
7. Maximum chain: **20 consecutive flips** (auto cash-out at flip 20)
8. Session stats update after each resolved bet (cash-out or loss)
9. After 5+ bets, "What You Would Have Won" display appears

### 2.2 Step-by-Step Game Flow — Auto Mode

1. Player sets **bet amount**
2. Player selects a side (Heads / Tails / Random)
3. Player sets **flips per round** (1–20): how many consecutive wins needed to cash out
4. Player sets **number of rounds** (10 / 25 / 50 / 100 / ∞)
5. Player configures optional stop conditions (on profit, on loss)
6. Player clicks **"Start Auto"** → rounds execute automatically
7. Each round: all N flips must be correct to win; one wrong = bet lost
8. Auto-play stops when: rounds completed, stop condition hit, or player clicks **"Stop"**

### 2.3 Outcome Determination

**NOT a physics simulation.** The outcome is determined BEFORE the animation begins:

1. Generate a single random bit using `crypto.getRandomValues()`: 0 = Heads, 1 = Tails
2. Compare to player's pick → win or loss
3. Animate the coin to show the predetermined result

### 2.4 Configurable Parameters

| Parameter | Range | Default | Step |
|-----------|-------|---------|------|
| Bet Amount | $0.10 – $1,000.00 | $1.00 | $0.10 |
| Side Pick | Heads / Tails / Random | — | — |
| Flips per Round (auto) | 1 – 20 | 1 | 1 |
| Auto-play Rounds | 10 / 25 / 50 / 100 / ∞ | Off | — |

---

## 3. Mathematical Model

### 3.1 House Edge & RTP

- **Win probability per flip:** exactly **50.00%** (fair coin)
- **Base multiplier (1 flip):** **1.96x** (instead of fair 2.00x)
- **House edge:** **2.00%**
- **RTP (Return to Player):** **98.00%**

### 3.2 Multiplier Formula

```
multiplier(n) = 1.96 × 2^(n-1)
win_chance(n) = (1/2)^n
```

The house edge is applied **once** (in the base 1.96x). Each subsequent winning flip multiplies by exactly 2x. This means the EV is always 98% regardless of flip count:

```
EV = win_chance(n) × multiplier(n) = (0.5^n) × 1.96 × 2^(n-1) = 1.96 / 2 = 0.98
```

### 3.3 Complete Multiplier Table

| Flips (n) | Multiplier | Win Chance | Odds (1 in X) |
|-----------|-----------|------------|---------------|
| 1 | 1.96x | 50.0000% | 2 |
| 2 | 3.92x | 25.0000% | 4 |
| 3 | 7.84x | 12.5000% | 8 |
| 4 | 15.68x | 6.2500% | 16 |
| 5 | 31.36x | 3.1250% | 32 |
| 6 | 62.72x | 1.5625% | 64 |
| 7 | 125.44x | 0.7813% | 128 |
| 8 | 250.88x | 0.3906% | 256 |
| 9 | 501.76x | 0.1953% | 512 |
| 10 | 1,003.52x | 0.0977% | 1,024 |
| 11 | 2,007.04x | 0.0488% | 2,048 |
| 12 | 4,014.08x | 0.0244% | 4,096 |
| 13 | 8,028.16x | 0.0122% | 8,192 |
| 14 | 16,056.32x | 0.0061% | 16,384 |
| 15 | 32,112.64x | 0.0031% | 32,768 |
| 16 | 64,225.28x | 0.0015% | 65,536 |
| 17 | 128,450.56x | 0.0008% | 131,072 |
| 18 | 256,901.12x | 0.0004% | 262,144 |
| 19 | 513,802.24x | 0.0002% | 524,288 |
| 20 | 1,027,604.48x | 0.0001% | 1,048,576 |

### 3.4 Win Tier Classification

| Tier | Multiplier Range | Description |
|------|-----------------|-------------|
| Normal | 1.96x (1 flip) | Single correct flip |
| Good Win | 3.92x – 7.84x (2–3 flips) | Short streak |
| Big Win | 15.68x – 125.44x (4–7 flips) | Impressive streak |
| Epic Win | 250.88x – 1,003.52x (8–10 flips) | Rare streak |
| Jackpot | 2,007.04x+ (11+ flips) | Legendary streak |

---

## 4. Visual Design Specification

### 4.1 Overall Layout

**Desktop (≥1024px) — 3-Column Layout:**
```
┌───────────────────────────────────────────────────────────────┐
│ [HEADER — sticky, always visible]                             │
├────────────┬─────────────────────┬────────────────────────────┤
│            │                     │                            │
│  CONTROLS  │    FLIP ARENA       │    CASINO SIDEBAR          │
│  PANEL     │    (Coin + Result)  │    (Deals + Stats)         │
│            │                     │                            │
│  Width:    │    Width: flex-1    │    Width: 320px            │
│  300px     │    Min: 400px       │    Scrollable              │
│            │                     │                            │
│  - Bet Amt │    Coin Visual      │    - Casino Cards          │
│  - Side    │    + Multiplier     │    - Session Stats         │
│    Pick    │    + Flip Chain     │    - Bet History           │
│  - Flip    │      Progress       │    - "What You Would       │
│  - Auto    │                     │       Have Won"            │
│            │                     │                            │
├────────────┴─────────────────────┴────────────────────────────┤
│ [BET HISTORY TABLE — full width below on desktop]             │
└───────────────────────────────────────────────────────────────┘
```

**Mobile (<768px) — Single Column, Stacked:**
```
┌─────────────────────────┐
│ FLIP ARENA              │
│ Coin + Result           │
│ Full width, 50vh max    │
├─────────────────────────┤
│ CONTROLS (compact)      │
│ Side pick + flip button │
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
│ FLIP ARENA (centered, max-w: 500px)      │
├───────────────────┬──────────────────────┤
│ CONTROLS          │ SESSION STATS        │
├───────────────────┴──────────────────────┤
│ CASINO CARDS + BET HISTORY               │
└──────────────────────────────────────────┘
```

### 4.2 The Flip Arena (Center Panel)

**Container:**
- Background: `#0B0F1A` (seamless with page)
- Min-height: 400px (desktop), 300px (mobile)
- Centered content: coin + result text + flip chain tracker
- Subtle `#1F2937` border, rounded-xl

**The Coin:**
- Size: **120px × 120px** (desktop), **96px × 96px** (mobile)
- Shape: perfect circle with subtle 3D depth (CSS perspective transform)
- Border: 3px solid, color depends on visible face
- Shadow: `0 4px 20px rgba(0, 0, 0, 0.3)` resting, intensifies during spin

**Heads Side:**
- Background: linear gradient from `#F59E0B` (amber/gold) to `#D97706` (darker amber)
- Symbol: **"H"** letter in JetBrains Mono, 48px bold, `#0B0F1A` (dark)
- OR: stylized crown/star icon in the center (Lucide `Crown` icon, 48px)
- Border color: `#F59E0B`
- Subtle inner glow: `inset 0 0 20px rgba(245, 158, 11, 0.3)`

**Tails Side:**
- Background: linear gradient from `#00B4D8` (cyan) to `#0284C7` (deeper blue)
- Symbol: **"T"** letter in JetBrains Mono, 48px bold, `#0B0F1A` (dark)
- OR: stylized diamond icon in the center (Lucide `Diamond` icon, 48px)
- Border color: `#00B4D8`
- Subtle inner glow: `inset 0 0 20px rgba(0, 180, 216, 0.3)`

**Idle State (before first flip):**
- Coin shows a neutral state: both sides visible as a split coin (left half Heads color, right half Tails color) with a "?" in the center
- OR: coin slowly rotates on Y-axis at 0.5rpm (idle animation)
- Text below coin: "Pick a side and flip!" in `#6B7280`, DM Sans, 14px

**After Result:**
- Coin shows the winning face (Heads or Tails)
- Coin has a subtle float animation (up/down 4px, 2s loop)

### 4.3 Flip Chain Progress Tracker

**Position:** Below the coin in the Flip Arena

**Purpose:** Shows the player's current streak progress visually

**Layout:** Horizontal row of circular indicators (one per flip in the chain)

```
○ ○ ○ ○ ○ ○ ○ ○ ○ ○    (max 20 circles)
● ● ● ◐ ○ ○ ○ ○ ○ ○    (3 wins, currently flipping 4th, 6 remaining)
```

**Circle States:**
| State | Visual |
|-------|--------|
| Not yet reached | `#374151` fill, `#4B5563` border, 12px diameter |
| Won (correct flip) | `#00E5A0` fill, `#00E5A0` border, 12px, checkmark inside |
| Currently flipping | Pulsing animation, `#F59E0B` border, `#1F2937` fill |
| Lost (wrong flip) | `#EF4444` fill with "×" symbol, 12px |

**Multiplier labels:** Show key multiplier milestones below the circles:
- Below flip 1: "1.96x"
- Below flip 5: "31.36x"
- Below flip 10: "1,003x"
- Below flip 15: "32,112x"
- Below flip 20: "1,027,604x"

**Responsive:** On mobile, if 20 circles don't fit, show a compact version:
- Show current flip number + total: "Flip 4 / 10"
- Show mini progress bar instead of individual circles
- Always show current multiplier prominently

### 4.4 Multiplier / Result Display

**Position:** Centered above or below the coin (above on desktop, below on mobile)

**Typography:**
- Font: JetBrains Mono
- Size: 56px (desktop), 36px (mobile)
- Weight: Bold (700)
- Format: "1.96x", "31.36x", "1,027,604x"

**Color by Result:**
| Result | Color | Effect |
|--------|-------|--------|
| 1.96x (1 flip) | `#00E5A0` (green) | — |
| 3.92x – 7.84x | `#00E5A0` (green) | — |
| 15.68x – 125.44x | `#F97316` (orange) | Subtle pulse |
| 250.88x – 1,003.52x | `#EF4444` (red) | Pulse + glow |
| 2,007x+ | `#F59E0B` (gold) | Pulse + gold glow + text-shadow |

**Entrance animation:**
- Scale 0.5 → 1.0, opacity 0 → 1, duration 200ms, ease-out
- For multipliers ≥ 15.68x: pulse scale 1.0 → 1.1 → 1.0 twice after entrance

**Profit Display (below multiplier):**
- Shows "+$X.XX" (green) for wins, "-$X.XX" (red) for losses
- Font: JetBrains Mono, 20px, regular weight
- Appears 200ms after multiplier

### 4.5 Cash Out / Continue UI

**Position:** Directly below the coin in the Flip Arena, replaces the "Flip" button area after a win

**Two-button layout (side by side):**

**"Cash Out" Button (left, secondary action):**
- Background: `#1F2937`
- Border: 2px solid `#00E5A0`
- Text: "Cash Out" + amount below: "$X.XX" (current potential payout)
- Font: DM Sans, 14px bold (label), JetBrains Mono, 18px bold (amount)
- Text color: `#00E5A0`
- Hover: background `#00E5A0` at 15% opacity, border brightens
- Width: 45% of container

**"Flip Again" Button (right, primary action):**
- Background: `#00E5A0`
- Text: "Flip Again" + next multiplier below: "→ X.XXx"
- Font: DM Sans, 16px bold (label), JetBrains Mono, 14px (next multiplier)
- Text color: `#0B0F1A`
- Hover: brightness 105%, shadow `0 0 30px rgba(0, 229, 160, 0.3)`
- Width: 55% of container (slightly larger, emphasizing the "risky" choice — intentional)
- Subtle pulse animation to draw attention

**At flip 20 (max):** Only "Cash Out" button appears (full width), no "Flip Again" option

**Animation:** Buttons slide in from bottom with a spring animation (Framer Motion, `type: "spring"`, `stiffness: 300`)

### 4.6 Color Coding System

**Side Colors:**

| Side | Primary Color | Gradient | Use |
|------|--------------|----------|-----|
| Heads | `#F59E0B` (amber) | `#F59E0B` → `#D97706` | Coin face, history indicators, pick button |
| Tails | `#00B4D8` (cyan) | `#00B4D8` → `#0284C7` | Coin face, history indicators, pick button |

**Result Colors:**

| Result | Color |
|--------|-------|
| Win (any) | `#00E5A0` (accent green) |
| Loss | `#EF4444` (danger red) |
| Pending/Neutral | `#9CA3AF` (muted gray) |

**Flip Chain Colors (progress states):**
| State | Color |
|-------|-------|
| Won flip | `#00E5A0` |
| Current flip | `#F59E0B` (pulsing) |
| Future flip | `#374151` |
| Lost flip | `#EF4444` |

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

### 5.3 Side Selection

**Label:** "Pick Your Side" — DM Sans, 14px, `#9CA3AF`

**Layout:** Three options in a row (equal width)

**Heads Button:**
- Default: `#1F2937` bg, `#374151` border, rounded-lg, py-3
- Content: mini coin icon (16px amber circle) + "Heads" text below
- Selected: `#F59E0B` bg at 15% opacity, `#F59E0B` border (2px), `#F59E0B` text
- Hover (unselected): `#374151` bg

**Tails Button:**
- Default: same as Heads default
- Content: mini coin icon (16px cyan circle with diamond) + "Tails" text below
- Selected: `#00B4D8` bg at 15% opacity, `#00B4D8` border (2px), `#00B4D8` text
- Hover (unselected): `#374151` bg

**Random Pick Button:**
- Default: same styling
- Content: shuffle/dice icon (Lucide `Shuffle`) + "Random" text below
- Selected: `#00E5A0` bg at 15% opacity, `#00E5A0` border, `#00E5A0` text
- Behavior: on each flip, randomly picks Heads or Tails (can be different each flip)
- Visual: when random is selected and flip executes, briefly flash the chosen side's color on the button

**Font:** DM Sans, 13px, semibold for labels
**Transition:** 150ms ease on all hover/active state changes

### 5.4 Flip Button (Primary Action)

**Normal State:**
- Full-width button within controls panel
- Height: 48px (desktop), 44px (mobile)
- Background: `#00E5A0`
- Text: "Flip" — DM Sans, 16px, bold, `#0B0F1A`
- Border-radius: 10px
- Subtle box-shadow: `0 0 20px rgba(0, 229, 160, 0.2)`
- Cursor: pointer

**Hover State:**
- Background lightens slightly (`#1AFFA8`)
- Box-shadow intensifies: `0 0 30px rgba(0, 229, 160, 0.3)`

**Active/Pressed:**
- Scale: 0.98
- Background: `#00CC8E`

**During Coin Flip (Disabled):**
- Background: `#374151`
- Text: "Flipping..." with animated ellipsis
- Cursor: not-allowed
- Re-enables when coin lands

**During Active Streak (replaced by Cash Out / Flip Again):**
- The Flip button in the controls panel changes to show current streak info:
- Text: "Streak: 3 flips — 7.84x" in `#F59E0B`
- Background: `#1F2937`
- Non-clickable (actions are on the Cash Out / Flip Again buttons in the arena)

**Keyboard shortcut:** Spacebar triggers flip (or "Flip Again" during streak)

### 5.5 Instant Bet Toggle

**Position:** Small toggle below the Flip button

**Layout:** Inline flex with label
- Label: "Instant Bet" — DM Sans, 12px, `#6B7280`
- Toggle: 36px × 20px track
- Off: `#374151` track, `#6B7280` thumb
- On: `#00E5A0` track, white thumb
- When on: skip coin animation entirely, result appears instantly

### 5.6 Auto Mode Controls

When the "Auto" tab is active, the controls panel shows:

**Bet Amount:** Same as manual mode (§5.2)

**Side Selection:** Same as manual mode (§5.3)

**Flips Per Round:**
- Label: "Flips Per Round" — DM Sans, 14px, `#9CA3AF`
- Slider: track `#374151`, filled `#00E5A0` → `#00B4D8` gradient, thumb white with `#00E5A0` border
- Range: 1–20, integer snap
- Below slider: current value "5 flips → 31.36x" showing the resulting multiplier
- Tick marks at 1, 5, 10, 15, 20

**Number of Rounds:**
- Label: "Number of Rounds" — DM Sans, 14px, `#9CA3AF`
- Segmented control: 10 | 25 | 50 | 100 | ∞
- Same styling as risk level segmented control in Plinko
- Active: `#00E5A0` bg at 15%, `#00E5A0` text

**Advanced Settings (collapsible):**
- Header: "Advanced" with chevron, clickable to expand
- When expanded:

**On Win:**
- Radio: "Reset to base bet" (default) | "Increase by ___%"
- Input: percentage field, JetBrains Mono, `#1F2937` bg

**On Loss:**
- Radio: "Reset to base bet" (default) | "Increase by ___%"
- Input: percentage field

**Stop on Profit:**
- Toggle + amount input: "Stop if profit ≥ $___"
- Default: off

**Stop on Loss:**
- Toggle + amount input: "Stop if loss ≥ $___"
- Default: off

**Start/Stop Auto Button:**
- Start: same as Flip button but text says "Start Auto"
- Running: changes to "Stop Auto" with `#EF4444` bg, white text
- Counter below: "Round 15 / 50 — W: 8 | L: 7"

---

## 6. Animations & Transitions

### 6.1 Coin Flip Animation

**Duration:** 1.2 seconds (normal), 0ms (instant bet mode)

**Animation sequence:**
1. **Launch (0–200ms):** Coin lifts up 40px with slight scale increase (1.0 → 1.05)
2. **Spin (200–1000ms):** Coin rotates on Y-axis (CSS `rotateY`), completing 3–4 full rotations
   - Use CSS `perspective: 600px` on container for 3D depth
   - During spin: coin is a blur of alternating Heads/Tails colors
   - Spin speed: fast at start, decelerates toward end (ease-out)
3. **Land (1000–1200ms):** Coin settles to final face, drops back down 40px
   - Slight bounce on landing (translate Y: 0 → -8px → 0, over 200ms)
   - Landing face fully visible with a brief scale pulse (1.0 → 1.08 → 1.0)

**CSS Implementation:**
```css
.coin-flip {
  animation: coinFlip 1.2s ease-out forwards;
  transform-style: preserve-3d;
}

@keyframes coinFlip {
  0% { transform: translateY(0) rotateY(0deg); }
  15% { transform: translateY(-40px) rotateY(180deg); }
  85% { transform: translateY(-20px) rotateY(1260deg); } /* 3.5 rotations */
  95% { transform: translateY(8px) rotateY(1440deg); }   /* 4 rotations, bounce */
  100% { transform: translateY(0) rotateY(1440deg); }    /* settle */
}
```

**The two faces:** Use `backface-visibility: hidden` with two div layers:
- Front: Heads design (rotateY: 0deg)
- Back: Tails design (rotateY: 180deg)
- Final rotation angle determines which face shows (even = Heads, odd half-turn = Tails)

### 6.2 Win Celebrations by Tier

| Tier | Flips | Animation |
|------|-------|-----------|
| Normal Win | 1 | Coin glows green briefly, multiplier fades in, "+$X.XX" floats up |
| Good Win | 2–3 | Same as Normal + coin pulses larger (1.15x) + streak dots animate in sequence |
| Big Win | 4–7 | Screen-edge glow orange, coin orbited by particle ring, multiplier shakes subtly |
| Epic Win | 8–10 | Screen-edge glow red, intense particle burst from coin, multiplier scales up large with pulsing glow, streak tracker pulses all green |
| Jackpot | 11+ | Gold particle explosion from coin, screen shake (2px, 500ms), golden rain particles from top, multiplier text in gold with animated text-shadow, entire flip arena briefly tinted gold |

### 6.3 Loss Animation

- Coin lands on wrong face
- Brief red flash on coin border (200ms)
- Coin fades to 50% opacity over 300ms
- "×" symbol appears over the coin briefly
- If on a streak: all chain progress dots flash red simultaneously, then gray out one by one from right to left (reverse collapse effect, 500ms total)
- Multiplier text (if visible from streak) shatters/dissolves away
- Loss amount appears in `#EF4444`: "-$X.XX"
- Everything resets to idle state after 1 second
- **Key design principle:** losses during a streak should feel dramatic (you lost something real), but single-flip losses should feel quick and forgettable (encourages replaying)

### 6.4 Cash Out Animation

- When player clicks "Cash Out":
  1. Coin lifts up slightly with a green glow intensifying
  2. Multiplier text does a final triumphant scale (1.0 → 1.2 → 1.0)
  3. "+$X.XX" text floats up from the coin in green, large font
  4. Coin returns to idle state
  5. Chain progress dots do a celebratory ripple (each lights up bright green in sequence, 50ms apart)

### 6.5 Auto-Play Animations

- **Normal speed:** Full coin flip animation per round
- **With Instant Bet:** No animation, just result flash (200ms green/red border on coin) and history update
- **History update:** Each result slides into the result history strip at the bottom with a left-to-right push animation

### 6.6 Idle Animations

- Coin: gentle Y-axis rotation (0.5rpm), subtle float (up/down 3px, 3s ease-in-out loop)
- Side selection buttons: slight shimmer on hover (gradient sweep left → right, 600ms)
- Flip button: subtle breathing glow on box-shadow (opacity 0.15 → 0.25, 2s loop)

---

## 7. Statistics & History Display

### 7.1 Session Statistics

**Layout:** 2×2 grid of stat cards (uses shared `SessionStats` component)

**Stats tracked:**
| Stat | Format | Font |
|------|--------|------|
| Total Bets | "47 bets" | JetBrains Mono, 20px, `#F9FAFB` |
| Total Wagered | "$47.00" | JetBrains Mono, 20px, `#F9FAFB` |
| Net Profit | "+$12.30" or "-$5.20" | JetBrains Mono, 20px, green or red |
| Best Win | "31.36x ($31.36)" | JetBrains Mono, 20px, `#F59E0B` |

**Additional stats (expandable "More Stats" section):**
- Total Returns
- Biggest Loss
- Current Streak (consecutive winning bets)
- Best Streak
- Longest Flip Chain (most consecutive flips won in one bet)
- Average Cash-Out Multiplier
- Win Rate %
- Times Cashed Out vs Times Lost on Streak

### 7.2 Result History Strip

**Position:** Below the coin in the Flip Arena (horizontal scrolling strip)

**Layout:** Row of small colored circles showing last 20 results
- Heads win: `#F59E0B` circle (amber)
- Tails win: `#00B4D8` circle (cyan)
- Size: 10px circles, 4px gap
- Most recent on the right
- New results push in from the right with slide animation
- On hover: tooltip showing "Heads — 1.96x — +$0.96"

### 7.3 Bet History Table

**Layout:** Scrollable table below the main game area (uses shared `BetHistory` component with adapted columns)

**Columns:**
| Column | Width | Alignment | Content |
|--------|-------|-----------|---------|
| # | 40px | Center | Row number (most recent first) |
| Bet | 80px | Right | "$1.00" — JetBrains Mono |
| Flips | 50px | Center | "5" — number of flips in chain |
| Multi | 80px | Right | "31.36x" — colored by tier |
| Profit | 100px | Right | "+$30.36" green or "-$1.00" red |
| Pick | 60px | Center | Amber/Cyan dot + "H"/"T" |
| Result | 60px | Center | "Win"/"Loss" badge |

**Behavior:**
- Shows last 25 bets (scrollable for more)
- New bets insert at top with slide-down animation (200ms)
- Alternating row backgrounds: `#0B0F1A` and `#111827`
- Hover: row highlights to `#1F2937`
- Win rows: subtle left border accent in `#00E5A0`
- Loss rows: subtle left border accent in `#EF4444`

### 7.4 "What You Would Have Won" Display

**Trigger:** Appears after 5+ bets in a session

**Layout:** Prominent card, `#111827` bg, green border (`#00E5A0`), rounded-xl, p-6

**Content:**
```
"If you played with real money..."

$47.00 wagered → $59.30 returned

Net Profit: +$12.30

Top casino for Coin Games:
[Casino Card — e.g., Stake: 200% up to $2K]
[CTA: "Spin the Deal Wheel →"]
```

Uses shared `RealMoneyDisplay` component.

---

## 8. Sound Design Notes (Visual Equivalents)

Since our simulator has no audio, visual cues replace sound feedback:

| Audio Cue (Real Casino) | Visual Replacement |
|------------------------|-------------------|
| Coin toss "whoosh" | Coin lift + spin blur |
| Coin landing "clink" | Landing bounce + scale pulse |
| Correct guess "ding" | Green flash on coin border, multiplier pop-in |
| Wrong guess "buzz" | Red flash on coin, brief screen-edge red tint |
| Cash out "cha-ching" | Green particle burst + profit text float-up |
| Streak milestone | Chain progress dots ripple + multiplier glow intensifies |
| Big win "fanfare" | Particle explosion + screen shake |
| Auto-play tick | Small pulse on round counter |
| Button click "pop" | Button scale 0.95 → 1.0 micro-animation |

**Haptic Feedback (mobile):** If Vibration API is available:
- Flip button: short vibration (50ms)
- Win: medium vibration (80ms)
- Streak win ≥ 5 flips: pattern vibration (100ms-50ms-100ms)
- Cash out on big streak: long vibration (200ms)

---

## 9. Edge Cases & Error States

### 9.1 Rapid Clicking
- Flip button disabled during coin animation
- Cash Out / Flip Again buttons disabled during coin animation
- If Instant Bet is on: allow rapid succession (50ms debounce)

### 9.2 Mid-Streak Page Navigation
- If player has an active streak and tries to navigate away:
- Show confirmation dialog: "You have an active streak at X.XXx ($XX.XX). Cash out before leaving?"
- Options: "Cash Out & Leave" | "Stay"
- If browser is closed: streak is lost (client-side only, no server state)
- Consider `beforeunload` event to warn

### 9.3 Mid-Streak Auto-Play Conflict
- If player is in a manual streak, the Auto tab should be disabled
- If player is in auto-play, Manual tab should be disabled
- Clear visual indicator of which mode is active

### 9.4 Browser Resize Mid-Flip
- Coin animation completes at current dimensions
- Layout re-renders on resize (debounced 200ms)
- Chain progress tracker reflows (wrap to two lines if needed on mobile)

### 9.5 Touch vs Click
- All buttons must have minimum 44px touch targets
- Flip button: full width on mobile for easy thumb access
- Side selection buttons: minimum 56px height for comfortable tapping
- Cash Out / Flip Again: minimum 48px height, adequate spacing between them to prevent mis-taps

### 9.6 Extreme Values
- Max multiplier display: "1,027,604.48x" (7 significant digits — fits within display at 36px+ font)
- Bet at $1,000 with 1,027,604.48x: display "$1,027,604,480.00" — use abbreviation "$1.03B" if space constrained
- Net profit display: handle "-$999.99" to "+$999,999,999.99" range
- Format large numbers with commas: "1,003.52x" not "1003.52x"

### 9.7 Random Pick Edge Cases
- Random pick should resolve BEFORE the animation starts (not during)
- Show which side was randomly picked: briefly highlight the chosen button before flip starts
- In auto-play with random: each round independently picks a random side

### 9.8 Connection/Performance
- Client-side only, no connection issues
- If CSS 3D transforms are not supported: fall back to 2D coin flip (simple scale X animation)
- `prefers-reduced-motion`: skip coin animation, show result with simple fade

---

## 10. Conversion Integration Points

### 10.1 Casino Recommendation Sidebar (Desktop)
- Position: right column, below session stats
- Content: 2-3 casino cards showing coin-game-specific offers
- Filter: show casinos from CASINOS constant that have "flip" or "coin" in their games array
- Each card: casino name (colored), offer, "Claim Deal →" link to /deals

### 10.2 "Spin the Deal Wheel" CTA
- Position: below casino cards in sidebar
- Trigger: always visible, becomes PROMINENT (pulsing border, larger) after 10+ bets
- Style: `#00E5A0` border, `#111827` bg, with wheel icon
- Text: "Spin the Deal Wheel" + "Win exclusive coin game bonuses"

### 10.3 "What You Would Have Won" Display
- Trigger: after 5+ bets
- Position: sidebar on desktop, inline card on mobile
- Shows real money equivalent of paper money results
- Includes casino recommendation and CTA to /deals
- Updates in real-time after each bet

### 10.4 Post-Session Nudge
- Trigger: when user hasn't flipped for 60 seconds after 10+ bets
- Subtle slide-in from bottom: "Ready to play for real? Spin the Deal Wheel to unlock exclusive bonuses at top coin-flip casinos."
- Dismissable, only shown once per session

### 10.5 Streak-Based Nudge (Flip-Specific)
- Trigger: when player cashes out on a streak of 5+ flips
- After cash-out celebration, show a subtle message: "Nice streak! Imagine cashing out $X,XXX.XX for real. Check out our partner casinos →"
- Non-intrusive: small text below the result, fades after 5 seconds
- Only shown once every 10 bets (don't spam)

### 10.6 Integration Rules
- CTAs should NEVER interrupt gameplay (no modals during a flip or streak)
- Casino links must open in new tab: `target="_blank" rel="noopener noreferrer"`
- Responsible gambling disclaimer must be visible on the page at all times
- All conversion elements should feel like helpful suggestions, not pushy sales

---

## 11. Technical Implementation Notes

### 11.1 Recommended Tech Stack
- **Coin rendering:** CSS 3D transforms (`transform-style: preserve-3d`, `perspective`, `rotateY`)
- **Animation:** Framer Motion for UI transitions, CSS `@keyframes` for coin flip
- **State management:** React `useReducer` for game state (streak tracking requires multi-step state machine)
- **Random number generation:** `crypto.getRandomValues()` for fair randomness

### 11.2 Game State Machine

The Flip game has distinct states that must be carefully managed:

```
IDLE → FLIPPING → WON → (CASHING_OUT | FLIPPING) → IDLE
IDLE → FLIPPING → LOST → IDLE
```

**States:**
| State | Description | Available Actions |
|-------|-------------|-------------------|
| `idle` | No active bet, ready to flip | Change bet, change side, flip |
| `flipping` | Coin animation in progress | None (all controls disabled) |
| `won` | Flip won, awaiting decision | Cash Out, Flip Again |
| `cashing_out` | Cash-out animation playing | None |
| `lost` | Loss animation playing | None |
| `auto_running` | Auto-play in progress | Stop |

### 11.3 Performance Targets
- Coin flip animation: 60fps on mid-range mobile
- Initial render: < 100ms after component mount
- State transition: < 16ms (one frame)
- Auto-play mode: handle 1000+ rounds without memory leaks
- History array: cap at 500 entries, FIFO

### 11.4 File Structure

```
components/games/flip/
├── FlipGame.tsx              # Main component, orchestrates 3-column layout
├── FlipArena.tsx             # Center panel: coin + result + chain tracker
├── FlipCoin.tsx              # The coin component (3D CSS flip animation)
├── FlipChainTracker.tsx      # Horizontal progress dots for flip streak
├── FlipControls.tsx          # Controls panel (bet, side, flip, auto)
├── FlipSidebar.tsx           # Casino cards + session stats + bet history
├── FlipResultOverlay.tsx     # Multiplier + profit display overlay
├── FlipCashOutPanel.tsx      # Cash Out / Flip Again buttons
├── useFlipGame.ts            # Game state hook (useReducer state machine)
├── flipEngine.ts             # Core game logic (multiplier calc, RNG)
├── flipTypes.ts              # TypeScript types for Flip game
└── flipAnimations.ts         # Animation constants and CSS class utilities
```

### 11.5 Key TypeScript Types

```typescript
// flipTypes.ts

export type CoinSide = "heads" | "tails";
export type SidePick = CoinSide | "random";
export type FlipGameState = "idle" | "flipping" | "won" | "cashing_out" | "lost" | "auto_running";

export interface FlipConfig {
  betAmount: number;
  sidePick: SidePick;
  instantBet: boolean;
}

export interface FlipStreak {
  flips: number;          // current number of consecutive wins
  currentMultiplier: number;
  results: CoinSide[];    // sequence of coin results in this streak
  picks: CoinSide[];      // sequence of player picks in this streak
}

export interface FlipBetResult {
  id: string;
  amount: number;
  flipsInChain: number;
  multiplier: number;
  profit: number;
  pick: CoinSide;
  result: CoinSide;
  cashedOut: boolean;     // true if player cashed out, false if lost
  timestamp: number;
}

export interface FlipAutoPlayConfig {
  flipsPerRound: number;  // 1-20
  numberOfRounds: number; // 10, 25, 50, 100, Infinity
  onWin: "reset" | { increaseBy: number };
  onLoss: "reset" | { increaseBy: number };
  stopOnProfit: number | null;
  stopOnLoss: number | null;
}

export interface FlipGameFullState {
  gameState: FlipGameState;
  config: FlipConfig;
  streak: FlipStreak | null;  // null when idle
  balance: number;
  history: FlipBetResult[];
  sessionStats: SessionStats;
  autoPlay: FlipAutoPlayConfig | null;
  autoPlayProgress: {
    currentRound: number;
    totalRounds: number;
    wins: number;
    losses: number;
  } | null;
}
```

### 11.6 Core Engine Logic

```typescript
// flipEngine.ts

const HOUSE_EDGE = 0.02;
const BASE_MULTIPLIER = 1.96; // 2 * (1 - HOUSE_EDGE)
const MAX_FLIPS = 20;

export function getMultiplier(flips: number): number {
  return BASE_MULTIPLIER * Math.pow(2, flips - 1);
}

export function getWinChance(flips: number): number {
  return Math.pow(0.5, flips);
}

export function flipCoin(): CoinSide {
  const array = new Uint8Array(1);
  crypto.getRandomValues(array);
  return array[0] < 128 ? "heads" : "tails";
}

export function resolvePick(pick: SidePick): CoinSide {
  if (pick === "random") return flipCoin();
  return pick;
}

export function calculatePayout(betAmount: number, flips: number): number {
  return betAmount * getMultiplier(flips);
}
```

---

## 12. Accessibility

- Flip button: keyboard accessible (Space/Enter)
- Cash Out / Flip Again: keyboard accessible (Tab to navigate, Enter to activate)
- Side selection: `role="radiogroup"` with `aria-checked` on each option
- Coin flip result: `aria-live="polite"` region announces "Heads" or "Tails" + "You won X.XXx" or "You lost"
- Chain progress: `role="progressbar"` with `aria-valuenow` and `aria-valuemax`
- Screen reader: announce streak progress ("Flip 3 of 10, current multiplier 7.84x")
- Reduced motion: respect `prefers-reduced-motion` — skip coin animation, show result with simple fade transition
- Color contrast: all text meets WCAG AA (4.5:1 minimum)
- Focus management: after flip resolves, focus moves to Cash Out button (win) or Flip button (loss)

---

## 13. Responsible Gambling

The following must be present on the Flip page at all times:

**Footer disclaimer (always visible):**
> "18+ | Gambling involves risk. Only bet what you can afford to lose. PaperBet.io is a free simulator for educational purposes. We are not a gambling site."

**Session limit indicator:**
- After 100 bets in a session, show a gentle reminder: "You've played 100 rounds. Remember, this is practice mode."
- Non-intrusive: small banner below the controls panel, dismissable

**Streak warning:**
- If player is on a streak of 10+ flips without cashing out, show a small non-intrusive message: "You're on a hot streak! Remember: each flip is still 50/50."
- Does NOT interrupt gameplay — just informational text near the chain tracker

---

## 14. Game Info Panel

**Position:** Collapsible panel at the bottom of the page (or in a modal triggered by "?" icon)

**Content:**

**"How to Play" section:**
1. Set your bet amount
2. Pick Heads or Tails (or choose Random)
3. Flip the coin — if you guessed right, you win 1.96x your bet
4. After winning, choose: Cash Out to take your winnings, or Flip Again to double the multiplier
5. Keep going up to 20 flips for a maximum of 1,027,604.48x — but one wrong guess and you lose everything!

**"Game Info" section:**
| Property | Value |
|----------|-------|
| Game Type | Coin Flip |
| RTP | 98.00% |
| House Edge | 2.00% |
| Max Flips | 20 |
| Max Multiplier | 1,027,604.48x |
| Win Chance (1 flip) | 50.00% |
| Provider | PaperBet Originals |

**"Multiplier Table" section:** Collapsible table showing all 20 flip multipliers (from §3.3)
