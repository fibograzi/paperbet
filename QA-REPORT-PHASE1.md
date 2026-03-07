# PaperBet.io — Phase 1 QA Report

**Date:** March 6, 2026
**Phase Reviewed:** Phase 0 (Setup/Config) + Phase 1 (Layout + Homepage)
**Tested at:** Desktop (1280px), Mobile (375px iPhone SE)
**Dev server:** localhost:3000

---

## CRITICAL ISSUES (Must fix before Phase 2)

### 1. FONTS NOT LOADING — All Custom Fonts Falling Back to System UI

**VISUAL BUG: Global — All pages**

- **What's wrong:** Outfit, DM Sans, and JetBrains Mono are all showing status `unloaded` in the browser. The entire site renders in `ui-sans-serif, system-ui, sans-serif` instead of the design system fonts. JavaScript font audit confirms: `document.fonts` shows all three custom fonts as "unloaded".
- **Expected:** Headings in Outfit, body in DM Sans, stats/numbers in JetBrains Mono.
- **Root cause:** In `app/globals.css`, the `@theme inline` block defines `--font-heading: var(--font-outfit)` etc., but Tailwind CSS v4 `@theme inline` variables don't automatically cascade to the `body` element the way you'd expect. The `body` rule uses `font-family: var(--font-body)` which resolves to `var(--font-dm-sans)`, but the CSS variable `--font-dm-sans` set by Next.js on the `<body>` element's `className` may not be visible inside the `@theme inline` scope.
- **Fix:** In `app/layout.tsx`, add the font class names directly to the body or html element so the fonts actually load and apply. Additionally, in `app/globals.css`, reference the font variables directly in the body rule instead of going through the theme indirection:

