# 08 — Content Ruleset

> 10 "always do" rules, 10 "never do" rules, page type templates, FAQ standards, differentiation enforcement.
> Generated: 2026-03-11 | Companion to: 05–07 blueprint docs

---

## 1. The 10 "Always Do" Rules

### Rule 1: Primary Keyword in H1 and First 100 Words
Every page's H1 must contain its primary keyword exactly. The primary keyword must also appear naturally within the first 100 words of body content (the intro paragraph or first section).

### Rule 2: Answer-First Intros
Every page opens with a direct answer or value statement. No throat-clearing, no "Welcome to our…", no "In this guide, we'll explore…". Lead with what the user gets.

**Good:** "This free Plinko simulator uses casino-accurate multipliers across 3 risk levels. Drop balls, track results, and test strategies before playing for real."
**Bad:** "Welcome to PaperBet's Plinko page! In this article, we'll explore everything you need to know about Plinko."

### Rule 3: Unique Content Per Page
Every page must have content that doesn't exist on any other page. No copy-pasting game descriptions, intro paragraphs, or FAQ answers across pages. Each game's educational section, FAQ, and intro must be unique to that game.

### Rule 4: FAQPage Schema on Every Game Page
Every game page (8 core games + roulette hub) must include `FAQPage` JSON-LD structured data with at least 5 Q&A pairs. FAQ content must be factual, game-specific, and self-contained (each answer stands alone without needing other context).

### Rule 5: SoftwareApplication Schema on All Simulators
Every game page and tool page uses `@type: "SoftwareApplication"` structured data with:
- `applicationCategory`: "GameApplication" (games), "EducationalApplication" (roulette hub), "UtilitiesApplication" (tools)
- `operatingSystem`: "Web"
- `offers.price`: "0"
- `name`: "PaperBet [Game] Simulator"

### Rule 6: CrossGameLinks Component on Every Game Page
Every game page renders the `CrossGameLinks` component showing all other 8 games. This ensures no game is an orphan and maximizes internal link equity distribution.

### Rule 7: Responsible Gambling Link on Every Page
Every page that mentions real-money play, casinos, or betting must link to `/responsible-gambling`. This includes all game pages, all roulette tool pages, all blog posts, and the homepage.

### Rule 8: Keyword-Rich Anchor Text
Every internal link uses descriptive anchor text containing relevant keywords. See the Internal Linking System (doc 07) for approved anchor text patterns per link type.

### Rule 9: Mobile-First Content
All content sections must be readable on 375px screens. Educational sections use responsive grids (1 col mobile, 2 cols desktop). FAQ accordion must be touch-friendly. Stats strips must wrap gracefully.

### Rule 10: Canonical URLs on Every Page
Every page declares its canonical URL as `https://paperbet.io/[path]` (absolute, no trailing slash, lowercase). This prevents duplicate content issues from www/non-www or trailing slash variants.

---

## 2. The 10 "Never Do" Rules

### Rule 1: Never Use Noise Keywords
The following terms must NEVER appear in PaperBet content, metadata, or structured data:

| Game | Noise Keywords to Exclude |
|------|--------------------------|
| Crash | Crash Bandicoot, crash bash, crash tag team racing, crash nitro kart, flight simulator crash |
| Dice | craps, D&D dice, dungeons and dragons, python dice, tabletop dice |
| Keno | state lottery keno, keno live, club keno, keno olg, keno draw results, lottery numbers |
| Mines | Minesweeper (the classic PC game), mine blocks, crypto mining, GPU calculator, antminer, idle miner tycoon |
| Limbo | Limbo (video game by Playdead), Inside Limbo, Marvel Limbo |
| HiLo | Omaha Hi/Lo, poker hi-lo |
| General | download, APK, mod, hack, cheat, real money deposit, withdrawal, faucet |

### Rule 2: Never Reference Unsupported Games
PaperBet does NOT offer: Aviator, Blackjack, Poker, Slots, Baccarat, Craps, or any game not in the 9-game roster (Plinko, Crash, Mines, Dice, HiLo, Keno, Limbo, Flip, Roulette). These game names must never appear in content as if PaperBet offers them.

### Rule 3: Never Use Generic Intros
No page may begin with "Welcome to…", "In this guide…", "Have you ever wondered…", or any filler opening. Every intro must be answer-first (see Rule 1 of "Always Do").

