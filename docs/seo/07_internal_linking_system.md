# 07 — Internal Linking System

> Link type taxonomy, hub-and-spoke model, full adjacency map, anchor text guidelines.
> Generated: 2026-03-11 | Companion to: 05–08 blueprint docs

---

## 1. Link Type Taxonomy

Every internal link on PaperBet falls into one of these 6 categories:

| Type | Purpose | Example |
|------|---------|---------|
| **Game CTA** | Drive users from content to simulator | "Try this in our free Plinko simulator" → `/plinko` |
| **Strategy Link** | Connect simulator to its strategy guide | "Read the Plinko strategy guide" → `/blog/plinko-strategy-guide` |
| **Comparison Link** | Connect simulator to casino comparison | "Best casinos for Plinko" → `/blog/best-crypto-casinos-for-plinko` |
| **Cross-Game Link** | Connect one game to another game | "Try Crash next" → `/crash` |
| **Educational Link** | Connect to concept explanations | "Learn about provably fair" → `/blog/what-is-provably-fair` |
| **Commercial Link** | Connect to deals/casino offers | "View featured deals" → `/deals` |

---

## 2. Hub-and-Spoke Model

### 2.1 Primary Hubs

Each game page is a **hub** that links outward to its **spokes** (related content):

```
                    ┌──────────────────┐
                    │   Game Page      │
                    │   (Hub)          │
                    └────────┬─────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
    ┌─────▼─────┐    ┌──────▼──────┐    ┌──────▼──────┐
    │ Strategy   │    │ Comparison  │    │ Educational │
    │ Guide      │    │ Post        │    │ Posts       │
    │ (Spoke)    │    │ (Spoke)     │    │ (Spokes)    │
    └────────────┘    └─────────────┘    └─────────────┘
```

### 2.2 Cross-Hub Connections

Every game hub links to every other game hub via the `CrossGameLinks` component:

```
    Plinko ←→ Crash ←→ Mines ←→ Dice
      ↕          ↕        ↕        ↕
    HiLo  ←→  Keno  ←→ Limbo ←→ Flip
      ↕          ↕        ↕        ↕
      └──────────┴────────┴────────┘
              All connect to
              Roulette Hub
```

### 2.3 Roulette Sub-Hub

The roulette section has its own internal hub-and-spoke:

```
                ┌──────────────────┐
                │ /roulette (Hub)  │
                └────────┬─────────┘
                         │
    ┌────────┬───────┬───┴───┬────────┬──────────┬────────┐
    │        │       │       │        │          │        │
  free-   strategy odds-  risk-of  martingale fibonacci learn
  play    tester   calc    ruin    simulator  simulator guide
```

---

## 3. Complete Adjacency Map

### Legend
- **→ OUT** = This page links to
- **← IN** = These pages link to this page
- Link types in parentheses: (game-cta), (strategy), (comparison), (cross-game), (educational), (commercial)

---

### 3.1 Homepage (`/`)

**→ OUT:**
- `/plinko` (game-cta)
- `/crash` (game-cta)
- `/mines` (game-cta)
- `/dice` (game-cta)
- `/hilo` (game-cta)
- `/keno` (game-cta)
- `/limbo` (game-cta)
- `/flip` (game-cta)
- `/roulette` (game-cta)
- `/deals` (commercial)
- `/blog` (strategy)
- `/responsible-gambling` (footer)

**← IN:**
- All pages via site navigation
- All roulette tool pages via breadcrumb "Home"

---

### 3.2 Plinko (`/plinko`)

**→ OUT:**
- `/blog/plinko-strategy-guide` (strategy)
- `/blog/plinko-high-risk-vs-low-risk` (strategy)
- `/blog/best-crypto-casinos-for-plinko` (comparison)
- `/blog/what-is-provably-fair` (educational)
- `/blog/understanding-house-edge-rtp` (educational)
- `/crash` (cross-game)
- `/mines` (cross-game)
- `/dice` (cross-game)
- `/hilo` (cross-game)
- `/keno` (cross-game)
- `/limbo` (cross-game)
- `/flip` (cross-game)
- `/roulette` (cross-game)
- `/deals` (commercial)
- `/responsible-gambling` (footer)

