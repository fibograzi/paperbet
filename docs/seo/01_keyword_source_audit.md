# 01 — Keyword Source Audit

> Generated: 2026-03-11 | Source: `seo/master_keyword_file_final.csv` (9,066 rows)

## 1. Source Overview

| Metric | Count |
|--------|-------|
| Total keyword rows | 9,066 |
| Excluded by automated filters | 1,819 |
| Remaining after filters | 7,247 |
| Additional semantic noise (manual review) | ~549 |
| **Net actionable keywords** | **~6,698** |

### Distribution by Game (all rows)

| Game | Total KWs | Excluded | Non-excluded | Noise in non-excluded | Actionable | Actionable Volume |
|------|-----------|----------|--------------|----------------------|------------|-------------------|
| Roulette | 2,009 | 62 | 1,947 | 0 | **1,947** | 2,650,550 |
| Keno | 1,145 | 54 | 1,091 | 269 | **822** | 396,250 |
| Dice | 689 | 19 | 670 | 175 | **495** | 519,900 |
| Crash | 413 | 42 | 371 | 36 | **335** | 307,300 |
| Mines | 222 | 18 | 204 | 19 | **185** | 240,400 |
| Plinko | 215 | 14 | 201 | 0 | **201** | 1,077,000 |
| Limbo | 113 | 3 | 110 | 33 | **77** | 11,500 |
| Aviator | 64 | 1 | 63 | 0 | **63** (deferred) | 237,100 |
| HiLo | 56 | 4 | 52 | 16 | **36** | 6,250 |
| Flip | 4 | 1 | 3 | 1 | **2** | 50 |
| Blackjack | 12 | 0 | 12 | 0 | **12** (deferred) | 1,066,650 |
| Poker | 8 | 0 | 8 | 0 | **8** (deferred) | 110,650 |
| Slots | 151 | 0 | 151 | 0 | **151** (deferred) | 9,558,350 |
| Other/uncategorized | 3,954 | 1,601 | 2,353 | — | — | — |

### Distribution by Priority Tier (non-excluded)

| Tier | Count |
|------|-------|
| P1-critical | 849 |
| P2-high | 3,372 |
| P3-medium | 1,232 |
| P4-low | 989 |
| P5-backlog | 805 |

### Distribution by Intent (non-excluded)

| Intent | Count |
|--------|-------|
| Informational | 2,519 |
| Commercial | 1,304 |
| Strategy | 1,168 |
| Tool | 1,019 |
| Other | 985 |
| Navigational | 127 |
| Commercial-broad | 113 |
| Transactional | 9 |

---

## 2. Data Quality Issues Found

### 2.1 Automated Exclusions (1,819 keywords)

Top exclusion reasons by volume:

| Reason | Count | Example |
|--------|-------|---------|
| Crash Bandicoot variants | 411 | "crash bandicoot n sane trilogy" |
| Mining/GPU calculator | 283 | "mining calculator", "antminer" |
| Download keywords | 178 | "free keno games no download" |
| Antminer hardware | 95 | "antminer s19 pro" |
| Mining profitability | 66 | "bitcoin mining profitability" |
| Gold miner (game) | 63 | "gold miner game" |
| Flight simulator | 56 | "flight simulator crash" |
| Hashrate queries | 50 | "ethereum hashrate" |
| Gibberish/spam | 46 | repetitive keyword stuffing |
| Refinance | 45 | "refinance calculator" |
| Repetitive spam | 44 | only 2 unique words in 4+ word keyword |
| Minesweeper | 39 | "minesweeper online" |
| NiceHash | 35 | "nicehash calculator" |
| Idle Miner (game) | 24 | "idle miner tycoon" |
| GPU model numbers | 19 | "rtx 3080 mining" |

### 2.2 Remaining Semantic Noise (~549 keywords still in non-excluded set)

These keywords passed automated filters but are semantically irrelevant to PaperBet's casino simulator product:

#### Crash (36 remaining noise, 10% of non-excluded)
- Video game titles: "crash bash" (5K), "cats crash arena turbo stars" (5K), "crash tag team racing" (5K)
- Yandere Simulator: "yandere simulator com crash" (50)
- Generic crash: "crash n sane trilogy" (5K), "crash twinsanity" (5K)

