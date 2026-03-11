# PaperBet.io Implementation Progress

## Phase 7 — Final Polish, SEO, Mobile & Performance
- [x] SEO: sitemap.ts (dynamic, all pages + blog posts with priorities)
- [x] SEO: robots.ts (allow all, sitemap URL)
- [x] SEO: Homepage JSON-LD (WebSite + Organization schema)
- [x] SEO: Twitter card metadata added to all pages (layout, plinko, crash, mines, deals)
- [x] SEO: OG images added to all game/deals pages
- [x] Accessibility: Skip-to-content link in layout.tsx (sr-only, visible on focus)
- [x] Accessibility: Global focus-visible styles (2px accent outline, :focus-visible only)
- [x] Accessibility: Canvas fallback text (PlinkoBoard, CrashChart, DealWheel)
- [x] Error handling: Branded 404 page (not-found.tsx) with CTAs
- [x] Error handling: Loading skeletons (loading.tsx) for all game routes
- [x] Error handling: localStorage try/catch verified across all files
- [x] Compliance: rel="sponsored" added to all affiliate links (DealWheelResult, DealWheelSidebar, RealMoneyDisplay)
- [x] Cleanup: Removed unused imports (SITE, useCallback, email, TierWeight)
- [x] Build verification — 0 errors, 17 routes
- [x] Consistency: No "exclusive", "No KYC", "console.log" found in codebase
- [x] Devil's advocate audit — 15 issues found (2 CRITICAL, 5 HIGH, 4 MEDIUM, 4 LOW)
- [x] Fix CRITICAL: Created OG image via opengraph-image.tsx (ImageResponse)
- [x] Fix CRITICAL: Moved JSON-LD from client page.tsx to server layout.tsx, added inLanguage
- [x] Fix HIGH: Added OG metadata to privacy, terms, responsible-gambling pages
- [x] Fix HIGH: Added metadata with robots:noindex to 404 page
- [x] Fix HIGH: Added role="img" and aria-label to PlinkoBoard + CrashChart canvases
- [x] Fix HIGH: Moved CrashChart style jsx keyframes to globals.css
- [x] Fix MEDIUM: Removed border-radius from focus-visible (inherits from element)
- [x] Fix MEDIUM: Fixed misleading "Let us know" copy on 404 page
- [x] Fix MEDIUM: Used fixed dates for legal pages in sitemap
- [x] Fix LOW: Added role="status" to all loading.tsx components
- [x] Fix: Added metadataBase to root layout metadata
- [x] Fix: DealWheel ARIA label made dynamic (segments.length)
- [x] Fix: T&Cs links changed from rel="sponsored" to rel="noreferrer" (not affiliate content)
- [x] Fix: Confetti canvas added aria-hidden="true" (decorative)
- [x] Fix: Blog article JSON-LD added required `image` property
- [x] Final build verification — 0 errors, 18 routes (incl. opengraph-image)

## Phase 6 — Blog System + 3 SEO Articles
- [x] Create blog data layer (lib/blog-data.ts) with types and 3 full articles
- [x] Build blog index page with filter tabs, cards, metadata
- [x] Build dynamic blog post page with content renderer, TOC sidebar, related posts
- [x] Update internal links (footer, plinko page, homepage Strategy Hub)
- [x] Build verification — 0 errors, 15 routes
- [x] Devil's advocate audit — 25 issues found and fixed (4 Critical, 8 High, 8 Medium, 5 Low)
- [x] Final build verification — 0 errors, 15 routes


## Phase 0 — Project Setup & Configuration
- [x] Initialize Next.js 16 project with TypeScript, Tailwind v4, ESLint
- [x] Install framer-motion and lucide-react
- [x] Configure Tailwind v4 design tokens in globals.css (@theme inline)
- [x] Configure fonts: Outfit (heading), DM Sans (body), JetBrains Mono (mono)
- [x] Create file structure (app/, components/, lib/, content/, public/)
- [x] Set up lib/constants.ts (CASINOS, GAMES, SITE)
- [x] Set up lib/types.ts (Casino, Game, BetResult, SessionStats, etc.)
- [x] Set up lib/utils.ts (formatCurrency, formatMultiplier, generateId, cn)
- [x] Verify build compiles with zero errors

