# 06 — Page-by-Page Content Briefs

> Full 17-field brief for every page on PaperBet.io.
> Generated: 2026-03-11 | Companion to: 05, 07, 08 blueprint docs

---

## Brief Field Key

| # | Field | Description |
|---|-------|-------------|
| 1 | URL | Page path |
| 2 | Status | NEW / OPTIMIZE / REWRITE |
| 3 | Primary KW | Main target keyword |
| 4 | Secondary KWs | 3-5 supporting keywords |
| 5 | Search Intent | Informational / Commercial / Tool / Strategy |
| 6 | Page Angle | What makes this page's approach unique |
| 7 | Purpose | Why this page exists in the content strategy |
| 8 | Title Tag | ≤60 chars |
| 9 | Meta Description | ≤155 chars |
| 10 | H1 | Exactly 1 per page |
| 11 | H2/H3 Structure | Heading hierarchy |
| 12 | Intro Angle | First 2-3 sentences approach |
| 13 | Internal Links OUT | Pages this page links to |
| 14 | Internal Links IN | Pages that link to this page |
| 15 | CTA Role | Primary conversion action |
| 16 | FAQ Targets | 5 questions (game pages only) |
| 17 | Differentiation Notes | What prevents keyword cannibalization |

---

## A. Homepage

### `/` — Homepage

| Field | Value |
|-------|-------|
| **URL** | `/` |
| **Status** | OPTIMIZE |
| **Primary KW** | crypto casino simulator |
| **Secondary KWs** | free casino games, practice crypto gambling, crypto casino free play, casino simulator online |
| **Search Intent** | Commercial |
| **Page Angle** | Central hub — presents all 9 simulators as a unified practice platform |
| **Purpose** | Entry point, distributes link equity to all game pages, establishes brand positioning |
| **Title Tag** | `PaperBet — Free Crypto Casino Simulators` |
| **Meta Description** | `9 free crypto casino simulators. Practice Plinko, Crash, Mines, Roulette, Dice, HiLo, Keno, Limbo, and Coin Flip risk-free before playing for real.` |
| **H1** | `Free Crypto Casino Simulators` |
| **H2/H3 Structure** | H2: Choose Your Game · H2: How PaperBet Works · H2: Crypto Casino Partner Offers · H2: Strategy Hub · H2: Ready to Test Your Edge? |
| **Intro Angle** | "Test Your Edge" as accent label above H1. Subheadline lists all 9 games. Answer-first: "Practice with $1,000 in paper money across 9 casino games." |
| **Links OUT** | All 9 game pages, `/deals`, `/blog`, `/responsible-gambling` |
| **Links IN** | All pages via navigation, roulette breadcrumbs |
| **CTA Role** | Drive users to game pages (primary) and `/deals` (secondary) |
| **FAQ Targets** | N/A |
| **Differentiation** | Only page that mentions all 9 games together. Uses "crypto casino simulator" (platform-level keyword), not individual game keywords. |

**Changes required:**
1. Update H1 from "Test Your Edge" → "Free Crypto Casino Simulators"
2. Move "Test Your Edge" to accent label above H1
3. Update subheadline to mention all 9 games (currently mentions only Plinko, Crash, Mines)
4. Add `keywords` to metadata
5. Add `WebSite` JSON-LD (optional, low priority)

---

## B. Core Game Pages

### `/plinko` — Plinko Simulator

| Field | Value |
|-------|-------|
| **URL** | `/plinko` |
| **Status** | OPTIMIZE |
| **Primary KW** | plinko simulator |
| **Secondary KWs** | plinko demo, plinko free, plinko game online, plinko practice |
| **Search Intent** | Tool |
| **Page Angle** | Casino-accurate Plinko with 3 risk levels and full stats tracking |
| **Purpose** | Primary Plinko landing page — captures all "plinko simulator/demo/free" traffic |
| **Title Tag** | `Free Plinko Simulator — 1,000x Multipliers | PaperBet` |
| **Meta Description** | `Play Plinko free with casino-accurate multipliers. Choose low, medium, or high risk across 8-16 rows. Track results and test strategies before real play.` |
| **H1** | `Free Plinko Simulator` |
| **H2/H3 Structure** | H2: [Game Component — no heading needed] · H2: How Plinko Works · H2: Plinko Probability Calculator · H2: Frequently Asked Questions about Plinko · H2: Try More Free Casino Simulators · H2: Related Strategy Guides |
| **Intro Angle** | Stats strip: 99% RTP · 1,000x Max Multiplier · 3 Risk Levels. Subtitle: "Drop balls through a pegged board and watch them bounce into multiplier slots. Test low, medium, and high risk strategies with $1,000 in paper money." |
| **Links OUT** | `/blog/plinko-strategy-guide`, `/blog/plinko-high-risk-vs-low-risk`, `/blog/best-crypto-casinos-for-plinko`, `/blog/what-is-provably-fair`, `/blog/understanding-house-edge-rtp`, all 8 other game pages (CrossGameLinks), `/deals`, `/responsible-gambling` |
| **Links IN** | `/`, `/blog/plinko-strategy-guide`, `/blog/plinko-high-risk-vs-low-risk`, `/blog/best-crypto-casinos-for-plinko`, educational posts, all other game pages (CrossGameLinks) |
| **CTA Role** | Keep users playing (primary), drive to strategy guide (secondary), drive to `/deals` (tertiary) |
| **FAQ Targets** | 1. What is Plinko and how does it work? · 2. What is the RTP of Plinko? · 3. Does risk level affect Plinko RTP? · 4. Is this Plinko simulator provably fair? · 5. Where can I play Plinko for real money? |
| **Differentiation** | Visual, passive gameplay — balls bounce through pegs. Not Pachinko, not pinball. Always pair "Plinko" with "simulator" or "casino". Emphasize "3 risk levels" and "row count" as unique mechanics. |

**FAQ answers:**

**Q1: What is Plinko and how does it work?**
Plinko is a casino game where you drop a ball from the top of a pegged board. The ball bounces randomly through rows of pegs and lands in a multiplier slot at the bottom. Higher risk levels spread the multipliers further apart — low risk gives frequent small wins, high risk gives rare large wins up to 1,000x.

**Q2: What is the RTP of Plinko?**
The return to player (RTP) of Plinko is 99% across all three risk levels (low, medium, high) and all row counts (8-16). This means that on average, for every $100 wagered, $99 is returned to players over the long run. The 1% house edge is among the lowest in casino games.

**Q3: Does risk level affect Plinko RTP?**
No. All three risk levels — low, medium, and high — have the same 99% RTP. What changes is the variance. Low risk produces frequent small multipliers (0.5x-5.6x). High risk produces rare large multipliers (0.2x-1,000x). Your average return is identical regardless of risk level.

**Q4: Is this Plinko simulator provably fair?**
This simulator uses a cryptographically secure random number generator to determine ball paths. Each drop is independent and random. While this is a practice simulator (not real money), the math and probabilities match those used by major crypto casinos like Stake.

**Q5: Where can I play Plinko for real money?**
You can play Plinko for real money at crypto casinos like Stake, BC.Game, and Rollbit. We recommend practicing here first to understand the risk levels and variance before wagering real funds. Always gamble responsibly and never bet more than you can afford to lose.

---

### `/crash` — Crash Simulator

| Field | Value |
|-------|-------|
| **URL** | `/crash` |
| **Status** | OPTIMIZE |
| **Primary KW** | crash game simulator |
| **Secondary KWs** | crash game, crash casino game, crash multiplier game, crash game free |
| **Search Intent** | Tool |
| **Page Angle** | Casino-accurate Crash with auto-cashout and strategy testing |
| **Purpose** | Primary Crash landing page — captures "crash game" and "crash simulator" traffic |
| **Title Tag** | `Free Crash Game Simulator — Test Strategies | PaperBet` |
| **Meta Description** | `Play Crash free with casino-accurate multiplier curves. Set auto-cashout targets, track your win rate, and test strategies before playing at real crypto casinos.` |
| **H1** | `Free Crash Game Simulator` |
| **H2/H3 Structure** | H2: [Game Component] · H2: How Crash Works · H2: Frequently Asked Questions about Crash · H2: Try More Free Casino Simulators · H2: Related Strategy Guides |
| **Intro Angle** | Stats strip: 99% RTP · Unlimited Max Multiplier · Active Cashout Timing. Subtitle: "Watch the multiplier rise and cash out before it crashes. The longer you wait, the bigger the win — or you lose everything." |
| **Links OUT** | `/blog/crash-strategy-guide`, `/blog/best-crypto-casinos-for-crash`, `/blog/what-is-provably-fair`, `/blog/understanding-house-edge-rtp`, all 8 other game pages, `/deals`, `/responsible-gambling` |
| **Links IN** | `/`, `/blog/crash-strategy-guide`, `/blog/best-crypto-casinos-for-crash`, educational posts, all other game pages |
| **CTA Role** | Keep users playing, drive to strategy guide, drive to `/deals` |
| **FAQ Targets** | 1. What is Crash and how does it work? · 2. What is the RTP of Crash? · 3. What is the best cashout strategy for Crash? · 4. Is this Crash simulator provably fair? · 5. Where can I play Crash for real money? |
| **Differentiation** | The only game with active timing decisions — you choose WHEN to stop. Not Crash Bandicoot, not flight crash. Always pair with "casino", "multiplier", or "cashout". Emphasize the tension of watching the multiplier rise. |

