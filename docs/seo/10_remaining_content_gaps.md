# 10 — Remaining Content Gaps

> What was intentionally deferred, what still needs work, and known weak spots.
> Generated: 2026-03-11 | Companion to: 09 changelog

---

## 1. Deferred: Calculator Sections (Wave 3)

The blueprint calls for embedded calculator sections on 4 game pages. These are interactive components that require custom development beyond content changes.

| Page | Calculator | Status |
|------|-----------|--------|
| `/plinko` | Plinko Probability Calculator | Not built |
| `/mines` | Mines Calculator | Not built |
| `/dice` | Dice Probability Calculator | Not built |
| `/keno` | Keno Odds Calculator | Not built |

**Recommendation:** Build as separate client components and embed them between GameSEOContent and GameFAQ sections.

---

## 2. Deferred: Blog Content (Waves 4–5)

### New Strategy Guides (Wave 4)
| Slug | Game | Status |
|------|------|--------|
| `dice-strategy-guide` | Dice | Not written |
| `keno-strategy-guide` | Keno | Not written |
| `hilo-strategy-guide` | HiLo | Not written |
| `limbo-strategy-guide` | Limbo | Not written |
| `flip-strategy-guide` | Coin Flip | Not written |
| `roulette-strategy-guide` | Roulette | Not written |

### New Comparison Posts (Wave 5)
| Slug | Topic | Status |
|------|-------|--------|
| `best-crypto-casinos-for-roulette` | Roulette | Not written |
| `best-crypto-casinos-for-crash` | Crash | Not written |
| `best-crypto-casinos-for-mines` | Mines | Not written |
| `best-crypto-casinos-for-dice` | Dice | Not written |

### New Educational Posts (Wave 5)
| Slug | Topic | Status |
|------|-------|--------|
| `what-is-provably-fair` | Provably fair technology | Not written |
| `understanding-house-edge-rtp` | House edge / RTP explainer | Not written |
| `crypto-casino-beginners-guide` | Beginner intro | Not written |

### Existing Posts Needing Updates (Wave 5)
| Slug | Change Needed | Status |
|------|--------------|--------|
| `plinko-high-risk-vs-low-risk` | Rewrite with updated structure | Not done |
| `best-crypto-casinos-for-plinko` | Update with current data | Not done |

**Note:** The educational sections on game pages already link to these blog slugs. The links will resolve once the posts are created in `lib/blog-data.ts`. Until then, the links point to 404 pages — they should either be created or the links temporarily removed.

---

## 3. Deferred: Roulette Tool Page Cleanup

| Task | Page | Status |
|------|------|--------|
| Remove duplicate inline breadcrumb | `/roulette/odds-calculator` | Not done |
| Remove duplicate inline breadcrumb | `/roulette/risk-of-ruin` | Not done |

These pages have breadcrumbs rendered both by the layout and inline. The layout breadcrumb should be the only one. Low priority since it's a minor visual issue, not a content gap.

---

## 4. Not Implemented: WebSite JSON-LD on Homepage

The blueprint mentions adding `WebSite` structured data with `potentialAction: SearchAction` to the homepage. This was marked as optional/low priority and was not implemented. PaperBet has no search functionality, making SearchAction meaningless.

---

## 5. Known Weak Spots

### 5.1 Blog Post Links to Unpublished Content
Several game pages link to blog posts that don't yet exist:
- `/blog/crash-strategy-guide`
- `/blog/mines-strategy-guide`
- `/blog/dice-strategy-guide`

These links are in the educational content paragraphs. They will 404 until the blog posts are created.

**Mitigation options:**
1. Create the blog posts (recommended — Wave 4)
2. Remove the links temporarily until posts exist
3. Add redirect rules to a related existing post

### 5.2 Cross-Game Links Card Design
The CrossGameLinks component uses a simple text-based card design. The blueprint spec mentions "game icon + name + short description + link" but the current implementation omits icons for simplicity. Adding dynamic icon rendering would improve visual quality but isn't critical for SEO.

### 5.3 Game Page Scroll Position
With the new GameHero section above the game component, the interactive game is no longer visible above the fold on all viewports. On smaller screens, users may need to scroll past the hero to reach the game. The hero is compact (pt-8 pb-4 on mobile) to minimize this, but it's worth monitoring user behavior.

### 5.4 Roulette Pages Missing CrossGameLinks
The roulette hub and tool pages don't have the CrossGameLinks component. The roulette hub has its own tool navigation grid. Adding CrossGameLinks to roulette pages would strengthen cross-linking but risks cluttering an already content-rich page.

---

## 6. Priority Ranking of Remaining Work

| Priority | Task | Impact | Effort |
|----------|------|--------|--------|
| 1 | Write 6 strategy guide blog posts | High (fills empty links, adds content depth) | Large |
| 2 | Write 3 educational blog posts | High (cross-links from all game pages) | Medium |
| 3 | Build 4 calculator components | Medium (adds tool value, captures long-tail KWs) | Medium |
| 4 | Write 4 comparison blog posts | Medium (commercial intent pages) | Large |
| 5 | Update 2 existing blog posts | Low (existing content, minor refresh) | Small |
| 6 | Remove duplicate roulette breadcrumbs | Low (visual cleanup) | Small |
| 7 | Add icons to CrossGameLinks | Low (visual polish) | Small |