**← IN:**
- `/` (game-cta)
- `/blog/plinko-strategy-guide` (game-cta)
- `/blog/plinko-high-risk-vs-low-risk` (game-cta)
- `/blog/best-crypto-casinos-for-plinko` (game-cta)
- `/blog/what-is-provably-fair` (educational)
- `/blog/understanding-house-edge-rtp` (educational)
- `/blog/crypto-casino-beginners-guide` (educational)
- All other game pages via CrossGameLinks

### 3.3 Crash (`/crash`)

**→ OUT:**
- `/blog/crash-strategy-guide` (strategy)
- `/blog/best-crypto-casinos-for-crash` (comparison)
- `/blog/what-is-provably-fair` (educational)
- `/blog/understanding-house-edge-rtp` (educational)
- `/plinko` (cross-game)
- `/mines` (cross-game)
- `/dice` (cross-game)
- `/hilo` (cross-game)
- `/keno` (cross-game)
- `/limbo` (cross-game)
- `/flip` (cross-game)
- `/roulette` (cross-game)
- `/deals` (commercial)
- `/responsible-gambling` (footer)

**← IN:**
- `/` (game-cta)
- `/blog/crash-strategy-guide` (game-cta)
- `/blog/best-crypto-casinos-for-crash` (game-cta)
- `/blog/what-is-provably-fair` (educational)
- `/blog/understanding-house-edge-rtp` (educational)
- `/blog/crypto-casino-beginners-guide` (educational)
- All other game pages via CrossGameLinks

### 3.4 Mines (`/mines`)

**→ OUT:**
- `/blog/mines-strategy-guide` (strategy)
- `/blog/best-crypto-casinos-for-mines` (comparison)
- `/blog/what-is-provably-fair` (educational)
- `/blog/understanding-house-edge-rtp` (educational)
- `/plinko` (cross-game)
- `/crash` (cross-game)
- `/dice` (cross-game)
- `/hilo` (cross-game)
- `/keno` (cross-game)
- `/limbo` (cross-game)
- `/flip` (cross-game)
- `/roulette` (cross-game)
- `/deals` (commercial)
- `/responsible-gambling` (footer)

**← IN:**
- `/` (game-cta)
- `/blog/mines-strategy-guide` (game-cta)
- `/blog/best-crypto-casinos-for-mines` (game-cta)
- `/blog/what-is-provably-fair` (educational)
- `/blog/understanding-house-edge-rtp` (educational)
- `/blog/crypto-casino-beginners-guide` (educational)
- All other game pages via CrossGameLinks

### 3.5 Dice (`/dice`)

**→ OUT:**
- `/blog/dice-strategy-guide` (strategy)
- `/blog/best-crypto-casinos-for-dice` (comparison)
- `/blog/what-is-provably-fair` (educational)
- `/blog/understanding-house-edge-rtp` (educational)
- `/plinko` (cross-game)
- `/crash` (cross-game)
- `/mines` (cross-game)
- `/hilo` (cross-game)
- `/keno` (cross-game)
- `/limbo` (cross-game)
- `/flip` (cross-game)
- `/roulette` (cross-game)
- `/deals` (commercial)
- `/responsible-gambling` (footer)

**← IN:**
- `/` (game-cta)
- `/blog/dice-strategy-guide` (game-cta)
- `/blog/best-crypto-casinos-for-dice` (game-cta)
- `/blog/what-is-provably-fair` (educational)
- `/blog/understanding-house-edge-rtp` (educational)
- `/blog/crypto-casino-beginners-guide` (educational)
- All other game pages via CrossGameLinks

### 3.6 HiLo (`/hilo`)

