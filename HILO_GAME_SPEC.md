# HiLo — Complete Game Specification for PaperBet.io

---

## 1. Game Overview

HiLo (High-Low) is a card prediction game where a player is shown a playing card and must guess whether the next card will be **Higher or Same** or **Lower or Same**. Each correct prediction multiplies the cumulative payout. The player can cash out at any point after a correct prediction, or continue guessing for a higher multiplier. One wrong guess and the entire bet is lost.

**Why it's popular in crypto casinos:** HiLo combines skill perception with pure probability. Players feel like they're making strategic decisions — betting "Higher" on a 3 feels safer than on a Queen — even though every outcome is independent. The variable multiplier per round (based on card position) creates a dynamic risk/reward curve that changes with every card, unlike fixed-odds games.

**Psychological hooks:** The visible probability percentages create an illusion of informed decision-making ("I *know* this is 76% likely"). The cumulative multiplier climbing with each correct guess triggers a "just one more" compulsion stronger than fixed-multiplier games because the next multiplier is unknown — it could be 1.07x (safe) or 12.87x (massive). The skip card mechanic adds a false sense of control ("I can dodge the bad cards"). King and Ace edge cases create memorable moments — guessing "Same" on a King for 12.87x feels like a calculated gamble, not blind luck.

---

## 2. Exact Game Mechanics

### 2.1 Step-by-Step Game Flow — Manual Mode

1. Player sets **bet amount** (default: $1.00 paper money)
2. Player clicks **"Bet"** → a random **Start Card** is dealt face-up
3. Player sees the current card and must choose:
   - **"Higher or Same"** — predicts next card's rank is ≥ current card
   - **"Lower or Same"** — predicts next card's rank is ≤ current card
   - **"Skip Card"** — skips the current card without affecting the bet (max 52 skips per round)
4. A new card is drawn and revealed:
   - **Correct prediction** → cumulative multiplier increases, player sees: **"Cash Out ($X.XX)"** button and can choose again (Higher/Lower/Skip)
   - **Wrong prediction** → entire bet is lost, game resets to idle
5. After each correct prediction, the player can:
   - **Cash Out** → winnings (bet × cumulative multiplier) are added to balance
   - **Continue predicting** → repeat step 3 with the new card as the current card
6. There is **no maximum number of rounds** — the player can keep predicting indefinitely
7. Session stats update after each resolved bet (cash-out or loss)
8. After 5+ bets, "What You Would Have Won" display appears

### 2.2 Step-by-Step Game Flow — Auto Mode

1. Player sets **bet amount**
2. Player sets **prediction strategy**: Always Higher / Always Lower / Smart (follows probability — picks the option with > 50%)
3. Player sets **auto cash-out at multiplier**: e.g., cash out when cumulative multiplier ≥ 5.00x
4. Player sets **number of rounds** (10 / 25 / 50 / 100 / ∞)
5. Player configures optional stop conditions (on profit, on loss)
6. Player clicks **"Start Auto"** → rounds execute automatically
7. Each round: bet placed → start card dealt → auto-predictions made until cash-out target reached or loss
8. Auto-play stops when: rounds completed, stop condition hit, or player clicks **"Stop"**

### 2.3 Outcome Determination

**NOT a physics simulation.** The outcome is determined BEFORE the animation begins:

1. Generate a random float [0, 1) using `crypto.getRandomValues()`
2. Map to card index: `cardIndex = Math.floor(float * 52)`
3. Map index to card: rank (A–K) and suit (♦♥♠♣)
4. Compare new card's rank to current card's rank → determine if prediction was correct
5. Animate the card reveal to show the predetermined result

### 2.4 Card System

**Deck:** Unlimited (infinite deck) — each draw is independent with equal probability for all 52 cards. No deck depletion.

**Rank Order (low → high):** A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K

**Card Index Mapping (0–51):**
```
 0–3:  ♦2, ♥2, ♠2, ♣2
 4–7:  ♦3, ♥3, ♣3, ♠3
 8–11: ♦4, ♥4, ♠4, ♣4
12–15: ♦5, ♥5, ♠5, ♣5
16–19: ♦6, ♥6, ♠6, ♣6
20–23: ♦7, ♥7, ♠7, ♣7
24–27: ♦8, ♥8, ♠8, ♣8
28–31: ♦9, ♥9, ♠9, ♣9
32–35: ♦10, ♥10, ♠10, ♣10
36–39: ♦J, ♥J, ♣J, ♠J
40–43: ♦Q, ♥Q, ♠Q, ♣Q
44–47: ♦K, ♥K, ♣K, ♠K
48–51: ♦A, ♥A, ♠A, ♣A
```

**Suits (4):** ♦ Diamonds (red), ♥ Hearts (red), ♠ Spades (black), ♣ Clubs (black)

### 2.5 Special Rules

- **When current card is King (K):** Only **"Lower or Same"** is available (no "Higher or Same" — King is the highest rank)
- **When current card is Ace (A):** Only **"Higher or Same"** is available (no "Lower or Same" — Ace is the lowest rank)
- The current card's rank counts as a match for **both** "Higher or Same" and "Lower or Same" (the "or Same" part)
- **Skip Card:** Does not affect the bet or multiplier. The skipped card becomes the new current card. Maximum 52 skips per round (practically unlimited, but capped to prevent abuse)

### 2.6 Configurable Parameters

| Parameter | Range | Default | Step |
|-----------|-------|---------|------|
| Bet Amount | $0.10 – $1,000.00 | $1.00 | $0.10 |
| Auto Cash-Out Multiplier | 1.01x – 1,000.00x | 2.00x | 0.01x |
| Auto Strategy | Higher / Lower / Smart | Smart | — |
| Auto-play Rounds | 10 / 25 / 50 / 100 / ∞ | Off | — |

---

## 3. Mathematical Model

### 3.1 House Edge & RTP

- **House edge:** **1.00%** (applied as a 0.99 multiplier on every payout)
- **RTP (Return to Player):** **99.00%**

### 3.2 Probability & Multiplier Formulas

The probability of each prediction is based on 13 unique card ranks:

```
higher_count = number of ranks ≥ current rank (current rank included)
lower_count  = number of ranks ≤ current rank (current rank included)

probability_higher = higher_count / 13
probability_lower  = lower_count / 13

multiplier_higher = (1 / probability_higher) × 0.99
multiplier_lower  = (1 / probability_lower) × 0.99
```

**Note:** Because "Same" counts for both options, `higher_count + lower_count = 14` (not 13), so the probabilities sum to > 100%. This is by design — the overlap is the "Same" outcome that pays for both.

### 3.3 Complete Multiplier Table