## Phase 1 — Layout + Landing Page
- [x] Button.tsx — primary/secondary/ghost variants, sm/md/lg sizes, loading state, Link rendering
- [x] Badge.tsx — success/warning/info/muted variants, rounded-full pill
- [x] GameCard.tsx — Framer Motion hover, icon lookup, RTP badge, available/coming soon states
- [x] Header.tsx — Fixed navbar, logo, desktop nav with animated Games dropdown, mobile hamburger
- [x] MobileNav.tsx — AnimatePresence slide-in, scroll lock, game list, CTA
- [x] Footer.tsx — 4-column grid (responsive), disclaimer, copyright
- [x] Landing page with 6 sections: Hero, Game Cards, How It Works, Casino Partners, Stats, Final CTA
- [x] Placeholder pages for /plinko, /crash, /mines, /deals, /blog
- [x] SEO metadata (og:image, canonical URL)
- [x] Accessibility fixes (aria-expanded, aria-label, form attributes)
- [x] Production config (poweredByHeader: false, WebP images)
- [x] Final build verification — zero errors

### Phase 1 QA Fixes
- [x] Fix fonts not loading — removed @theme font indirection, added .font-heading/.font-mono-stats CSS classes, added dmSans.className to body
- [x] Fix mobile nav overlay — 100% opacity, inline style scroll lock
- [x] Fix hero 3-second blank — replaced Framer Motion with CSS @keyframes animations
- [x] Fix Games dropdown staying open after navigation — usePathname listener
- [x] Fix casino carousel — changed from horizontal scroll to responsive grid (1/2/3 cols)
- [x] Simplify font class usage — replaced all font-[family-name:var(--font-heading)] with .font-heading across 11 files
- [x] Increase hero glow orb opacity from /5 to /10
- [x] Reduce AnimatedSection margin from -80px to -40px for better mobile triggering
- [x] Add email form success state with confirmation message
- [x] Fix scroll indicator — removed 1s delay, now visible immediately
- [x] Add active state to Header nav links using usePathname
- [x] Build verification — zero errors

## Phase 2 — Plinko Simulator (Flagship Game)
- [x] Data foundation: plinkoTypes.ts, plinkoMultipliers.ts (27 tables), plinkoEngine.ts
- [x] Added getSlotColor(), getResultColor(), getWinTier() to lib/utils.ts
- [x] Added AutoPlaySpeed type to lib/types.ts
- [x] usePlinkoGame.ts — useReducer with $1000 balance, full session stats, 100-bet reminder
- [x] usePlinkoAutoPlay.ts — Normal/Fast/Turbo speeds, stop conditions, cleanup on unmount
- [x] plinkoAnimation.ts — Canvas animator class, multi-ball support, peg flash, ball trail, DPR-aware
- [x] PlinkoBoard.tsx — Canvas component with ResizeObserver, forwardRef, reduced-motion support
- [x] PlinkoSlots.tsx — Color-coded multiplier slots (HTML below canvas)
- [x] PlinkoResultOverlay.tsx — Animated multiplier + profit display with win tier effects
- [x] PlinkoControls.tsx — Bet amount (+/- and quick-select), risk segmented control, rows slider, drop button, auto-play panel, spacebar shortcut, session reminder
- [x] SessionStats.tsx — Reusable 2x2 stat card grid (shared)
- [x] BetHistory.tsx — Scrollable table with Framer Motion row animation (shared)
- [x] RealMoneyDisplay.tsx — "What You Would Have Won" card with casino CTA (shared)
- [x] CasinoCard.tsx — Casino recommendation card with hover border effect (shared)
- [x] PlinkoSidebar.tsx — Stats, casino cards, Deal Wheel CTA, bet history, post-session nudge, disclaimer
- [x] PlinkoGame.tsx — 3-column responsive orchestrator (desktop: controls | board | sidebar)
- [x] app/plinko/page.tsx — Server component with SEO metadata + SoftwareApplication structured data
- [x] Build verification — zero errors, no console.log, no `any` types