**→ OUT:**
- `/blog/hilo-strategy-guide` (strategy)
- `/blog/what-is-provably-fair` (educational)
- `/blog/understanding-house-edge-rtp` (educational)
- `/plinko` (cross-game)
- `/crash` (cross-game)
- `/mines` (cross-game)
- `/dice` (cross-game)
- `/keno` (cross-game)
- `/limbo` (cross-game)
- `/flip` (cross-game)
- `/roulette` (cross-game)
- `/deals` (commercial)
- `/responsible-gambling` (footer)

**← IN:**
- `/` (game-cta)
- `/blog/hilo-strategy-guide` (game-cta)
- `/blog/what-is-provably-fair` (educational)
- `/blog/understanding-house-edge-rtp` (educational)
- `/blog/crypto-casino-beginners-guide` (educational)
- All other game pages via CrossGameLinks

### 3.7 Keno (`/keno`)

**→ OUT:**
- `/blog/keno-strategy-guide` (strategy)
- `/blog/what-is-provably-fair` (educational)
- `/blog/understanding-house-edge-rtp` (educational)
- `/plinko` (cross-game)
- `/crash` (cross-game)
- `/mines` (cross-game)
- `/dice` (cross-game)
- `/hilo` (cross-game)
- `/limbo` (cross-game)
- `/flip` (cross-game)
- `/roulette` (cross-game)
- `/deals` (commercial)
- `/responsible-gambling` (footer)

**← IN:**
- `/` (game-cta)
- `/blog/keno-strategy-guide` (game-cta)
- `/blog/what-is-provably-fair` (educational)
- `/blog/understanding-house-edge-rtp` (educational)
- `/blog/crypto-casino-beginners-guide` (educational)
- All other game pages via CrossGameLinks

### 3.8 Limbo (`/limbo`)

**→ OUT:**
- `/blog/limbo-strategy-guide` (strategy)
- `/blog/what-is-provably-fair` (educational)
- `/blog/understanding-house-edge-rtp` (educational)
- `/plinko` (cross-game)
- `/crash` (cross-game)
- `/mines` (cross-game)
- `/dice` (cross-game)
- `/hilo` (cross-game)
- `/keno` (cross-game)
- `/flip` (cross-game)
- `/roulette` (cross-game)
- `/deals` (commercial)
- `/responsible-gambling` (footer)

**← IN:**
- `/` (game-cta)
- `/blog/limbo-strategy-guide` (game-cta)
- `/blog/what-is-provably-fair` (educational)
- `/blog/understanding-house-edge-rtp` (educational)
- `/blog/crypto-casino-beginners-guide` (educational)
- All other game pages via CrossGameLinks

### 3.9 Flip (`/flip`)

**→ OUT:**
- `/blog/flip-strategy-guide` (strategy)
- `/blog/what-is-provably-fair` (educational)
- `/blog/understanding-house-edge-rtp` (educational)
- `/plinko` (cross-game)
- `/crash` (cross-game)
- `/mines` (cross-game)
- `/dice` (cross-game)
- `/hilo` (cross-game)
- `/keno` (cross-game)
- `/limbo` (cross-game)
- `/roulette` (cross-game)
- `/deals` (commercial)
- `/responsible-gambling` (footer)

**← IN:**
- `/` (game-cta)
- `/blog/flip-strategy-guide` (game-cta)
- `/blog/what-is-provably-fair` (educational)
- `/blog/understanding-house-edge-rtp` (educational)
- `/blog/crypto-casino-beginners-guide` (educational)
- All other game pages via CrossGameLinks

### 3.10 Roulette Hub (`/roulette`)

**→ OUT:**
- `/roulette/free-play` (game-cta)
- `/roulette/strategy-tester` (game-cta)
- `/roulette/odds-calculator` (game-cta)
- `/roulette/risk-of-ruin` (game-cta)
- `/roulette/simulators/martingale` (game-cta)
- `/roulette/simulators/fibonacci` (game-cta)
- `/roulette/learn` (educational)
- `/blog/roulette-strategy-guide` (strategy)
- `/blog/best-crypto-casinos-for-roulette` (comparison)
- `/roulette/disclaimer` (footer)
- `/responsible-gambling` (footer)

