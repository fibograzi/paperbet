# Mines — Complete Game Specification for PaperBet.io

## 1. Game Overview

Mines is a grid-based risk/reward game played on a 5×5 board containing hidden gems and mines. Players reveal tiles one at a time — each gem revealed increases the multiplier, but hitting a mine ends the game and loses the bet. Players can cash out at any time after revealing at least one gem to lock in their current multiplier.

**Why it's popular in crypto casinos:** Mines gives players full control over their risk per round. Unlike Plinko (passive) or Crash (time-pressure), Mines lets you pause, think, and decide after every tile. The escalating tension of "one more tile" is deeply compelling. Configurable mine count (1–24) creates extreme flexibility from near-guaranteed small wins to insane million-x jackpots.

**Psychological hooks:** The sunk-cost effect ("I've already revealed 8 gems, might as well go for 9"), visible rising multiplier creates greed, the "near mine" effect (revealing a tile adjacent to a mine is thrilling), and the post-game reveal (seeing where all the mines were) creates "what if I'd clicked there" regret that drives replays.

---

## 2. Exact Game Mechanics

### 2.1 Step-by-Step Game Flow

**Phase 1 — SETUP (IDLE state):**
1. Player sets **bet amount** (default: $1.00)
2. Player selects **number of mines** (1–24, default: 3)
3. Player sees: gems to find (25 − mines), risk label, first-gem multiplier preview
4. Player clicks **"Bet"** — this locks bet amount and mine count

**Phase 2 — ACTIVE GAME (PLAYING state):**
5. Board generates: 25 tiles laid face-down, `m` mines randomly placed (positions pre-determined)
6. Player clicks a tile to reveal it:
   - **Gem found:** tile flips with 3D animation → shows gem → multiplier increases → "Cash Out" button updates with new profit → player can continue or cash out
   - **Mine found:** tile flips → shows mine → explosion animation → GAME OVER → player loses entire bet
