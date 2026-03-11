# Keno — Complete Game Specification for PaperBet.io

---

## 1. Game Overview

Keno is a lottery-style number-picking game played on an 8×5 grid of 40 numbers. The player selects 1 to 10 numbers, the casino draws 10 random numbers, and the payout is determined by how many of the player's picks match the drawn numbers. Four difficulty levels control the risk/reward curve — from conservative Classic mode to volatile High mode where 10/10 matches pay 1,000x.

**Why it's popular in crypto casinos:** Keno combines the instant-gratification of lottery scratchers with customizable risk. Players feel strategic because they "choose their numbers" (even though the selection is purely luck-based). The 8×5 mini-grid format keeps rounds under 3 seconds, enabling rapid-fire play.

**Psychological hooks:** Number selection creates an illusion of control — players develop superstitious patterns and "lucky numbers." The sequential tile reveal builds anticipation as each match accumulates. The gem/diamond visual on hits triggers a collectible/reward instinct. Variable difficulty lets players self-select their risk tolerance while the house edge remains constant. Near-miss scenarios (9/10 hits) feel agonizingly close to a 1,000x jackpot, driving retry behavior.

---

## 2. Exact Game Mechanics

### 2.1 Step-by-Step Game Flow — Manual Mode

1. Player sets **bet amount** (default: $1.00 paper money)
2. Player selects **difficulty level** (Classic / Low / Medium / High, default: Classic)
3. Player selects **1 to 10 numbers** on the 8×5 grid by clicking tiles
   - OR clicks **"Random Pick"** to auto-select 10 random numbers
   - OR clicks **"Clear Table"** to deselect all
4. Player clicks **"Bet"** → the draw begins
5. The casino draws **10 numbers** from 1–40 (no duplicates)
6. Numbers are revealed **sequentially** on the board with staggered animation (~100ms apart)
   - **Hit** (drawn number matches a player pick): tile reveals with green gem icon + glow
   - **Miss** (drawn number not in player picks): tile dims to dark state
   - Undrawn tiles remain unchanged
7. Matches are counted, multiplier is looked up from the payout table
8. Payout = bet × multiplier → result displayed
9. Session stats update (total bets, net profit, etc.)
10. Player's number selections **persist** for the next round (no need to re-select)
11. After 5+ bets, "What You Would Have Won" display appears

### 2.2 Step-by-Step Game Flow — Auto Mode

1. Player sets **bet amount**
2. Player selects **difficulty level**
3. Player selects **numbers** (or uses Random Pick)
4. Player sets **number of rounds** (10 / 25 / 50 / 100 / ∞)
5. Player configures optional stop/adjust conditions
6. Player clicks **"Start Auto"** → rounds execute automatically
7. Each round: draw 10 numbers, check matches, pay out, repeat
8. Auto-play stops when: rounds completed, stop condition hit, or player clicks **"Stop"**

### 2.3 Draw Mechanism

**The draw is pre-calculated before any animation begins:**

1. Generate 10 unique random numbers from 1–40 using Fisher-Yates partial shuffle:
   - Pool = [1, 2, 3, ..., 40]
   - For i = 0 to 9: generate random float via `crypto.getRandomValues()`, pick index `floor(float × (40 - i))`, swap with end of remaining pool
2. The 10 drawn numbers are the result
3. Count matches against player's selected numbers
4. Look up multiplier from payout table [difficulty][picks][matches]
5. Animate the reveal sequence

### 2.4 Configurable Parameters

| Parameter | Range | Default | Step |
|-----------|-------|---------|------|
| Bet Amount | $0.10 – $1,000.00 | $1.00 | $0.10 |
| Difficulty | Classic / Low / Medium / High | Classic | — |
| Number Picks | 1 – 10 numbers from 1–40 | — | — |
| Auto-play Rounds | 10 / 25 / 50 / 100 / ∞ | Off | — |

---

## 3. Mathematical Model

### 3.1 House Edge & RTP

- **House edge:** **1.00%** (lowest of all PaperBet games)
- **RTP (Return to Player):** **99.00%**
- House edge is embedded in the multiplier values, not in the draw probabilities
- The draw is perfectly fair: 10 out of 40 numbers, uniform random
- Expected Value: `EV = Σ (P(k matches) × Multiplier(k)) ≈ 0.99` for all difficulty/pick combinations

### 3.2 Probability Model

The number of matches follows a **hypergeometric distribution**:

```
P(k matches | n picks, 10 drawn, 40 total) = C(n,k) × C(40-n, 10-k) / C(40, 10)
```

Where:
- `n` = number of player picks (1–10)
- `k` = number of matches (0–n)
- `C(a,b)` = binomial coefficient "a choose b"
- Total possible draws: `C(40,10) = 847,660,528`

### 3.3 Probability Tables

**For reference — exact probabilities for each pick count:**

| Picks | 0 hits | 1 hit | 2 hits | 3 hits | 4 hits | 5 hits | 6 hits | 7 hits | 8 hits | 9 hits | 10 hits |
|-------|--------|-------|--------|--------|--------|--------|--------|--------|--------|--------|---------|
| 1 | 75.00% | 25.00% | | | | | | | | | |
| 2 | 55.77% | 38.46% | 5.77% | | | | | | | | |
| 3 | 41.09% | 44.03% | 13.66% | 1.21% | | | | | | | |
| 4 | 29.99% | 44.43% | 21.42% | 3.94% | 0.23% | | | | | | |
| 5 | 21.66% | 41.65% | 27.77% | 7.93% | 0.96% | 0.04% | | | | | |
| 6 | 15.47% | 37.13% | 32.13% | 12.69% | 2.38% | 0.20% | 0.01% | | | | |
| 7 | 10.92% | 31.85% | 34.40% | 17.64% | 4.57% | 0.59% | 0.03% | 0.001% | | | |
| 8 | 7.61% | 26.47% | 34.74% | 22.24% | 7.48% | 1.33% | 0.12% | 0.005% | 0.0001% | | |
| 9 | 5.23% | 21.40% | 33.50% | 26.06% | 10.94% | 2.53% | 0.31% | 0.02% | 0.0005% | 0.00001% | |
| 10 | 3.54% | 16.88% | 31.07% | 28.82% | 14.71% | 4.24% | 0.68% | 0.06% | 0.002% | 0.00005% | 0.000001% |

### 3.4 Multiplier / Payout Tables

#### IMPORTANT: How to read these tables
- Rows = number of picks (1–10)
- Columns = number of matches (0× = 0 matches, 1× = 1 match, etc.)
- Values are the multiplier applied to the bet amount
- 0.00 means no payout (bet is lost)
- Multipliers are symmetric across difficulties for the same match probability tier

#### 3.4.1 — Classic Difficulty

