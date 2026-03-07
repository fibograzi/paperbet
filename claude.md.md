# CLAUDE.md — PaperBet.io Project Rules

## Project Overview
PaperBet.io is a free-to-play crypto casino simulator platform. Users practice real casino games (Plinko, Crash, Mines) risk-free, then convert through a gamified Deal Wheel that offers exclusive bonuses at real crypto casinos (Stake, Rollbit, BC.Game, etc.). Revenue comes from lifetime affiliate commissions.

## Brand Identity
- **Name:** PaperBet.io
- **Tagline:** "Test Your Edge"
- **Positioning:** Smart, data-driven, professional. NOT a casino site. We are the training ground before real play.
- **Tone:** Clean, trustworthy, confident. Think fintech meets gaming. Never sleazy, never hype-y.

## Design System

### Colors
```
--color-bg-primary: #0B0F1A        /* Deep navy/near-black — main background */
--color-bg-secondary: #111827       /* Slightly lighter — card backgrounds */
--color-bg-tertiary: #1F2937        /* Elevated surfaces — modals, dropdowns */
--color-accent-primary: #00E5A0     /* Neon green — CTAs, highlights, success */
--color-accent-secondary: #00B4D8   /* Cyan blue — secondary actions, links */
--color-accent-warning: #F59E0B     /* Amber — warnings, medium risk */
--color-accent-danger: #EF4444      /* Red — high risk, losses */
--color-text-primary: #F9FAFB       /* Near-white — headings, primary text */
--color-text-secondary: #9CA3AF     /* Gray — body text, descriptions */
--color-text-muted: #6B7280         /* Muted gray — labels, captions */
--color-border: #374151             /* Subtle borders */
--color-glow: rgba(0, 229, 160, 0.15) /* Green glow for hover effects */
```

### Typography
- **Headings:** "Space Grotesk" (Google Fonts) — bold, techy, modern
  - WAIT: Do NOT use Space Grotesk. Use "Outfit" or "Sora" instead.
- **Body:** "DM Sans" (Google Fonts) — clean, readable
- **Mono/Stats:** "JetBrains Mono" (Google Fonts) — for numbers, stats, code-like displays

### Spacing & Layout
- Border radius: 12px for cards, 8px for buttons, 16px for modals
- Max content width: 1280px
- Mobile-first: all components designed for 375px+ first
- Card elevation: subtle border + shadow, NO heavy box-shadows

### Component Patterns
- Buttons: Rounded, accent-primary bg, dark text, subtle hover glow animation
- Cards: bg-secondary, border-border, rounded-xl, p-6
- Inputs: bg-tertiary, border-border, rounded-lg, focus:ring-accent-primary
- Stats displays: Use mono font, large numbers, muted labels below

## Tech Stack
- **Framework:** Next.js 14+ (App Router, `app/` directory)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v3+ with custom theme extending design tokens above
- **Animations:** Framer Motion for React components, CSS for simple transitions
- **Canvas:** HTML5 Canvas API for Plinko physics (no external physics libraries)
- **State:** React useState/useReducer (no external state management)
- **Icons:** Lucide React
- **Fonts:** Next.js Google Fonts (next/font/google)
- **Email:** Placeholder integration (ConvertKit-ready fetch calls)
- **Analytics:** Placeholder for Plausible
- **Deployment:** Vercel-ready (next.config.js optimized)