#### Dice (175 remaining noise, 26% of non-excluded)
- **Craps keywords (different game)**: "casino craps" (5K), "craps dice" (5K), "craps game" (500K — top volume keyword, but refers to a different game entirely)
- D&D/tabletop: "dnd dice simulator" (500), "d20 dice simulator" (50), "rpg dice simulator" (50), "star wars legion dice simulator" (50)
- Python projects: "dice rolling simulator python project pdf" (50)
- Party/novelty: "sex dice simulator" (50), "yahtzee dice simulator" (50)
- Board games: "ludo" variants, "farkle" variants

#### Keno (269 remaining noise, 25% of non-excluded)
- **State lottery queries**: "keno live" (50K), "keno lotto" (50K), "club keno" (50K), "keno olg" (50K), "keno lottery" (50K)
- Lottery results: "keno winning numbers", "keno results", "daily keno results"
- Specific lottery variants: "superball keno", "caveman keno", "cleopatra keno", "four card keno"
- State-specific: "keno north carolina" (50K), "keno michigan"

#### Limbo (33 remaining noise, 30% of non-excluded)
- Video game: "inside limbo" (5K), "limbo key" (5K), "limbo nintendo switch" (500)
- Marvel: "limbo marvel" (5K)
- Literature: "dante alighieri limbo", "limbo dante's inferno" (5K)

#### Mines (19 remaining noise, 9% of non-excluded)
- Browser games: "mine blocks" (5K), "mr mine game" (5K)
- Crypto mining (missed by filters): "crypto mine calculator" still tagged as mines-tool

#### HiLo (16 remaining noise, 31% of non-excluded)
- Poker variants: "omaha hi lo" (5K), "omaha hi lo online" (50), "hi lo poker" (500)
- All Omaha/poker keywords are a different game

#### Flip (1 remaining noise, 33% of non-excluded)
- Product: "rocketbook flip" (500) — a physical notebook product

---

## 3. P1-Critical Audit

**849 total P1-critical keywords** across all games.

### P1-critical per supported game:

| Game | P1-critical KWs | Questionable in P1 |
|------|-----------------|-------------------|
| Roulette | 360 | 0 — all clean |
| Dice | 202 | ~37 (D&D dice, python projects, sex dice, yahtzee, craps) |
| Keno | 127 | ~15 (lottery-specific keno variants) |
| Aviator | 50 | All deferred (unsupported game) |
| Mines | 46 | ~5 (crypto mining, mine blocks) |
| Plinko | 44 | 0 — all clean |
| Crash | 16 | 1 ("yandere simulator com crash") |
| Limbo | 3 | 0 |
| HiLo | 1 | 0 |

**Questionable P1-critical examples:**
- `dnd dice probability calculator` (50 vol) — D&D audience, not casino
- `sex dice simulator` (50 vol) — novelty, wrong audience
- `yahtzee dice simulator` (50 vol) — board game
- `star wars legion dice simulator` (50 vol) — tabletop wargaming
- `yandere simulator com crash` (50 vol) — video game tech support
- `crypto mine calculator` (5K vol) — cryptocurrency mining, not Mines game
- `ether mine calculator` (5K vol) — Ethereum mining
- `gpu mine calculator` (5K vol) — GPU mining profitability
- `solo mine calculator` (5K vol) — solo crypto mining

---

## 4. Actionable Keyword Counts — Top 5 per Game

### Plinko (201 actionable, 1.08M volume)
| Keyword | Volume | Tier | Intent |
|---------|--------|------|--------|
| plinko | 500,000 | P2-high | informational |
| plinko game | 50,000 | P2-high | informational |
| plinko demo | 50,000 | P1-critical | tool |
| online plinko | 50,000 | P2-high | informational |
| plinko free | 50,000 | P2-high | informational |

### Crash (335 actionable, 307K volume)
| Keyword | Volume | Tier | Intent |
|---------|--------|------|--------|
| crash game | 50,000 | P2-high | informational |
| crash game prediction | 5,000–15,000 | P2-high | informational |
| crash game strategy | 3,000–8,000 | P2-high | informational |
| crash casino game | 5,000 | P2-high | commercial |
| crash gambling | 5,000 | P2-high | informational |