| Picks | 0× | 1× | 2× | 3× | 4× | 5× | 6× | 7× | 8× | 9× | 10× |
|-------|------|------|------|------|------|------|------|------|------|------|-------|
| 1 | 0.00 | 3.96 | | | | | | | | | |
| 2 | 0.00 | 1.90 | 4.50 | | | | | | | | |
| 3 | 0.00 | 1.00 | 3.10 | 10.40 | | | | | | | |
| 4 | 0.00 | 0.80 | 1.80 | 5.00 | 22.50 | | | | | | |
| 5 | 0.00 | 0.25 | 1.40 | 4.10 | 16.50 | 36.00 | | | | | |
| 6 | 0.00 | 0.00 | 1.00 | 3.68 | 7.00 | 16.50 | 40.00 | | | | |
| 7 | 0.00 | 0.00 | 0.47 | 3.00 | 4.50 | 14.00 | 31.00 | 60.00 | | | |
| 8 | 0.00 | 0.00 | 0.00 | 2.20 | 4.00 | 13.00 | 22.00 | 55.00 | 70.00 | | |
| 9 | 0.00 | 0.00 | 0.00 | 1.55 | 3.00 | 8.00 | 15.00 | 44.00 | 60.00 | 85.00 | |
| 10 | 0.00 | 0.00 | 0.00 | 1.40 | 2.25 | 4.50 | 8.00 | 17.00 | 50.00 | 80.00 | 100.00 |

#### 3.4.2 — Low Difficulty

| Picks | 0× | 1× | 2× | 3× | 4× | 5× | 6× | 7× | 8× | 9× | 10× |
|-------|------|------|------|------|------|------|------|------|------|------|-------|
| 1 | 0.70 | 1.85 | | | | | | | | | |
| 2 | 0.00 | 2.00 | 3.80 | | | | | | | | |
| 3 | 0.00 | 1.10 | 1.38 | 26.00 | | | | | | | |
| 4 | 0.00 | 0.00 | 2.20 | 7.90 | 90.00 | | | | | | |
| 5 | 0.00 | 0.00 | 1.50 | 4.20 | 13.00 | 300.00 | | | | | |
| 6 | 0.00 | 0.00 | 1.10 | 2.00 | 6.20 | 100.00 | 700.00 | | | | |
| 7 | 0.00 | 0.00 | 1.10 | 1.60 | 3.50 | 15.00 | 225.00 | 700.00 | | | |
| 8 | 0.00 | 0.00 | 1.10 | 1.50 | 2.00 | 5.50 | 39.00 | 100.00 | 800.00 | | |
| 9 | 0.00 | 0.00 | 1.10 | 1.30 | 1.70 | 2.50 | 7.50 | 50.00 | 250.00 | 1000.00 | |
| 10 | 0.00 | 0.00 | 1.10 | 1.20 | 1.30 | 1.80 | 3.50 | 13.00 | 50.00 | 250.00 | 1000.00 |

#### 3.4.3 — Medium Difficulty

| Picks | 0× | 1× | 2× | 3× | 4× | 5× | 6× | 7× | 8× | 9× | 10× |
|-------|------|------|------|------|------|------|------|------|------|------|-------|
| 1 | 0.40 | 2.75 | | | | | | | | | |
| 2 | 0.00 | 1.80 | 5.10 | | | | | | | | |
| 3 | 0.00 | 0.00 | 2.80 | 50.00 | | | | | | | |
| 4 | 0.00 | 0.00 | 1.70 | 10.00 | 100.00 | | | | | | |
| 5 | 0.00 | 0.00 | 1.40 | 4.00 | 14.00 | 390.00 | | | | | |
| 6 | 0.00 | 0.00 | 0.00 | 3.00 | 9.00 | 180.00 | 710.00 | | | | |
| 7 | 0.00 | 0.00 | 0.00 | 2.00 | 7.00 | 30.00 | 400.00 | 800.00 | | | |
| 8 | 0.00 | 0.00 | 0.00 | 2.00 | 4.00 | 11.00 | 67.00 | 400.00 | 900.00 | | |
| 9 | 0.00 | 0.00 | 0.00 | 2.00 | 2.50 | 5.00 | 15.00 | 100.00 | 500.00 | 1000.00 | |
| 10 | 0.00 | 0.00 | 0.00 | 1.60 | 2.00 | 4.00 | 7.00 | 26.00 | 100.00 | 500.00 | 1000.00 |

#### 3.4.4 — High Difficulty

| Picks | 0× | 1× | 2× | 3× | 4× | 5× | 6× | 7× | 8× | 9× | 10× |
|-------|------|------|------|------|------|------|------|------|------|------|-------|
| 1 | 0.00 | 3.96 | | | | | | | | | |
| 2 | 0.00 | 0.00 | 17.10 | | | | | | | | |
| 3 | 0.00 | 0.00 | 0.00 | 81.50 | | | | | | | |
| 4 | 0.00 | 0.00 | 0.00 | 10.00 | 259.00 | | | | | | |
| 5 | 0.00 | 0.00 | 0.00 | 4.50 | 48.00 | 450.00 | | | | | |
| 6 | 0.00 | 0.00 | 0.00 | 0.00 | 11.00 | 350.00 | 710.00 | | | | |
| 7 | 0.00 | 0.00 | 0.00 | 0.00 | 7.00 | 90.00 | 400.00 | 800.00 | | | |
| 8 | 0.00 | 0.00 | 0.00 | 0.00 | 5.00 | 20.00 | 270.00 | 600.00 | 900.00 | | |
| 9 | 0.00 | 0.00 | 0.00 | 0.00 | 4.00 | 11.00 | 56.00 | 500.00 | 800.00 | 1000.00 | |
| 10 | 0.00 | 0.00 | 0.00 | 0.00 | 3.50 | 8.00 | 13.00 | 63.00 | 500.00 | 800.00 | 1000.00 |

### 3.5 Win Tier Classification

| Tier | Multiplier Range | Description |
|------|-----------------|-------------|
| Loss | 0.00x | No payout — bet lost |
| Micro Win | 0.01x – 0.99x | Partial return (only in Classic/Low with few matches) |
| Break Even | 1.00x – 1.49x | Roughly break even |
| Small Win | 1.50x – 4.99x | Modest profit |
| Good Win | 5.00x – 49.99x | Solid return |
| Big Win | 50.00x – 299.99x | Major payout |
| Epic Win | 300.00x – 799.99x | Rare and exciting |
| Jackpot | 800.00x – 1,000.00x | Maximum tier — legendary |

---

## 4. Visual Design Specification

### 4.1 Overall Layout