**← IN:**
- `/` (game-cta)
- All roulette tool pages via breadcrumb
- All game pages via CrossGameLinks
- `/blog/roulette-strategy-guide` (game-cta)
- `/blog/best-crypto-casinos-for-roulette` (game-cta)
- `/blog/what-is-provably-fair` (educational)
- `/blog/understanding-house-edge-rtp` (educational)
- `/blog/crypto-casino-beginners-guide` (educational)

### 3.11 Roulette Tool Pages

**`/roulette/free-play` → OUT:**
- `/roulette` (breadcrumb)
- `/roulette/strategy-tester` (cross-link: "Test a strategy")
- `/roulette/learn` (educational: "Learn the rules")
- `/responsible-gambling` (footer)

**`/roulette/free-play` ← IN:**
- `/roulette` (game-cta)
- `/blog/roulette-strategy-guide` (game-cta)

**`/roulette/strategy-tester` → OUT:**
- `/roulette` (breadcrumb)
- `/roulette/simulators/martingale` (cross-link)
- `/roulette/simulators/fibonacci` (cross-link)
- `/roulette/risk-of-ruin` (cross-link: "Calculate your risk")
- `/responsible-gambling` (footer)

**`/roulette/strategy-tester` ← IN:**
- `/roulette` (game-cta)

**`/roulette/odds-calculator` → OUT:**
- `/roulette` (breadcrumb)
- `/roulette/learn` (educational)
- `/roulette/risk-of-ruin` (cross-link)
- `/responsible-gambling` (footer)

**`/roulette/odds-calculator` ← IN:**
- `/roulette` (game-cta)
- `/roulette/learn` (educational)

**`/roulette/risk-of-ruin` → OUT:**
- `/roulette` (breadcrumb)
- `/roulette/strategy-tester` (cross-link)
- `/roulette/odds-calculator` (cross-link)
- `/responsible-gambling` (footer)

**`/roulette/risk-of-ruin` ← IN:**
- `/roulette` (game-cta)
- `/roulette/strategy-tester` (cross-link)
- `/roulette/odds-calculator` (cross-link)

**`/roulette/simulators/martingale` → OUT:**
- `/roulette` (breadcrumb)
- `/roulette/simulators/fibonacci` (cross-link: "Try Fibonacci instead")
- `/roulette/risk-of-ruin` (cross-link: "Calculate Martingale risk")
- `/roulette/strategy-tester` (cross-link: "Compare all strategies")
- `/responsible-gambling` (footer)

**`/roulette/simulators/martingale` ← IN:**
- `/roulette` (game-cta)
- `/roulette/strategy-tester` (cross-link)
- `/roulette/simulators/fibonacci` (cross-link)

**`/roulette/simulators/fibonacci` → OUT:**
- `/roulette` (breadcrumb)
- `/roulette/simulators/martingale` (cross-link: "Try Martingale instead")
- `/roulette/risk-of-ruin` (cross-link: "Calculate Fibonacci risk")
- `/roulette/strategy-tester` (cross-link: "Compare all strategies")
- `/responsible-gambling` (footer)

**`/roulette/simulators/fibonacci` ← IN:**
- `/roulette` (game-cta)
- `/roulette/strategy-tester` (cross-link)
- `/roulette/simulators/martingale` (cross-link)

**`/roulette/learn` → OUT:**
- `/roulette` (breadcrumb)
- `/roulette/free-play` (game-cta: "Practice what you learned")
- `/roulette/odds-calculator` (cross-link)
- `/roulette/strategy-tester` (cross-link)
- `/roulette/simulators/martingale` (cross-link)
- `/roulette/simulators/fibonacci` (cross-link)
- `/roulette/risk-of-ruin` (cross-link)
- `/responsible-gambling` (footer)