| Current Card | Higher or Same | | Lower or Same | |
|---|---|---|---|---|
| | Probability | Multiplier | Probability | Multiplier |
| **A** (lowest) | 13/13 = 100.00% | **0.99×** | 1/13 = 7.69% | **12.87×** |
| **2** | 12/13 = 92.31% | **1.07×** | 2/13 = 15.38% | **6.44×** |
| **3** | 11/13 = 84.62% | **1.17×** | 3/13 = 23.08% | **4.29×** |
| **4** | 10/13 = 76.92% | **1.29×** | 4/13 = 30.77% | **3.22×** |
| **5** | 9/13 = 69.23% | **1.43×** | 5/13 = 38.46% | **2.57×** |
| **6** | 8/13 = 61.54% | **1.61×** | 6/13 = 46.15% | **2.15×** |
| **7** | 7/13 = 53.85% | **1.84×** | 7/13 = 53.85% | **1.84×** |
| **8** | 6/13 = 46.15% | **2.15×** | 8/13 = 61.54% | **1.61×** |
| **9** | 5/13 = 38.46% | **2.57×** | 9/13 = 69.23% | **1.43×** |
| **10** | 4/13 = 30.77% | **3.22×** | 10/13 = 76.92% | **1.29×** |
| **J** | 3/13 = 23.08% | **4.29×** | 11/13 = 84.62% | **1.17×** |
| **Q** | 2/13 = 15.38% | **6.44×** | 12/13 = 92.31% | **1.07×** |
| **K** (highest) | 1/13 = 7.69% | **12.87×** | 13/13 = 100.00% | **0.99×** |

### 3.4 Cumulative Multiplier

The total payout multiplier is the **product** of all individual round multipliers:

```
total_multiplier = round1_multiplier × round2_multiplier × round3_multiplier × ...
payout = bet_amount × total_multiplier
```

**Example chain:**
1. Start card: 5 → Higher → 8 appears (correct) → round multiplier: 1.43× → cumulative: 1.43×
2. Current: 8 → Lower → 3 appears (correct) → round multiplier: 1.61× → cumulative: 1.43 × 1.61 = 2.30×
3. Current: 3 → Higher → K appears (correct) → round multiplier: 1.17× → cumulative: 2.30 × 1.17 = 2.69×
4. Cash out: bet × 2.69×

### 3.5 Expected Value Per Round

Every individual prediction has the same EV regardless of the card:
```
EV = probability × multiplier = probability × (1/probability) × 0.99 = 0.99
```

The house edge is exactly 1% per prediction, compounding over multiple rounds.

### 3.6 Win Tier Classification

| Tier | Cumulative Multiplier | Description |
|------|----------------------|-------------|
| Break Even | < 1.50x | Minimal streak |
| Small Win | 1.50x – 3.00x | Short careful streak |
| Good Win | 3.00x – 10.00x | Solid multi-round streak |
| Big Win | 10.00x – 50.00x | Extended streak with risky calls |
| Epic Win | 50.00x – 500.00x | Exceptional streak |
| Jackpot | 500.00x+ | Legendary streak |

---

## 4. Visual Design Specification

### 4.1 Game-Specific Accent Color