### Rule 4: Never Keyword-Stuff
Maximum 2 uses of the primary keyword in body text (excluding H1, title tag, and meta description). Supporting keywords appear once each. Content reads naturally — if a sentence sounds forced because of a keyword, rewrite it.

### Rule 5: Never Duplicate Game Definitions
Each game's "How It Works" explanation exists on ONE page only (the game page). Blog posts reference the game but don't re-explain the full mechanics. Use a 1-sentence summary + link to the simulator instead.

### Rule 6: Never Use WebApplication Schema
All game pages use `SoftwareApplication`, never `WebApplication`. The current Mines page (`WebApplication`) must be fixed.

### Rule 7: Never Create Standalone Calculator Pages
Calculator functionality lives embedded within game pages, never as separate URLs. This consolidates page authority and prevents thin content issues.

### Rule 8: Never Use Generic Anchor Text
No "click here", "read more", "learn more", or "here" as standalone anchor text. Every link must include a keyword or descriptive phrase.

### Rule 9: Never Promise Real Money Outcomes
Content must never imply that simulator results predict real-money outcomes. Always include language like "for practice only", "simulated results", "not indicative of real-money play".

### Rule 10: Never Exceed Metadata Limits
- Title tags: 60 characters max
- Meta descriptions: 155 characters max
- H1 tags: 1 per page, never more
- Exceeding these limits means Google truncates the content, losing impact

---

## 3. Page Type Templates

### 3.1 Game Page Educational Section Template

**Component:** `GameSEOContent`
**Placement:** Below game component, above calculator section (if applicable) or FAQ

```
H2: "How [Game Name] Works"

Paragraph 1 (primary keyword inclusion):
[Game Name] is a [1-sentence mechanic description]. In this free [Game Name]
simulator, you [what the user does] with [key feature]. The game uses
[RNG/provably fair method] to ensure fair outcomes with a [X]% RTP.

Paragraph 2 (strategy hook):
[Unique strategic element of this game]. Players can [key decision point],
which affects [outcome variable]. Our simulator tracks [what we track] so you
can [benefit of tracking].

Paragraph 3 (internal link integration):
Want to go deeper? Read our [Game Name] strategy guide for data-driven
insights from [number] simulated rounds. Or explore how [Game Name] compares
to other crypto casino games in our [comparison post title].
```

**Rules:**
- 150–250 words total
- Primary keyword in first sentence
- At least 1 internal link (to strategy guide)
- Unique content per game — no shared paragraphs
- Factual, math-based tone — no hype

### 3.2 Game Page FAQ Template

**Component:** `GameFAQ`
**Placement:** Below educational section (or calculator), above CrossGameLinks

Each game page includes exactly 5 FAQ items. Questions follow this structure:

| Q# | Pattern | Example (Plinko) |
|----|---------|-------------------|
| 1 | What is [Game] and how does it work? | What is Plinko and how does it work? |
| 2 | What is the RTP / house edge of [Game]? | What is the RTP of Plinko? |
| 3 | [Game-specific strategy question] | Does risk level affect Plinko RTP? |
| 4 | Is [Game] provably fair? | Is this Plinko simulator provably fair? |
| 5 | Can I play [Game] for real money? | Where can I play Plinko for real money? |

**Answer rules:**
- 40–80 words per answer
- Self-contained (no "as mentioned above")
- Factual and specific (include numbers: RTP percentages, multiplier ranges)
- No promotional language in answers
- Q5 (real money) must include responsible gambling disclaimer language

### 3.3 Game Page Calculator Section Template

**Applies to:** Plinko, Mines, Dice, Keno only
**Placement:** Between GameSEOContent and GameFAQ

```
H2: "[Game Name] [Calculator Type]"

Brief intro (1-2 sentences): Explain what the calculator does and why it's useful.

[Interactive calculator component — game-specific]

Explanation paragraph: How to interpret the results, with a link to the
strategy guide for deeper analysis.
```

**Calculator types:**
- Plinko: Probability Calculator (expected value per risk level per row count)
- Mines: Mines Calculator (multiplier and probability per reveal count per mine count)
- Dice: Probability Calculator (win probability and multiplier per target number)
- Keno: Odds Calculator (match probability and payout per pick count per difficulty)

### 3.4 Blog Strategy Guide Template

**Section structure in `blog-data.ts`:**