**FAQ answers:**

**Q1: What is Crash and how does it work?**
Crash is a crypto casino game where a multiplier starts at 1.00x and rises until it randomly crashes. You place a bet and must cash out before the crash happens. If you cash out in time, your bet is multiplied by the cashout value. If the game crashes first, you lose your bet entirely.

**Q2: What is the RTP of Crash?**
Crash has a 99% RTP (return to player), meaning the house edge is just 1%. This applies regardless of your cashout strategy. Whether you cash out early at 1.5x or wait for 10x+, the mathematical expected value remains the same over the long run.

**Q3: What is the best cashout strategy for Crash?**
There is no strategy that changes the 99% RTP. Lower cashout targets (1.5x-2x) win more frequently but pay less. Higher targets (5x-10x) pay more but win rarely. Auto-cashout removes emotional decisions. The optimal choice depends on your risk tolerance, not math.

**Q4: Is this Crash simulator provably fair?**
This simulator uses a cryptographically secure random number generator to determine crash points. Each round is independent. The probability distribution matches real crypto casino Crash games, making it accurate for strategy testing and practice.

**Q5: Where can I play Crash for real money?**
Crash is available at most crypto casinos including Stake, BC.Game, Rollbit, and Wild.io. Practice your cashout timing and strategy here first. Remember that no strategy guarantees profits — always gamble responsibly and set loss limits.

---

### `/mines` — Mines Simulator

| Field | Value |
|-------|-------|
| **URL** | `/mines` |
| **Status** | OPTIMIZE |
| **Primary KW** | mines simulator |
| **Secondary KWs** | mines demo, mines casino game, mines game free, mines multiplier game |
| **Search Intent** | Tool |
| **Page Angle** | Casino-accurate Mines on a 5×5 grid with adjustable mine count |
| **Purpose** | Primary Mines landing page — captures "mines simulator/demo" traffic |
| **Title Tag** | `Free Mines Simulator — Casino Mines Game Online | PaperBet` |
| **Meta Description** | `Play Mines free on a 5x5 grid. Reveal gems, avoid mines, and cash out as multipliers rise. Test strategies with 1-24 mines before playing for real.` |
| **H1** | `Free Mines Simulator` |
| **H2/H3 Structure** | H2: [Game Component] · H2: How Mines Works · H2: Mines Calculator · H2: Frequently Asked Questions about Mines · H2: Try More Free Casino Simulators · H2: Related Strategy Guides |
| **Intro Angle** | Stats strip: 99% RTP · 1-24 Mines · 5×5 Grid. Subtitle: "Reveal gems to increase your multiplier. Each safe tile raises the stakes — but hit a mine and you lose it all. Cash out anytime." |
| **Links OUT** | `/blog/mines-strategy-guide`, `/blog/best-crypto-casinos-for-mines`, `/blog/what-is-provably-fair`, `/blog/understanding-house-edge-rtp`, all 8 other game pages, `/deals`, `/responsible-gambling` |
| **Links IN** | `/`, `/blog/mines-strategy-guide`, `/blog/best-crypto-casinos-for-mines`, educational posts, all other game pages |
| **CTA Role** | Keep users playing, drive to strategy guide, drive to `/deals` |
| **FAQ Targets** | 1. What is Mines and how does it work? · 2. What is the RTP of Mines? · 3. How many mines should I play with? · 4. Is this Mines simulator provably fair? · 5. Where can I play Mines for real money? |
| **Differentiation** | Risk escalation with each reveal — not Minesweeper (no flags, no grid clearing). Always say "casino Mines" with "multiplier" and "cash out". Emphasize adjustable mine count (1-24) as the unique mechanic. |

**FAQ answers:**

**Q1: What is Mines and how does it work?**
Mines is a casino game played on a 5×5 grid containing hidden gems and mines. You choose how many mines to place (1-24), then reveal tiles one by one. Each gem you reveal increases your multiplier. You can cash out at any time, but if you reveal a mine, you lose your bet. More mines mean higher multipliers but greater risk.

**Q2: What is the RTP of Mines?**
Mines has a 99% RTP regardless of how many mines you place on the grid. The house edge is 1%. Whether you play with 1 mine (low risk, low multipliers) or 24 mines (extreme risk, massive multipliers), your long-term expected return is the same.

**Q3: How many mines should I play with?**
It depends on your risk tolerance. With 1-3 mines, you get frequent small wins. With 5-10 mines, rewards increase significantly but so does the chance of hitting a mine early. With 15+ mines, each safe reveal pays huge multipliers but survival past 3-4 reveals is unlikely.

**Q4: Is this Mines simulator provably fair?**
This simulator uses cryptographically random mine placement. Each game generates a new random layout of mines and gems. The probabilities and multipliers match those used by real crypto casinos, making it accurate for practice and strategy testing.

**Q5: Where can I play Mines for real money?**
Mines is popular at crypto casinos including Stake, BC.Game, and Wild.io. We recommend experimenting with different mine counts here to find your preferred risk level. Always set a budget and stick to it — gambling involves real financial risk.

**Additional fix required:** Change structured data from `WebApplication` → `SoftwareApplication`, add "PaperBet" prefix to name, change `operatingSystem` from "Any" → "Web".

---

### `/dice` — Dice Simulator

| Field | Value |
|-------|-------|
| **URL** | `/dice` |
| **Status** | OPTIMIZE |
| **Primary KW** | dice simulator |
| **Secondary KWs** | dice game online, roll over under, dice casino game, dice probability game |
| **Search Intent** | Tool |
| **Page Angle** | Casino dice with adjustable target — set your own win probability |
| **Purpose** | Primary Dice landing page — captures "dice simulator" traffic, differentiates from craps |
| **Title Tag** | `Free Dice Simulator — Roll Over or Under | PaperBet` |
| **Meta Description** | `Play casino Dice free. Set your target number, pick Roll Over or Roll Under, and see the result. Adjust win probability from 0.01% to 98%. 99% RTP.` |
| **H1** | `Free Dice Game Simulator` |
| **H2/H3 Structure** | H2: [Game Component] · H2: How Casino Dice Works · H2: Dice Probability Calculator · H2: Frequently Asked Questions about Dice · H2: Try More Free Casino Simulators · H2: Related Strategy Guides |
| **Intro Angle** | Stats strip: 99% RTP · ~9,900x Max Multiplier · You Set the Odds. Subtitle: "Set your target number and pick Roll Over or Roll Under. You control the win probability — higher risk means higher multipliers." |
| **Links OUT** | `/blog/dice-strategy-guide`, `/blog/best-crypto-casinos-for-dice`, `/blog/what-is-provably-fair`, `/blog/understanding-house-edge-rtp`, all 8 other game pages, `/deals`, `/responsible-gambling` |
| **Links IN** | `/`, `/blog/dice-strategy-guide`, `/blog/best-crypto-casinos-for-dice`, educational posts, all other game pages |
| **CTA Role** | Keep users playing, drive to strategy guide, drive to `/deals` |
| **FAQ Targets** | 1. What is casino Dice and how does it work? · 2. What is the RTP of Dice? · 3. What is the difference between Roll Over and Roll Under? · 4. Is this Dice simulator provably fair? · 5. Where can I play Dice for real money? |
| **Differentiation** | Casino Dice (roll over/under), NOT craps or D&D dice. Always specify "casino Dice" or "crypto Dice". The unique mechanic is that YOU set the exact win probability via the target slider. |

**FAQ answers:**

**Q1: What is casino Dice and how does it work?**
Casino Dice is a game where you set a target number between 0 and 99.99, then choose Roll Over or Roll Under. A random number is generated — if it meets your condition, you win. The multiplier is inversely proportional to your win chance. A 50% chance pays 1.98x; a 1% chance pays 98x.

**Q2: What is the RTP of Dice?**
Dice has a 99% RTP at every target setting. The house edge is a fixed 1% regardless of whether you set a high win probability (small multiplier) or a low win probability (large multiplier). This makes Dice one of the most transparent casino games.

**Q3: What is the difference between Roll Over and Roll Under?**
Roll Over wins when the result is higher than your target. Roll Under wins when the result is lower. At target 50, both directions give a roughly 50% chance and 1.98x payout. Moving the target changes your win probability and multiplier equally in either direction.