**File:** `app/layout.tsx` — Change line 51:
```tsx
// BEFORE:
className={`${outfit.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased`}

// AFTER:
className={`${outfit.variable} ${dmSans.variable} ${jetbrainsMono.variable} ${dmSans.className} antialiased`}
```

This ensures DM Sans is the default body font. Then also update heading elements to use `${outfit.className}` or ensure the CSS variable approach works by testing in browser.

Alternatively, simplify the font approach — instead of relying on CSS variables through Tailwind theme, apply fonts directly:

**File:** `app/globals.css` — Change body rule:
```css
body {
  background: var(--color-pb-bg-primary);
  color: var(--color-pb-text-primary);
  font-family: var(--font-dm-sans), system-ui, sans-serif;
}
```

And in every heading that uses `font-[family-name:var(--font-heading)]`, this should work IF the CSS variable is resolving. Test by checking computed styles in DevTools.

- **Priority:** 🔴 CRITICAL — The site looks generic without its custom fonts. This is the single biggest design issue.

---

### 2. MOBILE NAV BROKEN — Content Bleeds Through Overlay

**VISUAL BUG: `components/layout/MobileNav.tsx`**

- **What's wrong:** When the mobile hamburger menu is opened at 375px, the underlying page content (game cards, text, footer) is visibly bleeding through behind the nav items. The nav doesn't fully cover the viewport — it slides in from the right but the page content beneath remains partially visible and overlapping with nav items.
- **Expected:** A full-screen opaque overlay that completely hides the page behind it.
- **Root cause:** The overlay has `bg-pb-bg-primary/95` (95% opacity), and the slide-in animation (`x: "100%"` → `x: 0`) means during the transition, content shows through. More importantly, the body scroll isn't properly locked — `overflow-hidden` as a Tailwind class on `document.body` may not work in Tailwind CSS v4 since utility classes need to be in the Tailwind layer.
- **Fix:**

**File:** `components/layout/MobileNav.tsx`

1. Change opacity to 100%:
```tsx
// Line 40, BEFORE:
className="fixed inset-0 z-50 bg-pb-bg-primary/95 backdrop-blur-lg"

// AFTER:
className="fixed inset-0 z-50 bg-pb-bg-primary backdrop-blur-lg"
```

2. Fix scroll lock — use direct style instead of Tailwind class:
```tsx
// Lines 26-30, BEFORE:
if (isOpen) {
  document.body.classList.add("overflow-hidden");
} else {
  document.body.classList.remove("overflow-hidden");
}

// AFTER:
if (isOpen) {
  document.body.style.overflow = "hidden";
} else {
  document.body.style.overflow = "";
}
```

- **Priority:** 🔴 CRITICAL — Mobile nav is unusable. Users can't navigate on mobile.

---

### 3. HERO CONTENT DISAPPEARS ON NAVIGATION — Framer Motion Rendering Bug

**VISUAL BUG: `app/page.tsx` — Hero Section**

- **What's wrong:** When navigating back to the homepage (e.g., clicking the logo or using browser back), the hero section content (headline, CTAs, subheading) is invisible for ~3 seconds. Only the faint "Free Casino Simulators" badge is barely visible. The hero takes 3+ seconds to render after page load.
- **Expected:** Hero content should be immediately visible on page load (< 500ms).
- **Root cause:** The hero elements use Framer Motion `initial={{ opacity: 0 }}` with staggered delays up to 0.5s. When Next.js client-side navigates, the component re-mounts and these animations replay. The 3-second blank is likely because the "use client" page takes time to hydrate before Framer Motion can start animating.
- **Fix:** Remove the entrance animations from the hero OR use `whileInView` instead of `initial/animate` so they only trigger once on first visit. Better yet, make the hero content visible by default and only animate if desired:

**File:** `app/page.tsx` — For the critical hero elements (lines 62-119), either:

Option A: Remove animations from hero entirely (recommended for performance):
```tsx
// Replace motion.h1 with regular h1, motion.p with p, etc.
// The hero should ALWAYS be visible immediately
```

Option B: Set initial state to visible and only animate the first time:
```tsx
// Use CSS animations instead of Framer Motion for the hero
// This avoids the hydration delay
```

- **Priority:** 🔴 CRITICAL — Users see a blank page for 3 seconds on first visit. This kills conversion.

---

## HIGH PRIORITY ISSUES

### 4. GAMES DROPDOWN STAYS OPEN AFTER NAVIGATION

**UX BUG: `components/layout/Header.tsx`**

- **What's wrong:** After clicking "Plinko" in the Games dropdown, the page navigates to /plinko but the dropdown remains open on the new page.
- **Expected:** Dropdown should close when any link is clicked.
- **Root cause:** On line 96, `onClick={() => setGamesOpen(false)}` is set, but with Next.js App Router client-side navigation, the Header component may persist its state across navigations. The click handler fires but the state might not properly reset.
- **Fix:**

**File:** `components/layout/Header.tsx` — Add a route change listener:
```tsx
import { usePathname } from "next/navigation";

// Inside the Header component:
const pathname = usePathname();

useEffect(() => {
  setGamesOpen(false);
}, [pathname]);
```

- **Priority:** 🟡 HIGH

---

### 5. CASINO CAROUSEL — 6th CASINO (CoinCasino) NOT VISIBLE WITHOUT SCROLLING

**UX IMPROVEMENT: `app/page.tsx` — Section 4 (Casino Partners)**

- **What's wrong:** The horizontal casino carousel shows 5 cards on desktop but CoinCasino is cut off. There's no visual indicator that the carousel is scrollable (no arrows, no fade effect, no scroll indicator).
- **Expected:** Either all 6 should be visible, or there should be a clear scroll affordance.
- **Suggested improvement:** Add left/right arrow buttons or a subtle fade-out on the right edge to indicate more content. On mobile, the snap-scroll works fine but desktop users may not realize they can scroll horizontally.
- **Fix:** Add a gradient fade on the right edge and/or make the cards smaller to fit all 6:

**File:** `app/page.tsx` — Around line 229, either:
- Reduce `min-w-[260px]` to `min-w-[200px]` to fit all 6
- Or wrap the carousel in a relative container and add a right-edge gradient overlay
- Or add scroll arrows using state + `scrollBy()`

- **Priority:** 🟡 HIGH — CoinCasino might as well not exist if nobody scrolls to it.

---

### 6. HEADING FONT NOT APPLIED TO "Choose Your Game" AND OTHER SECTION HEADINGS

**DESIGN FEEDBACK: Homepage — All section headings**

- **What's wrong:** The section headings ("Choose Your Game", "How PaperBet Works", etc.) use `font-[family-name:var(--font-heading)]` which should resolve to Outfit, but since fonts aren't loading (Issue #1), they render in system font. Even when fonts ARE fixed, this Tailwind arbitrary value syntax is verbose and error-prone.
- **Suggestion:** After fixing Issue #1, create a utility class or component for heading styling. Consider adding a `font-heading` utility in your Tailwind theme:

**File:** `app/globals.css` — Add:
```css
.font-heading {
  font-family: var(--font-outfit), system-ui, sans-serif;
}

.font-mono-stats {
  font-family: var(--font-jetbrains-mono), monospace;
}
```

Then replace all instances of `font-[family-name:var(--font-heading)]` with `font-heading`.

- **Priority:** 🟡 HIGH (blocked by Issue #1)

---

## MEDIUM PRIORITY ISSUES

### 7. HERO GREEN GLOW ORB — Nearly Invisible

**DESIGN FEEDBACK: `app/page.tsx` — Hero Section**

- **What's wrong:** The green glow orb (`bg-pb-accent/5 blur-[120px]`) at 5% opacity is almost invisible on screen. The briefing says it should provide a subtle ambient effect, but at 5% it's barely perceptible.
- **Suggestion:** Increase opacity to 8-10%:

**File:** `app/page.tsx` — Line 58:
```tsx
// BEFORE:
className="... bg-pb-accent/5 blur-[120px] ..."

// AFTER:
className="... bg-pb-accent/8 blur-[120px] ..."
```

- **Priority:** 🟠 MEDIUM

---

### 8. "How It Works" SECTION — Low Contrast Text on Mobile

**VISUAL BUG: `app/page.tsx` — Section 3**

- **What's wrong:** The step descriptions and titles in the "How PaperBet Works" section have very low contrast on mobile. The text appears dim/faded, making it hard to read. The `AnimatedSection` component uses `opacity: 0` as initial state and animate to `opacity: 1`, but the animation might not fully complete, leaving elements at partial opacity.
- **Expected:** Full white text for titles, clear secondary text for descriptions.
- **Fix:** This may self-resolve when Issue #3 (hero animation) is fixed. If not, ensure the AnimatedSection's `useInView` triggers properly on mobile viewports. The `margin: "-80px"` might cause issues on short mobile viewports.

- **Priority:** 🟠 MEDIUM

---

### 9. STATS SECTION — Monospace Font Not Rendering

**VISUAL BUG: `app/page.tsx` — Section 5 (Stats)**

- **What's wrong:** The stats numbers (6+, 1,000x, 97%+, $0) use `font-[family-name:var(--font-jetbrains-mono)]` but since JetBrains Mono isn't loading (Issue #1), they render in system font. The numbers don't look like data/stats — they look like regular text.
- **Expected:** Numbers should render in JetBrains Mono for that data-driven, Bloomberg-terminal feel.
- **Fix:** Blocked by Issue #1. After fonts are fixed, verify these render in monospace.

- **Priority:** 🟠 MEDIUM (blocked by Issue #1)

---

### 10. EMAIL FORM — No Submit Handler / No Validation Feedback

**UX IMPROVEMENT: `app/page.tsx` — Section 6 (Final CTA)**

- **What's wrong:** The email capture form has `onSubmit={(e) => e.preventDefault()}` — it does nothing. There's no loading state, no success message, no error state. For Phase 1 this is expected (backend not built yet), but the form should at minimum show a "Coming soon" toast or redirect to /deals.
- **Suggested improvement:** Add a simple state handler that shows "Thanks! We'll notify you when we launch." after submission, or redirect to the deals page.

- **Priority:** 🟠 MEDIUM (acceptable for Phase 1, but should be addressed in Phase 3)

---

### 11. FOOTER LINKS — All Point to Non-Existent Pages

**UX BUG: `components/layout/Footer.tsx`**

- **What's wrong:** Footer links like "Plinko Guide", "Crash Guide", "Odds Explained", "Best Plinko Casinos", "No KYC Casinos" point to pages that don't exist yet (/blog/plinko-guide, etc.). Clicking them leads to 404s.
- **Expected:** Links to unbuilt pages should either be disabled/grayed out, or point to coming-soon pages.
- **Fix:** Add `pointer-events-none opacity-50` to links for pages not yet built, or make them link to the blog landing page with a hash.

- **Priority:** 🟠 MEDIUM

---

## LOW PRIORITY / POLISH ISSUES

### 12. NO `<meta>` DESCRIPTION FOR INDIVIDUAL PAGES

**SEO: Plinko, Crash, Mines, Deals, Blog pages**

- **What's wrong:** Only the root layout has metadata. The placeholder pages (/plinko, /crash, etc.) inherit the homepage meta description rather than having their own.
- **Fix:** Add unique `export const metadata` to each page file even in placeholder state.

- **Priority:** 🔵 LOW (can wait for their respective phases)

---

### 13. CASINO CARDS — No Logos, Only Text Names

**DESIGN FEEDBACK: Homepage — Casino Partners Section**

- **What's wrong:** The casino cards show only text names (colored by brand color) without any logos. The `/public/casinos/` directory exists but is empty — no SVG logos have been added.
- **Expected:** Each casino card should have a small logo or icon for visual recognition.
- **Fix:** Add casino logo SVGs to `/public/casinos/` (stake.svg, rollbit.svg, etc.) and render them in the casino cards.

- **Priority:** 🔵 LOW (Phase 1 is acceptable with text-only, but logos would look much more premium)

---

### 14. SCROLL INDICATOR CHEVRON — Delay Too Long

**UX IMPROVEMENT: Homepage Hero**

- **What's wrong:** The scroll-down chevron at the bottom of the hero has `transition={{ delay: 1 }}` — it takes a full second to appear after everything else loads. Combined with the 3-second hero animation issue (#3), the chevron doesn't show until ~4 seconds after page load.
- **Fix:** Reduce delay to 0.3s or make it instantly visible.

- **Priority:** 🔵 LOW

---

### 15. HEADER — No Active State for Current Page

**UX IMPROVEMENT: `components/layout/Header.tsx`**

- **What's wrong:** The navigation links (Games, Strategy Hub, Deals) don't indicate which page the user is currently on. All links look the same regardless of route.
- **Fix:** Use `usePathname()` to add an active state (e.g., `text-pb-accent` and underline) to the current page's nav link.

- **Priority:** 🔵 LOW

---

## WHAT'S WORKING WELL ✅

1. **Color system** — The dark navy backgrounds, green accents, and color hierarchy are correctly implemented and match the design spec exactly.
2. **Layout structure** — 6 well-organized homepage sections with clear hierarchy.
3. **Game cards** — Clean design with proper badges (Live/Coming Soon), hover animations, and color-coded icons.
4. **Casino partner data** — All 6 casinos with correct colors, offers, and data.
5. **Responsive grid** — Game cards properly go from 3-column (desktop) to 1-column (mobile).
6. **Stats section** — Good 2x2 grid on mobile, 4-column on desktop.
7. **CTAs** — Clear primary/secondary button hierarchy with proper green accent.
8. **Trust indicators** — Clean "No signup / No deposits / Real game mechanics" line.
9. **Responsible gambling disclaimer** — Present in footer on every page. ✅
10. **Header** — Clean fixed header with proper backdrop blur and border.
11. **Footer** — Well-organized 4-column layout with all necessary links.
12. **TypeScript types** — Clean, well-defined interfaces for all data.
13. **Constants** — Centralized casino and game data for consistency.

---

## RECOMMENDED FIX ORDER

1. **Issue #1** — Fix fonts (CRITICAL — everything looks generic without them)
2. **Issue #3** — Fix hero animation delay (CRITICAL — blank page for 3 seconds)
3. **Issue #2** — Fix mobile nav overlay (CRITICAL — mobile unusable)
4. **Issue #4** — Fix dropdown staying open after navigation
5. **Issue #6** — Simplify font class usage after fonts work
6. **Issue #5** — Add carousel scroll indicators
7. **Issue #7-11** — Medium priority polish items
8. **Issue #12-15** — Low priority items for later phases