**Desktop (≥1024px) — 3-Column Layout:**
```
┌───────────────────────────────────────────────────────────────┐
│ [HEADER — sticky, always visible]                             │
├────────────┬─────────────────────────┬────────────────────────┤
│            │                         │                        │
│  CONTROLS  │    KENO BOARD           │    CASINO SIDEBAR      │
│  PANEL     │    (8×5 Grid)           │    (Deals + Stats)     │
│            │                         │                        │
│  Width:    │    Width: flex-1        │    Width: 320px        │
│  300px     │    Min: 480px           │    Scrollable          │
│            │    Max: 720px           │                        │
│            │                         │                        │
│  - Bet Amt │    40 Number Tiles      │    - Casino Cards      │
│  - Diff.   │                         │    - Session Stats     │
│  - Pick /  │    ─────────────────    │    - Bet History       │
│    Clear   │    Multiplier Row       │    - "What You Would   │
│  - Bet     │    (match payouts)      │       Have Won"        │
│  - Auto    │                         │                        │
│            │                         │                        │
├────────────┴─────────────────────────┴────────────────────────┤
│ [BET HISTORY TABLE — full width below on desktop]             │
└───────────────────────────────────────────────────────────────┘
```

**Mobile (<768px) — Single Column, Stacked:**
```
┌─────────────────────────┐
│ KENO BOARD (8×5 Grid)   │
│ Full width, scaled      │
├─────────────────────────┤
│ MULTIPLIER ROW          │
├─────────────────────────┤
│ CONTROLS (compact)      │
│ Bet + Difficulty + Bet  │
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
│ KENO BOARD (centered, max-w: 600px)      │
│ MULTIPLIER ROW                           │
├───────────────────┬──────────────────────┤
│ CONTROLS          │ SESSION STATS        │
├───────────────────┴──────────────────────┤
│ CASINO CARDS + BET HISTORY               │
└──────────────────────────────────────────┘
```

### 4.2 The Keno Board (8×5 Grid)

**Container:**
- Background: `#0B0F1A` (seamless with page)
- Max width: 720px (desktop), full width on mobile
- Padding: 16px around the grid
- Border: subtle `#1F2937` border, rounded-xl
- Aspect ratio: approximately 8:5.5 (includes multiplier row below)

**Grid Layout:**
- CSS Grid: `grid-template-columns: repeat(8, 1fr)`
- 5 rows × 8 columns = 40 tiles
- Gap: 8px (desktop), 6px (mobile)
- Numbers arranged sequentially: Row 1 = 1–8, Row 2 = 9–16, Row 3 = 17–24, Row 4 = 25–32, Row 5 = 33–40

**Individual Tiles:**
- Shape: rounded rectangle, `border-radius: 8px`
- Aspect ratio: 1:1 (square) achieved via `aspect-ratio: 1` or `padding-bottom: 100%`
- Min size: 44px × 44px (touch target compliance)
- Number text: JetBrains Mono, 18px bold (desktop), 14px bold (mobile)
- Text shadow: `rgba(0, 0, 0, 0.15) 0 2px 2px` for depth
- Font variant: `lining-nums tabular-nums` (consistent number widths)
- Cursor: pointer on interactive tiles
- Transition: all 150ms ease

### 4.3 Tile States (6 States)

**Keno's game-specific accent color: `#A855F7` (purple)** — used for selected tiles to give Keno a unique visual identity distinct from other PaperBet games.

| State | Background | Box Shadow | Text Color | Border |
|-------|-----------|------------|------------|--------|
| **Default** | `#1F2937` | `0 3px 0 #374151` (bottom depth) | `#F9FAFB` (white) | none |
| **Hover** | `#374151` | `0 4px 0 #4B5563` (slightly taller) | `#F9FAFB` | none |
| **Selected** | `#A855F7` (purple) | `0 3px 0 #7C3AED` (purple shadow) | `#FFFFFF` | none |
| **Selected + Hover** | `#C084FC` (lighter purple) | `0 4px 0 #9333EA` | `#FFFFFF` | none |
| **Revealed: Hit** | `#0B0F1A` (deep dark) | `0 3px 0 #7C3AED, inset 0 0 0 3px #A855F7` (purple inner border) | `#00E5A0` (green) | 3px inset `#A855F7` |
| **Revealed: Miss** | `#0B0F1A` (deep dark) | `inset 0 3px 0 #000D14` | `#EF4444` (red, dimmed to 60% opacity) | none |
| **Not Drawn** | remains in Default or Selected state | — | — | — |

**Hit Tile Content:**
- The number stays visible but shifts to `#00E5A0` (accent green)
- A **gem/diamond icon** (Lucide `Gem` icon) appears centered below or beside the number
- Gem size: 20px (desktop), 16px (mobile)
- Gem color: `#00E5A0` with subtle glow: `drop-shadow(0 0 6px rgba(0, 229, 160, 0.5))`
- The tile has a brief **green pulse glow** on reveal (see §6.2)

**Miss Tile Content:**
- Number visible but dimmed to `#EF4444` at 60% opacity
- No icon — just the darkened number
- Feels "empty" and muted — intentionally forgettable

**Tile Click Behavior:**
- Click toggles selection (selected ↔ default)
- If 10 numbers already selected and player clicks an 11th, show a brief shake animation on the grid + tooltip: "Maximum 10 numbers"
- Selected tiles have a **pop animation** on selection: scale 0.9 → 1.05 → 1.0 over 200ms
- Deselected tiles: scale 1.0 → 0.95 → 1.0 over 150ms

### 4.4 Multiplier Badge Row

**Position:** Directly below the 8×5 grid, full width of the board container

**Layout:** Horizontal row of rounded pill badges, one per possible match count (0 to N, where N = number of picks)

**Example for 5 picks:** `0×  1×  2×  3×  4×  5×`

**Each Badge:**
- Shape: rounded-full pill, `px-3 py-1.5`
- Min width: 56px (desktop), 44px (mobile)
- Gap between badges: 6px
- Layout: flex, justify-center, gap-1.5, overflow-x-auto on mobile

**Badge Content (two lines stacked):**
- Top: multiplier value — JetBrains Mono, 12px bold (e.g., "4.10x")
- Bottom: match label — DM Sans, 10px, muted (e.g., "3 hits")
- For 0.00x payouts: show "0x" in muted styling

**Badge Color States:**

| State | Background | Text | Border |
|-------|-----------|------|--------|
| **Inactive (no match yet)** | `#1F2937` | `#6B7280` (muted) | `#374151` |
| **Loss multiplier (0.00x)** | `#1F2937` | `#4B5563` (very muted) | `#374151` |
| **Active (current match count)** | colored by tier (see below) | `#FFFFFF` | matching tier color |
| **Passed (fewer matches than current)** | `#111827` | `#6B7280` | none |

**Active Badge Color by Multiplier Tier:**