**`/roulette/learn` ← IN:**
- `/roulette` (game-cta)
- `/roulette/free-play` (educational)
- `/roulette/odds-calculator` (educational)

---

### 3.12 Blog Posts — Strategy Guides

**Pattern: Every strategy guide links to:**
- Its game simulator (game-cta — primary CTA)
- Its comparison post, if exists (comparison)
- Educational posts: provably-fair, house-edge-rtp (educational)
- `/deals` (commercial)

**`/blog/plinko-strategy-guide`**
→ OUT: `/plinko` (game-cta), `/blog/plinko-high-risk-vs-low-risk` (strategy), `/blog/best-crypto-casinos-for-plinko` (comparison), `/blog/what-is-provably-fair` (educational), `/deals` (commercial)
← IN: `/plinko` (strategy)

**`/blog/crash-strategy-guide`**
→ OUT: `/crash` (game-cta), `/blog/best-crypto-casinos-for-crash` (comparison), `/blog/what-is-provably-fair` (educational), `/deals` (commercial)
← IN: `/crash` (strategy)

**`/blog/mines-strategy-guide`**
→ OUT: `/mines` (game-cta), `/blog/best-crypto-casinos-for-mines` (comparison), `/blog/what-is-provably-fair` (educational), `/deals` (commercial)
← IN: `/mines` (strategy)

**`/blog/dice-strategy-guide`** (NEW)
→ OUT: `/dice` (game-cta), `/blog/best-crypto-casinos-for-dice` (comparison), `/blog/understanding-house-edge-rtp` (educational), `/deals` (commercial)
← IN: `/dice` (strategy)

**`/blog/keno-strategy-guide`** (NEW)
→ OUT: `/keno` (game-cta), `/blog/understanding-house-edge-rtp` (educational), `/deals` (commercial)
← IN: `/keno` (strategy)

**`/blog/roulette-strategy-guide`** (NEW)
→ OUT: `/roulette` (game-cta), `/roulette/free-play` (game-cta), `/roulette/strategy-tester` (game-cta), `/blog/best-crypto-casinos-for-roulette` (comparison), `/blog/understanding-house-edge-rtp` (educational), `/deals` (commercial)
← IN: `/roulette` (strategy)

**`/blog/hilo-strategy-guide`** (NEW)
→ OUT: `/hilo` (game-cta), `/blog/understanding-house-edge-rtp` (educational), `/deals` (commercial)
← IN: `/hilo` (strategy)

**`/blog/limbo-strategy-guide`** (NEW)
→ OUT: `/limbo` (game-cta), `/blog/understanding-house-edge-rtp` (educational), `/deals` (commercial)
← IN: `/limbo` (strategy)

**`/blog/flip-strategy-guide`** (NEW)
→ OUT: `/flip` (game-cta), `/blog/understanding-house-edge-rtp` (educational), `/deals` (commercial)
← IN: `/flip` (strategy)

### 3.13 Blog Posts — Comparison Posts

**Pattern: Every comparison post links to:**
- Its game simulator (game-cta)
- Its strategy guide (strategy)
- `/deals` (commercial)

**`/blog/best-crypto-casinos-for-plinko`** (EXISTING — update)
→ OUT: `/plinko` (game-cta), `/blog/plinko-strategy-guide` (strategy), `/blog/best-crypto-casinos-for-crash` (comparison), `/blog/best-crypto-casinos-for-mines` (comparison), `/deals` (commercial)
← IN: `/plinko` (comparison), `/blog/plinko-strategy-guide` (comparison)

**`/blog/best-crypto-casinos-for-crash`** (NEW)
→ OUT: `/crash` (game-cta), `/blog/crash-strategy-guide` (strategy), `/deals` (commercial)
← IN: `/crash` (comparison), `/blog/crash-strategy-guide` (comparison)