## File Structure
```
paperbet/
├── app/
│   ├── layout.tsx              # Root layout with fonts, metadata, nav
│   ├── page.tsx                # Landing page
│   ├── plinko/
│   │   └── page.tsx            # Plinko simulator page
│   ├── crash/
│   │   └── page.tsx            # Crash simulator page
│   ├── mines/
│   │   └── page.tsx            # Mines simulator page
│   ├── deals/
│   │   └── page.tsx            # Deal Wheel page
│   └── blog/
│       ├── page.tsx            # Blog index
│       └── [slug]/
│           └── page.tsx        # Individual blog post
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── MobileNav.tsx
│   │   └── GameLayout.tsx      # Shared layout for all game pages
│   ├── games/
│   │   ├── PlinkoGame.tsx      # Canvas-based Plinko
│   │   ├── PlinkoControls.tsx  # Risk/rows/bet controls
│   │   ├── CrashGame.tsx       # Line chart crash game
│   │   ├── CrashControls.tsx
│   │   ├── MinesGame.tsx       # Grid-based mines
│   │   └── MinesControls.tsx
│   ├── shared/
│   │   ├── SessionStats.tsx    # Live session statistics
│   │   ├── RealMoneyDisplay.tsx # "What you would have won"
│   │   ├── StrategySelector.tsx # Martingale/Fibonacci/custom presets
│   │   ├── BetHistory.tsx      # Recent bets log
│   │   └── GameCard.tsx        # Game preview card for homepage
│   ├── conversion/
│   │   ├── SpinWheel.tsx       # Animated deal wheel
│   │   ├── EmailGate.tsx       # Email capture modal
│   │   ├── CasinoCard.tsx      # Casino offer display
│   │   └── WheelResult.tsx     # Post-spin result + CTA
│   └── ui/
│       ├── Button.tsx
│       ├── Badge.tsx
│       ├── Modal.tsx
│       └── Tooltip.tsx
├── lib/
│   ├── constants.ts            # Casino data, game configs
│   ├── plinko-engine.ts        # Plinko physics math
│   ├── strategies.ts           # Betting strategy implementations
│   ├── utils.ts                # Helpers, formatters
│   └── types.ts                # TypeScript interfaces
├── content/
│   └── blog/                   # Blog post data (JSON or MDX)
├── public/
│   ├── og-image.png
│   └── favicon.ico
├── CLAUDE.md                   # This file
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
└── package.json
```

## Code Standards
- All components are functional with hooks (no class components)
- Use `"use client"` directive only on components that need browser APIs (Canvas, useState, event handlers)
- Server components by default for pages and layouts
- Every game component must work on mobile (touch events, responsive canvas)
- All text content must be in English
- Use semantic HTML (main, section, article, nav)
- All images must have alt text
- Console.log statements are forbidden in committed code
- No `any` types — use proper TypeScript interfaces

## Casino Partner Data
Use these real URLs (affiliate params to be added later):
```typescript
export const CASINOS = [
  {
    id: "stake",
    name: "Stake",
    url: "https://stake.com",
    logo: "/casinos/stake.svg", // placeholder, will add real logos
    color: "#1475E1",
    offer: "200% deposit match up to $2,000",
    offerShort: "200% up to $2K",
    games: ["plinko", "crash", "mines", "dice", "limbo"],
    features: ["Provably Fair", "Instant Crypto Payouts", "25M+ Users"],
  },
  {
    id: "rollbit",
    name: "Rollbit",
    url: "https://rollbit.com",
    color: "#FFD700",
    offer: "15% rakeback on all bets",
    offerShort: "15% Rakeback",
    games: ["plinko", "crash", "mines", "roulette"],
    features: ["No KYC", "Crypto Trading", "NFT Integration"],
  },
  {
    id: "bcgame",
    name: "BC.Game",
    url: "https://bc.game",
    color: "#27AE60",
    offer: "Spin Lucky Wheel for up to 5 BTC",
    offerShort: "Win up to 5 BTC",
    games: ["plinko", "crash", "mines", "dice", "limbo", "hilo"],
    features: ["140+ Cryptos", "10K+ Games", "Community Events"],
  },
  {
    id: "wildio",
    name: "Wild.io",
    url: "https://wild.io",
    color: "#8B5CF6",
    offer: "350% up to $10,000 + 200 free spins",
    offerShort: "350% + 200 Spins",
    games: ["plinko", "crash", "mines"],
    features: ["No KYC", "4000+ Slots", "Weekly Reload"],
  },
  {
    id: "jackbit",
    name: "Jackbit",
    url: "https://jackbit.com",
    color: "#F97316",
    offer: "100 wager-free spins",
    offerShort: "100 Free Spins",
    games: ["plinko", "crash", "mines", "dice"],
    features: ["Wager-Free Bonuses", "Fast Payouts", "9000+ Games"],
  },
  {
    id: "coincasino",
    name: "CoinCasino",
    url: "https://coincasino.com",
    color: "#EC4899",
    offer: "200% welcome bonus + WalletConnect",
    offerShort: "200% Welcome Bonus",
    games: ["plinko", "crash", "mines"],
    features: ["Since 2017", "21+ Cryptos", "Provably Fair"],
  },
];
```