| Multiplier | Badge Color |
|-----------|------------|
| 0.00x | `#374151` (dark gray) |
| 0.01x – 0.99x | `#6B7280` (gray) |
| 1.00x – 4.99x | `#00E5A0` (green) |
| 5.00x – 49.99x | `#F97316` (orange) |
| 50.00x – 299.99x | `#EF4444` (red) |
| 300.00x – 799.99x | `#EF4444` (red) with glow |
| 800.00x+ | `#F59E0B` (gold) with intense glow |

**Animation during draw:** As each hit is revealed, the active badge shifts right with a slide animation (200ms spring). The newly active badge scales up (1.0 → 1.15 → 1.0) and the previous one dims.

**Before the draw:** All badges show their multiplier values but in the inactive (muted) state. The "0×" badge is subtly highlighted as the starting position.

### 4.5 Result Display

**Position:** Centered overlay on the board, appears after all 10 numbers are revealed

**Content:**
```
[Multiplier]     ← large, colored text
[+$X.XX]         ← profit amount below
[X / N hits]     ← match summary
```

**Multiplier Typography:**
- Font: JetBrains Mono
- Size: 48px (desktop), 32px (mobile)
- Weight: Bold (700)
- Color: by tier (same as multiplier badge colors)

**Profit Display:**
- "+$X.XX" in `#00E5A0` for wins, "-$X.XX" in `#EF4444` for losses, "$0.00" in `#6B7280` for zero payout
- Font: JetBrains Mono, 20px regular

**Match Summary:**
- "5 / 8 hits" — DM Sans, 14px, `#9CA3AF`
- Shows picks that matched out of total picks

**Animation:**
- Entrance: scale 0.5 → 1.0, opacity 0 → 1, 200ms ease-out
- For multipliers ≥ 50x: pulse scale 1.0 → 1.1 → 1.0 twice
- For multipliers ≥ 800x: gold glow + pulse
- Exit: fade out after 2 seconds (or immediately on next bet in auto-play)

### 4.6 Color Coding System

**Keno Game Accent: `#A855F7` (Purple)**
This color is unique to Keno across PaperBet and used for:
- Selected tile backgrounds
- Hit tile inner borders
- Game card accent on homepage
- Active difficulty badge when viewing Keno

**Difficulty Visual Indicators:**

| Difficulty | Badge Color | Description |
|-----------|------------|-------------|
| Classic | `#00E5A0` (green) | Balanced, beginner-friendly |
| Low | `#00B4D8` (cyan) | Conservative, frequent small wins |
| Medium | `#F59E0B` (amber) | Moderate risk, decent peaks |
| High | `#EF4444` (red) | Volatile, all-or-nothing payouts |

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

### 5.3 Difficulty Selector

**Label:** "Difficulty" — DM Sans, 14px, `#9CA3AF`

**Segmented Control (4 buttons in a row):**
- Container: `#1F2937` bg, rounded-lg, p-1
- Each segment: rounded-md, py-2, flex-1
- Inactive: transparent bg, `#9CA3AF` text
- Active states:
  - Classic: `#00E5A0` bg at 15% opacity, `#00E5A0` text
  - Low: `#00B4D8` bg at 15% opacity, `#00B4D8` text
  - Medium: `#F59E0B` bg at 15% opacity, `#F59E0B` text
  - High: `#EF4444` bg at 15% opacity, `#EF4444` text
- Font: DM Sans, 12px, semibold
- Transition: 150ms ease background-color change
- When changed: multiplier badge row instantly updates with new payout values

### 5.4 Number Selection Controls

**Two buttons side by side below the difficulty selector:**

**"Random Pick" Button:**
- Width: flex-1
- Background: `#1F2937`, border: `#374151`, rounded-lg
- Icon: Lucide `Shuffle`, 16px, `#A855F7` (Keno purple)
- Text: "Random Pick" — DM Sans, 13px, `#9CA3AF`
- Hover: `#374151` bg, `#F9FAFB` text
- Behavior: selects 10 random numbers, clearing any existing selection first
- If numbers are already selected: replaces them entirely with 10 new random picks

**"Clear Table" Button:**
- Width: flex-1
- Background: `#1F2937`, border: `#374151`, rounded-lg
- Icon: Lucide `Trash2`, 16px, `#EF4444`
- Text: "Clear" — DM Sans, 13px, `#9CA3AF`
- Hover: `#374151` bg, `#EF4444` text
- Behavior: deselects all numbers
- Disabled state: when no numbers are selected (opacity 50%, cursor not-allowed)

**Selection Counter:**
- Below the buttons: "5 / 10 selected" — DM Sans, 12px, `#6B7280`
- Updates in real-time as player clicks tiles
- When 0 selected: "Select 1–10 numbers to play" in `#6B7280`
- When 10 selected: "Maximum reached" in `#A855F7`

### 5.5 Bet Button (Primary Action)

**Normal State:**
- Full-width button within controls panel
- Height: 48px (desktop), 44px (mobile)
- Background: `#00E5A0`
- Text: "Bet" — DM Sans, 16px, bold, `#0B0F1A` (dark text on green)
- Border-radius: 10px
- Subtle box-shadow: `0 0 20px rgba(0, 229, 160, 0.2)`
- Cursor: pointer

**Hover State:**
- Background lightens slightly (`#1AFFA8`)
- Box-shadow intensifies: `0 0 30px rgba(0, 229, 160, 0.3)`

**Active/Pressed:**
- Scale: 0.98
- Background: `#00CC8E`

**Disabled States:**
- No numbers selected: `#374151` bg, "Select Numbers" text, cursor not-allowed
- During draw animation: `#374151` bg, "Drawing..." text with animated ellipsis
- Re-enables when draw animation completes

**Keyboard shortcut:** Spacebar triggers bet (when focus is not on an input)

### 5.6 Instant Bet Toggle

**Position:** Small toggle below the Bet button

**Layout:** Inline flex with label
- Label: "Instant Bet" — DM Sans, 12px, `#6B7280`
- Toggle: 36px × 20px track
- Off: `#374151` track, `#6B7280` thumb
- On: `#00E5A0` track, white thumb
- When on: skip tile reveal animation, show all results instantly

### 5.7 Auto Mode Controls

When the "Auto" tab is active, the controls panel shows:

**Bet Amount:** Same as manual mode (§5.2)

**Difficulty Selector:** Same as manual mode (§5.3)

**Number Selection:** Same Random Pick / Clear buttons (§5.4)

**Number of Rounds:**
- Label: "Number of Rounds" — DM Sans, 14px, `#9CA3AF`
- Segmented control: 10 | 25 | 50 | 100 | ∞
- Active: `#00E5A0` bg at 15%, `#00E5A0` text
- Inactive: transparent, `#9CA3AF` text