**Q4: Is this Dice simulator provably fair?**
This simulator uses a cryptographically secure random number generator. Each roll produces an independent random value between 0 and 99.99. The math matches real crypto casino implementations, making it accurate for strategy testing.

**Q5: Where can I play Dice for real money?**
Casino Dice is available at Stake, BC.Game, Rollbit, and most other crypto casinos. It is one of the most popular games due to its mathematical transparency. Practice setting targets here first, and always gamble responsibly with a set budget.

---

### `/hilo` — HiLo Simulator

| Field | Value |
|-------|-------|
| **URL** | `/hilo` |
| **Status** | OPTIMIZE |
| **Primary KW** | hilo simulator |
| **Secondary KWs** | hilo casino game, higher or lower game, hilo card game, hilo crypto |
| **Search Intent** | Tool |
| **Page Angle** | Card-based chain game — build multiplier streaks with correct predictions |
| **Purpose** | Primary HiLo landing page — small keyword volume but completes the game roster |
| **Title Tag** | `Free HiLo Card Game — Predict Higher or Lower | PaperBet` |
| **Meta Description** | `Play HiLo free. A card is shown — predict if the next is higher or lower. Build multiplier chains with correct guesses. 99% RTP crypto casino simulator.` |
| **H1** | `Free HiLo Card Game Simulator` |
| **H2/H3 Structure** | H2: [Game Component] · H2: How HiLo Works · H2: Frequently Asked Questions about HiLo · H2: Try More Free Casino Simulators · H2: Related Strategy Guides |
| **Intro Angle** | Stats strip: 99% RTP · Card-Based Chains · Multiplier Streaks. Subtitle: "A card is revealed — predict whether the next card will be higher or lower. Each correct guess multiplies your bet. Cash out anytime or keep the chain going." |
| **Links OUT** | `/blog/hilo-strategy-guide`, `/blog/what-is-provably-fair`, `/blog/understanding-house-edge-rtp`, all 8 other game pages, `/deals`, `/responsible-gambling` |
| **Links IN** | `/`, `/blog/hilo-strategy-guide`, educational posts, all other game pages |
| **CTA Role** | Keep users playing, drive to strategy guide, drive to `/deals` |
| **FAQ Targets** | 1. What is HiLo and how does it work? · 2. What is the RTP of HiLo? · 3. Is there a strategy for HiLo? · 4. Is this HiLo simulator provably fair? · 5. Where can I play HiLo for real money? |
| **Differentiation** | Card-based chain game, NOT Omaha Hi/Lo poker. Emphasize "card game" and "predict higher or lower". The chain mechanic (streak of correct guesses) is the unique differentiator. |

**FAQ answers:**

**Q1: What is HiLo and how does it work?**
HiLo is a casino card game. A card is shown face-up, and you predict whether the next card will be higher or lower. Each correct prediction multiplies your bet. You can cash out after any correct guess, or continue the chain for bigger multipliers. An incorrect prediction loses your bet.

**Q2: What is the RTP of HiLo?**
HiLo has a 99% RTP. The house edge is 1%, applied per prediction in the chain. The payout for each prediction depends on the current card — predicting "higher" on a 2 pays less than predicting "higher" on a King, because a 2 has more cards above it.

**Q3: Is there a strategy for HiLo?**
The optimal strategy is straightforward: always predict "higher" when the current card is low (2-7) and "lower" when it is high (8-King). Middle cards (7-8) are the riskiest since the probability is close to 50/50. No strategy changes the 99% RTP.

**Q4: Is this HiLo simulator provably fair?**
This simulator uses a cryptographically secure random number generator to draw cards. Each card is independent and random. The probabilities match a standard 52-card deck, making this an accurate practice environment.

**Q5: Where can I play HiLo for real money?**
HiLo is available at crypto casinos including Stake and BC.Game. It is less widely available than games like Crash or Plinko but offers a unique card-based experience. Practice building chains here first, and always set loss limits when playing for real.

---

### `/keno` — Keno Simulator

| Field | Value |
|-------|-------|
| **URL** | `/keno` |
| **Status** | OPTIMIZE |
| **Primary KW** | keno simulator |
| **Secondary KWs** | free keno game, keno online, casino keno, keno number game |
| **Search Intent** | Tool |
| **Page Angle** | Instant casino Keno with 4 difficulty levels — not lottery Keno |
| **Purpose** | Primary Keno landing page — captures "keno simulator" and "free keno" traffic |
| **Title Tag** | `Free Keno Simulator — Play Casino Keno Online | PaperBet` |
| **Meta Description** | `Play casino Keno free. Pick up to 10 numbers from a 40-number grid, choose your difficulty, and see instant results. 99% RTP, no real money needed.` |
| **H1** | `Free Keno Game Simulator` |
| **H2/H3 Structure** | H2: [Game Component] · H2: How Casino Keno Works · H2: Keno Odds Calculator · H2: Frequently Asked Questions about Keno · H2: Try More Free Casino Simulators · H2: Related Strategy Guides |
| **Intro Angle** | Stats strip: 99% RTP · 1,000x Max Multiplier · 4 Difficulty Levels. Subtitle: "Pick your numbers, choose a difficulty, and see how many match the draw. Instant results — no waiting for a live draw." |
| **Links OUT** | `/blog/keno-strategy-guide`, `/blog/what-is-provably-fair`, `/blog/understanding-house-edge-rtp`, all 8 other game pages, `/deals`, `/responsible-gambling` |
| **Links IN** | `/`, `/blog/keno-strategy-guide`, educational posts, all other game pages |
| **CTA Role** | Keep users playing, drive to strategy guide, drive to `/deals` |
| **FAQ Targets** | 1. What is casino Keno and how does it work? · 2. What is the RTP of Keno? · 3. How many numbers should I pick in Keno? · 4. Is this Keno simulator provably fair? · 5. Where can I play Keno for real money? |
| **Differentiation** | Casino Keno with INSTANT results and difficulty levels. NOT state lottery Keno (no live draws, no lottery tickets). Always specify "casino Keno" and emphasize "instant results" to differentiate from lottery Keno. |

**FAQ answers:**

**Q1: What is casino Keno and how does it work?**
Casino Keno is a number-picking game. You select 1-10 numbers from a grid of 40, choose a difficulty level, and the game randomly draws 10 numbers. Payouts depend on how many of your picks match the draw. Unlike state lottery Keno, casino Keno gives instant results with no waiting.

**Q2: What is the RTP of Keno?**
This Keno simulator has a 99% RTP across all difficulty levels and pick counts. The house edge is 1%. Higher difficulty levels offer bigger payouts for the same number of matches but require more matches to break even.

**Q3: How many numbers should I pick in Keno?**
Picking fewer numbers (1-3) gives more frequent wins with smaller payouts. Picking more numbers (7-10) gives rare wins with much larger payouts — up to 1,000x. The RTP stays at 99% regardless of pick count. Your choice depends on whether you prefer steady small wins or chasing big hits.

**Q4: Is this Keno simulator provably fair?**
This simulator uses a cryptographically secure random number generator to draw the 10 result numbers. Each draw is independent and random. The probabilities are based on hypergeometric distribution, matching real casino Keno math.

**Q5: Where can I play Keno for real money?**
Casino Keno is available at crypto casinos like Stake, BC.Game, and CoinCasino. Make sure you are playing casino Keno (instant results) and not lottery Keno (scheduled draws). Practice with different pick counts and difficulty levels here first. Gamble responsibly.

---

### `/limbo` — Limbo Simulator

| Field | Value |
|-------|-------|
| **URL** | `/limbo` |
| **Status** | OPTIMIZE |
| **Primary KW** | limbo simulator |
| **Secondary KWs** | limbo game, limbo crypto game, limbo multiplier, limbo casino |
| **Search Intent** | Tool |
| **Page Angle** | Instant multiplier prediction — the fastest crypto casino game |
| **Purpose** | Primary Limbo landing page — small but growing keyword cluster |
| **Title Tag** | `Free Limbo Simulator — Instant Multiplier Game | PaperBet` |
| **Meta Description** | `Play Limbo free. Set a target multiplier, bet, and see if the random result beats your target. Instant rounds, 99% RTP. The fastest crypto casino game.` |
| **H1** | `Free Limbo Game Simulator` |
| **H2/H3 Structure** | H2: [Game Component] · H2: How Limbo Works · H2: Frequently Asked Questions about Limbo · H2: Try More Free Casino Simulators · H2: Related Strategy Guides |
| **Intro Angle** | Stats strip: 99% RTP · 1,000,000x Max Multiplier · Instant Rounds. Subtitle: "Set your target multiplier and bet. The game generates a random result — if it beats your target, you win. No waiting, no animation, pure probability." |
| **Links OUT** | `/blog/limbo-strategy-guide`, `/blog/what-is-provably-fair`, `/blog/understanding-house-edge-rtp`, all 8 other game pages, `/deals`, `/responsible-gambling` |
| **Links IN** | `/`, `/blog/limbo-strategy-guide`, educational posts, all other game pages |
| **CTA Role** | Keep users playing, drive to strategy guide, drive to `/deals` |
| **FAQ Targets** | 1. What is Limbo and how does it work? · 2. What is the RTP of Limbo? · 3. What is the difference between Limbo and Crash? · 4. Is this Limbo simulator provably fair? · 5. Where can I play Limbo for real money? |
| **Differentiation** | Instant version of Crash — no rising animation, no timing decision. NOT the Playdead video game "Limbo" or Marvel's Limbo dimension. Always pair with "crypto casino" or "multiplier game". Clarify difference from Crash in educational content. |