**`/blog/best-crypto-casinos-for-mines`** (NEW)
→ OUT: `/mines` (game-cta), `/blog/mines-strategy-guide` (strategy), `/deals` (commercial)
← IN: `/mines` (comparison), `/blog/mines-strategy-guide` (comparison)

**`/blog/best-crypto-casinos-for-roulette`** (NEW)
→ OUT: `/roulette` (game-cta), `/roulette/free-play` (game-cta), `/blog/roulette-strategy-guide` (strategy), `/deals` (commercial)
← IN: `/roulette` (comparison), `/blog/roulette-strategy-guide` (comparison)

**`/blog/best-crypto-casinos-for-dice`** (NEW)
→ OUT: `/dice` (game-cta), `/blog/dice-strategy-guide` (strategy), `/deals` (commercial)
← IN: `/dice` (comparison), `/blog/dice-strategy-guide` (comparison)

### 3.14 Blog Posts — Educational Posts

**Pattern: Every educational post links to all 9 game simulators.**

**`/blog/what-is-provably-fair`** (NEW)
→ OUT: `/plinko` (game-cta), `/crash` (game-cta), `/mines` (game-cta), `/dice` (game-cta), `/hilo` (game-cta), `/keno` (game-cta), `/limbo` (game-cta), `/flip` (game-cta), `/roulette` (game-cta), `/blog/understanding-house-edge-rtp` (educational)
← IN: All 9 game pages (educational), all strategy guides (educational)

**`/blog/understanding-house-edge-rtp`** (NEW)
→ OUT: `/plinko` (game-cta), `/crash` (game-cta), `/mines` (game-cta), `/dice` (game-cta), `/hilo` (game-cta), `/keno` (game-cta), `/limbo` (game-cta), `/flip` (game-cta), `/roulette` (game-cta), `/blog/what-is-provably-fair` (educational)
← IN: All 9 game pages (educational), all strategy guides (educational)

**`/blog/crypto-casino-beginners-guide`** (NEW)
→ OUT: `/plinko` (game-cta), `/crash` (game-cta), `/mines` (game-cta), `/dice` (game-cta), `/hilo` (game-cta), `/keno` (game-cta), `/limbo` (game-cta), `/flip` (game-cta), `/roulette` (game-cta), `/deals` (commercial), `/blog/what-is-provably-fair` (educational), `/blog/understanding-house-edge-rtp` (educational)
← IN: None required (top-of-funnel entry page)

### 3.15 Blog Posts — Existing (Optimize)

**`/blog/plinko-high-risk-vs-low-risk`** (EXISTING — optimize)
→ OUT: `/plinko` (game-cta), `/blog/plinko-strategy-guide` (strategy), `/blog/best-crypto-casinos-for-plinko` (comparison)
← IN: `/plinko` (strategy), `/blog/plinko-strategy-guide` (strategy)

### 3.16 Utility Pages

**`/deals`**
→ OUT: `/plinko` (game-cta), `/crash` (game-cta), `/mines` (game-cta), `/roulette` (game-cta), `/responsible-gambling` (footer)
← IN: All game pages (commercial), all comparison posts (commercial), all strategy guides (commercial)

**`/blog` (index)**
→ OUT: All blog post pages
← IN: `/` (strategy), navigation

**`/responsible-gambling`**
→ OUT: None (terminal page)
← IN: All game pages (footer), all roulette tool pages (footer)

**`/privacy`, `/terms`**
→ OUT: Each other
← IN: Site footer

**`/roulette/disclaimer`**
→ OUT: `/responsible-gambling`
← IN: `/roulette` (footer)

---

## 4. Anchor Text Guidelines

### 4.1 Game CTA Anchors

Use keyword-rich anchor text that includes the game name and "simulator" or "free":