**Advanced Settings (collapsible):**
- Header: "Advanced" with chevron, clickable to expand

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
- Start: same as Bet button but text says "Start Auto"
- Running: changes to red `#EF4444` bg, white text, "Stop Auto"
- Counter below: "Round 15 / 50 — Hits: 32 | Profit: +$12.30"

---

## 6. Animations & Transitions

### 6.1 Tile Reveal Animation Sequence

**Total duration:** ~1.2 seconds for all 10 drawn numbers (normal mode), 0ms (instant bet)

**Sequence:**
1. Board locks — all tiles become non-interactive
2. All 10 drawn numbers are pre-determined
3. Tiles reveal one by one in **draw order** (the order generated by the RNG, which is effectively random across the board)
4. Each reveal is staggered by **100ms**
5. Total: 10 × 100ms = ~1 second of reveals + 200ms for result overlay = ~1.2s

**Individual Tile Reveal Animation (per tile, 300ms):**

**For Hit tiles (drawn number matches player pick):**
1. Tile "flips" via Y-axis rotation: `rotateY(0deg → 90deg)` over 150ms (first half)
2. At 90deg (tile edge-on): swap content to hit state (green number + gem icon)
3. Continue rotation: `rotateY(90deg → 0deg)` over 150ms (second half)
4. On completion: brief green glow pulse on the tile — `box-shadow: 0 0 15px rgba(0, 229, 160, 0.4)` fading over 300ms
5. Corresponding multiplier badge advances and highlights

**For Miss tiles (drawn but not selected by player):**
1. Same flip animation but faster (200ms total)
2. Content swaps to miss state (dimmed red number, dark background)
3. No glow effect — just dims quietly

**Easing:** `cubic-bezier(0.87, -0.41, 0.19, 1.44)` — slight bounce overshoot for tactile feel

**For tiles that were NOT drawn (30 out of 40):**
- No animation — they stay in their current state (default or selected)
- Selected-but-not-drawn tiles remain purple, indicating "you picked this but it wasn't drawn"

### 6.2 Win Celebrations by Tier

| Tier | Multiplier | Animation |
|------|-----------|-----------|
| Loss | 0.00x | Board dims briefly, result shows in muted gray, resets quickly |
| Micro Win | 0.01x – 0.99x | Small result text, muted colors, quick fade |
| Break Even | 1.00x – 1.49x | Result text in green, subtle pulse |
| Small Win | 1.50x – 4.99x | Multiplier badge glows, result text pulses green, "+$X.XX" floats up |
| Good Win | 5.00x – 49.99x | Screen edges flash green/orange, result scales up, hit tiles pulse in unison |
| Big Win | 50.00x – 299.99x | Intense glow on all hit tiles, screen-edge red/orange flash, result text large with glow, board shakes subtly (1px, 300ms) |
| Epic Win | 300.00x – 799.99x | Particle burst from hit tiles, heavy screen shake (2px, 500ms), all hit gems pulse together, result scales up dramatically |
| Jackpot | 800.00x – 1,000x | Gold particle explosion from all hit tiles, full screen shake (3px, 600ms), golden rain particles from top, result text in gold with animated text-shadow, entire board briefly tinted gold, all multiplier badges do a celebratory ripple |

### 6.3 Loss Animation (0.00x)

- All revealed tiles dim simultaneously
- No dramatic animation — losses should feel quick and forgettable
- Result "0.00x" appears briefly in `#6B7280` (muted), small font
- "-$X.XX" in `#EF4444` at 60% opacity
- Board resets to interactive state within 500ms
- Design principle: minimize loss dwelling time to encourage replaying

### 6.4 Tile Selection Animation

**On select (click to add):**
1. Tile scales: 1.0 → 0.92 → 1.06 → 1.0 (spring effect, 250ms)
2. Background transitions: `#1F2937` → `#A855F7` (150ms ease)
3. Box-shadow transitions to purple shadow
4. Number text brightens to pure white

**On deselect (click to remove):**
1. Tile scales: 1.0 → 0.95 → 1.0 (softer spring, 150ms)
2. Background transitions: `#A855F7` → `#1F2937` (150ms ease)
3. Shadow resets to default

**Random Pick animation:**
- All currently selected tiles deselect simultaneously (no animation)
- 10 new tiles select in rapid cascade: ~30ms stagger between each
- Creates a "popcorn" visual effect across the grid
- Each tile does the select spring animation

**Clear Table animation:**
- All selected tiles do the deselect animation simultaneously
- Brief collective scale-down effect

### 6.5 Multiplier Badge Advancement Animation

During the draw, as each hit is revealed:

1. Current match count increases
2. The active badge shifts one position right
3. Outgoing badge: dims to `#111827`, scale 1.0 → 0.95 (200ms)
4. Incoming badge: lights up with tier color, scale 1.0 → 1.15 → 1.0 (300ms spring)
5. If the new multiplier is higher tier: badge color transitions with a brief flash

### 6.6 Auto-Play Animations

- **Normal mode:** Full tile reveal sequence per round, then 500ms pause before next round
- **Instant Bet mode:** All results appear instantly, 200ms pause between rounds, only the result overlay and multiplier badge briefly flash
- **Board transition between rounds:** Quick fade-reset of revealed tiles (200ms fade to default state)
- Round counter in controls panel pulses green on each win, red on each loss

### 6.7 Idle Animations

- Selected tiles: very subtle glow pulse on `box-shadow` (opacity 0.3 → 0.5, 3s loop, ease-in-out)
- Bet button: breathing glow on box-shadow (opacity 0.15 → 0.25, 2s loop)
- Multiplier badges: no idle animation (static until draw begins)

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
| Best Win | "81.50x ($81.50)" | JetBrains Mono, 20px, `#F59E0B` |

**Additional stats (expandable "More Stats" section):**
- Total Returns
- Biggest Loss
- Average Hits per Draw
- Most Hits in One Draw
- Average Multiplier
- Win Rate % (rounds with payout > 0)
- Favorite Numbers (top 3 most-picked numbers — fun stat)
- Total Gems Collected (total hit count across all draws)

### 7.2 Draw Result History Strip

**Position:** Thin horizontal strip between the multiplier badge row and the board bottom edge (or above the board)

**Layout:** Row of small indicators showing last 15 results
- Each indicator: 20px × 20px rounded square
- Content: match count number (e.g., "3", "7", "0")
- Background color: by win tier (green for wins, gray for losses, gold for big wins)
- Most recent on the right
- New results push in from the right with slide animation
- On hover: tooltip showing "3/5 hits — 4.10x — +$3.10"

### 7.3 Bet History Table

**Layout:** Scrollable table below the main game area (uses shared `BetHistory` component with adapted columns)