## Phase 3 — Crash Simulator
- [x] Data foundation: crashTypes.ts (CrashPhase, CrashGameState, CrashAction, etc.)
- [x] crashEngine.ts — crash point generation (provably fair, 1% house edge), multiplier math (e^0.15t), color scheme, formatting
- [x] useCrashGame.ts — useReducer with $1000 balance, round lifecycle (betting→running→crashed), auto-cashout, auto-play with on-win/on-loss strategies
- [x] crashAnimation.ts — CrashChartRenderer class: logarithmic grid, multiplier line with gradient/glow, area fill, smooth bezier curves, crash state animation (red flash, line fade), off-screen grid caching
- [x] CrashChart.tsx — Canvas + HTML overlay: live multiplier display, countdown ("Starting in 3..."), "GO!" flash, crash display with shake animation, cashout float animation, prefers-reduced-motion support
- [x] CrashControls.tsx — Bet amount (+/- and quick-select), cashout at with presets (1.5x/2x/5x/10x), phase-aware action button (Bet/Cash Out/Watching/Cashed Out/Round Over), pulsing amber cash-out button, auto-play panel with on-win/on-loss strategies, spacebar shortcut, session reminder
- [x] CrashPreviousRounds.tsx — Horizontal scrollable badge row, color-coded (red/gray/green/gold), AnimatePresence for new rounds
- [x] CrashSidebar.tsx — SessionStats, crash casino cards, Deal Wheel CTA, RealMoneyDisplay, custom bet history table (Crashed At/Cashout columns), post-session nudge, disclaimer
- [x] CrashGame.tsx — 3-column responsive orchestrator (desktop: controls | chart | sidebar)
- [x] app/crash/page.tsx — Server component with SEO metadata + SoftwareApplication structured data
- [x] Set crash game available:true in constants.ts (RTP: 99%)
- [x] Build verification — zero errors, no console.log, no `any` types

### Phase 3 QA Fixes
- [x] Fix Strict Mode breaking game loop — cleanup now resets gameActiveRef, allowing proper restart after double-mount
- [x] Fix untracked timeouts — postCrashTimeout and autoPlayBetTimeout now stored in refs and cleaned up on unmount
- [x] Fix race condition: auto-cashout + crash in same rAF frame — local didCashOut/cashoutMult tracking instead of stale stateRef
- [x] Fix previousCrashPoints missing for no-bet rounds — new ADD_CRASH_POINT action dispatched for every round
- [x] Fix CrashChart rAF loop restarting every frame — moved phase/multiplier to refs, removed from useEffect deps
- [x] Added gameActiveRef guards in countdown interval and rAF tick to prevent ghost operations after cleanup
- [x] Fix crash display showing "1.00x" instead of actual crash point — CRASH now snaps currentMultiplier to crashPoint, ROUND_COMPLETE no longer resets currentMultiplier/crashPoint (START_COUNTDOWN handles those resets)
- [x] Build verification — zero errors, no console.log, no `any` types