### Mines (185 actionable, 240K volume)
| Keyword | Volume | Tier | Intent |
|---------|--------|------|--------|
| mines game | 50,000 | P2-high | informational |
| game with mines | 50,000 | P2-high | informational |
| mines demo | 50,000 | P1-critical | tool |
| mines gamble | 5,000 | P2-high | informational |
| mines simulator | 5,000 | P1-critical | tool |

### Dice (495 actionable, 520K volume)
| Keyword | Volume | Tier | Intent |
|---------|--------|------|--------|
| dice simulator | 50,000 | P1-critical | tool |
| dice free | 50,000 | P2-high | informational |
| roll a dice 1 6 | 50,000 | P2-high | informational |
| roll two dice | 50,000 | P2-high | informational |
| dice casino | 5,000 | P2-high | commercial |

### Keno (822 actionable, 396K volume)
| Keyword | Volume | Tier | Intent |
|---------|--------|------|--------|
| keno casino | 5,000 | P2-high | commercial |
| keno online | 5,000 | P2-high | informational |
| keno go | 5,000 | P2-high | informational |
| free keno game | 5,000 | P1-critical | tool |
| keno free keno game | 5,000 | P1-critical | tool |

### HiLo (36 actionable, 6.3K volume)
| Keyword | Volume | Tier | Intent |
|---------|--------|------|--------|
| hilo game | 500 | P2-high | informational |
| hilo casino game | 500 | P2-high | commercial |
| hi lo casino game | 500 | P2-high | commercial |
| hi lo game | 500 | P2-high | informational |
| blackjack hi lo | 500 | P2-high | informational |

### Limbo (77 actionable, 11.5K volume)
| Keyword | Volume | Tier | Intent |
|---------|--------|------|--------|
| limbo game simulator | 500–1,500 | P1-critical | tool |
| limbo casino | 500 | P2-high | commercial |
| limbo casino game | 500 | P2-high | commercial |
| limbo stake | 500 | P2-high | navigational |
| stake limbo | 500 | P2-high | navigational |

### Roulette (1,947 actionable, 2.65M volume)
| Keyword | Volume | Tier | Intent |
|---------|--------|------|--------|
| roulette demo | 50,000 | P1-critical | tool |
| roulette simulator | 50,000 | P1-critical | tool |
| online roulette | 50,000 | P2-high | informational |
| free roulette | 50,000 | P2-high | informational |
| roulette wheel simulator | 50,000 | P1-critical | tool |

### Flip (2 actionable, 50 volume)
| Keyword | Volume | Tier | Intent |
|---------|--------|------|--------|
| flip stake | 50 | P2-high | navigational |
| flip gamble | 0 | P2-high | informational |

---

## 5. Recommendations

### Immediate Actions
1. **Do not target craps keywords** — "craps game" (500K volume) refers to a different game than PaperBet's Dice simulator. Flag for future product decision.
2. **Do not target lottery keno keywords** — "keno live" (50K), "club keno" (50K), "keno lottery" (50K) all refer to state lotteries, not casino keno.
3. **Remove D&D/tabletop dice keywords from targeting** — "dnd dice simulator", "rpg dice simulator", etc. are a different audience.
4. **Remove crypto mining keywords from Mines targeting** — "crypto mine calculator", "ether mine calculator" refer to cryptocurrency mining.
5. **Remove video game limbo keywords** — "inside limbo", "limbo key", "limbo marvel" are about the indie/Marvel games.

### Before Content Execution
- Apply the secondary noise patterns documented in section 2.2 to the keyword list
- Re-calculate volumes after filtering to get true addressable market per game
- Use the clean actionable keyword counts from section 4 as the basis for content planning

### Deferred Games (do not build pages)
- **Aviator**: 63 actionable KWs, 237K volume — high potential but no live game
- **Blackjack**: 12 KWs, 1.07M volume — dominated by a single head term
- **Poker**: 8 KWs, 111K volume — too few keywords for meaningful content
- **Slots**: 151 KWs, 9.56M volume — no product, and highly competitive SERP