**Columns:**
| Column | Width | Alignment | Content |
|--------|-------|-----------|---------|
| # | 40px | Center | Row number (most recent first) |
| Bet | 80px | Right | "$1.00" — JetBrains Mono |
| Hits | 60px | Center | "5/8" — matches/picks |
| Multi | 80px | Right | "4.10x" — colored by tier |
| Profit | 100px | Right | "+$3.10" green or "-$1.00" red |
| Diff | 70px | Center | Badge (Classic/Low/Med/High) |

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

Top casino for Keno:
[Casino Card — e.g., BC.Game: Win up to 5 BTC]
[CTA: "Spin the Deal Wheel →"]
```

Uses shared `RealMoneyDisplay` component.

---

## 8. Sound Design Notes (Visual Equivalents)

Since our simulator has no audio, visual cues replace sound feedback:

| Audio Cue (Real Casino) | Visual Replacement |
|------------------------|-------------------|
| Tile reveal "tick" | Tile flip animation (rotateY) |
| Hit match "ting" | Green glow pulse on hit tile + gem icon appearance |
| Miss reveal "thud" | Tile dims to dark state, no celebration |
| Multiple hits "ting-ting-ting" | Rapid succession of green glows across board |
| Big win "fanfare" | Particle burst + screen shake + golden glow |
| Jackpot "explosion" | Full gold particle explosion + heavy screen shake + golden rain |
| Number select "pop" | Tile spring scale animation (0.92 → 1.06 → 1.0) |
| Random pick "cascade" | Rapid staggered tile selections (popcorn effect) |
| Auto-play "tick" | Small pulse on round counter |
| Button click "pop" | Button scale 0.95 → 1.0 micro-animation |

**Haptic Feedback (mobile):** If Vibration API is available:
- Bet button: short vibration (50ms)
- Each hit during draw: micro vibration (30ms)
- Win ≥ 50x: medium vibration (100ms)
- Jackpot: pattern vibration (100ms-50ms-100ms-50ms-100ms)

---

## 9. Edge Cases & Error States

### 9.1 No Numbers Selected
- Bet button shows "Select Numbers" and is disabled
- Cannot start auto-play without at least 1 number selected
- Gentle visual hint: grid tiles have a subtle shimmer/pulse to draw attention

### 9.2 Maximum Selection (10 Numbers)
- Clicking an 11th number: grid does a brief horizontal shake (3px, 200ms)
- Tooltip appears: "Maximum 10 numbers selected"
- The unselected tile briefly flashes red border, then returns to default
- Player must deselect a number before selecting a new one

### 9.3 Rapid Clicking During Draw
- Board is non-interactive during draw animation (pointer-events: none)
- Bet button disabled during draw
- Tile hover effects disabled
- If auto-play and Instant Bet: allow rapid succession (50ms debounce per round)

### 9.4 Browser Resize
- Grid recalculates tile sizes on resize (debounced 200ms)
- Draw animation in progress: complete at current dimensions, next draw uses new
- Multiplier badges reflow (wrap to two lines if needed on mobile)

### 9.5 Touch vs Click
- All tiles must have minimum 44px × 44px touch targets
- Bet button: full width on mobile for easy thumb access
- Tile gap must be sufficient to prevent mis-taps (minimum 6px)
- No long-press behavior — single tap toggles selection

### 9.6 Extreme Values
- Bet at $1,000 with 1,000x multiplier: display "$1,000,000.00" correctly
- Format large multipliers with commas: "1,000.00x" not "1000x"
- Net profit display: handle "-$999.99" to "+$999,999.99" range

### 9.7 Difficulty Change Mid-Session
- Changing difficulty updates multiplier badges immediately
- Bet history preserves the difficulty used for each bet
- Stats are session-wide (not per-difficulty)

### 9.8 Connection/Performance
- Client-side only, no connection issues
- Grid is CSS-based (not Canvas), so performance is excellent
- Tile animations use CSS transforms + will-change for GPU acceleration
- If `prefers-reduced-motion`: skip tile flip animations, show results with simple opacity fade
- Auto-play with Instant Bet: cap at ~10 rounds/second to prevent browser freeze

### 9.9 Number Persistence
- Selected numbers persist between rounds — no re-selection needed
- Selected numbers persist when switching between Manual and Auto tabs
- Changing difficulty does NOT clear selected numbers
- Only "Clear Table" or manually deselecting clears picks
- When navigating away and returning: selections are lost (client-side only, no persistence)

---

## 10. Conversion Integration Points

### 10.1 Casino Recommendation Sidebar (Desktop)
- Position: right column, below session stats
- Content: 2-3 casino cards showing keno-specific offers
- Filter: show casinos from CASINOS constant that have "keno" in their games array (add "keno" to relevant casinos)
- Each card: casino name (colored), offer, "Claim Deal →" link to /deals

### 10.2 "Spin the Deal Wheel" CTA
- Position: below casino cards in sidebar
- Trigger: always visible, becomes PROMINENT (pulsing border, larger) after 10+ bets
- Style: `#00E5A0` border, `#111827` bg, with wheel icon
- Text: "Spin the Deal Wheel" + "Win exclusive Keno bonuses"

### 10.3 "What You Would Have Won" Display
- Trigger: after 5+ bets
- Position: sidebar on desktop, inline card on mobile
- Shows real money equivalent of paper money results
- Includes casino recommendation and CTA to /deals
- Updates in real-time after each bet

### 10.4 Post-Session Nudge
- Trigger: when user hasn't placed a bet for 60 seconds after 10+ bets
- Subtle slide-in from bottom: "Ready to play for real? Spin the Deal Wheel to unlock exclusive bonuses at top Keno casinos."
- Dismissable, only shown once per session

### 10.5 Hot Streak Nudge (Keno-Specific)
- Trigger: when player hits 7+ matches in a single draw
- After the win celebration, show: "Amazing hit! Imagine winning $X,XXX.XX for real. See our partner casinos →"
- Non-intrusive: small text below the result, fades after 5 seconds
- Only shown once every 10 bets

### 10.6 Integration Rules
- CTAs should NEVER interrupt gameplay (no modals during a draw)
- Casino links must open in new tab: `target="_blank" rel="noopener noreferrer"`
- Responsible gambling disclaimer must be visible on the page at all times
- All conversion elements should feel like helpful suggestions, not pushy sales

---

## 11. Technical Implementation Notes

### 11.1 Recommended Tech Stack
- **Board rendering:** CSS Grid (NOT Canvas — tiles are interactive DOM elements)
- **Tile animations:** CSS `transform: rotateY()` with `perspective` for 3D flip, Framer Motion for spring/scale effects
- **State management:** React `useReducer` for game state
- **Random number generation:** `crypto.getRandomValues()` via Fisher-Yates partial shuffle

### 11.2 Game State Machine

```
IDLE → DRAWING → RESULT → IDLE
```