## Game Specification Files
Three detailed game spec files live in the project root. Claude Code MUST read the relevant spec file BEFORE building each game:
- `PLINKO_GAME_SPEC.md` — Complete Plinko mechanics, visuals, animations, multiplier tables
- `CRASH_GAME_SPEC.md` — Complete Crash mechanics, visuals, animations, cashout logic
- `MINES_GAME_SPEC.md` — Complete Mines mechanics, visuals, animations, grid logic

These specs are the SINGLE SOURCE OF TRUTH for how each game looks, feels, and works. They override any conflicting information in the implementation plan.
```

---

## Change 2: Replace the Phase 2 prompt opening

Find the **first 3 lines** inside the Phase 2 code block (after the triple backticks):
```
Read CLAUDE.md first. Phase 0 and 1 are complete (project setup + landing page). Now build the complete Plinko simulator — the flagship game of PaperBet.io.

This is the most important page on the entire site. It must be visually stunning, perfectly functional on mobile, and feel as close to a real crypto casino Plinko game as possible.
```

**Replace with:**
```
Read CLAUDE.md first, then read PLINKO_GAME_SPEC.md in the project root. That spec file is your SINGLE SOURCE OF TRUTH for every visual detail, animation, multiplier table, and game mechanic. Phase 0 and 1 are complete (project setup + landing page). Now build the complete Plinko simulator — the flagship game of PaperBet.io.

This is the most important page on the entire site. It must be visually stunning, perfectly functional on mobile, and feel as close to a real crypto casino Plinko game as possible. Follow the game spec file for ALL visual design, animation timing, color coding, and layout decisions. The instructions below cover the technical architecture and page structure — the spec file covers how it looks and feels.
```

---

## Change 3: Replace the Phase 4 prompt opening

Find the **first 3 lines** inside the Phase 4 code block:
```
Read CLAUDE.md first. Phases 0-3 are complete. Now build the Crash game simulator — the second game on PaperBet.io.

Crash is a popular crypto casino game where a multiplier starts at 1.00x and rises until it randomly "crashes." The player must cash out before the crash to win. If they don't cash out in time, they lose their bet.
```

**Replace with:**
```
Read CLAUDE.md first, then read CRASH_GAME_SPEC.md in the project root. That spec file is your SINGLE SOURCE OF TRUTH for every visual detail, animation, multiplier logic, and game mechanic. Phases 0-3 are complete. Now build the Crash game simulator — the second game on PaperBet.io.

Crash is a popular crypto casino game where a multiplier starts at 1.00x and rises until it randomly "crashes." The player must cash out before the crash to win. The spec file contains the complete visual design, animation timing, chart rendering details, and crash point math. The instructions below cover the technical architecture and page structure — the spec file covers how it looks and feels.
```

---

## Change 4: Replace the Phase 5 prompt opening

Find the **first 3 lines** inside the Phase 5 code block:
```
Read CLAUDE.md first. Phases 0-4 are complete. Now build the Mines game simulator — the third game on PaperBet.io.

Mines is a grid-based game where the player clicks tiles to reveal gems (safe) or mines (game over). Each safe reveal increases the multiplier. The player can cash out at any time.
```

**Replace with:**
```
Read CLAUDE.md first, then read MINES_GAME_SPEC.md in the project root. That spec file is your SINGLE SOURCE OF TRUTH for every visual detail, animation, multiplier formula, and game mechanic. Phases 0-4 are complete. Now build the Mines game simulator — the third game on PaperBet.io.

Mines is a grid-based game where the player clicks tiles to reveal gems (safe) or mines (game over). Each safe reveal increases the multiplier. The player can cash out at any time. The spec file contains the complete visual design, grid rendering, reveal animations, and payout math. The instructions below cover the technical architecture and page structure — the spec file covers how it looks and feels.


## SEO Requirements
- Every page needs: unique title tag, meta description, og:image, canonical URL
- Blog posts need: structured data (Article schema), reading time, publish date
- Game pages need: structured data (SoftwareApplication schema)
- Internal linking: every game page links to related blog posts and vice versa
- All images: WebP format, lazy loaded, with descriptive alt text

## Responsible Gambling
Every page that links to a real casino MUST include a small disclaimer footer:
"18+ | Gambling involves risk. Only bet what you can afford to lose. PaperBet.io is a free simulator for educational purposes. We are not a gambling site."