7. After each gem reveal, the multiplier bar shows:
   - Current multiplier and dollar profit
   - Next multiplier (what you'd get if you reveal one more gem)
   - Danger meter updates (probability of mine on next click)

**Phase 3 — RESOLUTION (GAME_OVER state):**
8. Game ends via one of three triggers:
   - **Mine hit:** player loses bet, mine explosion animation
   - **Cash out:** player wins `bet × currentMultiplier`, green celebration
   - **Full clear:** all safe tiles revealed, auto-cashout at maximum multiplier, gold celebration
9. ALL remaining tiles are revealed with staggered animation (mines shown, safe tiles shown faded)
10. Result is logged, stats update, "New Game" button appears

### 2.2 Mine Placement Algorithm

```typescript
function generateMinePositions(mineCount: number): Set<number> {
  // Create array of all 25 positions [0..24]
  const positions = Array.from({ length: 25 }, (_, i) => i);

  // Fisher-Yates shuffle
  for (let i = positions.length - 1; i > 0; i--) {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    const j = buffer[0] % (i + 1);
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  // First `mineCount` positions are mines
  return new Set(positions.slice(0, mineCount));
}
```

**Key rules:**
- Board: 5×5 grid = 25 tiles total (indexed 0-24, row-major: tile[row * 5 + col])
- Mines: randomly placed (1–24 mines)
- Safe tiles (gems): `25 − mineCount`
- Positions are determined BEFORE the first click (provably fair model)
- Player cannot influence mine positions after game starts
- Each position has equal probability of being a mine

### 2.3 Multiplier Formula

The multiplier after revealing `k` gems with `m` mines on a 25-tile board:

```
multiplier(k, m) = 0.99 / P(surviving k reveals)

P(surviving k reveals) = ∏(i=0 to k-1) [(25 - m - i) / (25 - i)]
```

**Step-by-step breakdown for 3 mines, 5 gems revealed:**
```
P(survive 1st) = (25-3-0)/(25-0) = 22/25 = 0.8800
P(survive 2nd) = (25-3-1)/(25-1) = 21/24 = 0.8750
P(survive 3rd) = (25-3-2)/(25-2) = 20/23 = 0.8696
P(survive 4th) = (25-3-3)/(25-3) = 19/22 = 0.8636
P(survive 5th) = (25-3-4)/(25-4) = 18/21 = 0.8571

P(survive all 5) = 0.8800 × 0.8750 × 0.8696 × 0.8636 × 0.8571 = 0.4957

multiplier = 0.99 / 0.4957 = 1.997 ≈ 2.00x
```

**TypeScript implementation:**
```typescript
function calculateMultiplier(gemsRevealed: number, mineCount: number): number {
  if (gemsRevealed === 0) return 0.99; // no gems = base (for display only, can't cash out)
  let survivalProb = 1.0;
  for (let i = 0; i < gemsRevealed; i++) {
    survivalProb *= (25 - mineCount - i) / (25 - i);
  }
  return 0.99 / survivalProb;
}

function calculateNextMultiplier(gemsRevealed: number, mineCount: number): number {
  return calculateMultiplier(gemsRevealed + 1, mineCount);
}

function calculateDanger(gemsRevealed: number, mineCount: number): number {
  // Probability of hitting a mine on the NEXT click
  const remainingTiles = 25 - gemsRevealed;
  return mineCount / remainingTiles;
}
```

### 2.4 Complete Multiplier Tables (All 24 Mine Counts)

#### 1 Mine (24 safe tiles — Low Risk)
| Gems | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 |
|------|---|---|---|---|---|---|---|---|---|----|----|----|----|----|----|----|----|----|----|----|----|----|----|---|
| Multi | 1.03 | 1.08 | 1.12 | 1.18 | 1.24 | 1.30 | 1.37 | 1.46 | 1.55 | 1.65 | 1.77 | 1.90 | 2.06 | 2.25 | 2.48 | 2.75 | 3.09 | 3.54 | 4.13 | 4.95 | 6.19 | 8.25 | 12.38 | 24.75 |

#### 2 Mines (23 safe tiles)
| Gems | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 |
|------|---|---|---|---|---|---|---|---|---|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
| Multi | 1.08 | 1.17 | 1.29 | 1.41 | 1.56 | 1.74 | 1.94 | 2.18 | 2.48 | 2.83 | 3.26 | 3.81 | 4.50 | 5.40 | 6.60 | 8.25 | 10.61 | 14.14 | 19.80 | 29.70 | 49.50 | 99.00 | 297.00 |

#### 3 Mines (22 safe tiles — Low-Medium Risk)
| Gems | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 |
|------|---|---|---|---|---|---|---|---|---|----|----|----|----|----|----|----|----|----|----|----|----|---|
| Multi | 1.12 | 1.29 | 1.48 | 1.71 | 2.00 | 2.35 | 2.79 | 3.35 | 4.07 | 5.00 | 6.26 | 7.96 | 10.35 | 13.80 | 18.97 | 27.11 | 40.66 | 65.06 | 113.85 | 227.70 | 569.25 | 2,277.00 |

#### 4 Mines (21 safe tiles)
| Gems | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 |
|------|---|---|---|---|---|---|---|---|---|----|----|----|----|----|----|----|----|----|----|----|----|
| Multi | 1.18 | 1.41 | 1.71 | 2.09 | 2.58 | 3.23 | 4.09 | 5.26 | 6.88 | 9.17 | 12.51 | 17.52 | 25.30 | 37.95 | 59.64 | 99.39 | 178.91 | 357.81 | 834.90 | 2,504.70 | 12,523.50 |

#### 5 Mines (20 safe tiles — Medium Risk)
| Gems | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 |
|------|---|---|---|---|---|---|---|---|---|----|----|----|----|----|----|----|----|----|----|---|
| Multi | 1.24 | 1.56 | 2.00 | 2.58 | 3.39 | 4.52 | 6.14 | 8.50 | 12.04 | 17.52 | 26.27 | 40.87 | 66.41 | 113.85 | 208.72 | 417.45 | 939.26 | 2,504.70 | 8,766.45 | 52,598.70 |

#### 6 Mines (19 safe tiles)
| Gems | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 |
|------|---|---|---|---|---|---|---|---|---|----|----|----|----|----|----|----|----|----|----|
| Multi | 1.30 | 1.74 | 2.35 | 3.23 | 4.52 | 6.46 | 9.44 | 14.17 | 21.89 | 35.03 | 58.38 | 102.17 | 189.75 | 379.50 | 834.90 | 2,087.25 | 6,261.75 | 25,047.00 | 175,329.00 |

#### 7 Mines (18 safe tiles)
| Gems | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 |
|------|---|---|---|---|---|---|---|---|---|----|----|----|----|----|----|----|----|---|
| Multi | 1.38 | 1.94 | 2.79 | 4.09 | 6.14 | 9.44 | 14.95 | 24.47 | 41.60 | 73.95 | 138.66 | 277.33 | 600.88 | 1,442.10 | 3,965.78 | 13,219.25 | 59,486.63 | 475,893.00 |

#### 8 Mines (17 safe tiles)
| Gems | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 |
|------|---|---|---|---|---|---|---|---|---|----|----|----|----|----|----|----|----|
| Multi | 1.46 | 2.18 | 3.35 | 5.26 | 8.50 | 14.17 | 24.47 | 44.05 | 83.20 | 166.40 | 356.56 | 831.98 | 2,163.15 | 6,489.45 | 23,794.65 | 118,973.25 | 1,070,759.25 |

#### 9 Mines (16 safe tiles)
| Gems | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 |
|------|---|---|---|---|---|---|---|---|---|----|----|----|----|----|----|---|
| Multi | 1.55 | 2.47 | 4.07 | 6.88 | 12.04 | 21.89 | 41.60 | 83.20 | 176.80 | 404.10 | 1,010.26 | 2,828.73 | 9,193.39 | 36,773.55 | 202,254.53 | 2,022,545.25 |

#### 10 Mines (15 safe tiles — High Risk)
| Gems | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 |
|------|---|---|---|---|---|---|---|---|---|----|----|----|----|----|----|
| Multi | 1.65 | 2.83 | 5.00 | 9.17 | 17.52 | 35.03 | 73.95 | 166.40 | 404.10 | 1,077.61 | 3,232.84 | 11,314.94 | 49,031.40 | 294,188.40 | 3,236,072.40 |

#### 11 Mines (14 safe tiles)
| Gems | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 |
|------|---|---|---|---|---|---|---|---|---|----|----|----|----|---|
| Multi | 1.77 | 3.26 | 6.26 | 12.51 | 26.27 | 58.38 | 138.66 | 356.56 | 1,010.26 | 3,232.84 | 12,123.15 | 56,574.69 | 367,735.50 | 4,412,826.00 |

#### 12 Mines (13 safe tiles)
| Gems | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 |
|------|---|---|---|---|---|---|---|---|---|----|----|----|----|
| Multi | 1.90 | 3.81 | 7.96 | 17.52 | 40.87 | 102.17 | 277.33 | 831.98 | 2,828.73 | 11,314.94 | 56,574.69 | 396,022.85 | 5,148,297.00 |

#### 13 Mines (12 safe tiles)
| Gems | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|------|---|---|---|---|---|---|---|---|---|----|----|---|
| Multi | 2.06 | 4.50 | 10.35 | 25.30 | 66.41 | 189.75 | 600.88 | 2,163.15 | 9,193.39 | 49,031.40 | 367,735.50 | 5,148,297.00 |

#### 14 Mines (11 safe tiles)
| Gems | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
|------|---|---|---|---|---|---|---|---|---|----|----|
| Multi | 2.25 | 5.40 | 13.80 | 37.95 | 113.85 | 379.50 | 1,442.10 | 6,489.45 | 36,773.55 | 294,188.40 | 4,412,826.00 |

#### 15 Mines (10 safe tiles)
| Gems | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|------|---|---|---|---|---|---|---|---|---|---|
| Multi | 2.48 | 6.60 | 18.97 | 59.64 | 208.72 | 834.90 | 3,965.78 | 23,794.65 | 202,254.53 | 3,236,072.40 |

#### 16 Mines (9 safe tiles)
| Gems | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|------|---|---|---|---|---|---|---|---|---|
| Multi | 2.75 | 8.25 | 27.11 | 99.39 | 417.45 | 2,087.25 | 13,219.25 | 118,973.25 | 2,022,545.25 |

#### 17 Mines (8 safe tiles)
| Gems | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|------|---|---|---|---|---|---|---|---|
| Multi | 3.09 | 10.61 | 40.66 | 178.91 | 939.26 | 6,261.75 | 59,486.63 | 1,070,759.25 |

#### 18 Mines (7 safe tiles)
| Gems | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|------|---|---|---|---|---|---|---|
| Multi | 3.54 | 14.14 | 65.06 | 357.81 | 2,504.70 | 25,047.00 | 475,893.00 |

#### 19 Mines (6 safe tiles)
| Gems | 1 | 2 | 3 | 4 | 5 | 6 |
|------|---|---|---|---|---|---|
| Multi | 4.13 | 19.80 | 113.85 | 834.90 | 8,766.45 | 175,329.00 |

#### 20 Mines (5 safe tiles)
| Gems | 1 | 2 | 3 | 4 | 5 |
|------|---|---|---|---|---|
| Multi | 4.95 | 29.70 | 227.70 | 2,504.70 | 52,598.70 |

#### 21 Mines (4 safe tiles)
| Gems | 1 | 2 | 3 | 4 |
|------|---|---|---|---|
| Multi | 6.19 | 49.50 | 569.25 | 12,523.50 |

#### 22 Mines (3 safe tiles)
| Gems | 1 | 2 | 3 |
|------|---|---|---|
| Multi | 8.25 | 99.00 | 2,277.00 |

#### 23 Mines (2 safe tiles)
| Gems | 1 | 2 |
|------|---|---|
| Multi | 12.38 | 297.00 |

#### 24 Mines (1 safe tile — Maximum Risk)
| Gems | 1 |
|------|---|
| Multi | 24.75 |

### 2.5 Full Clear Multipliers (Maximum Possible per Mine Count)

| Mines | Safe Tiles | Full Clear Multiplier | Survival Odds |
|-------|-----------|----------------------|---------------|
| 1 | 24 | 24.75x | 4.00% |
| 2 | 23 | 297.00x | 0.33% |
| 3 | 22 | 2,277.00x | 0.04% |
| 4 | 21 | 12,523.50x | 0.008% |
| 5 | 20 | 52,598.70x | 0.002% |
| 6 | 19 | 175,329.00x | 0.0006% |
| 7 | 18 | 475,893.00x | 0.0002% |
| 8 | 17 | 1,070,759.25x | 0.00009% |
| 9 | 16 | 2,022,545.25x | 0.00005% |
| 10 | 15 | 3,236,072.40x | 0.00003% |
| 11 | 14 | 4,412,826.00x | 0.00002% |
| 12 | 13 | 5,148,297.00x | 0.00002% |
| 13 | 12 | 5,148,297.00x | 0.00002% |
| 14 | 11 | 4,412,826.00x | 0.00002% |
| 15 | 10 | 3,236,072.40x | 0.00003% |
| 16 | 9 | 2,022,545.25x | 0.00005% |
| 17 | 8 | 1,070,759.25x | 0.00009% |
| 18 | 7 | 475,893.00x | 0.0002% |
| 19 | 6 | 175,329.00x | 0.0006% |
| 20 | 5 | 52,598.70x | 0.002% |
| 21 | 4 | 12,523.50x | 0.008% |
| 22 | 3 | 2,277.00x | 0.04% |
| 23 | 2 | 297.00x | 0.33% |
| 24 | 1 | 24.75x | 4.00% |

Note: Maximum multiplier peaks at 12-13 mines (5,148,297x) because the number of combinations C(25, m) is maximized around the midpoint.

### 2.6 House Edge & RTP

- **RTP: 99%** (1% house edge)
- The `0.99` factor in the multiplier formula IS the house edge
- EV for any strategy: `bet × 0.99` regardless of mine count or cashout timing
- Increasing mines increases **volatility**, not house edge
- The choice of when to cash out affects variance, not expected return

### 2.7 Danger Probability (Mine on Next Click)

```
danger(gemsRevealed, mineCount) = mineCount / (25 - gemsRevealed)
```

**Example danger progression with 3 mines:**
| Gems Revealed | Remaining Tiles | Danger | Risk Level |
|--------------|----------------|--------|------------|
| 0 | 25 | 12.0% | Low |
| 3 | 22 | 13.6% | Low |
| 5 | 20 | 15.0% | Medium |
| 8 | 17 | 17.6% | Medium |
| 10 | 15 | 20.0% | Medium |
| 13 | 12 | 25.0% | High |
| 15 | 10 | 30.0% | High |
| 18 | 7 | 42.9% | Very High |
| 20 | 5 | 60.0% | Extreme |
| 21 | 4 | 75.0% | Extreme |

**Example danger progression with 10 mines:**
| Gems Revealed | Remaining Tiles | Danger | Risk Level |
|--------------|----------------|--------|------------|
| 0 | 25 | 40.0% | High |
| 3 | 22 | 45.5% | High |
| 5 | 20 | 50.0% | Very High |
| 8 | 17 | 58.8% | Very High |
| 10 | 15 | 66.7% | Extreme |
| 12 | 13 | 76.9% | Extreme |
| 14 | 11 | 90.9% | Extreme |

### 2.8 "Profit on Next Tile" Display

This is what the player sees: "If you reveal one more gem, your multiplier goes from X to Y."

```
profitOnNextTile = (nextMultiplier - currentMultiplier) × betAmount
```

**Example with 5 mines, $1.00 bet:**
| Gems | Current Multi | Next Multi | Profit on Next Tile |
|------|-------------|-----------|-------------------|
| 0 → 1 | — | 1.24x | $1.24 (initial) |
| 1 → 2 | 1.24x | 1.56x | +$0.32 |
| 2 → 3 | 1.56x | 2.00x | +$0.44 |
| 5 → 6 | 3.39x | 4.52x | +$1.13 |
| 10 → 11 | 17.52x | 26.27x | +$8.76 |
| 15 → 16 | 208.72x | 417.45x | +$208.72 |
| 19 → 20 | 8,766.45x | 52,598.70x | +$43,832.25 |

The exponentially growing "profit on next tile" is what creates the irresistible "one more click" urge.

---

## 3. Visual Design Specification

### 3.1 Overall Layout

**Fonts (PaperBet design system):**
- Headings: **Outfit** (bold, techy, modern)
- Body text: **DM Sans** (clean, readable)
- Numbers/multipliers/currency: **JetBrains Mono** (monospace)

**Desktop (≥1024px) — 3-Column Layout:**
```
┌───────────────────────────────────────────────────────────────┐
│ [HEADER — sticky]                                             │
├────────────┬─────────────────────────┬────────────────────────┤
│            │  MULTIPLIER BAR         │                        │
│  CONTROLS  │  [Current → Next]       │  CASINO SIDEBAR        │
│  PANEL     │  DANGER METER ████░░░░  │  + STATS               │
│            ├─────────────────────────┤                        │
│  Width:    │                         │  Width: 320px          │
│  300px     │      5×5 GRID           │                        │
│            │      (Game Board)       │  - Casino Cards        │
│  - Bet Amt │                         │  - Session Stats       │
│  - Mines # │      Width: flex-1      │  - Bet History         │
│  - Bet/    │      Aspect: 1:1        │  - "What You Would     │
│    Cashout │      Max: 500px         │     Have Won"          │
│  - Random  │                         │                        │
│  - Auto    │                         │                        │
│            │                         │                        │
└────────────┴─────────────────────────┴────────────────────────┘
```

**Mobile (<768px, test at 375px width) — Single Column:**
```
┌─────────────────────────┐
│ MULTIPLIER BAR           │
│ "3.43x — Cash Out $3.43" │
│ DANGER METER ████░░░░    │
├─────────────────────────┤
│                          │
│     5×5 GRID             │
│     (Full width, square) │
│                          │
├─────────────────────────┤
│ CONTROLS (compact)       │
│ [Bet: $1.00] [Mines: 3] │
│ [=== BET / CASHOUT =====]│
├─────────────────────────┤
│ SESSION STATS (2x2)      │
├─────────────────────────┤
│ CASINO CARDS             │
├─────────────────────────┤
│ BET HISTORY              │
└─────────────────────────┘

[FIXED: Cash Out bar at bottom of screen during active game]
```

### 3.2 The 5×5 Grid (Game Board)

**Container:**
- Background: `#111827` (card bg)
- Border: `#374151`, rounded-xl
- Padding: 16px (desktop), 12px (mobile)
- Grid: `display: grid; grid-template-columns: repeat(5, 1fr);`
- Grid gap: 8px (desktop), 6px (mobile)
- Aspect ratio: 1:1 (square) enforced by `aspect-ratio: 1 / 1`
- Max-width: 500px (centered with `margin: 0 auto`)

**Tile States (each tile is a React component with 6 visual states):**

**State 1 — IDLE (before game starts):**
- Background: `#1F2937`
- Border: 1px `#374151`
- Border-radius: 12px
- Cursor: default (not clickable)
- No hover effect
- Opacity: 0.7 (slightly dimmed to indicate "not active")

**State 2 — UNREVEALED (game active, tile not yet clicked):**
- Background: `#1F2937`
- Border: 1px `#374151`
- Border-radius: 12px
- Cursor: pointer
- Hover: background `#374151`, translateY(-2px), box-shadow `0 4px 12px rgba(0, 0, 0, 0.3)`
- Active (pressed): scale(0.95), background `#4B5563`
- Transition: all 150ms ease
- Size: ~80px × 80px (desktop), ~56px × 56px (mobile), calculated from grid

**State 3 — REVEALING (flip animation in progress):**
- CSS 3D transform: `perspective(600px) rotateY(0→90→0deg)`
- Duration: 300ms total
  - 0–150ms: `rotateY(0deg → 90deg)` — tile shrinks to line
  - At 150ms: swap content (show gem icon)
  - 150–300ms: `rotateY(90deg → 0deg)` — new face appears
- `backface-visibility: hidden`
- `transform-style: preserve-3d`

**State 4 — REVEALED GEM:**
- Background: `rgba(0, 229, 160, 0.15)` (green at 15%)
- Border: 1px `rgba(0, 229, 160, 0.4)`
- Center: Lucide `Gem` icon, 28px (desktop) / 20px (mobile), color `#00E5A0`
- After flip: green glow pulse `box-shadow: 0 0 12px rgba(0, 229, 160, 0.3)` → fade out over 500ms
- Cursor: default (already revealed)
- Not clickable

**State 5 — MINE HIT (the mine the player clicked):**
- Background: `rgba(239, 68, 68, 0.30)` (red at 30% — brighter)
- Border: 1px `rgba(239, 68, 68, 0.6)`
- Center: Lucide `Bomb` icon, 28px / 20px, color `#EF4444`
- Explosion animation sequence:
  1. Frame 0–100ms: scale 1.0 → 1.2, background brightens
  2. Frame 100–300ms: red radial gradient pulse expands from center
  3. Frame 300–500ms: board shakes (CSS `translate(±3px, ±3px)` random, 200ms)
  4. Frame 500–800ms: "BOOM" text scales in above tile (DM Sans, 16px, bold, `#EF4444`), fades out

**State 6 — POST-GAME REVEALED (remaining tiles shown after game ends):**
- **Unrevealed mine:** Background `rgba(239, 68, 68, 0.10)` (dimmer red), Bomb icon at 60% opacity
- **Unrevealed gem:** Background `rgba(0, 229, 160, 0.05)` (faint green), Gem icon at 30% opacity
- Stagger animation: each tile flips with 50ms delay between them (mines first, then gems)
- Start: 400ms after game ends (mine hit or cashout)

### 3.3 Multiplier Bar (Above Grid)

**Container:**
- Full width across game area
- Background: `#111827`
- Border-bottom: 1px `#374151`
- Padding: 12px 16px
- Border-radius: 12px 12px 0 0 (rounds top, connects to grid)

**Before game starts (IDLE):**
- Text: "Place your bet and start" in `#6B7280`, DM Sans, 16px
- Below: first-gem multiplier preview: "First gem: X.XXx" in `#9CA3AF`

**During game — 0 gems revealed:**
- Text: "Click a tile to reveal" in `#6B7280`
- Cash Out button is DISABLED

**During game — 1+ gems revealed:**
- Left side:
  - Label: "Multiplier" in `#6B7280`, DM Sans, 12px
  - Value: JetBrains Mono, 28px (desktop) / 22px (mobile), bold
  - Color: per multiplier color scale (§3.3 colors below)
- Right side:
  - Label: "Profit on Next Tile" in `#6B7280`, DM Sans, 12px
  - Value: "+$X.XX" in `#9CA3AF`, JetBrains Mono, 16px
  - Below: "Next: X.XXx" in `#6B7280`

**Multiplier Color Scale:**
| Range | Color |
|-------|-------|
| 1.00x – 1.99x | `#F9FAFB` (white) |
| 2.00x – 4.99x | `#00E5A0` (green) |
| 5.00x – 19.99x | `#F97316` (orange) |
| 20.00x – 99.99x | `#EF4444` (red) |
| 100.00x+ | `#F59E0B` (gold, pulsing glow) |

**After mine hit:**
- "GAME OVER" in `#EF4444`, DM Sans, 20px, bold
- Below: "-$X.XX" loss amount

**After cashout:**
- "CASHED OUT" in `#00E5A0`, DM Sans, 20px, bold
- Below: "+$X.XX" profit amount + "at X.XXx"

**After full clear:**
- "PERFECT CLEAR" in `#F59E0B` (gold), DM Sans, 20px, bold
- Below: "+$X.XX" profit amount + "at X.XXx" + odds display ("1 in X,XXX")

### 3.4 Danger Meter

**Position:** Directly below the multiplier bar, above the grid

**Visual design:**
- Height: 6px (desktop), 4px (mobile)
- Full width
- Background track: `#1F2937`
- Border-radius: full (rounded)
- Filled portion: gradient from left, color based on danger level

**Danger color thresholds:**
| Danger % | Fill Color | Label |
|----------|-----------|-------|
| 0%–15% | `#00E5A0` (green) | Safe |
| 15%–30% | `#F59E0B` (amber) | Risky |
| 30%–50% | `#F97316` (orange) | Dangerous |
| 50%–75% | `#EF4444` (red) | Very Dangerous |
| 75%+ | `#EF4444` pulsing | Extreme |

**Fill amount:** proportional to danger percentage
**Label:** Small text to the right of the bar: "12% danger" in `#6B7280`, JetBrains Mono, 11px
**Animation:** fill width transitions smoothly (200ms ease) after each reveal
**Hidden:** before game starts and after game ends

### 3.5 Animations & Transitions

**Tile Flip Animation (Gem Found):**
```css
.tile-flip {
  animation: tileFlip 300ms ease-out forwards;
  transform-style: preserve-3d;
}
@keyframes tileFlip {
  0% { transform: perspective(600px) rotateY(0deg); }
  50% { transform: perspective(600px) rotateY(90deg); }
  100% { transform: perspective(600px) rotateY(0deg); }
}
```
- Content swap happens at 50% (rotateY 90deg = edge-on, invisible)
- After flip: green glow pulse (box-shadow fade in/out over 500ms)

**Mine Hit Animation:**
- Duration: 800ms total
- Frame 0–100ms: Tile turns red, scales 1.0 → 1.2
- Frame 100–300ms: Red radial gradient expands from tile center (CSS `radial-gradient` on `::after`)
- Frame 300–500ms: Board shakes (transform translate ±3px random, 200ms)
- Frame 500–800ms: "BOOM" text appears and fades, board settles

**Post-Game Mine Reveal:**
- Starts 400ms after mine hit or cashout
- Mines flip first (50ms stagger between each)
- Then safe tiles show faded gems (40ms stagger — faster than mines to keep total reveal time under 2s)
- Total: ~500–1200ms depending on remaining tile count

**Cash Out Animation:**
- All revealed gem tiles pulse simultaneously (scale 1.0 → 1.05 → 1.0, 200ms)
- Green sparkle/confetti from board center
- Profit: "+$XX.XX" scales up from center, floats upward 40px, fades after 1.5s

**Win Celebration Tiers:**
| Multiplier | Animation |
|-----------|-----------|
| < 2x | Green pulse on gems, profit text |
| 2x – 9.9x | Green sparkle burst from board center, "NICE" text |
| 10x – 99x | Larger gold/green burst + multiplier text floats up large |
| 100x+ | Gold particle explosion + full confetti + screen-edge glow + "JACKPOT" text |

**Full Clear Celebration:**
- "PERFECT CLEAR" text in gold, DM Sans, 28px, scales up
- All tiles simultaneously pulse gold (box-shadow `0 0 20px rgba(245, 158, 11, 0.5)`)
- Display the astronomical odds: "Odds: 1 in X,XXX,XXX"
- Full confetti + screen shake

**Loss Animation (mine hit):**
- Dramatic enough to create impact but NOT so long it frustrates
- After explosion, the post-game reveal should feel quick — the player wants to play again

---

## 4. Controls Panel Specification

### 4.1 Bet Amount Control

**Identical to all other PaperBet games** — same card layout, input, +/- buttons, quick-select.

**Card:** `#111827` bg, `#374151` border, rounded-xl, p-4
**Label:** "Bet Amount" — DM Sans, 14px, `#9CA3AF`
**Input:** `#1F2937` bg, `#374151` border, rounded-lg, JetBrains Mono 18px, `#F9FAFB`, right-aligned. "$" prefix in `#6B7280`. Focus ring: `#00E5A0` at 50%.
**+/- Buttons:** Circular 36px, `#1F2937` bg, `#374151` border, Lucide Minus/Plus icons
**Quick-Select:** "½" | "2×" | "Min" | "Max" pill buttons

| Parameter | Value |
|-----------|-------|
| Min Bet | $0.10 |
| Max Bet | $1,000.00 |
| Default | $1.00 |
| Step | $0.10 |

**DISABLED during active game** — cannot change bet mid-game.

### 4.2 Mine Count Control

**Label:** "Mines" — DM Sans, 14px, `#9CA3AF`

**Number Selector:**
- Input field: JetBrains Mono, 18px, centered, `#F9FAFB`
- +/- buttons: same circular style as bet amount
- Range: 1–24
- Default: 3
- Quick-select buttons: "1" | "3" | "5" | "10" | "24"
  - Same pill styling as bet amount quick-selects

**Info displays (below selector):**
- "X gems to find" — `#9CA3AF`, shows `25 − mines`
- Risk label with color:
  - 1–2 mines: `#00E5A0` text ("Low Risk")
  - 3–5 mines: `#F59E0B` text ("Medium Risk")
  - 6–12 mines: `#F97316` text ("High Risk")
  - 13–24 mines: `#EF4444` text ("Extreme Risk")
- "1st gem: X.XXx" — preview of what the first reveal pays

**DISABLED during active game** — cannot change mines mid-game.

### 4.3 Action Buttons (Phase-Dependent)

The main action button changes completely depending on game phase:

**IDLE Phase — "Bet" button:**
- Full width, height: 48px
- Background: `#00E5A0`
- Text: "Bet" — DM Sans, 16px, bold, `#0B0F1A`
- Below text: bet amount preview "$1.00"
- Border-radius: 10px
- Box-shadow: `0 0 20px rgba(0, 229, 160, 0.2)`
- Hover: `#1AFFA8`, shadow intensifies
- Active: scale 0.98, `#00CC8E`
- Keyboard: Spacebar

**PLAYING Phase, 0 gems — "Cash Out" (disabled):**
- Full width, height: 52px
- Background: `#374151` (gray — disabled)
- Text: "Cash Out" — DM Sans, 16px, `#6B7280`
- Below: "Reveal a tile first"
- Cursor: not-allowed

**PLAYING Phase, 1+ gems — "Cash Out" (active):**
- Full width, height: 52px
- Background: `#F59E0B` (amber — urgency color)
- Text: "Cash Out" — DM Sans, 16px, bold, `#0B0F1A`
- Below text: "X.XXx — $XX.XX" (multiplier and dollar amount, JetBrains Mono 14px)
- Pulsing animation: scale 1.0 → 1.02 → 1.0, 1s infinite
- Box-shadow: `0 0 20px rgba(245, 158, 11, 0.3)`
- This button MUST be impossible to miss
- Keyboard: Spacebar

**PLAYING Phase, mobile — Fixed Cash Out:**
- Position: fixed at bottom of viewport
- Width: 100%, height: 56px
- Same amber styling as above but larger
- z-index: 50 (above everything)
- Safe area padding for notched phones
- Visible only during active game with 1+ gems

**GAME_OVER Phase — "New Game" button:**
- Full width, height: 48px
- Background: `#00E5A0`
- Text: "New Game" — DM Sans, 16px, bold, `#0B0F1A`
- Appears after post-game reveal animation completes (~1-2s after game ends)
- Keyboard: Spacebar

### 4.4 "Pick Random Tile" Button

**Position:** Below mine count, above action button

**Styling:**
- Secondary button: `#1F2937` bg, `#374151` border, rounded-lg
- Text: "Pick Random" — DM Sans, 14px, `#9CA3AF`
- Icon: Lucide `Shuffle` or `Dices`, 16px, to the left of text
- Height: 36px
- Full width
- Hover: `#374151` bg, `#F9FAFB` text

**Behavior:**
- Only active during PLAYING phase
- Reveals a random unrevealed tile (same as clicking it)
- Uses same debounce as regular tile clicks (100ms)
- Disabled during flip animation

### 4.5 Auto-Play System

**Toggle:** "Auto" switch below action button — same as other games

**Auto-Play Options Panel (collapsible):**
- Number of games: 10 / 25 / 50 / 100 / ∞
- **Auto-reveal count:** (CRITICAL SETTING) Number of tiles to reveal before auto-cashout (e.g., 5 → reveal 5 gems then cash out)
  - Input: JetBrains Mono, number input, range 1–(25-mines)
  - Quick-select: "1" | "3" | "5" | "10" | "Max"
- On Win: same bet / increase by X% / reset to base
- On Loss: same bet / increase by X% / reset to base
- Stop on Profit ≥ $X
- Stop on Loss ≥ $X

**Auto-play behavior:**
1. Start game automatically (instant, no extra click needed)
2. Reveal tiles one-by-one with 300ms delay between each (visible animation)
3. Tile selection: random unrevealed tile each time
4. After reaching target reveal count: auto-cashout
5. If mine hit before target: loss, log result
6. Wait 1s between games
7. Apply on-win/on-loss bet adjustments
8. Check stop conditions
9. Repeat or stop

**Manual interaction during auto-play:**
- Manual tile clicks are IGNORED during auto-play (auto-play controls the reveal order)
- Player can only press "Stop" to cancel auto-play — current game completes, then auto-play stops
- All other controls (bet amount, mine count) remain locked

**Visual during auto-play:**
- Pulsing green dot + "Auto" label
- Game counter: "Game 7 / 25"
- "Stop" button replaces "Bet" button
- Tiles reveal with visible animation (not instant — player should SEE the auto-play)

---

## 5. Statistics & History Display

### 5.1 Session Statistics

**Layout:** 2×2 grid (desktop in sidebar, mobile below game)

| Stat | Format | Font | Color |
|------|--------|------|-------|
| Games Played | "28 games" | JetBrains Mono, 20px | `#F9FAFB` |
| Total Wagered | "$28.00" | JetBrains Mono, 20px | `#F9FAFB` |
| Net Profit | "+$14.30" / "-$8.20" | JetBrains Mono, 20px | `#00E5A0` / `#EF4444` |
| Best Win | "19.80x ($19.80)" | JetBrains Mono, 20px | `#F59E0B` |

Each stat card: `#111827` bg, `#374151` border, rounded-lg, p-3
Label: DM Sans, 12px, `#6B7280` (above the number)
Update animation: number count-up/down over 300ms when value changes

**Expandable "More Stats" section:**
- Win Rate (%)
- Average Cashout Multiplier
- Longest Gem Streak (most gems revealed in one game)
- Average Gems per Game
- Total Returns
- Biggest Single Loss
- Current Win Streak
- Best Win Streak

### 5.2 Bet History Table

**Columns:**
| Column | Width | Alignment | Content |
|--------|-------|-----------|---------|
| # | 40px | Center | Game number (most recent first) |
| Bet | 70px | Right | "$1.00" — JetBrains Mono |
| Mines | 50px | Center | "3" — badge styled |
| Gems | 50px | Center | "8" — JetBrains Mono |
| Result | 80px | Right | "3.35x" green or "MINE" red badge |
| Profit | 90px | Right | "+$2.35" green / "-$1.00" red |

**Mine count badge colors:**
- 1–2: `#00E5A0` bg at 10%, green text
- 3–5: `#F59E0B` bg at 10%, amber text
- 6–12: `#F97316` bg at 10%, orange text
- 13–24: `#EF4444` bg at 10%, red text

**Behavior:**
- Shows last 25 games (scrollable for more)
- New games insert at top with slide-down animation (200ms)
- Alternating row backgrounds: `#0B0F1A` and `#111827`
- Hover: row highlights to `#1F2937`
- Win rows: left border 2px `#00E5A0`
- Loss rows: left border 2px `#EF4444`

### 5.3 "What You Would Have Won" Display

**Trigger:** Appears after 5+ games in a session

**Layout:** Prominent card, `#111827` bg, `#00E5A0` border (1px), rounded-xl, p-6

**Content:**
```
"If you played with real money..."

$28.00 wagered → $42.30 returned

Net Profit: +$14.30

Biggest Win: 19.80x on a $1.00 bet = $19.80

Top casino for Mines:
[Casino Card — Stake: 200% up to $2K]
[CTA: "Spin the Deal Wheel →"]
```

**Typography:**
- Headline: DM Sans, 16px, `#9CA3AF`
- Wagered/Returned: JetBrains Mono, 24px, `#F9FAFB`
- Net Profit: JetBrains Mono, 28px, green or red
- Casino card: standard component from CASINOS constant
- CTA button: `#00E5A0` bg, dark text, rounded-lg

**Animation:** Slides in from right (desktop) or bottom (mobile) on first appearance

---

## 6. Sound Design Notes (Visual Equivalents)

| Audio Cue (Real Casino) | Visual Replacement |
|------------------------|-------------------|
| Tile click/reveal "pop" | 3D tile flip animation (300ms) |
| Gem found "ding" | Green glow pulse on tile + multiplier scales up |
| Multiplier tick up | Multiplier number briefly scales 102% on change |
| Mine found "explosion" | Red flash + board shake + "BOOM" text |
| Cash out "cha-ching" | Green sparkle burst + profit float-up |
| Danger rising | Danger meter bar fills redder, color transition |
| Post-game reveal "clicks" | Staggered tile flips at 50ms intervals |
| Button click "pop" | Button scale 0.95 → 1.0 micro-animation |

**Haptic Feedback (mobile, Vibration API):**
- Tile reveal: light tap (30ms vibration)
- Mine hit: strong burst (200ms vibration)
- Cash out: double tap pattern (50ms-30ms-50ms)
- Big win (≥ 10x): triple burst pattern

---

## 7. Edge Cases & Error States

### 7.1 All Gems Revealed (Full Clear)
- Probability: extremely low for most mine counts (see §2.5)
- Auto-cashout triggered (no more tiles to reveal)
- Special "PERFECT CLEAR" celebration animation
- Display: odds of achievement (e.g., "1 in 2,598,960")
- Maximum multiplier awarded

### 7.2 First Tile is a Mine
- Probability: `mineCount / 25` (e.g., 12% with 3 mines, 40% with 10 mines)
- Flip animation plays, mine explodes
- Display: "Unlucky! First tile was a mine." in `#9CA3AF`
- Faster transition to GAME_OVER (skip long post-game reveal since only 1 tile was revealed)
- "New Game" button appears after ~1s

### 7.3 24 Mines (Maximum Risk)
- Only 1 safe tile out of 25
- 96% chance of instant mine hit on first click
- Single successful reveal: 24.75x multiplier
- Auto-cashout after 1 gem (since that's all gems available)
- This is "pick one and pray" mode
- Grid should show the gravity of the situation: maybe subtle red tint on all tiles

### 7.4 1 Mine (Minimum Risk)
- 24 safe tiles, only 1 mine
- 96% chance of survival per click — very safe
- Players might reveal 15–20+ tiles before cashing out
- Multiplier grows slowly: 1.03x → 1.08x → 1.12x...
- Grid fills up with revealed gems — should look satisfying, not cluttered

### 7.5 Rapid Clicking
- Debounce tile clicks: 100ms minimum between reveals
- Queue at most 1 pending reveal (process after current flip animation)
- Prevent clicking multiple tiles simultaneously
- During flip animation: all other tiles temporarily ignore clicks
- Visual: clicked tile immediately shows "selected" state (slight brightness increase) before flip starts

### 7.6 Mid-Game Browser Resize
- Grid recalculates tile sizes from CSS Grid (automatic)
- All revealed/unrevealed states preserved
- Animations in progress complete at current dimensions
- Cash Out button repositions correctly (especially mobile fixed position)

### 7.7 Mobile Touch
- Tiles: minimum 44px touch target (met by design — tiles are ≥56px)
- `touch-action: manipulation` on grid to prevent double-tap zoom
- Cash Out button: fixed bottom, 56px height, full width, impossible to miss
- No accidental reveals: slight delay (50ms) before registering a tap to prevent scroll-then-tap

### 7.8 Game Abandonment
- If player navigates away during active game → game auto-resolves as loss (bet is lost)
- If player closes tab → same, lost bet (client-side only, no persistence)
- beforeunload warning: "You have an active Mines game. Leaving will forfeit your bet."

---

## 8. Strategy Preset Specifications

### 8.1 Safe Grinder
- Mines: 1
- Auto-reveal: 10 tiles then cash out (~1.65x)
- Low risk, consistent small profits
- Win rate: ~60%
- Best for: learning, demonstrating low-volatility play

### 8.2 Balanced
- Mines: 3
- Auto-reveal: 5 tiles then cash out (~2.00x)
- Medium risk, decent returns
- Win rate: ~49%
- The "default" feel-good strategy

### 8.3 Diamond Hunter
- Mines: 5
- Auto-reveal: 3 tiles then cash out (~2.00x)
- Higher risk per click, fewer clicks needed
- Win rate: ~49%
- Same EV as Balanced, but different feel (fewer clicks = more volatile)

### 8.4 Degen Mode
- Mines: 10
- Auto-reveal: 3 tiles then cash out (~5.00x)
- High risk, high reward
- Win rate: ~19%
- Big wins interspersed with long losing streaks

### 8.5 One Shot
- Mines: 24
- Auto-reveal: 1 tile (all or nothing)
- 4% chance of 24.75x — pure lottery
- Maximum volatility
- Fast rounds — over in one click

### 8.6 Martingale
- Start with base bet
- On loss: double bet, same mine/reveal count
- On win: reset to base bet
- Auto-stop at max bet ($1,000) or bankroll limit
- Warning: "Martingale can lead to rapid bankroll depletion"

### 8.7 Anti-Martingale (Paroli)
- On win: double bet
- On loss: reset to base bet
- Take profit after 3 consecutive wins

### 8.8 Custom
- Player sets: mine count, target reveals, bet adjustments, stop conditions
- Full control over all parameters

**Strategy Controls:** Collapsible panel below auto-play settings
**Active indicator:** Small colored badge on bet field showing strategy name

---

## 9. Conversion Integration Points

### 9.1 Casino Sidebar (Desktop)
- Filter: casinos with "mines" in their games array
- Currently: Stake, Rollbit, BC.Game, Wild.io, Jackbit, CoinCasino (all have "mines")
- Show 2–3 cards: name (brand colored), offer, "Claim Deal →" link to /deals
- Position: right column, below session stats

### 9.2 "Spin the Deal Wheel" CTA
- Position: below casino cards in sidebar
- Trigger: always visible, PROMINENT after 10+ games (pulsing border, larger text)
- Style: `#00E5A0` border, `#111827` bg, wheel icon
- Text: "Spin the Deal Wheel" + "Win exclusive Mines bonuses"

### 9.3 "What You Would Have Won"
- Trigger: after 5+ games
- Sidebar (desktop), inline card (mobile)
- Updates after each game (not mid-game)
- Emphasis: "Your 19.80x win would have paid $19.80 at BC.Game"

### 9.4 Post-Session Nudge
- Trigger: 60 seconds inactivity after 10+ games
- Subtle slide-in from bottom: "Ready for real stakes? Spin the Deal Wheel →"
- Dismissable, once per session

### 9.5 Integration Rules
- **NEVER** show CTAs while a game is in progress (tiles being revealed)
- CTAs only appear between games or in the sidebar
- Casino links: `target="_blank" rel="noopener noreferrer"` — all links use affiliate tracking URLs
- Affiliate attribution: every casino link must pass through the PaperBet affiliate redirect
- Disclaimer always visible
- No pop-ups or modals during gameplay

---

## 10. Technical Implementation Notes

### 10.1 Rendering Approach
- **Grid:** CSS Grid (`display: grid; grid-template-columns: repeat(5, 1fr)`) — NOT Canvas
- **Tiles:** Individual React components with CSS 3D transforms for flip
- **Icons:** Lucide React (`Gem`, `Bomb` icons)
- **Animations:** CSS transitions for flips, CSS `@keyframes` for celebrations (keep zero external animation dependencies — no framer-motion needed for 25 tiles)
- **Particles:** CSS `@keyframes` or lightweight `<canvas>` overlay for confetti
- DOM-based rendering is perfectly fine for 25 tiles — no performance concerns

### 10.2 Complete State Machine

```typescript
type GamePhase = 'IDLE' | 'PLAYING' | 'GAME_OVER';
type GameOverReason = 'mine_hit' | 'cashout' | 'full_clear';
type TileState = 'hidden' | 'revealing' | 'gem' | 'mine_hit' | 'mine_revealed' | 'gem_faded';

interface MinesGameState {
  // Game phase
  phase: GamePhase;
  gameOverReason: GameOverReason | null;

  // Configuration (locked when phase = PLAYING)
  betAmount: number;
  mineCount: number;

  // Board state
  minePositions: Set<number>;      // indices 0-24
  revealedTiles: Set<number>;      // indices of revealed gems
  tileStates: TileState[];         // array of 25 tile states

  // Multiplier state
  currentMultiplier: number;       // 0 if no gems revealed yet
  nextMultiplier: number;          // what multiplier would be after one more gem
  gemsRevealed: number;
  dangerPercent: number;           // mineCount / (25 - gemsRevealed)

  // Result
  profit: number;                  // positive for cashout, negative for mine hit
  isWin: boolean | null;

  // Auto-play
  autoPlayEnabled: boolean;
  autoPlayGamesTotal: number;
  autoPlayGamesCurrent: number;
  autoRevealTarget: number;        // gems to reveal before auto-cashout
  onWinAction: 'same' | 'increase' | 'reset';
  onWinValue: number;
  onLossAction: 'same' | 'increase' | 'reset';
  onLossValue: number;
  stopOnProfit: number | null;
  stopOnLoss: number | null;

  // Session
  stats: MinesSessionStats;
  history: MinesRound[];
}

interface MinesSessionStats {
  gamesPlayed: number;
  totalWagered: number;
  totalReturns: number;
  netProfit: number;
  bestWin: { multiplier: number; profit: number } | null;
  biggestLoss: number;
  longestGemStreak: number;
  avgGemsPerGame: number;
  winRate: number;                 // percentage
  currentWinStreak: number;
  bestWinStreak: number;
}

interface MinesRound {
  id: string;
  betAmount: number;
  mineCount: number;
  gemsRevealed: number;
  multiplier: number;              // 0 if mine hit on first tile
  profit: number;
  isWin: boolean;
  minePositions: number[];         // for post-game analysis
  revealOrder: number[];           // order tiles were revealed
  timestamp: number;
}
```

### 10.3 State Transitions

```
IDLE:
  → user clicks "Bet"
  → validate: betAmount > 0, mineCount 1-24
  → generate mine positions (Fisher-Yates shuffle)
  → set all tiles to 'hidden'
  → lock bet and mine count inputs
  → transition to PLAYING

PLAYING:
  → user clicks tile[i]:
    → if minePositions.has(i):
      → set tileStates[i] = 'mine_hit'
      → set profit = -betAmount
      → set gameOverReason = 'mine_hit'
      → transition to GAME_OVER
    → else:
      → set tileStates[i] = 'revealing' → (after 300ms) → 'gem'
      → add i to revealedTiles
      → gemsRevealed++
      → recalculate currentMultiplier, nextMultiplier, dangerPercent
      → if gemsRevealed === 25 - mineCount:
        → set profit = betAmount × currentMultiplier - betAmount
        → set gameOverReason = 'full_clear'
        → transition to GAME_OVER

  → user clicks "Cash Out":
    → set profit = betAmount × currentMultiplier - betAmount
    → set gameOverReason = 'cashout'
    → transition to GAME_OVER

  → user clicks "Pick Random":
    → select random index from unrevealed non-mine tiles... wait, no:
    → select random index from ALL unrevealed tiles (could be a mine!)
    → process same as tile click

GAME_OVER:
  → play result animation (explosion or celebration)
  → reveal remaining tiles (staggered, 400ms delay then 50ms between each)
  → update session stats
  → add to history
  → show "New Game" button
  → user clicks "New Game" → transition to IDLE (preserve bet amount and mine count from previous game — only reset board state)
  → (if auto-play: auto-transition after 1s delay, apply on-win/on-loss bet adjustments)
```

### 10.4 Multiplier Calculator Module

```typescript
// minesCalculator.ts

/**
 * Pre-compute all multipliers for a given mine count.
 * Returns array where index k = multiplier after revealing k gems.
 * Index 0 = 0.99 (base, can't cash out at 0 gems).
 */
export function precomputeMultipliers(mineCount: number): number[] {
  const maxGems = 25 - mineCount;
  const multipliers: number[] = [0.99]; // k=0

  let survivalProb = 1.0;
  for (let k = 1; k <= maxGems; k++) {
    survivalProb *= (25 - mineCount - (k - 1)) / (25 - (k - 1));
    multipliers.push(0.99 / survivalProb);
  }
  return multipliers;
}

/**
 * Get danger % for next click.
 */
export function getDanger(gemsRevealed: number, mineCount: number): number {
  return mineCount / (25 - gemsRevealed);
}

/**
 * Format multiplier for display.
 */
export function formatMultiplier(mult: number): string {
  if (mult >= 1000000) return `${(mult / 1000000).toFixed(2)}M`;
  if (mult >= 1000) return mult.toLocaleString('en-US', { maximumFractionDigits: 2 });
  return mult.toFixed(2);
}
```

**Performance note:** Call `precomputeMultipliers(mineCount)` ONCE when mine count changes and cache the array. Then during gameplay, just index into the array: `multipliers[gemsRevealed]`. No per-reveal recalculation needed.

### 10.5 File Structure

```
components/games/mines/
├── MinesGame.tsx              # Main component — orchestrates layout + phase transitions
├── MinesBoard.tsx             # 5×5 CSS Grid container
├── MinesTile.tsx              # Individual tile — handles 6 visual states + flip animation
├── MinesMultiplierBar.tsx     # Current/next multiplier + profit display
├── MinesDangerMeter.tsx       # Thin danger probability bar
├── MinesControls.tsx          # Bet amount, mine count, action buttons, pick random
├── MinesAutoPlay.tsx          # Auto-play configuration panel
├── MinesStats.tsx             # Session statistics (2x2 grid)
├── MinesBetHistory.tsx        # Bet history table
├── MinesSidebar.tsx           # Casino cards + conversion CTAs + "What You Would Have Won"
├── MinesCelebration.tsx       # Confetti/particles overlay (optional <canvas>)
├── useMinesGame.ts            # Core game hook — state machine, mine generation, multiplier logic
├── minesCalculator.ts         # Pure functions: multiplier tables, danger, formatting
├── minesTypes.ts              # All TypeScript interfaces and types
└── minesConstants.ts          # Precomputed multiplier lookup tables for common mine counts
```

### 10.6 Performance Targets
- Tile flip animation: 60fps (CSS 3D transform, hardware-accelerated)
- Multiplier recalculation: < 1ms (pre-computed lookup table)
- Danger meter update: smooth CSS transition (200ms)
- Post-game reveal: staggered via CSS `animation-delay` (no JS timers for each tile)
- Auto-play: handle 100+ games without memory leak (cap history at 200 entries)
- `will-change: transform` on tiles that are about to flip

---

## 11. Accessibility

- **Grid navigation:** Arrow keys move focus between tiles (2D navigation: Up/Down/Left/Right)
- **Tile labels:** Each tile has `role="button"` and `aria-label="Tile row X, column Y — unrevealed"` or "revealed — gem" or "revealed — mine"
- **Focus ring:** visible 2px `#00E5A0` outline on focused tile
- **Screen reader:** `aria-live="assertive"` region announces:
  - "Gem found. Multiplier is now X.XXx. Danger: Y%."
  - "Mine hit! Game over. You lost $X.XX."
  - "Cashed out at X.XXx. Profit: $X.XX."
- **Cash Out button:** keyboard accessible (Tab to focus, Enter/Space to activate)
- **Keyboard shortcuts:** Spacebar OR Enter triggers Bet/Cash Out/New Game (context-dependent). Arrow keys navigate grid tiles.
- **Reduced motion** (`prefers-reduced-motion: reduce`):
  - Skip 3D flip — instant content swap with opacity transition
  - Skip board shake
  - Skip particle effects
  - Keep color changes and text updates only
- **Color contrast:** All text meets WCAG AA (4.5:1 minimum). Gem/mine icons have both color AND icon shape to distinguish (not color-only).
- **Tab order:** Bet Amount → Mine Count → Bet/Start Button → Grid tiles (left-to-right, top-to-bottom) → Cash Out Button

---

## 12. Responsible Gambling

**Footer disclaimer (always visible):**
> "18+ | Gambling involves risk. Only bet what you can afford to lose. PaperBet.io is a free simulator for educational purposes. We are not a gambling site."

**Session reminder:** After 30 games, show gentle reminder: "You've played 30 rounds. Remember, this is practice mode — take a break if needed."
- Small banner below controls, dismissable
- Non-intrusive, does NOT interrupt active game

**Speed governor:** Auto-play has minimum 1-second delay between games. After 200 auto-play games, auto-play pauses and requires manual restart.

**Danger education:** The always-visible Danger Meter teaches players about increasing risk per click — this is inherently educational about probability.

---

## 13. What Makes Mines Unique (Design Philosophy)

Mines occupies a unique position in PaperBet's game library:

**1. Player Agency**
Mines is the ONLY game where the player makes multiple decisions within a single round. In Plinko you drop and watch. In Crash you pick one cashout moment. In Dice/Limbo you bet and see a result. In Mines, you make 1–24 sequential decisions, each building on the last. This creates the deepest engagement loop.

**2. The Sunk Cost Trap**
After revealing 8 gems at 3.35x, the player thinks "I've already come this far." The next gem only adds ~0.70x... but the one after adds ~1.00x, and the one after that ~2.00x. The exponentially growing "profit on next tile" creates an almost irresistible pull to keep going — this is the core addictive mechanic.

**3. Visual Storytelling**
Unlike numbers-only games (Dice, Limbo, Crash), Mines tells a VISUAL story. Each revealed tile is a character in a narrative. The board fills with green gems and the post-game reveal shows where the mines were — creating "what if" scenarios that drive replays.

**4. Configurable Volatility**
1 mine = slot machine (frequent small wins). 24 mines = lottery ticket (rare massive payoff). The same game engine serves radically different player psychologies.
