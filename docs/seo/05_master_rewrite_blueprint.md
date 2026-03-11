# 05 — Master Rewrite Blueprint

> Sitewide content frameworks, component architecture, metadata rules, and wave sequencing.
> Generated: 2026-03-11 | Companion to: 01–04 strategy docs

---

## 1. Page Type Frameworks

PaperBet has 5 distinct page types. Each type has a fixed content structure that every page of that type must follow.

### 1.1 Game Page (8 pages: Plinko, Crash, Mines, Dice, HiLo, Keno, Limbo, Flip)

```
┌─────────────────────────────────────────┐
│ GameHero                                │
│   H1 (primary keyword)                  │
│   Subtitle (value prop, 1 sentence)     │
│   Stats strip (RTP, max mult, mechanic) │
├─────────────────────────────────────────┤
│ Game Component (existing, untouched)    │
├─────────────────────────────────────────┤
│ GameSEOContent — "How [Game] Works"     │
│   2–3 paragraphs, primary KW in first   │
│   100 words, inline links to guides     │
├─────────────────────────────────────────┤
│ Calculator Section (4 games only)       │
│   Plinko, Mines, Dice, Keno             │
│   Embedded within page, NOT separate URL│
├─────────────────────────────────────────┤
│ GameFAQ (5 Qs per game)                 │
│   FAQPage JSON-LD schema               │
│   Accordion UI, one item open at a time │
├─────────────────────────────────────────┤
│ CrossGameLinks                          │
│   Grid of all other game simulators     │
│   Excludes current game                 │
├─────────────────────────────────────────┤
│ Related Strategy Guides (existing)      │
│   Blog post cards for this game         │
├─────────────────────────────────────────┤
│ Responsible Gambling Footer (existing)  │
└─────────────────────────────────────────┘
```

**Metadata pattern:**
- Title: `Free [Game] Simulator — [Unique hook] | PaperBet.io` (≤60 chars)
- Description: Answer-first, mentions free play + key mechanic (≤155 chars)
- Canonical: `https://paperbet.io/[game]`
- Keywords: primary KW + 3–5 supporting terms
- OG image: `https://paperbet.io/opengraph-image` (standardize across all)

**Structured data:** `SoftwareApplication` with `applicationCategory: "GameApplication"`, `operatingSystem: "Web"`, `offers.price: "0"`, `name: "PaperBet [Game] Simulator"`. Fix Mines from `WebApplication` → `SoftwareApplication`.

### 1.2 Homepage (`/`)

```
┌─────────────────────────────────────────┐
│ Hero Section                            │
│   H1: "Free Crypto Casino Simulators"   │
│   Accent subtext: "Test Your Edge"      │
│   Subheadline: mentions ALL 9 games     │
├─────────────────────────────────────────┤
│ Game Grid (existing, all 9 games)       │
├─────────────────────────────────────────┤
│ How PaperBet Works (existing)           │
├─────────────────────────────────────────┤
│ Casino Partner Offers (existing)        │
├─────────────────────────────────────────┤
│ Stats Strip (existing)                  │
├─────────────────────────────────────────┤
│ Strategy Hub CTA (existing)             │
├─────────────────────────────────────────┤
│ Email Capture (existing)                │
└─────────────────────────────────────────┘
```

**Changes required:**
1. Update H1 from "Test Your Edge" → "Free Crypto Casino Simulators" (keep "Test Your Edge" as accent label above)
2. Update subheadline to list all 9 games: Plinko, Crash, Mines, Roulette, Dice, HiLo, Keno, Limbo, Coin Flip
3. Expand `keywords` metadata to include all game names
4. Add `WebSite` JSON-LD with `potentialAction: SearchAction` (optional, low priority)

### 1.3 Roulette Hub (`/roulette`)

Already the gold standard. Minor updates only:

1. Update H1 from "Roulette Lab" → "Free Roulette Simulator & Tools"
2. Add `keywords` to metadata: `roulette simulator, free roulette, roulette strategy tester, roulette odds calculator, roulette probability`
3. Verify OG image matches sitewide standard (`/opengraph-image` not `/og-image.png`)

### 1.4 Roulette Tool Page (7 pages)

Two sub-patterns exist:

**Pattern A — Complete (odds-calculator, risk-of-ruin):** Already have H1, inline breadcrumb, intro paragraph. Changes:
- Add `keywords` to metadata
- Remove duplicate inline breadcrumb (layout already renders one via `RouletteLabBreadcrumb`)
- Verify structured data consistency

**Pattern B — Incomplete (free-play, strategy-tester, martingale, fibonacci):** Need additions:
- Add H1 (keyword-optimized)
- Add intro paragraph (2–3 sentences, answer-first)
- `keywords` in metadata
- Layout already provides breadcrumb — no need to add one

**Pattern C — Learn page:** Already comprehensive article. Add `keywords` only.

### 1.5 Blog Post (via `[slug]/page.tsx` dynamic route)

Existing template supports: paragraph, heading2, heading3, list, callout, simulator-cta, casino-cta, table, stat-highlight.