**States:**
| State | Description | Available Actions |
|-------|-------------|-------------------|
| `idle` | Board interactive, ready for bet | Select/deselect numbers, change difficulty, change bet, bet |
| `drawing` | Tile reveal animation in progress | None (all controls disabled) |
| `result` | Draw complete, result displayed | None (auto-transitions to idle after delay) |
| `auto_running` | Auto-play in progress | Stop |

**State transitions:**
- `idle` → `drawing`: player clicks Bet (requires ≥1 number selected)
- `drawing` → `result`: all 10 tiles revealed
- `result` → `idle`: after 1.5s delay (or immediately if Instant Bet)
- `idle` → `auto_running`: player clicks Start Auto
- `auto_running` → `idle`: rounds complete, stop condition, or player clicks Stop

### 11.3 Performance Targets
- Tile selection response: < 16ms (one frame)
- Draw reveal animation: 60fps on mid-range mobile
- Initial render: < 100ms after component mount
- Grid re-render on difficulty change: < 50ms
- Auto-play with Instant Bet: handle 500+ rounds without memory leaks
- History array: cap at 500 entries, FIFO

### 11.4 Fisher-Yates Draw Algorithm

```typescript
function drawNumbers(count: number = 10, poolSize: number = 40): number[] {
  const pool = Array.from({ length: poolSize }, (_, i) => i + 1);
  const drawn: number[] = [];

  for (let i = 0; i < count; i++) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const index = array[0] % (poolSize - i);
    drawn.push(pool[index]);
    // Swap drawn number to end of active pool
    pool[index] = pool[poolSize - 1 - i];
  }

  return drawn;
}
```

### 11.5 File Structure

```
components/games/keno/
├── KenoGame.tsx              # Main component, orchestrates 3-column layout
├── KenoBoard.tsx             # The 8×5 grid of number tiles
├── KenoTile.tsx              # Individual tile component (6 visual states)
├── KenoMultiplierRow.tsx     # Payout badge row below the board
├── KenoControls.tsx          # Controls panel (bet, difficulty, pick/clear, auto)
├── KenoSidebar.tsx           # Casino cards + session stats + bet history
├── KenoResultOverlay.tsx     # Multiplier + profit display overlay
├── useKenoGame.ts            # Game state hook (useReducer state machine)
├── kenoEngine.ts             # Core game logic (draw, match, payout lookup)
├── kenoMultipliers.ts        # All 4 difficulty × 10 pick payout tables
├── kenoTypes.ts              # TypeScript types for Keno game
└── kenoAnimations.ts         # Animation constants, timing, CSS class utilities
```

### 11.6 Key TypeScript Types

```typescript
// kenoTypes.ts

export type KenoDifficulty = "classic" | "low" | "medium" | "high";
export type KenoGameState = "idle" | "drawing" | "result" | "auto_running";
export type TileState = "default" | "hover" | "selected" | "selected_hover" | "hit" | "miss";

export interface KenoConfig {
  betAmount: number;
  difficulty: KenoDifficulty;
  instantBet: boolean;
}

export interface KenoDrawResult {
  drawnNumbers: number[];       // the 10 drawn numbers (in draw order)
  selectedNumbers: number[];    // player's picks
  matches: number[];            // intersection — which numbers hit
  matchCount: number;           // how many matches
  multiplier: number;           // looked up from payout table
  payout: number;               // betAmount × multiplier
  profit: number;               // payout - betAmount
}

export interface KenoBetResult {
  id: string;
  amount: number;
  picks: number;                // how many numbers the player selected
  matchCount: number;           // how many matches
  multiplier: number;
  profit: number;
  difficulty: KenoDifficulty;
  selectedNumbers: number[];
  drawnNumbers: number[];
  matches: number[];
  timestamp: number;
}

export interface KenoAutoPlayConfig {
  numberOfRounds: number;       // 10, 25, 50, 100, Infinity
  onWin: "reset" | { increaseBy: number };
  onLoss: "reset" | { increaseBy: number };
  stopOnProfit: number | null;
  stopOnLoss: number | null;
}

export interface KenoGameFullState {
  gameState: KenoGameState;
  config: KenoConfig;
  selectedNumbers: number[];     // player's current picks (1-10 numbers)
  currentDraw: KenoDrawResult | null;
  revealIndex: number;           // which drawn number is being revealed (0-9)
  balance: number;
  history: KenoBetResult[];
  sessionStats: SessionStats;
  autoPlay: KenoAutoPlayConfig | null;
  autoPlayProgress: {
    currentRound: number;
    totalRounds: number;
    wins: number;
    losses: number;
    totalProfit: number;
  } | null;
}
```

### 11.7 Core Engine Logic

```typescript
// kenoEngine.ts

import { KENO_MULTIPLIERS } from "./kenoMultipliers";
import type { KenoDifficulty, KenoDrawResult } from "./kenoTypes";

const POOL_SIZE = 40;
const DRAW_COUNT = 10;
const MAX_PICKS = 10;

export function drawNumbers(): number[] {
  const pool = Array.from({ length: POOL_SIZE }, (_, i) => i + 1);
  const drawn: number[] = [];

  for (let i = 0; i < DRAW_COUNT; i++) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const remainingSize = POOL_SIZE - i;
    const index = array[0] % remainingSize;
    drawn.push(pool[index]);
    pool[index] = pool[remainingSize - 1];
  }

  return drawn;
}

export function getMatches(selected: number[], drawn: number[]): number[] {
  const drawnSet = new Set(drawn);
  return selected.filter((n) => drawnSet.has(n));
}

export function getMultiplier(
  difficulty: KenoDifficulty,
  picks: number,
  matchCount: number
): number {
  return KENO_MULTIPLIERS[difficulty][picks]?.[matchCount] ?? 0;
}

export function resolveRound(
  selected: number[],
  difficulty: KenoDifficulty,
  betAmount: number
): KenoDrawResult {
  const drawnNumbers = drawNumbers();
  const matches = getMatches(selected, drawnNumbers);
  const matchCount = matches.length;
  const multiplier = getMultiplier(difficulty, selected.length, matchCount);
  const payout = betAmount * multiplier;
  const profit = payout - betAmount;

  return {
    drawnNumbers,
    selectedNumbers: selected,
    matches,
    matchCount,
    multiplier,
    payout,
    profit,
  };
}
```

### 11.8 Multiplier Data Structure