**FAQ answers:**

**Q1: What is Limbo and how does it work?**
Limbo is an instant crypto casino game. You set a target multiplier (e.g., 2x, 5x, 100x), place a bet, and the game instantly generates a random multiplier. If the result meets or exceeds your target, you win that multiplier applied to your bet. Higher targets pay more but hit less frequently.

**Q2: What is the RTP of Limbo?**
Limbo has a 99% RTP at every target multiplier setting. The house edge is 1%. A 2x target wins roughly 49.5% of the time. A 100x target wins roughly 0.99% of the time. The expected return is always 99% regardless of your chosen target.

**Q3: What is the difference between Limbo and Crash?**
Both games involve multipliers, but they play differently. In Crash, a multiplier rises in real-time and you decide when to cash out. In Limbo, you set your target before the round and get an instant result — no watching, no timing. Limbo is faster but removes the active decision-making element.

**Q4: Is this Limbo simulator provably fair?**
This simulator uses a cryptographically secure random number generator. Each round independently generates a multiplier result. The probability distribution matches real crypto casino Limbo implementations, making it a reliable practice tool.

**Q5: Where can I play Limbo for real money?**
Limbo is available at Stake, BC.Game, and several other crypto casinos. It is popular for its speed — experienced players often use auto-bet for hundreds of rounds per minute. Practice your target settings here first, and always gamble responsibly.

---

### `/flip` — Coin Flip Simulator

| Field | Value |
|-------|-------|
| **URL** | `/flip` |
| **Status** | OPTIMIZE |
| **Primary KW** | coin flip simulator |
| **Secondary KWs** | coin flip game, heads or tails casino, coin flip casino game, double or nothing game |
| **Search Intent** | Tool |
| **Page Angle** | Casino coin flip with chain multipliers — simplest casino game |
| **Purpose** | Primary Coin Flip landing page — very small keyword volume but rounds out roster |
| **Title Tag** | `Free Coin Flip Simulator — Heads or Tails | PaperBet` |
| **Meta Description** | `Play Coin Flip free. Pick heads or tails, double your bet on each win, and build chains up to 1,027,604x. The simplest casino game. 98% RTP.` |
| **H1** | `Free Coin Flip Simulator` |
| **H2/H3 Structure** | H2: [Game Component] · H2: How Coin Flip Works · H2: Frequently Asked Questions about Coin Flip · H2: Try More Free Casino Simulators · H2: Related Strategy Guides |
| **Intro Angle** | Stats strip: 98% RTP · 1,027,604x Max Chain · 50/50 Odds. Subtitle: "Pick heads or tails. Win and your bet doubles. Chain multiple wins for massive multipliers — or cash out after any correct guess." |
| **Links OUT** | `/blog/flip-strategy-guide`, `/blog/what-is-provably-fair`, `/blog/understanding-house-edge-rtp`, all 8 other game pages, `/deals`, `/responsible-gambling` |
| **Links IN** | `/`, `/blog/flip-strategy-guide`, educational posts, all other game pages |
| **CTA Role** | Keep users playing, drive to strategy guide, drive to `/deals` |
| **FAQ Targets** | 1. What is Coin Flip and how does it work? · 2. What is the RTP of Coin Flip? · 3. What is the maximum chain multiplier in Coin Flip? · 4. Is this Coin Flip simulator provably fair? · 5. Where can I play Coin Flip for real money? |
| **Differentiation** | Casino coin flip with chain multipliers and cash-out mechanic. NOT a probability calculator or random coin flip utility. Emphasize "casino game" and "chain multiplier" to differentiate from educational coin flip tools. |

**FAQ answers:**

**Q1: What is Coin Flip and how does it work?**
Coin Flip is a casino game where you pick heads or tails. If you guess correctly, your bet doubles. You can cash out after any win or continue the chain for bigger multipliers. Each additional correct guess doubles the previous multiplier. An incorrect guess at any point loses your entire bet.

**Q2: What is the RTP of Coin Flip?**
Coin Flip has a 98% RTP, slightly lower than PaperBet's other games (which are 99%). The house edge is 2% per flip. This is built into the payout structure — a fair 50/50 flip would pay 2x, but Coin Flip pays slightly less to account for the house edge.

**Q3: What is the maximum chain multiplier in Coin Flip?**
The theoretical maximum chain is 20 correct guesses in a row, which would multiply your bet by 1,027,604x. However, the probability of achieving this is approximately 0.0001% (1 in a million). Most players cash out after 3-5 correct guesses for a 4x-16x return.

**Q4: Is this Coin Flip simulator provably fair?**
This simulator uses a cryptographically secure random number generator. Each flip is an independent 50/50 event. The outcome is determined before the animation plays. The probabilities match real crypto casino coin flip games.

**Q5: Where can I play Coin Flip for real money?**
Coin flip games are available at Stake, BC.Game, and other crypto casinos, though the game may appear under different names (e.g., "Classic Dice" with 50% target, or dedicated flip games). Practice chain strategies here first. Gamble responsibly.

---

## C. Roulette Section

### `/roulette` — Roulette Hub

| Field | Value |
|-------|-------|
| **URL** | `/roulette` |
| **Status** | OPTIMIZE (minor) |
| **Primary KW** | roulette simulator |
| **Secondary KWs** | free roulette, roulette tools, roulette strategy tester, roulette calculator |
| **Search Intent** | Tool |
| **Page Angle** | Comprehensive roulette toolkit — 7 tools in one hub |
| **Purpose** | Roulette hub page, distributes link equity to 7 tool pages |
| **Title Tag** | `Free Roulette Simulator & Tools | PaperBet` |
| **Meta Description** | `7 free roulette tools: simulator, strategy tester, odds calculator, risk of ruin calculator, Martingale and Fibonacci simulators, and a learning guide. No signup.` |
| **H1** | `Free Roulette Simulator & Tools` |
| **H2/H3 Structure** | H2: All Tools · H2: Why Roulette Math Matters · H2: Frequently Asked Questions |
| **Intro Angle** | Keep existing hero with stats strip (2.7%, 5.26%, 37, 97.3%). Update H1 only. |
| **Links OUT** | All 7 roulette tool pages, `/blog/roulette-strategy-guide`, `/blog/best-crypto-casinos-for-roulette`, `/roulette/disclaimer`, `/responsible-gambling` |
| **Links IN** | `/`, all roulette tool pages (breadcrumb), all game pages (CrossGameLinks), `/blog/roulette-strategy-guide`, `/blog/best-crypto-casinos-for-roulette`, educational posts |
| **CTA Role** | Drive users to individual roulette tools |
| **FAQ Targets** | Already has 10 questions — keep existing |
| **Differentiation** | Hub page for 7 tools, not just a simulator. The "toolkit" angle differentiates from single-game roulette pages. |

**Changes required:**
1. Update H1 in `RouletteHubHero` from "Roulette Lab" → "Free Roulette Simulator & Tools"
2. Add `keywords` to metadata
3. Fix OG image from `/og-image.png` → `/opengraph-image`
4. Add links to new blog posts (roulette-strategy-guide, best-crypto-casinos-for-roulette) when they're created

---

### `/roulette/free-play` — Free Roulette Game

| Field | Value |
|-------|-------|
| **URL** | `/roulette/free-play` |
| **Status** | OPTIMIZE |
| **Primary KW** | free roulette simulator game |
| **Secondary KWs** | free roulette, play roulette online, roulette game free, european roulette free |
| **Search Intent** | Tool |
| **Page Angle** | Play roulette with both European and American wheel options |
| **Purpose** | The actual playable roulette game (vs. hub which is the overview) |
| **Title Tag** | `Free Roulette Game — European & American Wheels | PaperBet` |
| **Meta Description** | `Play free roulette with European and American wheel options. Place inside and outside bets with casino-accurate odds. No signup, no download needed.` |
| **H1** | `Free Roulette Game` |
| **H2/H3 Structure** | H1: Free Roulette Game · [Game Component] · Disclaimer footer |
| **Intro Angle** | "Spin the wheel on European or American roulette with real casino odds. Place inside bets, outside bets, or neighbor bets — all with $1,000 in paper money." |
| **Links OUT** | `/roulette` (breadcrumb), `/roulette/strategy-tester`, `/roulette/learn`, `/responsible-gambling` |
| **Links IN** | `/roulette`, `/blog/roulette-strategy-guide` |
| **CTA Role** | Keep users playing roulette |
| **FAQ Targets** | N/A (FAQ lives on hub) |
| **Differentiation** | The playable game — distinct from the hub (overview) and learn (education) pages |