| Target | Anchor Text Options |
|--------|-------------------|
| `/plinko` | "Try our free Plinko simulator", "Play Plinko free", "Practice in the Plinko simulator" |
| `/crash` | "Try our free Crash simulator", "Play Crash free", "Test cashout strategies in our Crash simulator" |
| `/mines` | "Try our free Mines simulator", "Play Mines free", "Practice in the Mines simulator" |
| `/dice` | "Try our free Dice simulator", "Play Dice free", "Practice roll strategies in our Dice simulator" |
| `/hilo` | "Try our free HiLo simulator", "Play HiLo free", "Practice in the HiLo simulator" |
| `/keno` | "Try our free Keno simulator", "Play Keno free", "Practice in the Keno simulator" |
| `/limbo` | "Try our free Limbo simulator", "Play Limbo free", "Practice in the Limbo simulator" |
| `/flip` | "Try our free Coin Flip simulator", "Play Coin Flip free" |
| `/roulette` | "Explore our free roulette tools", "Try our roulette simulator" |

### 4.2 Strategy Link Anchors

| Target | Anchor Text Options |
|--------|-------------------|
| Strategy guide | "Read the [Game] strategy guide", "[Game] strategy guide", "Learn [Game] strategy" |
| Comparison post | "Best casinos for [Game]", "Where to play [Game] for real", "Top [Game] casinos" |
| Educational post | "Learn about provably fair", "Understanding house edge and RTP", "Crypto casino beginner's guide" |

### 4.3 Cross-Game Link Anchors

Used within `CrossGameLinks` component cards:

| Target | Card Anchor |
|--------|------------|
| Any game | "Play Free [Game]" (button text on card) |

### 4.4 Anchor Text Rules

1. **Never use generic anchors** — no "click here", "read more", "learn more" without context
2. **Vary anchor text** — don't use the same exact anchor for the same target across all pages
3. **Include keyword in anchor** — every anchor to a game page should include the game name
4. **Max 2 links to same target per page** — one in content, one in navigation/component
5. **No exact-match keyword anchors repeatedly** — vary between "Plinko simulator", "free Plinko", "Plinko game" etc.

---

## 5. Cross-Game Linking Rules

### 5.1 CrossGameLinks Component Rules

1. Shows all 8 other games (excludes current)
2. Uses game card format with icon, name, short description
3. Card links use "Play Free [Game]" anchor text
4. Appears below FAQ section, above strategy guides section
5. H2 heading: "Try More Free Casino Simulators"
6. Grid: 3 cols desktop, 2 cols tablet, 1 col mobile

### 5.2 In-Content Cross-Links

Beyond the CrossGameLinks component, cross-game links can appear inline in educational content:

- Limbo page can reference Crash: "Limbo is an instant version of Crash — instead of watching a multiplier rise, you set your target upfront"
- Dice page can reference Limbo: "If you want a simpler version without the roll animation, try Limbo"
- Mines page can reference Plinko: "For a different kind of risk-reward game, try Plinko"

### 5.3 Linking Constraints

1. **No orphan pages** — every page must have at least 2 inbound links
2. **No dead ends** — every page must link to at least 2 other pages (excluding footer)
3. **Reciprocal where possible** — if A links to B, B should link back to A (except educational posts which receive links from all games but only link out to all games)
4. **Max link depth from homepage: 3 clicks** — Homepage → Game/Blog → Deep content
5. **Blog posts always link back to their game** — the simulator CTA is the primary conversion point

---

## 6. Link Audit Checklist

Use this checklist when implementing links on any page:

- [ ] Page has at least 2 inbound links from other pages
- [ ] Page links to at least 2 other pages
- [ ] All anchor text includes relevant keywords (no generic "click here")
- [ ] Game page includes CrossGameLinks component
- [ ] Game page links to its strategy guide (if exists)
- [ ] Game page links to its comparison post (if exists)
- [ ] Game page links to at least 1 educational post
- [ ] Game page links to `/deals`
- [ ] Game page links to `/responsible-gambling`
- [ ] Blog post links back to its game simulator
- [ ] No broken links (all targets exist or are planned)
- [ ] No exact-match anchor text used more than twice on same page