```typescript
// kenoMultipliers.ts

import type { KenoDifficulty } from "./kenoTypes";

// Structure: KENO_MULTIPLIERS[difficulty][picks][matchCount] = multiplier
// picks: 1-10, matchCount: 0 to picks

export const KENO_MULTIPLIERS: Record<KenoDifficulty, Record<number, number[]>> = {
  classic: {
    1:  [0.00, 3.96],
    2:  [0.00, 1.90, 4.50],
    3:  [0.00, 1.00, 3.10, 10.40],
    4:  [0.00, 0.80, 1.80, 5.00, 22.50],
    5:  [0.00, 0.25, 1.40, 4.10, 16.50, 36.00],
    6:  [0.00, 0.00, 1.00, 3.68, 7.00, 16.50, 40.00],
    7:  [0.00, 0.00, 0.47, 3.00, 4.50, 14.00, 31.00, 60.00],
    8:  [0.00, 0.00, 0.00, 2.20, 4.00, 13.00, 22.00, 55.00, 70.00],
    9:  [0.00, 0.00, 0.00, 1.55, 3.00, 8.00, 15.00, 44.00, 60.00, 85.00],
    10: [0.00, 0.00, 0.00, 1.40, 2.25, 4.50, 8.00, 17.00, 50.00, 80.00, 100.00],
  },
  low: {
    1:  [0.70, 1.85],
    2:  [0.00, 2.00, 3.80],
    3:  [0.00, 1.10, 1.38, 26.00],
    4:  [0.00, 0.00, 2.20, 7.90, 90.00],
    5:  [0.00, 0.00, 1.50, 4.20, 13.00, 300.00],
    6:  [0.00, 0.00, 1.10, 2.00, 6.20, 100.00, 700.00],
    7:  [0.00, 0.00, 1.10, 1.60, 3.50, 15.00, 225.00, 700.00],
    8:  [0.00, 0.00, 1.10, 1.50, 2.00, 5.50, 39.00, 100.00, 800.00],
    9:  [0.00, 0.00, 1.10, 1.30, 1.70, 2.50, 7.50, 50.00, 250.00, 1000.00],
    10: [0.00, 0.00, 1.10, 1.20, 1.30, 1.80, 3.50, 13.00, 50.00, 250.00, 1000.00],
  },
  medium: {
    1:  [0.40, 2.75],
    2:  [0.00, 1.80, 5.10],
    3:  [0.00, 0.00, 2.80, 50.00],
    4:  [0.00, 0.00, 1.70, 10.00, 100.00],
    5:  [0.00, 0.00, 1.40, 4.00, 14.00, 390.00],
    6:  [0.00, 0.00, 0.00, 3.00, 9.00, 180.00, 710.00],
    7:  [0.00, 0.00, 0.00, 2.00, 7.00, 30.00, 400.00, 800.00],
    8:  [0.00, 0.00, 0.00, 2.00, 4.00, 11.00, 67.00, 400.00, 900.00],
    9:  [0.00, 0.00, 0.00, 2.00, 2.50, 5.00, 15.00, 100.00, 500.00, 1000.00],
    10: [0.00, 0.00, 0.00, 1.60, 2.00, 4.00, 7.00, 26.00, 100.00, 500.00, 1000.00],
  },
  high: {
    1:  [0.00, 3.96],
    2:  [0.00, 0.00, 17.10],
    3:  [0.00, 0.00, 0.00, 81.50],
    4:  [0.00, 0.00, 0.00, 10.00, 259.00],
    5:  [0.00, 0.00, 0.00, 4.50, 48.00, 450.00],
    6:  [0.00, 0.00, 0.00, 0.00, 11.00, 350.00, 710.00],
    7:  [0.00, 0.00, 0.00, 0.00, 7.00, 90.00, 400.00, 800.00],
    8:  [0.00, 0.00, 0.00, 0.00, 5.00, 20.00, 270.00, 600.00, 900.00],
    9:  [0.00, 0.00, 0.00, 0.00, 4.00, 11.00, 56.00, 500.00, 800.00, 1000.00],
    10: [0.00, 0.00, 0.00, 0.00, 3.50, 8.00, 13.00, 63.00, 500.00, 800.00, 1000.00],
  },
};
```

---

## 12. Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Place bet (when not in an input field) |
| `A` | Halve bet amount |
| `S` | Double bet amount |
| `D` | Set bet to minimum ($0.10) |
| `Q` | Random Pick (select 10 random numbers) |
| `W` | Clear Table (deselect all) |
| `1`–`9`, `0` | Quick-select difficulty (1=Classic, 2=Low, 3=Medium, 4=High) |

Shortcuts are disabled when focus is inside an input field. Show keyboard hints on hover (tooltip) for power users.

---

## 13. Accessibility

- Number tiles: `role="checkbox"` with `aria-checked` for selected state
- Board: `role="grid"` with proper row/column semantics
- Tile reveal results: `aria-live="polite"` region announces "Number X — hit!" or "Number X — miss"
- Draw completion: announce "Draw complete. X out of Y matches. You won Z times your bet."
- Difficulty selector: `role="radiogroup"` with `aria-checked`
- All controls: keyboard accessible (Tab to navigate, Enter/Space to activate)
- Reduced motion: respect `prefers-reduced-motion` — skip tile flip animations, show results with opacity fade
- Color contrast: all text meets WCAG AA (4.5:1 minimum)
- Focus management: after draw completes, focus returns to Bet button

---

## 14. Responsible Gambling

The following must be present on the Keno page at all times:

**Footer disclaimer (always visible):**
> "18+ | Gambling involves risk. Only bet what you can afford to lose. PaperBet.io is a free simulator for educational purposes. We are not a gambling site."

**Session limit indicator:**
- After 100 bets in a session, show a gentle reminder: "You've played 100 rounds. Remember, this is practice mode."
- Non-intrusive: small banner below the controls panel, dismissable

**Auto-play session warning:**
- If auto-play has run for 200+ rounds continuously, show: "You've been auto-playing for a while. Take a break?"
- Does NOT stop auto-play — just informational, dismissable

---

## 15. Game Info Panel

**Position:** Collapsible panel at the bottom of the page (or in a modal triggered by "?" icon)

**"How to Play" section:**
1. Select 1 to 10 numbers from the board (or use Random Pick)
2. Choose your difficulty level — higher difficulty = bigger multipliers but harder to hit
3. Set your bet amount and click Bet
4. The casino draws 10 random numbers — matching numbers light up green
5. Your payout is based on how many of your picks match the drawn numbers
6. More matches = higher multiplier. Hit all 10 on High difficulty for 1,000x!

**"Game Info" section:**
| Property | Value |
|----------|-------|
| Game Type | Number Lottery (Keno) |
| RTP | 99.00% |
| House Edge | 1.00% |
| Board Size | 40 numbers (8×5) |
| Numbers Drawn | 10 per round |
| Max Picks | 10 |
| Max Multiplier | 1,000x |
| Difficulties | Classic, Low, Medium, High |
| Provider | PaperBet Originals |

**"Payout Tables" section:** Collapsible tables for all 4 difficulties (from §3.4), showing full multiplier grids