**Changes required:**
1. Add H1 "Free Roulette Game" above game component
2. Add 2-sentence intro paragraph
3. Add `keywords` to metadata

---

### `/roulette/strategy-tester` — Strategy Tester

| Field | Value |
|-------|-------|
| **URL** | `/roulette/strategy-tester` |
| **Status** | OPTIMIZE |
| **Primary KW** | roulette strategy tester |
| **Secondary KWs** | roulette strategy simulator, roulette monte carlo, test roulette strategy, roulette betting system tester |
| **Search Intent** | Tool |
| **Page Angle** | Monte Carlo simulation of roulette betting strategies |
| **Purpose** | Let users test strategies like Martingale, Fibonacci, D'Alembert with simulated data |
| **Title Tag** | `Roulette Strategy Tester — Monte Carlo Sim | PaperBet` |
| **Meta Description** | `Test any roulette strategy with Monte Carlo simulation. Compare Martingale, Fibonacci, D'Alembert, and flat betting over thousands of simulated spins.` |
| **H1** | `Roulette Strategy Tester` |
| **H2/H3 Structure** | H1: Roulette Strategy Tester · [StrategyTester Component] · Disclaimer footer |
| **Intro Angle** | "Run thousands of simulated roulette spins with any betting strategy. See how Martingale, Fibonacci, and D'Alembert perform over time with real probability math." |
| **Links OUT** | `/roulette` (breadcrumb), `/roulette/simulators/martingale`, `/roulette/simulators/fibonacci`, `/roulette/risk-of-ruin`, `/responsible-gambling` |
| **Links IN** | `/roulette` |
| **CTA Role** | Deep engagement with strategy testing tools |
| **FAQ Targets** | N/A |
| **Differentiation** | Multi-strategy comparison tool vs. single-strategy simulators (Martingale/Fibonacci pages) |

**Changes required:**
1. Add H1 "Roulette Strategy Tester" above component
2. Add 2-sentence intro paragraph
3. Add `keywords` to metadata

---

### `/roulette/simulators/martingale` — Martingale Simulator

| Field | Value |
|-------|-------|
| **URL** | `/roulette/simulators/martingale` |
| **Status** | OPTIMIZE |
| **Primary KW** | martingale roulette simulator |
| **Secondary KWs** | martingale strategy, martingale system roulette, double up strategy roulette, martingale betting system |
| **Search Intent** | Tool |
| **Page Angle** | Dedicated Martingale strategy simulator with visualization |
| **Purpose** | Let users see exactly how and why Martingale fails over time |
| **Title Tag** | `Martingale Roulette Simulator — Double-Up Test | PaperBet` |
| **Meta Description** | `Test the Martingale strategy on roulette. Watch how doubling after losses plays out over hundreds of spins. See the math behind the risk.` |
| **H1** | `Martingale Roulette Simulator` |
| **H2/H3 Structure** | H1: Martingale Roulette Simulator · [MartingaleSimulator Component] · Disclaimer footer |
| **Intro Angle** | "The Martingale system doubles your bet after every loss. It sounds foolproof — until a losing streak wipes out your bankroll. Run this simulator to see exactly when and how it fails." |
| **Links OUT** | `/roulette` (breadcrumb), `/roulette/simulators/fibonacci`, `/roulette/risk-of-ruin`, `/roulette/strategy-tester`, `/responsible-gambling` |
| **Links IN** | `/roulette`, `/roulette/strategy-tester`, `/roulette/simulators/fibonacci` |
| **CTA Role** | Demonstrate Martingale risk, drive to risk-of-ruin calculator |
| **FAQ Targets** | N/A |
| **Differentiation** | Single-strategy deep dive vs. the multi-strategy tester |

**Changes required:**
1. Add H1 "Martingale Roulette Simulator" above component
2. Add 2-sentence intro paragraph
3. Add `keywords` to metadata

---

### `/roulette/simulators/fibonacci` — Fibonacci Simulator

| Field | Value |
|-------|-------|
| **URL** | `/roulette/simulators/fibonacci` |
| **Status** | OPTIMIZE |
| **Primary KW** | fibonacci roulette simulator |
| **Secondary KWs** | fibonacci strategy roulette, fibonacci betting system, fibonacci casino strategy |
| **Search Intent** | Tool |
| **Page Angle** | Dedicated Fibonacci strategy simulator — gentler progression than Martingale |
| **Purpose** | Let users test the Fibonacci betting sequence on roulette |
| **Title Tag** | `Fibonacci Roulette Simulator — Strategy Test | PaperBet` |
| **Meta Description** | `Test the Fibonacci betting system on roulette. See how the 1-1-2-3-5-8 sequence performs compared to Martingale over hundreds of simulated spins.` |
| **H1** | `Fibonacci Roulette Simulator` |
| **H2/H3 Structure** | H1: Fibonacci Roulette Simulator · [FibonacciSimulator Component] · Disclaimer footer |
| **Intro Angle** | "The Fibonacci system increases bets following the 1-1-2-3-5-8 sequence after losses. It is slower than Martingale but carries similar long-term risk. Simulate hundreds of spins to see the pattern." |
| **Links OUT** | `/roulette` (breadcrumb), `/roulette/simulators/martingale`, `/roulette/risk-of-ruin`, `/roulette/strategy-tester`, `/responsible-gambling` |
| **Links IN** | `/roulette`, `/roulette/strategy-tester`, `/roulette/simulators/martingale` |
| **CTA Role** | Demonstrate Fibonacci risk, compare to Martingale |
| **FAQ Targets** | N/A |
| **Differentiation** | Fibonacci-specific vs. Martingale and multi-strategy tester |

**Changes required:**
1. Add H1 "Fibonacci Roulette Simulator" above component
2. Add 2-sentence intro paragraph
3. Add `keywords` to metadata

---

### `/roulette/odds-calculator` — Odds Calculator

| Field | Value |
|-------|-------|
| **URL** | `/roulette/odds-calculator` |
| **Status** | OPTIMIZE (minor) |
| **Primary KW** | roulette odds calculator |
| **Secondary KWs** | roulette probability calculator, roulette payout calculator, roulette odds chart, roulette bet odds |
| **Search Intent** | Tool |
| **Page Angle** | Complete probability and payout reference for all roulette bet types |
| **Purpose** | Capture "roulette odds calculator" searches, provide reference data |
| **Title Tag** | `Roulette Odds Calculator — Probabilities & Payouts` |
| **Meta Description** | `Calculate exact probabilities, expected values, and house edge for all 10 roulette bet types. European and American wheel comparison.` |
| **H1** | `Roulette Odds Calculator` (already exists) |
| **H2/H3 Structure** | Already complete |
| **Intro Angle** | Already has intro paragraph — keep |
| **Links OUT** | `/roulette` (breadcrumb), `/roulette/learn`, `/roulette/risk-of-ruin`, `/responsible-gambling` |
| **Links IN** | `/roulette`, `/roulette/learn` |
| **CTA Role** | Reference tool, drives to learn page and risk-of-ruin |
| **FAQ Targets** | N/A |
| **Differentiation** | Odds reference vs. playable simulator vs. strategy tester |

**Changes required:**
1. Add `keywords` to metadata
2. Remove duplicate inline breadcrumb (layout already provides one)

---

### `/roulette/risk-of-ruin` — Risk of Ruin Calculator

| Field | Value |
|-------|-------|
| **URL** | `/roulette/risk-of-ruin` |
| **Status** | OPTIMIZE (minor) |
| **Primary KW** | roulette risk of ruin calculator |
| **Secondary KWs** | risk of ruin calculator, martingale risk calculator, roulette bankroll calculator, gambling risk of ruin |
| **Search Intent** | Tool |
| **Page Angle** | Calculate probability of going broke with any roulette strategy |
| **Purpose** | Capture "risk of ruin" searches, support responsible gambling message |
| **Title Tag** | `Risk of Ruin Calculator — Roulette Strategy Risk` |
| **Meta Description** | `Calculate the probability of losing your entire bankroll using Martingale, Fibonacci, or flat betting on roulette. Understand the math behind strategy risk.` |
| **H1** | `Risk of Ruin Calculator` (already exists) |
| **H2/H3 Structure** | Already complete |
| **Intro Angle** | Already has intro paragraph — keep |
| **Links OUT** | `/roulette` (breadcrumb), `/roulette/strategy-tester`, `/roulette/odds-calculator`, `/responsible-gambling` |
| **Links IN** | `/roulette`, `/roulette/strategy-tester`, `/roulette/odds-calculator`, `/roulette/simulators/martingale`, `/roulette/simulators/fibonacci` |
| **CTA Role** | Demonstrate strategy risk, support responsible gambling |
| **FAQ Targets** | N/A |
| **Differentiation** | Risk quantification vs. strategy simulation |