**New posts follow three templates:**
- **Strategy Guide:** Game overview → Strategy analysis → Simulation data → Simulator CTA → Casino CTA
- **Comparison Post:** Intro → Casino comparison table → Per-casino review → Game simulator CTA → Disclaimer
- **Educational Post:** Concept explanation → How it applies to each game → Cross-links to all 9 simulators

All blog posts include `Article` JSON-LD schema (already handled by `[slug]/page.tsx`).

---

## 2. New Component Architecture

### 2.1 `components/shared/GameFAQ.tsx`

**Based on:** `components/roulette/RouletteFAQ.tsx`

**Key changes from RouletteFAQ:**
- Accept props instead of hardcoded content
- Accept `gameName` for heading customization
- Keep identical accordion UI (Framer Motion `AnimatePresence`, `ChevronDown` rotation)
- Keep inline `FAQPage` JSON-LD generation
- Same styling: `bg-pb-bg-secondary border border-pb-border rounded-xl`

```typescript
interface FAQItem {
  question: string
  answer: string
}

interface GameFAQProps {
  items: FAQItem[]
  gameName: string
}
```

**Behavior:**
- Renders H2: "Frequently Asked Questions about [gameName]"
- Subtitle: "Honest, math-based answers about [gameName]"
- Accordion with one-at-a-time open state
- Emits `FAQPage` JSON-LD from `items` prop
- `py-16` outer, `max-w-3xl mx-auto` inner (match RouletteFAQ)

### 2.2 `components/shared/GameSEOContent.tsx`

**Based on:** Roulette hub "Why Roulette Math Matters" section pattern

```typescript
interface LinkItem {
  text: string
  href: string
}

interface GameSEOContentProps {
  title: string           // H2 heading, e.g. "How Plinko Works"
  paragraphs: string[][]  // Array of paragraph groups (for columns)
  links?: LinkItem[]       // Optional inline link references
}
```

**Behavior:**
- Server component (no interactivity needed)
- Renders H2, then paragraphs in a responsive 1–2 column grid
- Links rendered inline within paragraph text
- Styling: `py-16`, prose-like typography with `text-pb-text-secondary`
- Subtle top border to separate from game component above

### 2.3 `components/shared/GameHero.tsx`

**Based on:** `RouletteHubHero` (lighter version — no spinning wheel SVG)

```typescript
interface StatItem {
  value: string
  label: string
}

interface GameHeroProps {
  h1: string              // Primary keyword H1
  subtitle: string        // 1-sentence value prop
  stats: StatItem[]       // 3–4 stat items (RTP, max mult, etc.)
}
```