```typescript
sections: [
  // 1. Hook stat
  { type: "stat-highlight", stat: "[compelling number]", label: "[context]" },

  // 2. Game overview (brief — NOT a full re-explanation)
  { type: "heading2", text: "What Is [Game]? (Quick Recap)" },
  { type: "paragraph", text: "[1-2 sentences, then link to simulator]" },
  { type: "simulator-cta", game: "[game]" },

  // 3. Core strategy content (the meat)
  { type: "heading2", text: "[Strategy Topic 1]" },
  { type: "paragraph", text: "[analysis with data]" },
  { type: "table", headers: [...], rows: [...] },

  { type: "heading2", text: "[Strategy Topic 2]" },
  { type: "paragraph", text: "[analysis with data]" },
  { type: "callout", variant: "tip", text: "[actionable takeaway]" },

  // 4. Simulation results
  { type: "heading2", text: "What [N] Simulated [Rounds/Drops/Spins] Reveal" },
  { type: "table", headers: [...], rows: [...] },
  { type: "paragraph", text: "[interpretation of data]" },

  // 5. Bankroll management
  { type: "heading2", text: "Bankroll Management for [Game]" },
  { type: "list", items: ["[tip 1]", "[tip 2]", "[tip 3]"] },

  // 6. Casino CTA (with disclaimer)
  { type: "heading2", text: "Where to Play [Game] for Real" },
  { type: "casino-cta", casinoId: "[best match]" },
  { type: "callout", variant: "warning", text: "Always gamble responsibly..." },

  // 7. Final simulator CTA
  { type: "simulator-cta", game: "[game]" }
]
```

### 3.5 Blog Comparison Post Template

```typescript
sections: [
  // 1. Quick verdict
  { type: "stat-highlight", stat: "[top pick]", label: "Best Overall for [Game]" },

  // 2. Comparison criteria
  { type: "heading2", text: "How We Ranked These Casinos" },
  { type: "list", items: ["[criterion 1]", "[criterion 2]", ...] },

  // 3. Comparison table
  { type: "heading2", text: "[Game] Casino Comparison" },
  { type: "table", headers: ["Casino", "Bonus", "[Game] RTP", "Provably Fair", "Rating"], rows: [...] },

  // 4. Per-casino reviews (H3 each)
  { type: "heading2", text: "Detailed Reviews" },
  { type: "heading3", text: "1. [Casino Name]" },
  { type: "paragraph", text: "[review]" },
  { type: "casino-cta", casinoId: "[casino]" },
  // repeat for each casino

  // 5. Practice CTA
  { type: "heading2", text: "Practice [Game] Before Playing for Real" },
  { type: "paragraph", text: "[why practice matters]" },
  { type: "simulator-cta", game: "[game]" },

  // 6. Disclaimer
  { type: "callout", variant: "warning", text: "Gambling involves risk..." }
]
```

### 3.6 Blog Educational Post Template

```typescript
sections: [
  // 1. Concept definition
  { type: "heading2", text: "What Is [Concept]?" },
  { type: "paragraph", text: "[clear definition, no jargon]" },

  // 2. How it works
  { type: "heading2", text: "How [Concept] Works" },
  { type: "paragraph", text: "[mechanism explanation]" },
  { type: "callout", variant: "info", text: "[key formula or principle]" },

  // 3. Per-game application
  { type: "heading2", text: "[Concept] in Practice: Game-by-Game" },
  { type: "heading3", text: "Plinko" },
  { type: "paragraph", text: "[how concept applies to Plinko]" },
  { type: "simulator-cta", game: "plinko" },
  // repeat for relevant games

  // 4. Table summarizing across games
  { type: "heading2", text: "[Concept] Across All Games" },
  { type: "table", headers: ["Game", "[Metric 1]", "[Metric 2]"], rows: [...] },

  // 5. Takeaway
  { type: "heading2", text: "What This Means for You" },
  { type: "paragraph", text: "[practical implications]" },
  { type: "callout", variant: "tip", text: "[actionable advice]" }
]
```

---

## 4. FAQ Writing Standards

### 4.1 Question Formats

**Approved patterns:**
- "What is [X]?" — for definitions
- "How does [X] work?" — for mechanics
- "What is the [metric] of [X]?" — for specific numbers (RTP, house edge)
- "Is [X] [property]?" — for yes/no factual questions
- "Can I [action]?" — for capability questions
- "Where can I [action]?" — for real-money/casino redirect questions