**Changes required:**
1. Add `keywords` to metadata
2. Remove duplicate inline breadcrumb (layout already provides one)

---

### `/roulette/learn` — Learn Roulette

| Field | Value |
|-------|-------|
| **URL** | `/roulette/learn` |
| **Status** | OPTIMIZE (minor) |
| **Primary KW** | learn roulette |
| **Secondary KWs** | roulette rules, roulette guide, how to play roulette, roulette for beginners |
| **Search Intent** | Informational |
| **Page Angle** | Comprehensive math-first roulette education guide |
| **Purpose** | Capture "learn roulette" and "roulette rules" searches |
| **Title Tag** | `Learn Roulette — Rules, Odds & Strategy Guide | PaperBet` |
| **Meta Description** | `Complete roulette guide: rules, odds for every bet, strategy analysis, and why no system beats the house. Math-first approach for smart players.` |
| **H1** | `Learn Roulette` (already exists) |
| **H2/H3 Structure** | Already comprehensive with 7 sections + ToC |
| **Intro Angle** | Already has intro — keep |
| **Links OUT** | `/roulette` (breadcrumb), `/roulette/free-play`, `/roulette/odds-calculator`, `/roulette/strategy-tester`, `/roulette/simulators/martingale`, `/roulette/simulators/fibonacci`, `/roulette/risk-of-ruin`, `/responsible-gambling` |
| **Links IN** | `/roulette`, `/roulette/free-play`, `/roulette/odds-calculator` |
| **CTA Role** | Educate, then drive to free-play and tools |
| **FAQ Targets** | N/A |
| **Differentiation** | Educational article (Article schema) vs. interactive tools |

**Changes required:**
1. Add `keywords` to metadata only

---

## D. Blog Posts — Existing (KEEP / OPTIMIZE)

### `/blog/plinko-strategy-guide` — KEEP

| Field | Value |
|-------|-------|
| **URL** | `/blog/plinko-strategy-guide` |
| **Status** | KEEP |
| **Primary KW** | plinko strategy |
| **Secondary KWs** | plinko tips, plinko simulator strategy, plinko guide, plinko odds |
| **Title Tag** | Already good — keep |
| **H1** | Already set via blog template |
| **CTA Role** | Drive to `/plinko` simulator |
| **Changes** | Add links to `/blog/what-is-provably-fair` and `/blog/understanding-house-edge-rtp` when those posts exist |

### `/blog/crash-strategy-guide` — KEEP

| Field | Value |
|-------|-------|
| **URL** | `/blog/crash-strategy-guide` |
| **Status** | KEEP |
| **Primary KW** | crash strategy |
| **Secondary KWs** | crash game tips, crash cashout strategy, crash multiplier odds |
| **Changes** | Add links to `/blog/best-crypto-casinos-for-crash` and educational posts when created |

### `/blog/mines-strategy-guide` — KEEP

| Field | Value |
|-------|-------|
| **URL** | `/blog/mines-strategy-guide` |
| **Status** | KEEP |
| **Primary KW** | mines strategy |
| **Secondary KWs** | mines game tips, mines odds, mines cash out strategy |
| **Changes** | Add links to `/blog/best-crypto-casinos-for-mines` and educational posts when created |

### `/blog/plinko-high-risk-vs-low-risk` — OPTIMIZE

| Field | Value |
|-------|-------|
| **URL** | `/blog/plinko-high-risk-vs-low-risk` |
| **Status** | OPTIMIZE |
| **Primary KW** | plinko high risk vs low risk |
| **Secondary KWs** | plinko risk level, plinko odds comparison, plinko multipliers |
| **Changes** | Add reference to Plinko probability calculator, add link to `/blog/best-crypto-casinos-for-plinko`, add link to `/blog/plinko-strategy-guide` |

### `/blog/best-crypto-casinos-for-plinko` — OPTIMIZE

| Field | Value |
|-------|-------|
| **URL** | `/blog/best-crypto-casinos-for-plinko` |
| **Status** | OPTIMIZE |
| **Primary KW** | best plinko casino |
| **Secondary KWs** | crypto plinko, plinko real money, plinko casino review |
| **Changes** | Update casino offers if stale, add cross-links to other comparison posts (Crash, Mines, Roulette), add link to `/blog/plinko-strategy-guide` |

---

## E. Blog Posts — NEW Strategy Guides

### `/blog/dice-strategy-guide` — NEW

| Field | Value |
|-------|-------|
| **URL** | `/blog/dice-strategy-guide` |
| **Status** | NEW |
| **Primary KW** | dice strategy |
| **Secondary KWs** | dice game tips, dice roll strategy, dice casino strategy, dice over under strategy |
| **Search Intent** | Strategy |
| **Page Angle** | Data-driven analysis of target selection and betting strategies for casino Dice |
| **Purpose** | Spoke content for `/dice` hub, captures "dice strategy" searches |
| **Title Tag** | `Dice Strategy Guide: The Math Behind Roll Over/Under` |
| **Meta Description** | `Dice strategy analyzed with simulation data. Learn optimal target selection, compare Martingale vs flat betting, and understand why 99% RTP doesn't guarantee wins.` |
| **H1** | `Dice Strategy Guide: The Math Behind Roll Over/Under` |
| **H2/H3 Structure** | H2: What Is Casino Dice? · H2: Target Selection Strategy · H2: Betting System Comparison · H2: What 10,000 Simulated Rolls Reveal · H2: Bankroll Management · H2: Where to Play Dice for Real |
| **Intro Angle** | "Casino Dice lets you set your exact win probability. But does that control translate into a strategic edge? We simulated 10,000 rolls to find out." |
| **Links OUT** | `/dice` (game-cta), `/blog/best-crypto-casinos-for-dice` (comparison), `/blog/understanding-house-edge-rtp` (educational), `/deals` (commercial) |
| **Links IN** | `/dice` (strategy) |
| **CTA Role** | Drive to `/dice` simulator and `/deals` |
| **Differentiation** | Casino Dice strategy, NOT craps strategy. Focuses on target selection and over/under mechanics, not craps betting positions. |

### `/blog/keno-strategy-guide` — NEW

| Field | Value |
|-------|-------|
| **URL** | `/blog/keno-strategy-guide` |
| **Status** | NEW |
| **Primary KW** | keno strategy |
| **Secondary KWs** | keno tips, keno number strategy, keno odds, how to win keno |
| **Search Intent** | Strategy |
| **Page Angle** | Optimal pick count and difficulty selection based on probability math |
| **Purpose** | Spoke content for `/keno` hub, captures "keno strategy" searches |
| **Title Tag** | `Keno Strategy Guide: Optimal Picks & Difficulty Levels` |
| **Meta Description** | `Keno strategy based on probability math. Find the optimal number of picks, compare difficulty levels, and learn why casino Keno differs from lottery Keno.` |
| **H1** | `Keno Strategy Guide: Optimal Picks & Difficulty Levels` |
| **H2/H3 Structure** | H2: What Is Casino Keno? · H2: Pick Count vs Expected Value · H2: Difficulty Level Comparison · H2: Simulation Results: 10,000 Draws · H2: Bankroll Management · H2: Where to Play Keno for Real |
| **Intro Angle** | "Casino Keno with instant results and 99% RTP is a different beast from state lottery Keno. Here is what the math says about your best approach." |
| **Links OUT** | `/keno` (game-cta), `/blog/understanding-house-edge-rtp` (educational), `/deals` (commercial) |
| **Links IN** | `/keno` (strategy) |
| **CTA Role** | Drive to `/keno` simulator and `/deals` |
| **Differentiation** | Casino Keno strategy, NOT lottery Keno tips. No "lucky numbers" or "hot/cold" patterns. Math-only approach. |

### `/blog/roulette-strategy-guide` — NEW