**Behavior:**
- Server component (stats strip doesn't need animation)
- Renders H1 with `font-heading text-4xl md:text-5xl font-bold`
- Subtitle below in `text-pb-text-secondary`
- Stats strip: horizontal row of stat items with `font-mono` values
- No CTA buttons (the game component immediately follows)
- Minimal animation (entry fade only, via CSS not Framer Motion — keeps it as server component)

### 2.4 `components/shared/CrossGameLinks.tsx`

**New component — no existing equivalent**

```typescript
interface CrossGameLinksProps {
  currentGame: string     // Slug of current game (excluded from grid)
}
```

**Behavior:**
- Server component
- Renders H2: "Try More Free Casino Simulators"
- Grid of game cards (3 cols desktop, 2 cols tablet, 1 col mobile)
- Each card: game icon + name + short description + link
- Excludes `currentGame` from the grid
- Uses the same game data source as homepage `GAMES` constant
- Cards styled consistently with `GameCard` component pattern
- Links use keyword anchor text: "Play Free [Game]"

**Game data (9 games):**

| Slug | Display Name | Short Description |
|------|-------------|-------------------|
| plinko | Plinko | Drop balls for multipliers up to 1,000x |
| crash | Crash | Cash out before the multiplier crashes |
| mines | Mines | Reveal gems, avoid mines on a 5×5 grid |
| dice | Dice | Roll over or under your target number |
| hilo | HiLo | Predict if the next card is higher or lower |
| keno | Keno | Pick numbers and match the draw |
| limbo | Limbo | Set a target multiplier and hope to beat it |
| flip | Coin Flip | Heads or tails with chain multipliers |
| roulette | Roulette | Spin the wheel — 7 free tools |

---

## 3. Metadata Standardization Rules

### 3.1 Title Tags
- Format: `[Primary Value Prop] — [Differentiator] | PaperBet.io`
- Max length: 60 characters (Google truncates at ~60)
- Primary keyword appears first
- Brand name last, after pipe separator
- No keyword stuffing — max 1 keyword phrase in title

### 3.2 Meta Descriptions
- Max length: 155 characters
- Answer-first: lead with what the user gets
- Include primary keyword naturally
- End with action verb or benefit
- No duplicate descriptions across pages

### 3.3 Keywords Meta Tag
- 5–8 terms per page
- Primary keyword first
- Include long-tail variants
- No noise keywords (see Content Ruleset 08 for exclusion list)

### 3.4 Canonical URLs
- Always absolute: `https://paperbet.io/[path]`
- No trailing slashes
- Lowercase only

### 3.5 OG / Twitter Tags
- Standardize all pages to `og:image: https://paperbet.io/opengraph-image`
- Fix roulette hub from `/og-image.png` → `/opengraph-image`
- `og:type: website` for all pages except blog posts (`article`)

### 3.6 Structured Data
- **Game pages:** `SoftwareApplication` with `applicationCategory: "GameApplication"`
- **Roulette hub:** `SoftwareApplication` with `applicationCategory: "EducationalApplication"`
- **Roulette tools:** `SoftwareApplication` with `applicationCategory: "UtilitiesApplication"`
- **Blog posts:** `Article` (already handled)
- **Homepage:** `WebSite` (add)
- **All schemas:** `operatingSystem: "Web"`, `offers.price: "0"`, `name: "PaperBet [X]"`
- **Fix:** Mines page — change `WebApplication` → `SoftwareApplication`, add "PaperBet" prefix, change `operatingSystem: "Any"` → `"Web"`

---

## 4. Implementation Wave Sequencing

### Wave 1 — Foundation (Do First)

**Priority: Highest impact, most volume**

| # | Task | Est. Effort |
|---|------|------------|
| 1.1 | Create `GameFAQ` component | Small |
| 1.2 | Create `GameSEOContent` component | Small |
| 1.3 | Create `GameHero` component | Small |
| 1.4 | Create `CrossGameLinks` component | Small |
| 1.5 | Rewrite `/plinko` as reference implementation | Medium |
| 1.6 | Validate Plinko — verify all sections render, FAQ schema validates, metadata correct | Small |
| 1.7 | Replicate pattern to `/crash` | Medium |
| 1.8 | Replicate pattern to `/mines` (also fix structured data) | Medium |
| 1.9 | Replicate pattern to `/dice` | Medium |

### Wave 2 — Remaining Games + Roulette Fixes

| # | Task | Est. Effort |
|---|------|------------|
| 2.1 | Replicate pattern to `/keno` | Medium |
| 2.2 | Replicate pattern to `/hilo` | Medium |
| 2.3 | Replicate pattern to `/limbo` | Medium |
| 2.4 | Replicate pattern to `/flip` | Medium |
| 2.5 | Update `/roulette` hub — H1, keywords, OG image | Small |
| 2.6 | Add H1 + intro to `/roulette/free-play` | Small |
| 2.7 | Add H1 + intro to `/roulette/strategy-tester` | Small |
| 2.8 | Add H1 + intro to `/roulette/simulators/martingale` | Small |
| 2.9 | Add H1 + intro to `/roulette/simulators/fibonacci` | Small |
| 2.10 | Add `keywords` to odds-calculator, risk-of-ruin, learn | Small |
| 2.11 | Remove duplicate inline breadcrumbs from odds-calculator + risk-of-ruin | Small |

### Wave 3 — Homepage + Calculator Sections

| # | Task | Est. Effort |
|---|------|------------|
| 3.1 | Update homepage H1, subheadline, keywords | Small |
| 3.2 | Add Plinko probability calculator section | Medium |
| 3.3 | Add Mines calculator section | Medium |
| 3.4 | Add Dice probability calculator section | Medium |
| 3.5 | Add Keno odds calculator section | Medium |

### Wave 4 — Blog Content (Strategy Guides)

| # | Task | Est. Effort |
|---|------|------------|
| 4.1 | Write roulette-strategy-guide blog post | Large |
| 4.2 | Write dice-strategy-guide blog post | Large |
| 4.3 | Write keno-strategy-guide blog post | Large |
| 4.4 | Write hilo-strategy-guide blog post | Large |
| 4.5 | Write limbo-strategy-guide blog post | Large |
| 4.6 | Write flip-strategy-guide blog post | Large |

### Wave 5 — Blog Content (Comparisons + Educational)

| # | Task | Est. Effort |
|---|------|------------|
| 5.1 | Write best-crypto-casinos-for-roulette | Large |
| 5.2 | Write best-crypto-casinos-for-crash | Large |
| 5.3 | Write best-crypto-casinos-for-mines | Large |
| 5.4 | Write best-crypto-casinos-for-dice | Large |
| 5.5 | Write what-is-provably-fair | Medium |
| 5.6 | Write understanding-house-edge-rtp | Medium |
| 5.7 | Write crypto-casino-beginners-guide | Medium |
| 5.8 | Rewrite plinko-high-risk-vs-low-risk | Medium |
| 5.9 | Update best-crypto-casinos-for-plinko | Medium |

---

## 5. Cross-Reference Index

| Blueprint File | What It Contains | Use It For |
|----------------|-----------------|------------|
| 05 (this file) | Frameworks, components, metadata rules, sequencing | Architecture decisions |
| 06 | Page-by-page briefs (all ~45 pages) | Exact copy and metadata per page |
| 07 | Internal linking adjacency map | Which pages link where |
| 08 | Content ruleset (dos, don'ts, templates) | Writing standards |