**Banned patterns:**
- "Why should I [action]?" — too promotional
- "Which is the best [X]?" — too subjective for FAQ
- "How much money can I win?" — implies real-money outcomes

### 4.2 Answer Format

Every FAQ answer follows this structure:
1. **Direct answer** (first sentence — answers the question)
2. **Supporting detail** (1-2 sentences — adds context, numbers, or nuance)
3. **No cross-references** — no "see above", "as mentioned", or links to other FAQ items

### 4.3 Length Guidelines

- Minimum: 40 words
- Maximum: 80 words
- Target: 50-60 words (Google's featured snippet sweet spot)

### 4.4 Tone

- Factual, not promotional
- Use specific numbers (percentages, multipliers, counts)
- No exclamation marks
- No superlatives ("best", "amazing", "incredible")
- No first person ("we", "our") — write in third person or address the user as "you"

---

## 5. Differentiation Enforcement

Each game must maintain a distinct identity in all content. This prevents keyword cannibalization and noise keyword pollution.

### 5.1 Game Identity Cards

**Plinko**
- Core mechanic: Drop balls through a pegged board; they bounce randomly into multiplier slots
- Differentiator: Visual, passive gameplay — you watch the outcome unfold
- RTP: 99% (all risk levels)
- Max multiplier: 1,000x (high risk, 16 rows)
- NOT: Pachinko, pinball, lottery
- Keyword cluster: plinko simulator, plinko demo, plinko free, plinko strategy, plinko probability

**Crash**
- Core mechanic: A multiplier rises from 1.00x until it "crashes" at a random point; cash out before it crashes
- Differentiator: Active timing decision — the only game where you choose WHEN to stop
- RTP: 99%
- Max multiplier: Unlimited (theoretically)
- NOT: Crash Bandicoot, flight simulator crash, car crash games, crash bash
- Keyword cluster: crash game simulator, crash game, crash casino, crash strategy, crash multiplier

**Mines**
- Core mechanic: Reveal tiles on a 5×5 grid — gems increase your multiplier, mines end the game
- Differentiator: Risk escalation with each reveal — multiplier increases but so does danger
- RTP: 99%
- Max multiplier: Depends on mine count (1 mine = 24 safe tiles = lower multipliers; 24 mines = 1 safe tile = massive multiplier)
- NOT: Minesweeper (PC game), crypto mining, mine blocks, idle miner
- Keyword cluster: mines simulator, mines demo, mines casino, mines strategy, mines calculator

**Dice**
- Core mechanic: Roll a number 0-99.99; bet whether result is over or under your target
- Differentiator: Most mathematically transparent game — you set your exact win probability
- RTP: 99%
- Max multiplier: ~9,900x (at 0.01% win chance)
- NOT: Craps, D&D dice, tabletop dice, python random dice
- Keyword cluster: dice simulator, dice game, dice roll over under, dice strategy, dice probability

**HiLo**
- Core mechanic: A card is shown; predict if the next card is higher or lower
- Differentiator: Card-based chain game — build multiplier chains across multiple correct predictions
- RTP: 99%
- Max multiplier: Chain-dependent
- NOT: Omaha Hi/Lo poker, Hi-Lo card game (generic)
- Keyword cluster: hilo simulator, hilo casino game, hilo game, hilo strategy, higher or lower game

**Keno**
- Core mechanic: Pick 1-10 numbers from a 40-number grid; the game draws 10 numbers; payouts based on matches
- Differentiator: Lottery-style game with instant results and multiple difficulty levels
- RTP: 99%
- Max multiplier: 1,000x (10 picks, all match, hardest difficulty)
- NOT: State lottery keno, keno live draw, club keno, keno OLG
- Keyword cluster: keno simulator, free keno game, keno online, keno strategy, keno odds

**Limbo**
- Core mechanic: Set a target multiplier; the game generates a random multiplier; win if the result beats your target
- Differentiator: Instant version of Crash — no waiting, no timing decision, pure probability
- RTP: 99%
- Max multiplier: 1,000,000x (at extremely low win probability)
- NOT: Limbo (Playdead video game), Inside/Limbo, Marvel Limbo
- Keyword cluster: limbo simulator, limbo game, limbo crypto, limbo strategy, limbo multiplier

**Coin Flip**
- Core mechanic: Pick heads or tails; win doubles your bet; can chain wins for multiplier chains
- Differentiator: Simplest game — pure 50/50 with chain multiplier mechanic
- RTP: 98%
- Max multiplier: 1,027,604x (20-chain)
- NOT: Coin toss probability calculator (educational), random coin flip (utility)
- Keyword cluster: coin flip simulator, coin flip game, heads or tails, coin flip casino

**Roulette**
- Core mechanic: Bet on numbers/colors/sections of a spinning wheel; ball lands randomly
- Differentiator: Most complex game with 7 dedicated tools (simulator, strategy tester, calculators, learning hub)
- RTP: 97.3% (European), 94.74% (American)
- NOT: Russian roulette, roulette drinking game
- Keyword cluster: roulette simulator, free roulette, roulette odds, roulette strategy, roulette wheel

### 5.2 Differentiation Rules

1. **Each game's intro section must explain what makes it unique** — reference the "Differentiator" from the identity card
2. **Cross-game references must clarify differences** — e.g., "Unlike Crash where you watch the multiplier rise, Limbo gives you the result instantly"
3. **FAQ answers must be game-specific** — the "What is the RTP?" answer for Plinko must mention "99% across all three risk levels", not just "99%"
4. **Calculator sections must use game-specific terminology** — Mines uses "mine count" and "reveal count", Dice uses "target number" and "win probability", never generic "odds calculator"
5. **Blog strategy guides must use game-specific data** — each guide references its own simulation results, not generic advice

### 5.3 Cannibalization Prevention

| Risk | Games | Prevention |
|------|-------|------------|
| Crash vs Limbo | Both involve multipliers | Crash = "timing game" / Limbo = "instant prediction game" |
| Dice vs Limbo | Both involve target numbers | Dice = "roll over/under" / Limbo = "target multiplier" |
| Keno vs Lottery | Both involve number picks | Always specify "casino Keno" with "instant results" |
| Mines vs Minesweeper | Both involve revealing safe tiles | Always specify "casino Mines" with "multiplier" and "cash out" |
| Plinko vs Generic Plinko | Many sites have Plinko | Always pair with "simulator", "casino", "crypto" |

---

## 6. Content Quality Checklist

Before publishing any page, verify:

### Metadata
- [ ] Title tag ≤ 60 characters
- [ ] Meta description ≤ 155 characters
- [ ] Primary keyword in title tag
- [ ] Primary keyword in meta description
- [ ] Canonical URL set (absolute, no trailing slash)
- [ ] OG image: `https://paperbet.io/opengraph-image`
- [ ] Keywords meta tag with 5-8 terms

### On-Page Content
- [ ] Exactly 1 H1 per page
- [ ] Primary keyword in H1
- [ ] Primary keyword in first 100 words
- [ ] Answer-first intro (no generic openers)
- [ ] No noise keywords present (check against Rule 1 of "Never Do")
- [ ] No unsupported game names mentioned as PaperBet offerings
- [ ] Max 2 uses of primary keyword in body text
- [ ] Unique content (not duplicated from another page)

### Structured Data
- [ ] JSON-LD validates (test at schema.org validator)
- [ ] Correct `@type` for page type
- [ ] `operatingSystem: "Web"` (not "Any")
- [ ] `name` includes "PaperBet" prefix
- [ ] `offers.price: "0"` present
- [ ] FAQPage schema present (game pages only)

### Internal Links
- [ ] At least 2 outbound internal links
- [ ] At least 2 inbound internal links (verify in adjacency map)
- [ ] Keyword-rich anchor text (no generic)
- [ ] CrossGameLinks component rendered (game pages only)
- [ ] Strategy guide linked (if exists for this game)
- [ ] `/responsible-gambling` linked (if page mentions casinos)
- [ ] `/deals` linked (if page includes casino CTAs)

### Accessibility & Mobile
- [ ] Content readable at 375px width
- [ ] Touch targets ≥ 44px
- [ ] FAQ accordion keyboard-navigable
- [ ] All images have alt text
- [ ] Color contrast meets WCAG AA (text on `#0B0F1A` background)

### Responsible Gambling
- [ ] Disclaimer present on pages linking to casinos
- [ ] No language implying guaranteed wins
- [ ] No encouragement to deposit real money
- [ ] "For practice only" or equivalent language present