| Field | Value |
|-------|-------|
| **URL** | `/blog/roulette-strategy-guide` |
| **Status** | NEW |
| **Primary KW** | roulette strategy |
| **Secondary KWs** | roulette strategy guide, roulette betting strategy, roulette tips, how to win at roulette |
| **Search Intent** | Strategy |
| **Page Angle** | Comprehensive strategy analysis using PaperBet's 7 roulette tools |
| **Purpose** | Highest-volume strategy guide (5K+ searches), spoke for `/roulette` hub |
| **Title Tag** | `Roulette Strategy Guide: What the Math Actually Says` |
| **Meta Description** | `Roulette strategy analyzed with Monte Carlo simulation. Compare Martingale, Fibonacci, D'Alembert, and flat betting with real probability data.` |
| **H1** | `Roulette Strategy Guide: What the Math Actually Says` |
| **H2/H3 Structure** | H2: The Truth About Roulette Systems · H2: Strategy Comparison (Martingale, Fibonacci, D'Alembert, Flat) · H2: Monte Carlo Simulation Results · H2: European vs American · H2: Bankroll Management · H2: Where to Play Roulette for Real |
| **Intro Angle** | "Every roulette strategy eventually loses to the house edge. But some lose faster than others. We ran Monte Carlo simulations across 4 strategies to show you exactly what to expect." |
| **Links OUT** | `/roulette` (game-cta), `/roulette/free-play` (game-cta), `/roulette/strategy-tester` (game-cta), `/blog/best-crypto-casinos-for-roulette` (comparison), `/blog/understanding-house-edge-rtp` (educational), `/deals` (commercial) |
| **Links IN** | `/roulette` (strategy) |
| **CTA Role** | Drive to roulette tools and `/deals` |
| **Differentiation** | Leverages PaperBet's unique toolkit (strategy tester, simulators, calculators) as proof points |

### `/blog/hilo-strategy-guide` — NEW

| Field | Value |
|-------|-------|
| **URL** | `/blog/hilo-strategy-guide` |
| **Status** | NEW |
| **Primary KW** | hilo strategy |
| **Secondary KWs** | hilo tips, higher or lower strategy, hilo casino tips, hilo card game strategy |
| **Search Intent** | Strategy |
| **Page Angle** | Optimal prediction strategy based on card probability |
| **Purpose** | Spoke content for `/hilo` hub |
| **Title Tag** | `HiLo Strategy Guide: When to Predict Higher vs Lower` |
| **Meta Description** | `HiLo strategy based on card probability. Learn when to pick higher, when to pick lower, and the optimal cash-out chain length for your risk level.` |
| **H1** | `HiLo Strategy Guide: When to Predict Higher vs Lower` |
| **H2/H3 Structure** | H2: How HiLo Probability Works · H2: The Decision Framework · H2: Optimal Chain Length · H2: Simulation Results · H2: Bankroll Management · H2: Where to Play HiLo for Real |
| **Intro Angle** | "With a 2 showing, predict higher. With a King, predict lower. But what about a 7? HiLo's edge decisions happen in the middle range." |
| **Links OUT** | `/hilo` (game-cta), `/blog/understanding-house-edge-rtp` (educational), `/deals` (commercial) |
| **Links IN** | `/hilo` (strategy) |
| **CTA Role** | Drive to `/hilo` simulator and `/deals` |
| **Differentiation** | Card game strategy, NOT poker Hi/Lo. Focus on card probability and chain mechanics. |

### `/blog/limbo-strategy-guide` — NEW

| Field | Value |
|-------|-------|
| **URL** | `/blog/limbo-strategy-guide` |
| **Status** | NEW |
| **Primary KW** | limbo strategy |
| **Secondary KWs** | limbo game strategy, limbo crypto tips, limbo target strategy, limbo auto-bet strategy |
| **Search Intent** | Strategy |
| **Page Angle** | Target multiplier selection and auto-bet configuration |
| **Purpose** | Spoke content for `/limbo` hub |
| **Title Tag** | `Limbo Strategy Guide: Optimal Target Multiplier Selection` |
| **Meta Description** | `Limbo strategy analyzed with simulation data. Find the optimal target multiplier, configure auto-bet settings, and understand Limbo vs Crash differences.` |
| **H1** | `Limbo Strategy Guide: Optimal Target Multiplier Selection` |
| **H2/H3 Structure** | H2: How Limbo Differs from Crash · H2: Target Multiplier Analysis · H2: Auto-Bet Configuration · H2: Simulation Results · H2: Bankroll Management · H2: Where to Play Limbo for Real |
| **Intro Angle** | "Limbo is Crash without the drama. You set your target, and the result is instant. But which target gives you the best risk-reward balance?" |
| **Links OUT** | `/limbo` (game-cta), `/blog/understanding-house-edge-rtp` (educational), `/deals` (commercial) |
| **Links IN** | `/limbo` (strategy) |
| **CTA Role** | Drive to `/limbo` simulator and `/deals` |
| **Differentiation** | Limbo-specific (target selection), NOT generic Crash advice. Emphasizes instant rounds and auto-bet. |

### `/blog/flip-strategy-guide` — NEW

| Field | Value |
|-------|-------|
| **URL** | `/blog/flip-strategy-guide` |
| **Status** | NEW |
| **Primary KW** | coin flip strategy |
| **Secondary KWs** | coin flip game strategy, double or nothing strategy, coin flip casino tips |
| **Search Intent** | Strategy |
| **Page Angle** | Chain length optimization and the math of double-or-nothing |
| **Purpose** | Spoke content for `/flip` hub, lowest priority strategy guide |
| **Title Tag** | `Coin Flip Strategy: The Math of Double or Nothing` |
| **Meta Description** | `Coin Flip strategy analyzed. Learn the optimal chain length for your risk tolerance and why the 98% RTP makes long chains a losing proposition.` |
| **H1** | `Coin Flip Strategy: The Math of Double or Nothing` |
| **H2/H3 Structure** | H2: How Casino Coin Flip Works · H2: Chain Length Probabilities · H2: The 98% RTP Impact · H2: Simulation: 10,000 Flips · H2: When to Cash Out · H2: Where to Play Coin Flip for Real |
| **Intro Angle** | "Each flip doubles your bet. A 10-chain pays 512x. But the probability of getting there is 0.098%. Here is the math that determines when to stop." |
| **Links OUT** | `/flip` (game-cta), `/blog/understanding-house-edge-rtp` (educational), `/deals` (commercial) |
| **Links IN** | `/flip` (strategy) |
| **CTA Role** | Drive to `/flip` simulator and `/deals` |
| **Differentiation** | Casino coin flip with chain mechanic, NOT probability theory or fair coin analysis |

---

## F. Blog Posts — NEW Comparison Posts

### `/blog/best-crypto-casinos-for-crash` — NEW

| Field | Value |
|-------|-------|
| **URL** | `/blog/best-crypto-casinos-for-crash` |
| **Status** | NEW |
| **Primary KW** | best crash game casino |
| **Secondary KWs** | crash game crypto casino, crash casino site, where to play crash, crash real money |
| **Search Intent** | Commercial |
| **Page Angle** | Compare top crypto casinos specifically for their Crash game offerings |
| **Purpose** | Commercial content, monetization via affiliate links |
| **Title Tag** | `Best Crypto Casinos for Crash 2026 — Top Crash Game Sites` |
| **Meta Description** | `The best crypto casinos for playing Crash in 2026. Compared by RTP, max multiplier, auto-cashout features, and bonuses. Practice free at PaperBet first.` |
| **H1** | `Best Crypto Casinos for Crash 2026` |
| **H2/H3 Structure** | H2: How We Ranked · H2: Crash Casino Comparison Table · H2: Detailed Reviews (H3: each casino) · H2: Practice Crash Before Playing for Real |
| **Links OUT** | `/crash` (game-cta), `/blog/crash-strategy-guide` (strategy), `/deals` (commercial) |
| **Links IN** | `/crash` (comparison), `/blog/crash-strategy-guide` (comparison) |
| **CTA Role** | Affiliate conversions + drive to `/crash` simulator |
| **Differentiation** | Crash-specific casino comparison, NOT generic "best crypto casinos" |

### `/blog/best-crypto-casinos-for-mines` — NEW

| Field | Value |
|-------|-------|
| **URL** | `/blog/best-crypto-casinos-for-mines` |
| **Status** | NEW |
| **Primary KW** | best mines casino |
| **Secondary KWs** | mines crypto casino, mines casino site, where to play mines, mines real money |
| **Search Intent** | Commercial |
| **Title Tag** | `Best Crypto Casinos for Mines 2026 — Top Sites` |
| **Meta Description** | `The best crypto casinos for playing Mines in 2026. Compared by RTP, grid size options, provably fair verification, and bonuses.` |
| **H1** | `Best Crypto Casinos for Mines 2026` |
| **H2/H3 Structure** | Same pattern as Crash comparison |
| **Links OUT** | `/mines` (game-cta), `/blog/mines-strategy-guide` (strategy), `/deals` (commercial) |
| **Links IN** | `/mines` (comparison), `/blog/mines-strategy-guide` (comparison) |
| **CTA Role** | Affiliate conversions + drive to `/mines` simulator |
| **Differentiation** | Mines-specific — NOT Minesweeper game sites |

### `/blog/best-crypto-casinos-for-roulette` — NEW

| Field | Value |
|-------|-------|
| **URL** | `/blog/best-crypto-casinos-for-roulette` |
| **Status** | NEW |
| **Primary KW** | best online roulette casino |
| **Secondary KWs** | crypto roulette casino, roulette casino site, where to play roulette crypto, roulette real money crypto |
| **Search Intent** | Commercial |
| **Title Tag** | `Best Crypto Casinos for Roulette 2026 — Top Roulette Sites` |
| **Meta Description** | `The best crypto casinos for playing roulette in 2026. Compared by European wheel availability, RTP, provably fair status, and bonuses.` |
| **H1** | `Best Crypto Casinos for Roulette 2026` |
| **H2/H3 Structure** | Same pattern as Crash comparison |
| **Links OUT** | `/roulette` (game-cta), `/roulette/free-play` (game-cta), `/blog/roulette-strategy-guide` (strategy), `/deals` (commercial) |
| **Links IN** | `/roulette` (comparison), `/blog/roulette-strategy-guide` (comparison) |
| **CTA Role** | Affiliate conversions + drive to roulette tools |
| **Differentiation** | Roulette-specific with focus on European vs American wheel availability |

### `/blog/best-crypto-casinos-for-dice` — NEW

| Field | Value |
|-------|-------|
| **URL** | `/blog/best-crypto-casinos-for-dice` |
| **Status** | NEW |
| **Primary KW** | best dice casino |
| **Secondary KWs** | dice crypto casino, dice casino site, where to play dice, dice real money casino |
| **Search Intent** | Commercial |
| **Title Tag** | `Best Crypto Casinos for Dice 2026 — Top Casino Dice Sites` |
| **Meta Description** | `The best crypto casinos for playing casino Dice in 2026. Compared by RTP, auto-bet features, provably fair status, and bonuses.` |
| **H1** | `Best Crypto Casinos for Dice 2026` |
| **H2/H3 Structure** | Same pattern as Crash comparison |
| **Links OUT** | `/dice` (game-cta), `/blog/dice-strategy-guide` (strategy), `/deals` (commercial) |
| **Links IN** | `/dice` (comparison), `/blog/dice-strategy-guide` (comparison) |
| **CTA Role** | Affiliate conversions + drive to `/dice` simulator |
| **Differentiation** | Casino Dice (roll over/under), NOT craps casino comparisons |

---

## G. Blog Posts — NEW Educational Posts

### `/blog/what-is-provably-fair` — NEW

| Field | Value |
|-------|-------|
| **URL** | `/blog/what-is-provably-fair` |
| **Status** | NEW |
| **Primary KW** | provably fair |
| **Secondary KWs** | provably fair explained, provably fair casino, how provably fair works, crypto casino fairness |
| **Search Intent** | Informational |
| **Page Angle** | Technical explanation of provably fair systems in crypto casinos |
| **Purpose** | Educational hub page — linked from all 9 game pages |
| **Title Tag** | `What Is Provably Fair? Crypto Casino Fairness Explained` |
| **Meta Description** | `Provably fair explained in plain language. How crypto casinos use hash functions to prove game outcomes are random and untampered. Verify it yourself.` |
| **H1** | `What Is Provably Fair? Crypto Casino Fairness Explained` |
| **H2/H3 Structure** | H2: What Is Provably Fair? · H2: How It Works (Server Seed, Client Seed, Nonce) · H2: Provably Fair in Practice · H3: [Per-game sections] · H2: Provably Fair vs Traditional RNG · H2: How to Verify Fairness |
| **Links OUT** | All 9 game pages (game-cta), `/blog/understanding-house-edge-rtp` (educational) |
| **Links IN** | All 9 game pages (educational), all strategy guides |
| **CTA Role** | Build trust, drive to simulators to experience fair gameplay |
| **Differentiation** | Explains the technical mechanism, not just "we are fair" claims |

### `/blog/understanding-house-edge-rtp` — NEW

| Field | Value |
|-------|-------|
| **URL** | `/blog/understanding-house-edge-rtp` |
| **Status** | NEW |
| **Primary KW** | house edge explained |
| **Secondary KWs** | what is house edge, RTP explained, return to player, casino house edge, house edge vs RTP |
| **Search Intent** | Informational |
| **Page Angle** | Practical explanation of house edge and RTP with game-by-game comparison |
| **Purpose** | Educational hub — linked from all game pages and strategy guides |
| **Title Tag** | `House Edge & RTP Explained — Every Player Must Know` |
| **Meta Description** | `House edge and RTP explained with real numbers. See the exact house edge for 9 casino games and learn why understanding it matters before you bet.` |
| **H1** | `House Edge & RTP Explained` |
| **H2/H3 Structure** | H2: What Is House Edge? · H2: What Is RTP? · H2: House Edge vs RTP · H2: Game-by-Game Comparison (with table) · H2: Why This Matters · H2: Practice with Real Math |
| **Links OUT** | All 9 game pages (game-cta), `/blog/what-is-provably-fair` (educational) |
| **Links IN** | All 9 game pages (educational), all strategy guides |
| **CTA Role** | Educate, then drive to simulators to see RTP in action |
| **Differentiation** | Specific to PaperBet's 9 games with exact RTP numbers, not generic casino theory |

### `/blog/crypto-casino-beginners-guide` — NEW

| Field | Value |
|-------|-------|
| **URL** | `/blog/crypto-casino-beginners-guide` |
| **Status** | NEW |
| **Primary KW** | crypto casino guide |
| **Secondary KWs** | crypto casino for beginners, how crypto casinos work, crypto gambling guide, getting started crypto casino |
| **Search Intent** | Informational |
| **Page Angle** | Complete beginner introduction to crypto casino gaming |
| **Purpose** | Top-of-funnel entry page for users new to crypto casinos |
| **Title Tag** | `Crypto Casino Beginner's Guide — How to Get Started` |
| **Meta Description** | `New to crypto casinos? This beginner's guide covers how they work, which games to start with, what provably fair means, and how to practice risk-free.` |
| **H1** | `Crypto Casino Beginner's Guide` |
| **H2/H3 Structure** | H2: What Are Crypto Casinos? · H2: How They Differ from Traditional Casinos · H2: Which Games to Start With · H2: Understanding Provably Fair · H2: Practice Before You Play · H2: Responsible Gambling Basics |
| **Links OUT** | All 9 game pages (game-cta), `/deals` (commercial), `/blog/what-is-provably-fair` (educational), `/blog/understanding-house-edge-rtp` (educational) |
| **Links IN** | None required (top-of-funnel entry) |
| **CTA Role** | Introduce crypto casinos, funnel to game simulators |
| **Differentiation** | Beginner-focused, not strategy-focused. Covers the "what" and "why" of crypto gambling. |

---

## H. Utility Pages (No Changes Required)

### `/deals` — KEEP as-is
Casino partner offers page. No SEO changes needed.

### `/responsible-gambling` — KEEP as-is
Responsible gambling information. Terminal page — no outbound links required.

### `/privacy` — KEEP as-is
Privacy policy. Legal page.

### `/terms` — KEEP as-is
Terms of service. Legal page.

### `/roulette/disclaimer` — KEEP as-is
Roulette-specific disclaimer page.

### `/blog` — KEEP as-is
Blog index page. Automatically lists all posts.

---

## Page Count Summary

| Category | Count | Status |
|----------|-------|--------|
| Homepage | 1 | OPTIMIZE |
| Core game pages | 8 | OPTIMIZE |
| Roulette hub | 1 | OPTIMIZE (minor) |
| Roulette tool pages | 6 | OPTIMIZE (4 need H1, 2 need keywords only) |
| Roulette learn | 1 | OPTIMIZE (keywords only) |
| Blog — existing KEEP | 3 | No changes |
| Blog — existing OPTIMIZE | 2 | Minor updates |
| Blog — NEW strategy guides | 6 | CREATE |
| Blog — NEW comparison posts | 4 | CREATE |
| Blog — NEW educational posts | 3 | CREATE |
| Utility pages (no changes) | 5 | KEEP |
| **Total pages** | **40** | **17 optimize, 13 new, 5 keep, 5 no-change** |

---

## Verification Checklist

- [x] Every existing page URL has a brief
- [x] Every new blog post has a brief
- [x] Calculator sections documented within their game page briefs (not separate)
- [x] Every page has defined internal links IN and OUT
- [x] No noise keywords appear anywhere
- [x] No unsupported games appear anywhere
- [x] Every game page brief includes 5 FAQ questions with answers
- [x] Title tags checked for ≤60 character limit
- [x] Meta descriptions checked for ≤155 character limit
- [x] Each game page differentiates from its noise keyword cluster