HiLo uses **indigo (#6366F1)** as its game-specific accent color. This distinguishes it from all other PaperBet games while evoking a sophisticated, card-table feel:

| Purpose | Color |
|---------|-------|
| Game accent | `#6366F1` (indigo) |
| Game accent hover | `#818CF8` (lighter indigo) |
| Game accent glow | `rgba(99, 102, 241, 0.15)` |
| Higher action | `#00E5A0` (accent green) |
| Lower action | `#EF4444` (accent red) |
| Skip action | `#9CA3AF` (muted gray) |
| Card red suits (♦♥) | `#EF4444` |
| Card black suits (♠♣) | `#F9FAFB` (near-white on dark bg) |

### 4.2 Overall Layout

**Desktop (≥1024px) — 3-Column Layout:**
```
┌───────────────────────────────────────────────────────────────┐
│ [HEADER — sticky, always visible]                             │
├────────────┬─────────────────────────┬────────────────────────┤
│            │                         │                        │
│  CONTROLS  │      CARD ARENA         │   CASINO SIDEBAR       │
│  PANEL     │   (Cards + Buttons)     │   (Deals + Stats)      │
│            │                         │                        │
│  Width:    │    Width: flex-1        │   Width: 320px         │
│  300px     │    Min: 480px           │   Scrollable           │
│            │                         │                        │
│  - Bet Amt │    Reference Cards      │   - Casino Cards       │
│  - Bet btn │    (K ← Current → A)   │   - Session Stats      │
│  - Higher  │                         │   - Bet History        │
│  - Lower   │    Higher/Lower Btns    │   - "What You Would    │
│  - Skip    │    Profit Preview       │      Have Won"         │
│  - Auto    │                         │                        │
│  - Profit  │    Card History         │                        │
│            │    Timeline             │                        │
│            │                         │                        │
├────────────┴─────────────────────────┴────────────────────────┤
│ [RESPONSIBLE GAMBLING DISCLAIMER]                             │
└───────────────────────────────────────────────────────────────┘
```

**Mobile (<768px) — Single Column, Stacked:**
```
┌─────────────────────────┐
│ CARD ARENA              │
│ Current card + actions  │
│ Card history timeline   │
│ Full width, 55vh max    │
├─────────────────────────┤
│ CONTROLS (compact)      │
│ Bet + Higher/Lower/Skip │
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
│ CARD ARENA (centered, max-w: 560px)      │
│ Card display + Higher/Lower + History    │
├───────────────────┬──────────────────────┤
│ CONTROLS          │ SESSION STATS        │
├───────────────────┴──────────────────────┤
│ CASINO CARDS + BET HISTORY               │
└──────────────────────────────────────────┘
```

### 4.3 The Card Arena (Center Panel)

**Container:**
- Background: `#0B0F1A` (seamless with page)
- Min-height: 480px (desktop), 360px (mobile)
- Content alignment: flex column, centered horizontally
- Subtle `#1F2937` border, rounded-xl
- Padding: 32px (desktop), 20px (mobile)

**Layout within arena (top to bottom):**
1. Cumulative multiplier display (top)
2. Card display area with reference cards (center — largest area)
3. Higher / Lower / Skip action buttons (below cards)
4. Profit preview row (below buttons)
5. Card history timeline (bottom)

### 4.4 Playing Card Design

**Card Dimensions:**
- Desktop: **120px × 168px** (5:7 aspect ratio)
- Tablet: **100px × 140px**
- Mobile: **88px × 123px**

**Card Face (face-up):**
- Background: `#F9FAFB` (near-white)
- Border-radius: 12px
- Border: 1px solid `#374151`
- Box-shadow: `0 4px 16px rgba(0, 0, 0, 0.3)`
- Padding: 8px

**Card Content Layout:**
```
┌──────────┐
│ A        │  ← rank (top-left), 18px, bold
│ ♠        │  ← suit (below rank), 14px
│          │
│    ♠     │  ← center suit symbol, 36px
│          │
│        ♠ │  ← suit (above rank), 14px, rotated 180°
│        A │  ← rank (bottom-right), 18px, bold, rotated 180°
└──────────┘
```

**Rank typography:**
- Font: JetBrains Mono, bold
- Size: 18px (desktop), 15px (mobile)
- Color: red `#EF4444` for ♦♥, near-white `#F9FAFB` inverted to `#1F2937` (dark) for ♠♣

**Center suit symbol:**
- Size: 36px (desktop), 28px (mobile)
- Color: same as rank color (red or dark)

**Face cards (J, Q, K) and Ace:**
- Same layout as number cards (no illustrated face card images — keeps it clean and implementable)
- J, Q, K distinguished by their letter rank in bold
- Ace: "A" displayed prominently

**Card Back (face-down / unrevealed):**
- Background: linear gradient from `#6366F1` (indigo) to `#4F46E5` (deeper indigo)
- Center: subtle geometric pattern (CSS repeating diagonal lines at 10% opacity)
- Or: PaperBet "P" logo watermark at 15% opacity, centered
- Border-radius: 12px
- Border: 1px solid `#6366F1`
- Box-shadow: same as face-up card

**Current Card (active):**
- Standard card face styling
- Additional: subtle glow `0 0 20px rgba(99, 102, 241, 0.25)` (indigo glow)
- Slight scale: `transform: scale(1.05)` compared to reference cards

### 4.5 Reference Cards (King & Ace Indicators)

**Position:** Flanking the current card on the left and right

**Layout (desktop):**
```
  ┌─────┐     ┌─────────┐     ┌─────┐
  │  K  │ ←── │ Current │ ──→ │  A  │
  │  ♠  │     │  Card   │     │  ♠  │
  └─────┘     └─────────┘     └─────┘
  "HIGHEST"                   "LOWEST"
```

**King Reference (left side):**
- Same card dimensions but at **65% opacity**
- Displays: K ♠ (always spades for consistency)
- Below card: "HIGHEST" label
  - Font: DM Sans, 10px, uppercase, letter-spacing 1px
  - Color: `#6B7280`
- Arrow indicator: upward arrow (Lucide `ChevronUp`) in `#00E5A0` between King ref and current card

**Ace Reference (right side):**
- Same card dimensions at **65% opacity**
- Displays: A ♠ (always spades)
- Below card: "LOWEST" label
  - Same styling as King label
- Arrow indicator: downward arrow (Lucide `ChevronDown`) in `#EF4444` between current card and Ace ref

**Mobile adaptation:**
- Reference cards hidden on mobile (< 768px) — replaced with a simple text indicator above the current card:
  - "K (highest) ← → A (lowest)" in `#6B7280`, 11px, DM Sans

### 4.6 Cumulative Multiplier Display

**Position:** Centered above the card display area

**Typography:**
- Font: JetBrains Mono
- Size: 48px (desktop), 32px (mobile)
- Weight: Bold (700)
- Format: "2.69×", "12.87×", "128.45×"

**Color by multiplier value:**

| Range | Color | Effect |
|-------|-------|--------|
| < 1.50x | `#9CA3AF` (muted) | None |
| 1.50x – 3.00x | `#00E5A0` (green) | None |
| 3.00x – 10.00x | `#00E5A0` (green) | Subtle pulse |
| 10.00x – 50.00x | `#F97316` (orange) | Pulse + glow |
| 50.00x – 500.00x | `#EF4444` (red) | Pulse + intense glow |
| 500.00x+ | `#F59E0B` (gold) | Pulse + gold glow + text-shadow |

**Before first prediction (after start card dealt):**
- Shows "1.00×" in `#6B7280` (indicates no multiplier yet)

**Update animation:**
- CountUp animation from old value to new value (300ms, ease-out)
- Scale pulse: 1.0 → 1.08 → 1.0 on each increase

### 4.7 Profit Preview Row

**Position:** Below the Higher/Lower/Skip buttons

**Layout:** Two side-by-side panels + total profit display

```
┌─────────────────────┬─────────────────────┐
│ ↑ Profit Higher     │ ↓ Profit Lower      │
│ 1.43× → +$0.43     │ 2.57× → +$1.57     │
└─────────────────────┴─────────────────────┘
         Total Profit: 2.30× → $2.30
```

**Higher Profit Panel:**
- Background: `#111827`
- Border-left: 3px solid `#00E5A0`
- Arrow: `ChevronUp` icon in `#00E5A0`, 14px
- Label: "Profit Higher" — DM Sans, 12px, `#9CA3AF`
- Values: multiplier "1.43×" and profit "+$0.43" — JetBrains Mono, 14px, `#00E5A0`
- Shows what the cumulative multiplier WOULD become if Higher wins
- Formula: `newCumulative = currentCumulative × higherMultiplier`

**Lower Profit Panel:**
- Same layout, mirrored
- Border-left: 3px solid `#EF4444`
- Arrow: `ChevronDown` icon in `#EF4444`, 14px
- Values in `#EF4444`

**Total Profit Display:**
- Centered below the two panels
- Label: "Total Profit" — DM Sans, 12px, `#6B7280`
- Current cumulative multiplier + dollar amount — JetBrains Mono, 16px, green or muted
- Only visible after first correct prediction

### 4.8 Card History Timeline

**Position:** Bottom of the Card Arena, full width

**Layout:** Horizontally scrollable row of mini card thumbnails

**Mini Card Dimensions:**
- Size: **48px × 67px** (same 5:7 ratio)
- Border-radius: 8px
- Gap between cards: 8px

**Mini Card Content:**
- Shows rank (14px, bold) and suit symbol (10px) — simplified single-corner layout
- Same red/dark suit coloring as full-size cards
- Background: `#F9FAFB` (same as full cards)

**Start Card Label:**
- The first card in the timeline has a small label above it:
  - "START" — DM Sans, 9px, uppercase, `#00E5A0`, letter-spacing 1px
  - Background pill: `#00E5A0` at 15% opacity, rounded-full, px-2, py-0.5

**Result Indicators on Mini Cards:**
- **Correct prediction → card played:** green bottom border (3px solid `#00E5A0`)
- **Wrong prediction → loss card:** red bottom border (3px solid `#EF4444`), red glow
- **Skipped card:** dashed bottom border (2px dashed `#6B7280`)
- **Start card:** indigo bottom border (3px solid `#6366F1`)

**Scrolling Behavior:**
- Auto-scrolls to keep the latest card visible (smooth scroll, 300ms)
- On desktop: show up to 10 cards before scrolling kicks in
- On mobile: show up to 5 cards before scrolling
- Manual horizontal scroll enabled (touch drag on mobile, mouse wheel on desktop)
- Fade gradient on left edge when scrolled (indicates more cards to the left)

**Connection Lines:**
- Between mini cards: thin horizontal line (1px solid `#374151`) connecting them
- Creates a visual "timeline" effect
- Arrow indicator on each line showing the prediction direction (tiny up/down chevron in green/red)

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
- Focus: ring-2 `#6366F1` at 50% opacity (game-accent focus ring)

**Quick-Select Buttons Row:**
- Horizontal row of 4 buttons: "½" | "2×" | "Min" | "Max"
- Each: small rounded pill, `#1F2937` bg, `#374151` border
- Font: DM Sans, 12px, `#9CA3AF`
- Hover: `#374151` bg, `#F9FAFB` text
- "½" halves current bet, "2×" doubles, "Min" sets $0.10, "Max" sets $1,000

### 5.3 Bet Button (Start Round)

**Normal State (idle — no active round):**
- Full-width button within controls panel
- Height: 48px (desktop), 44px (mobile)
- Background: `#6366F1` (indigo — game accent)
- Text: "Bet" — DM Sans, 16px, bold, `#F9FAFB`
- Border-radius: 10px
- Box-shadow: `0 0 20px rgba(99, 102, 241, 0.2)`

**Hover:**
- Background: `#818CF8` (lighter indigo)
- Box-shadow intensifies: `0 0 30px rgba(99, 102, 241, 0.3)`

**Active/Pressed:**
- Scale: 0.98
- Background: `#4F46E5` (deeper indigo)

**During Active Round (disabled):**
- Background: `#374151`
- Text: "Round Active" — `#6B7280`
- Cursor: not-allowed

### 5.4 Prediction Buttons (Higher / Lower / Skip)

**Position:** Below bet button, visible only during an active round

**"Higher or Same" Button:**
- Background: `#00E5A0` at 10% opacity
- Border: 2px solid `#00E5A0`
- Border-radius: 10px
- Height: 56px
- Content (flex, space-between):
  - Left: `ChevronUp` icon (20px, `#00E5A0`) + "Higher or Same" label (DM Sans, 14px bold, `#00E5A0`)
  - Right: probability badge "76.92%" (JetBrains Mono, 14px, `#00E5A0`, `#00E5A0` bg at 15%, rounded-full, px-3 py-1)
- Below button (outside): "1.29×" multiplier preview (JetBrains Mono, 12px, `#6B7280`)
- Hover: background `#00E5A0` at 20%, border brightens
- Active: background `#00E5A0` at 30%, scale 0.98
- **Disabled (current card = A):** hidden entirely, not just grayed

**"Lower or Same" Button:**
- Same layout, mirrored colors
- Background: `#EF4444` at 10% opacity
- Border: 2px solid `#EF4444`
- Content: `ChevronDown` icon + "Lower or Same" + probability badge — all in `#EF4444`
- Below: multiplier preview in `#6B7280`
- **Disabled (current card = K):** hidden entirely

**"Skip Card" Button:**
- Background: `#1F2937`
- Border: 1px solid `#374151`
- Border-radius: 10px
- Height: 40px (smaller than Higher/Lower)
- Content: `SkipForward` icon (Lucide, 16px) + "Skip Card" (DM Sans, 13px, `#9CA3AF`)
- Right side: skip counter "3/52" (JetBrains Mono, 11px, `#6B7280`)
- Hover: `#374151` bg, `#F9FAFB` text
- At 0 skips remaining: hidden

**Button Order (top to bottom):**
1. Higher or Same
2. Lower or Same
3. Skip Card (right-aligned, smaller)

**Edge Case Display:**
- When current card is **K**: only "Lower or Same" + "Skip" shown. Above the button area: small badge "King — only Lower or Same available" in `#F59E0B`
- When current card is **A**: only "Higher or Same" + "Skip" shown. Badge: "Ace — only Higher or Same available" in `#F59E0B`

### 5.5 Cash Out Button

**Position:** Replaces the Higher/Lower/Skip area in the controls panel when player has a winning streak

**Layout:** Full-width prominent button

**Styling:**
- Background: `#00E5A0`
- Text: "Cash Out" — DM Sans, 16px, bold, `#0B0F1A`
- Below text: "$X.XX" payout amount — JetBrains Mono, 20px, bold, `#0B0F1A`
- Below amount: "X.XX× multiplier" — JetBrains Mono, 12px, `#0B0F1A` at 70% opacity
- Border-radius: 10px
- Height: 64px
- Box-shadow: `0 0 24px rgba(0, 229, 160, 0.25)`
- Hover: brightness 110%, shadow intensifies
- Subtle pulse animation (box-shadow opacity 0.15 → 0.30, 2s loop) to draw attention

**Combined Layout (during active streak):**
The controls panel shows:
1. Cash Out button (top, prominent)
2. Divider line with "or continue..." text (DM Sans, 11px, `#6B7280`)
3. Higher or Same button
4. Lower or Same button
5. Skip Card button

### 5.6 Instant Bet Toggle

**Position:** Small toggle below the action buttons

**Layout:** Inline flex with label
- Label: "Instant Bet" — DM Sans, 12px, `#6B7280`
- Toggle: 36px × 20px track
- Off: `#374151` track, `#6B7280` thumb
- On: `#6366F1` track (indigo), white thumb
- When on: skip card reveal animation, result appears instantly

### 5.7 Total Profit Display (Controls Panel)

**Position:** Bottom of controls panel during active round

**Layout:** Card with `#111827` bg, `#374151` border, rounded-lg, p-3

**Content:**
- Label: "Total Profit" — DM Sans, 12px, `#6B7280`
- Multiplier: "2.69×" — JetBrains Mono, 24px, bold, colored by win tier
- Dollar amount: "$2.69" — JetBrains Mono, 16px, `#00E5A0`
- Bet amount reference: "on $1.00 bet" — DM Sans, 11px, `#6B7280`

### 5.8 Auto Mode Controls

When the "Auto" tab is active, the controls panel shows:

**Bet Amount:** Same as manual mode (§5.2)

**Strategy Selector:**
- Label: "Prediction Strategy" — DM Sans, 14px, `#9CA3AF`
- Segmented control: "Always Higher" | "Always Lower" | "Smart"
- Active: `#6366F1` bg at 15%, `#6366F1` text, `#6366F1` border
- Inactive: `#1F2937` bg, `#6B7280` text
- "Smart" tooltip: "Picks the option with > 50% probability. On 7 (50/50), picks Higher."

**Auto Cash-Out Multiplier:**
- Label: "Cash Out At" — DM Sans, 14px, `#9CA3AF`
- Input: JetBrains Mono, `#1F2937` bg, "×" suffix
- Default: "2.00×"
- When cumulative multiplier reaches this value, auto-cash-out

**Number of Rounds:**
- Label: "Number of Rounds" — DM Sans, 14px, `#9CA3AF`
- Segmented control: 10 | 25 | 50 | 100 | ∞
- Active: `#6366F1` bg at 15%, text `#6366F1`

**Advanced Settings (collapsible):**
- Header: "Advanced" with chevron, clickable to expand

**On Win:**
- Radio: "Reset to base bet" (default) | "Increase by ___%"

**On Loss:**
- Radio: "Reset to base bet" (default) | "Increase by ___%"

**Stop on Profit:**
- Toggle + amount input: "Stop if profit ≥ $___"

**Stop on Loss:**
- Toggle + amount input: "Stop if loss ≥ $___"

**Start/Stop Auto Button:**
- Start: same as Bet button styling but text: "Start Auto"
- Running: changes to "Stop Auto" with `#EF4444` bg, `#F9FAFB` text
- Counter below: "Round 12 / 50 — W: 7 | L: 5"

---

## 6. Animations & Transitions

### 6.1 Card Reveal Animation

**Duration:** 500ms (normal), 0ms (instant bet mode)

**Animation sequence:**
1. **Face-down card appears** (0ms): A face-down card (indigo back) slides in from the right of the current card
   - `translateX(100%) → translateX(0)`, 200ms, ease-out
   - Slight upward arc during slide: `translateY(-20px)` at midpoint
2. **Card flips** (200–450ms): The face-down card rotates on Y-axis to reveal its face
   - CSS 3D transform: `rotateY(0deg) → rotateY(180deg)`, 250ms
   - `perspective: 800px` on container
   - `backface-visibility: hidden` on both card faces
   - `transform-style: preserve-3d` on card container
3. **Result flash** (450–500ms):
   - **Win:** card border flashes `#00E5A0` (green), subtle green glow pulse
   - **Loss:** card border flashes `#EF4444` (red), subtle red glow pulse

**CSS Implementation:**
```css
.card-container {
  perspective: 800px;
  transform-style: preserve-3d;
}

.card-flip {
  animation: cardReveal 0.5s ease-out forwards;
}

@keyframes cardReveal {
  0% {
    transform: translateX(60px) translateY(-20px) rotateY(0deg);
    opacity: 0.7;
  }
  40% {
    transform: translateX(0) translateY(0) rotateY(0deg);
    opacity: 1;
  }
  100% {
    transform: translateX(0) translateY(0) rotateY(180deg);
  }
}

.card-face,
.card-back {
  backface-visibility: hidden;
  position: absolute;
  inset: 0;
}

.card-face {
  transform: rotateY(180deg);
}
```

### 6.2 Card Transition (New Card Becomes Current)

After the reveal animation completes:
1. The old current card slides left into the history timeline (300ms, ease-out)
   - Scale: 1.05 → 0.4 (shrinks to mini card size)
   - Translate: moves to the right end of the timeline
   - Opacity: stays at 1.0
2. The newly revealed card moves to center position (200ms, ease-out)
   - Scale: 1.0 → 1.05 (grows to current card size)
   - Indigo glow fades in
3. New reference cards (King/Ace) fade in if needed

### 6.3 Start Card Deal Animation

When the player clicks "Bet" and the start card is dealt:
1. Card appears face-down in the center, scale 0.8 → 1.05
2. Card flips to reveal face (same 3D flip as §6.1, 400ms)
3. Reference cards (K and A) fade in on sides (200ms, staggered 100ms after card flip)
4. Higher/Lower buttons slide up from below (Framer Motion spring, 200ms)
5. Profit preview fades in (200ms)

### 6.4 Skip Card Animation

1. Current card slides down and fades out (200ms)
   - `translateY(20px)`, `opacity: 0`
2. A new card slides in from above (200ms)
   - `translateY(-20px) → translateY(0)`, `opacity: 0 → 1`
3. Skipped card appears in history timeline with dashed border
4. Higher/Lower buttons update with new probabilities (cross-fade 150ms)
5. Profit preview values update with counting animation

### 6.5 Win Celebrations by Tier

| Tier | Cumulative Multi | Animation |
|------|-----------------|-----------|
| Break Even | < 1.50x | Card glows green briefly, multiplier updates |
| Small Win | 1.50x – 3.00x | Green border pulse on card, multiplier scales up, "+$X.XX" floats up |
| Good Win | 3.00x – 10.00x | Screen-edge green glow, card pulses larger (1.1x), multiplier shakes |
| Big Win | 10.00x – 50.00x | Screen-edge glow orange, particle burst from card, multiplier scales up with pulsing glow |
| Epic Win | 50.00x – 500.00x | Screen-edge glow red, intense particle burst, multiplier scales large with pulsing glow, history timeline lights up green |
| Jackpot | 500.00x+ | Gold particle explosion, screen shake (2px, 500ms), golden rain from top, multiplier in gold with text-shadow, entire arena briefly tinted gold |

### 6.6 Loss Animation

1. Card reveals the losing result
2. Card border flashes `#EF4444` (red), 200ms
3. Brief red overlay on the entire card area (100ms fade in, 300ms fade out)
4. Screen shake: 3px horizontal displacement, 300ms, ease-out (only if streak was > 3 rounds)
5. Cumulative multiplier text "shatters": dissolves with a brief particle effect, 400ms
6. Loss amount appears: "-$X.XX" in `#EF4444`, JetBrains Mono, 24px
   - Floats down slightly (translateY 0 → 10px) and fades out over 2 seconds
7. Card history timeline: the final (losing) card gets a red border, all previous cards dim to 50% opacity
8. Everything resets to idle state after 1.5 seconds

**Key principle:** Losses during a long streak should feel dramatic. Single-round losses (bet → wrong on first prediction) should feel quick and painless (encourages replaying).

### 6.7 Cash Out Animation

1. Cash Out button click:
2. Current card lifts slightly (translateY -8px) with green glow intensifying
3. Cumulative multiplier does a final triumphant scale (1.0 → 1.15 → 1.0)
4. "+$X.XX" text floats up from the card area in `#00E5A0`, large font (32px)
5. All cards in the history timeline do a celebratory ripple (each gets a brief green border pulse, 40ms stagger left to right)
6. Game resets to idle state

### 6.8 Probability Badges Update Animation

When the Higher/Lower probability badges update after a new card:
- Old percentage cross-fades to new percentage (150ms)
- If probability changed significantly (> 20% difference): brief scale pulse on the badge (1.0 → 1.1 → 1.0)
- Color intensifies momentarily on the button whose probability increased

### 6.9 Idle Animations

- Current card: subtle float (up/down 3px, 3s ease-in-out loop)
- Higher/Lower buttons: subtle breathing glow on borders (opacity 0.3 → 0.5, 2s loop)
- Bet button: box-shadow breathing (opacity 0.15 → 0.25, 2s loop)
- Reference cards: very subtle sway (rotate ±1°, 4s loop)

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
| Best Win | "128.45× ($128.45)" | JetBrains Mono, 20px, `#F59E0B` |

**Additional stats (expandable "More Stats" section):**
- Total Returns
- Biggest Loss
- Current Win Streak (consecutive profitable bets)
- Best Win Streak
- Longest Prediction Chain (most consecutive correct predictions in one round)
- Average Cash-Out Multiplier
- Win Rate %
- Total Predictions Made
- Skip Cards Used
- Favorite Prediction (Higher vs Lower %)

### 7.2 Bet History Table

**Layout:** Scrollable table (uses shared `BetHistory` component with adapted columns)

**Columns:**

| Column | Width | Alignment | Content |
|--------|-------|-----------|---------|
| # | 40px | Center | Row number (most recent first) |
| Bet | 80px | Right | "$1.00" — JetBrains Mono |
| Rounds | 55px | Center | "5" — number of correct predictions |
| Multi | 90px | Right | "12.87×" — colored by tier |
| Profit | 100px | Right | "+$11.87" green or "-$1.00" red |
| Start | 50px | Center | Start card mini display (rank + suit icon) |
| End | 50px | Center | Final card mini display |
| Result | 60px | Center | "Win"/"Loss" badge |

**Behavior:**
- Shows last 25 bets (scrollable for more)
- New bets insert at top with slide-down animation (200ms)
- Alternating row backgrounds: `#0B0F1A` and `#111827`
- Hover: row highlights to `#1F2937`
- Win rows: subtle left border accent in `#00E5A0`
- Loss rows: subtle left border accent in `#EF4444`

### 7.3 "What You Would Have Won" Display

**Trigger:** Appears after 5+ bets in a session

**Layout:** Prominent card, `#111827` bg, `#6366F1` border (indigo — game accent), rounded-xl, p-6

**Content:**
```
"If you played with real money..."

$47.00 wagered → $59.30 returned

Net Profit: +$12.30

Top casino for Card Games:
[Casino Card — e.g., Stake: 200% up to $2K]
[CTA: "Spin the Deal Wheel →"]
```

Uses shared `RealMoneyDisplay` component.

---

## 8. Sound Design Notes (Visual Equivalents)

Since our simulator has no audio, visual cues replace sound feedback:

| Audio Cue (Real Casino) | Visual Replacement |
|------------------------|-------------------|
| Card deal "swish" | Card slide-in animation + subtle motion blur |
| Card flip "snap" | 3D card rotation with crisp landing |
| Correct guess "ding" | Green border flash on card, multiplier pop-in |
| Wrong guess "buzz" | Red flash on card, brief screen-edge red tint |
| Cash out "cha-ching" | Green particle burst + profit text float-up |
| Multiplier climbing "tick" | CountUp number animation with scale pulse |
| Skip card "whoosh" | Card slide-down/fade + new card slide-in from top |
| Big win "fanfare" | Particle explosion + screen shake |
| Button click "pop" | Button scale 0.95 → 1.0 micro-animation |
| Auto-play tick | Small pulse on round counter |

**Haptic Feedback (mobile):** If Vibration API is available:
- Prediction button press: short vibration (40ms)
- Correct prediction: medium vibration (60ms)
- Cash out: pattern vibration (80ms-40ms-80ms)
- Wrong guess after long streak: long vibration (200ms)
- Big win (50x+): double pattern (100ms-50ms-100ms-50ms-100ms)

---

## 9. Edge Cases & Error States

### 9.1 Rapid Clicking
- Higher/Lower/Skip/CashOut buttons disabled during card reveal animation
- If Instant Bet is on: allow rapid succession (50ms debounce)
- Bet button disabled during active round

### 9.2 Mid-Round Page Navigation
- If player has an active round with cumulative multiplier > 1.00x:
- Show confirmation dialog: "You have an active round at X.XX× ($XX.XX). Cash out before leaving?"
- Options: "Cash Out & Leave" | "Stay"
- If browser is closed: round is lost (client-side only, no server state)
- Use `beforeunload` event to warn

### 9.3 Mid-Round Auto-Play Conflict
- If player is in a manual round, the Auto tab should be disabled
- If player is in auto-play, Manual tab should be disabled
- Clear visual indicator of which mode is active

### 9.4 King and Ace Edge Cases
- **King drawn:** "Higher or Same" button is hidden (not disabled — hidden entirely). Only "Lower or Same" and "Skip" visible. Small amber badge: "King — only Lower or Same"
- **Ace drawn:** "Lower or Same" button is hidden. Only "Higher or Same" and "Skip" visible. Badge: "Ace — only Higher or Same"
- **Auto-play on King/Ace:**
  - "Always Higher" strategy on King → auto-skips the card
  - "Always Lower" strategy on Ace → auto-skips the card
  - "Smart" strategy: follows the only available option (never skips on K/A)

### 9.5 "Same" Result
- When the new card has the SAME rank as the current card: this is a win for BOTH "Higher or Same" and "Lower or Same"
- Visual: show a "Same!" badge briefly (DM Sans, 14px, `#6366F1`, 800ms) alongside the win result
- The multiplier applied is whichever option the player chose

### 9.6 Browser Resize Mid-Animation
- Card animation completes at current dimensions
- Layout re-renders on resize (debounced 200ms)
- Card history timeline reflows

### 9.7 Touch vs Click
- All buttons: minimum 44px touch targets
- Higher/Lower buttons: 56px height, adequate spacing
- Cash Out button: 64px height, finger-friendly
- Card history: touch-draggable horizontal scroll
- Prevent accidental double-tap zoom on game buttons

### 9.8 Extreme Values
- Cumulative multiplier can theoretically grow very large (no cap)
- Display: use 2 decimal places up to 999.99x, then 0 decimals for 1,000x+
- Abbreviate extreme values: "1.2M×" for multipliers over 1,000,000x
- Payout display: "$1,234.56" with commas, abbreviate at "$1.00M+"
- History table: truncate multiplier column at 8 characters

### 9.9 Skip Card Limit
- Maximum 52 skips per round (shown as counter "X/52")
- At 0 remaining: Skip button hidden
- Skip counter resets when a new round starts

### 9.10 Very Long Streaks
- Card history timeline: cap at 100 cards visible, FIFO for display (full history kept in state for stats)
- Performance: ensure no memory leak — cap card array at 200 entries
- At 50+ correct predictions in a single round: show a special "Legendary Streak" badge above the multiplier

### 9.11 Connection/Performance
- Client-side only, no connection issues
- If CSS 3D transforms not supported: fall back to simple fade-in card reveal
- `prefers-reduced-motion`: skip card flip animation, show result with simple cross-fade (200ms)

---

## 10. Conversion Integration Points

### 10.1 Casino Recommendation Sidebar (Desktop)
- Position: right column, below session stats
- Content: 2-3 casino cards showing card-game-specific offers
- Filter: show casinos from CASINOS constant that have "hilo" in their games array
- Each card: casino name (colored), offer, "Claim Deal →" link to /deals

### 10.2 "Spin the Deal Wheel" CTA
- Position: below casino cards in sidebar
- Trigger: always visible, becomes PROMINENT (pulsing border, larger) after 10+ bets
- Style: `#6366F1` border (indigo — game accent), `#111827` bg, with wheel icon
- Text: "Spin the Deal Wheel" + "Win exclusive card game bonuses"

### 10.3 "What You Would Have Won" Display
- Trigger: after 5+ bets
- Position: sidebar on desktop, inline card on mobile
- Shows real money equivalent of paper money results
- Includes casino recommendation and CTA to /deals
- Updates in real-time after each bet

### 10.4 Post-Session Nudge
- Trigger: when user hasn't made a prediction for 60 seconds after 10+ bets
- Subtle slide-in from bottom: "Ready to play for real? Spin the Deal Wheel to unlock exclusive bonuses at top card game casinos."
- Dismissable, only shown once per session

### 10.5 Streak-Based Nudge (HiLo-Specific)
- Trigger: when player cashes out on a streak with 5+ correct predictions
- After cash-out celebration, show subtle message: "Nice streak! Imagine cashing out $X,XXX.XX for real. Check out our partner casinos →"
- Non-intrusive: small text below the result, fades after 5 seconds
- Only shown once every 10 bets (don't spam)

### 10.6 High-Multiplier Nudge (HiLo-Specific)
- Trigger: when cumulative multiplier exceeds 10.00x and player cashes out
- Show: "That 10.00× win would be $XX.XX on a real $X.XX bet. Top crypto casinos have even better odds on HiLo."
- Fades after 5 seconds

### 10.7 Integration Rules
- CTAs should NEVER interrupt gameplay (no modals during an active round)
- Casino links must open in new tab: `target="_blank" rel="noopener noreferrer"`
- Responsible gambling disclaimer must be visible on the page at all times
- All conversion elements should feel like helpful suggestions, not pushy sales

---

## 11. Technical Implementation Notes

### 11.1 Recommended Tech Stack
- **Card rendering:** CSS with styled divs (no canvas needed — standard card faces)
- **Card flip:** CSS 3D transforms (`transform-style: preserve-3d`, `perspective`, `rotateY`)
- **Animation:** Framer Motion for UI transitions (buttons, panels), CSS `@keyframes` for card flip
- **State management:** React `useReducer` for game state (round tracking requires multi-step state machine)
- **Random number generation:** `crypto.getRandomValues()` for fair randomness

### 11.2 Game State Machine

```
IDLE → DEALING → PREDICTING → REVEALING → (PREDICTING | CASHING_OUT | LOST)
IDLE → DEALING → PREDICTING → SKIPPING → PREDICTING
```

**States:**

| State | Description | Available Actions |
|-------|-------------|-------------------|
| `idle` | No active round, ready to bet | Change bet, click Bet |
| `dealing` | Start card being dealt (animation) | None |
| `predicting` | Card shown, awaiting player's prediction | Higher, Lower, Skip, Cash Out |
| `revealing` | New card being revealed (animation) | None |
| `skipping` | Skip animation in progress | None |
| `cashing_out` | Cash-out animation playing | None |
| `lost` | Loss animation playing | None |
| `auto_running` | Auto-play in progress | Stop |

**State Transitions:**
```
idle        → dealing       (player clicks Bet)
dealing     → predicting    (start card animation complete)
predicting  → revealing     (player clicks Higher or Lower)
predicting  → skipping      (player clicks Skip)
predicting  → cashing_out   (player clicks Cash Out)
revealing   → predicting    (correct prediction, animation complete)
revealing   → lost          (wrong prediction, animation complete)
skipping    → predicting    (skip animation complete, new card shown)
cashing_out → idle          (cash-out animation complete)
lost        → idle          (loss animation complete)
```

### 11.3 Performance Targets
- Card reveal animation: 60fps on mid-range mobile
- Initial render: < 100ms after component mount
- State transition: < 16ms (one frame)
- Auto-play mode: handle 1000+ rounds without memory leaks
- Card history array: cap at 200 entries, FIFO
- Bet history array: cap at 500 entries, FIFO

### 11.4 File Structure

```
components/games/hilo/
├── HiLoGame.tsx              # Main component, orchestrates 3-column layout
├── HiLoCardArena.tsx          # Center panel: cards + buttons + history
├── HiLoCard.tsx               # Single playing card component (3D flip)
├── HiLoCardBack.tsx           # Card back face (indigo design)
├── HiLoReferenceCards.tsx     # King/Ace reference indicators
├── HiLoActionButtons.tsx      # Higher/Lower/Skip/CashOut buttons
├── HiLoProfitPreview.tsx      # Profit preview row (Higher/Lower/Total)
├── HiLoCardTimeline.tsx       # Horizontal scrollable card history
├── HiLoControls.tsx           # Controls panel (bet, buttons, auto)
├── HiLoSidebar.tsx            # Casino cards + session stats + bet history
├── HiLoResultOverlay.tsx      # Multiplier + profit display overlay
├── useHiLoGame.ts             # Game state hook (useReducer state machine)
├── hiloEngine.ts              # Core game logic (multiplier calc, RNG, card mapping)
├── hiloTypes.ts               # TypeScript types for HiLo game
└── hiloAnimations.ts          # Animation constants and CSS class utilities
```

### 11.5 Key TypeScript Types

```typescript
// hiloTypes.ts

export type Suit = "diamonds" | "hearts" | "spades" | "clubs";
export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";
export type Prediction = "higher" | "lower";
export type SuitColor = "red" | "black";
export type HiLoGameState = "idle" | "dealing" | "predicting" | "revealing" | "skipping" | "cashing_out" | "lost" | "auto_running";
export type AutoStrategy = "always_higher" | "always_lower" | "smart";

export interface PlayingCard {
  rank: Rank;
  suit: Suit;
  index: number;        // 0-51 card index
  rankValue: number;    // 1 (A) through 13 (K)
  suitColor: SuitColor; // "red" for ♦♥, "black" for ♠♣
}

export interface HiLoConfig {
  betAmount: number;
  instantBet: boolean;
}

export interface RoundPrediction {
  card: PlayingCard;           // the card that was shown
  prediction: Prediction | "skip"; // what the player chose
  nextCard: PlayingCard;       // the card that was revealed
  correct: boolean | null;     // null for skips
  multiplier: number;          // individual round multiplier (0 for skips)
}

export interface HiLoRound {
  startCard: PlayingCard;
  predictions: RoundPrediction[];
  currentCard: PlayingCard;
  cumulativeMultiplier: number;
  skipsUsed: number;
}

export interface HiLoBetResult {
  id: string;
  amount: number;
  roundCount: number;          // number of correct predictions (not counting skips)
  cumulativeMultiplier: number;
  profit: number;
  startCard: PlayingCard;
  endCard: PlayingCard;
  cashedOut: boolean;          // true if player cashed out, false if lost
  timestamp: number;
}

export interface HiLoAutoPlayConfig {
  strategy: AutoStrategy;
  cashOutAt: number;           // cash out when cumulative multiplier ≥ this
  numberOfRounds: number;      // 10, 25, 50, 100, Infinity
  onWin: "reset" | { increaseBy: number };
  onLoss: "reset" | { increaseBy: number };
  stopOnProfit: number | null;
  stopOnLoss: number | null;
}

export interface HiLoPredictionInfo {
  higherProbability: number;   // e.g., 0.6154 (61.54%)
  lowerProbability: number;    // e.g., 0.4615 (46.15%)
  higherMultiplier: number;    // e.g., 1.61
  lowerMultiplier: number;     // e.g., 2.15
  higherAvailable: boolean;    // false only when current card is A (well, A has only higher, but we mean King blocks higher)
  lowerAvailable: boolean;     // false only when current card is K
}

export interface HiLoGameFullState {
  gameState: HiLoGameState;
  config: HiLoConfig;
  round: HiLoRound | null;     // null when idle
  balance: number;
  history: HiLoBetResult[];
  sessionStats: SessionStats;
  autoPlay: HiLoAutoPlayConfig | null;
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
// hiloEngine.ts

const HOUSE_EDGE = 0.01;
const RTP = 0.99;
const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const SUITS: Suit[] = ["diamonds", "hearts", "spades", "clubs"];

const RANK_VALUES: Record<Rank, number> = {
  "A": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7,
  "8": 8, "9": 9, "10": 10, "J": 11, "Q": 12, "K": 13
};

/**
 * Generate a random card using crypto.getRandomValues()
 */
export function drawCard(): PlayingCard {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const float = array[0] / (0xFFFFFFFF + 1); // [0, 1)
  const index = Math.floor(float * 52);

  const rankIndex = Math.floor(index / 4);
  const suitIndex = index % 4;
  const rank = RANKS[rankIndex];
  const suit = SUITS[suitIndex];

  return {
    rank,
    suit,
    index,
    rankValue: RANK_VALUES[rank],
    suitColor: (suit === "diamonds" || suit === "hearts") ? "red" : "black",
  };
}

/**
 * Calculate prediction info for a given card
 */
export function getPredictionInfo(card: PlayingCard): HiLoPredictionInfo {
  const rankValue = card.rankValue; // 1 (A) to 13 (K)

  // Higher or Same: ranks >= current rank
  const higherCount = 13 - rankValue + 1; // includes current
  // Lower or Same: ranks <= current rank
  const lowerCount = rankValue; // includes current

  const higherProbability = higherCount / 13;
  const lowerProbability = lowerCount / 13;

  const higherMultiplier = Math.round(((1 / higherProbability) * RTP) * 100) / 100;
  const lowerMultiplier = Math.round(((1 / lowerProbability) * RTP) * 100) / 100;

  return {
    higherProbability,
    lowerProbability,
    higherMultiplier,
    lowerMultiplier,
    higherAvailable: rankValue < 13, // not available on King
    lowerAvailable: rankValue > 1,   // not available on Ace
  };
}

/**
 * Resolve a prediction: is the new card higher/lower/same than current?
 */
export function resolvePrediction(
  currentCard: PlayingCard,
  newCard: PlayingCard,
  prediction: Prediction
): boolean {
  if (prediction === "higher") {
    return newCard.rankValue >= currentCard.rankValue;
  } else {
    return newCard.rankValue <= currentCard.rankValue;
  }
}

/**
 * Get the multiplier for a specific prediction on a given card
 */
export function getMultiplierForPrediction(
  card: PlayingCard,
  prediction: Prediction
): number {
  const info = getPredictionInfo(card);
  return prediction === "higher" ? info.higherMultiplier : info.lowerMultiplier;
}

/**
 * Auto-play: determine the prediction based on strategy
 */
export function autoPredict(card: PlayingCard, strategy: AutoStrategy): Prediction | "skip" {
  const info = getPredictionInfo(card);

  switch (strategy) {
    case "always_higher":
      return info.higherAvailable ? "higher" : "skip";
    case "always_lower":
      return info.lowerAvailable ? "lower" : "skip";
    case "smart":
      // Pick the option with higher probability
      // On 7 (50/50), default to higher
      if (!info.higherAvailable) return "lower";
      if (!info.lowerAvailable) return "higher";
      return info.higherProbability >= info.lowerProbability ? "higher" : "lower";
  }
}

/**
 * Format card for display: "K♠", "7♥", "10♦"
 */
export function formatCard(card: PlayingCard): string {
  const suitSymbols: Record<Suit, string> = {
    diamonds: "♦", hearts: "♥", spades: "♠", clubs: "♣"
  };
  return `${card.rank}${suitSymbols[card.suit]}`;
}

/**
 * Suit symbol mapping
 */
export const SUIT_SYMBOLS: Record<Suit, string> = {
  diamonds: "♦",
  hearts: "♥",
  spades: "♠",
  clubs: "♣",
};
```

### 11.7 Card Index Mapping Implementation

```typescript
// Card index (0-51) to PlayingCard conversion
// Index layout: [♦2,♥2,♠2,♣2, ♦3,♥3,♣3,♠3, ... ♦A,♥A,♠A,♣A]

// Note: The index mapping from the user's research has a non-standard suit order
// per rank group. For implementation simplicity, we use a consistent mapping:
// rankIndex = Math.floor(index / 4)  → 0=2, 1=3, ..., 11=K, 12=A
// suitIndex = index % 4              → 0=♦, 1=♥, 2=♠, 3=♣

// The RANKS array is ordered for game logic: A(1), 2, 3, ..., K(13)
// But the index maps 0-3=rank2, 4-7=rank3, ... 48-51=rankA
// This matches the provably fair system where A comes last in the index

const INDEX_RANK_ORDER: Rank[] = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];

export function cardFromIndex(index: number): PlayingCard {
  const rankIdx = Math.floor(index / 4);
  const suitIdx = index % 4;
  const rank = INDEX_RANK_ORDER[rankIdx];
  const suit = SUITS[suitIdx];

  return {
    rank,
    suit,
    index,
    rankValue: RANK_VALUES[rank],
    suitColor: (suit === "diamonds" || suit === "hearts") ? "red" : "black",
  };
}
```

---

## 12. Keyboard Shortcuts

| Action | Key | Context |
|--------|-----|---------|
| Place bet / Start round | Space | When idle |
| Higher or Same | Q | During active round |
| Lower or Same | W | During active round |
| Skip Card | E | During active round |
| Cash Out | C | During active round with streak |
| Halve bet amount | A | When idle |
| Double bet amount | S | When idle |
| Reset bet to minimum | D | When idle |

**Implementation:**
- Only active when the game component is focused or visible
- Disabled when modals are open
- Visual key hints shown on buttons: small "Q" badge in corner of Higher button, "W" on Lower, etc.
- Keyboard shortcuts section in Game Info panel

---

## 13. Accessibility

- All buttons: keyboard accessible (Tab navigation, Enter/Space to activate)
- Prediction buttons: `role="button"` with `aria-label` including probability ("Higher or Same, 76.92% chance, 1.29× multiplier")
- Card display: `aria-live="polite"` region announces new card: "New card: King of Spades"
- Prediction result: `aria-live="assertive"` announces: "Correct! Cumulative multiplier is now 2.69×" or "Incorrect. You lost $1.00"
- Cash Out button: `aria-label="Cash out for $2.69, current multiplier 2.69×"`
- Card history timeline: `role="list"` with each card as `role="listitem"`, `aria-label="7 of Hearts, correct prediction"`
- Skip card: announce "Skipped card. New card: 5 of Diamonds"
- Reduced motion: respect `prefers-reduced-motion` — skip card flip animation, show result with simple cross-fade
- Color contrast: all text meets WCAG AA (4.5:1 minimum). Suit colors on white card background pass contrast requirements.
- Focus management: after card reveal, focus moves to Cash Out button (if winning) or prediction buttons (if new round needed)
- Screen reader: cumulative multiplier announced on each change
- Higher/Lower button state: `aria-disabled="true"` when not available (K/A edge cases), with explanatory `aria-label`

---

## 14. Responsible Gambling

The following must be present on the HiLo page at all times:

**Footer disclaimer (always visible):**
> "18+ | Gambling involves risk. Only bet what you can afford to lose. PaperBet.io is a free simulator for educational purposes. We are not a gambling site."

**Session limit indicator:**
- After 100 bets in a session, show a gentle reminder: "You've played 100 rounds. Remember, this is practice mode."
- Non-intrusive: small banner below the controls panel, dismissable

**Probability reminder:**
- When player has won 5+ predictions in a row within a single round: show small non-intrusive text near the multiplier: "Each prediction is independent — past wins don't affect future odds."
- Does NOT interrupt gameplay

**EV transparency:**
- The Game Info panel clearly shows the 1% house edge
- Probability percentages on Higher/Lower buttons are always visible — players can see the exact odds before every decision

---

## 15. Game Info Panel

**Position:** Collapsible panel at the bottom of the page (or in a modal triggered by "?" icon)

**Content:**

**"How to Play" section:**
1. Set your bet amount and click "Bet" to receive a start card
2. Predict whether the next card will be **Higher or Same** or **Lower or Same** than the current card
3. If correct, your multiplier increases — cash out anytime or keep predicting!
4. Card ranks from lowest to highest: A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K
5. The "Same" outcome wins for both Higher and Lower predictions
6. Use "Skip Card" to get a new card without betting
7. One wrong prediction and your entire bet is lost — cash out wisely!

**"Game Info" section:**

| Property | Value |
|----------|-------|
| Game Type | Card Prediction (High-Low) |
| RTP | 99.00% |
| House Edge | 1.00% |
| Deck | Unlimited (infinite) — each card independent |
| Card Ranks | A (low) → K (high), 13 ranks |
| Max Multiplier | No limit (cumulative) |
| Max Skips | 52 per round |
| Provider | PaperBet Originals |

**"Multiplier Reference" section:** Collapsible table showing all 13 card multipliers (from §3.3)

**"Strategy Tips" section:**
- **Conservative:** Focus on high-probability predictions (≥ 70%). Build smaller multipliers consistently.
- **Aggressive:** Take low-probability bets (≤ 30%) for high multipliers. High risk, high reward.
- **Balanced:** Mix safe and risky predictions. Cash out at 3-5× to lock in profits.
- **Skip Strategy:** Skip unfavorable cards (like 7, which is 50/50 in both directions) to wait for better positions.