## Phase 4 — Mines Simulator
- [x] Data foundation: minesTypes.ts, minesCalculator.ts (multiplier math, Fisher-Yates RNG)
- [x] useMinesGame.ts — useReducer with IDLE→PLAYING→GAME_OVER state machine, auto-play, session stats
- [x] MinesTile.tsx — Memo'd 6-state tile component (hidden/revealing/gem/mine_hit/mine_revealed/gem_faded)
- [x] MinesBoard.tsx — 5×5 CSS Grid with board shake animation
- [x] MinesMultiplierBar.tsx — Phase-dependent multiplier display (IDLE/PLAYING/GAME_OVER)
- [x] MinesDangerMeter.tsx — Danger bar with color thresholds and pulse animation
- [x] MinesControls.tsx — Bet/mine controls, pick random, action button, auto-play panel
- [x] MinesSidebar.tsx — Session stats, casino cards, bet history, nudge, disclaimer
- [x] MinesGame.tsx — 3-column responsive orchestrator + mobile cash-out bar
- [x] app/mines/page.tsx — Server component with SEO metadata + structured data
- [x] CSS animations in globals.css (tile-flip, gem-glow, mine-explode, board-shake, etc.)
- [x] Set mines game available:true in constants.ts
- [x] Build verification — zero errors

### Phase 4 QA Fixes (Session 1)
- [x] Fix post-reveal timer memory leak — array-based handle storage
- [x] Fix post-session nudge self-destructs — add SHOW_POST_SESSION_NUDGE action
- [x] Fix mine tile shows gem icon during flip — add isMine prop to MinesTile
- [x] Fix auto-play double-counted first game — remove manual START_GAME dispatch
- [x] Fix prevPhaseRef stale on shake path — unconditional ref update
- [x] Fix AUTO_PLAY_ADJUST_BET rejected during GAME_OVER — allow both IDLE and GAME_OVER

### Phase 4 Audit Fixes (Session 2)
- [x] CRITICAL: Fix post-reveal effect race condition — cleanup cancelled own POST_REVEAL_TILE timers due to postRevealPhase/tileStates in deps. Replaced with ref guard (postRevealInitiatedRef) and [state.phase] only dep
- [x] Clean up dead postRevealDelay prop from MinesTile (never passed, never needed)
- [x] Fix ariaLiveText: was announcing "Gem found" during mine hit animation with stale multiplier — now fires after reveal completes
- [x] Remove redundant role="button" and onKeyDown from MinesTile (native button handles both)
- [x] Add missing "revealing" state to MinesTile aria labels
- [x] Fix history row numbers using sessionGameCount instead of history.length (correct after MAX_HISTORY truncation)
- [x] Build verification — zero errors

## All Phases Complete
- [x] Phase 0 — Project Setup & Configuration
- [x] Phase 1 — Layout + Landing Page
- [x] Phase 2 — Plinko Simulator
- [x] Phase 3 — Crash Simulator
- [x] Phase 4 — Mines Simulator
- [x] Phase 5 — Deal Wheel + Email Capture
- [x] Phase 6 — Blog System + 3 SEO Articles
- [x] Phase 7 — Final Polish, SEO, Mobile & Performance

---

# Roulette Lab Implementation

## Phase 1: Engine Foundation
- [ ] `lib/roulette/rouletteTypes.ts`
- [ ] `lib/roulette/rouletteEngine.ts`
- [ ] `lib/roulette/rouletteBets.ts`
- [ ] `lib/roulette/strategyTypes.ts`
- [ ] `lib/roulette/strategyEngine.ts`
- [ ] `lib/roulette/oddsCalculator.ts`
- [ ] `lib/roulette/simulationTypes.ts`
- [ ] `lib/roulette/simulationEngine.ts`
- [ ] `lib/roulette/riskOfRuinEngine.ts`
- [ ] Tests + install recharts

## Phase 2: Calculators
- [ ] Odds Calculator page
- [ ] Risk of Ruin page

## Phase 3: Strategy Tester + Simulators
- [ ] Web Worker + Strategy Tester
- [ ] Martingale + Fibonacci simulators

## Phase 4: Free Play Roulette
- [ ] Full interactive roulette table

## Phase 5: Hub + Content Pages
- [ ] Hub, Learn, Disclaimer pages

## Phase 6: Integration
- [ ] Constants, Header, Footer, Sitemap, Blog updates
