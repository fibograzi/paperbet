# Lessons Learned

## Tailwind v4
- Tailwind v4 uses CSS-based config via `@theme inline` in globals.css, NOT tailwind.config.ts
- Custom colors defined as `--color-pb-*` become usable as `bg-pb-*`, `text-pb-*`, etc.
- `scrollbar-hide` is NOT a built-in utility — must define custom CSS for it
- DO NOT define font families via `@theme inline` with `var()` indirection (e.g. `--font-heading: var(--font-outfit)`) — the theme vars are scoped to `:root` and can't resolve Next.js font vars set on `<body>`. Instead, create plain CSS utility classes (`.font-heading`) that reference the Next.js font vars directly
- DO NOT use Tailwind arbitrary value syntax for fonts (`font-[family-name:var(...)]`) — it's verbose and error-prone. Use custom CSS utility classes instead
- Use `@source not` to exclude non-source directories (tasks/, content/) from Tailwind scanning

## Lucide React Icons
- Icon casing matters: `Grid3x3` (lowercase x) is the correct export, not `Grid3X3`
- When using dynamic icon lookup maps, ensure the keys match the constant values exactly

## Next.js 16
- `create-next-app` has interactive prompts that can block — use `yes n | npx create-next-app` to auto-answer
- Server components are the default; only add "use client" when hooks/browser APIs are needed
- Badge-like presentational components don't need "use client" even when imported by client components
- When using `next/font/google` with `variable` mode, ALSO add `${font.className}` to `<body>` for the default body font — `variable` alone only sets the CSS custom property, it doesn't apply the font

## Framer Motion
- DO NOT use Framer Motion `initial={{ opacity: 0 }}` on hero/above-the-fold content — it blocks rendering until JS hydration completes (3+ second blank page)
- Use CSS `@keyframes` animations for hero entrance instead — they work before JS hydration
- Keep Framer Motion for scroll-triggered animations (useInView) and interactive elements (hover, dropdown)

## Mobile
- For body scroll lock, use `document.body.style.overflow = "hidden"` instead of Tailwind classes — Tailwind utility classes added via JS may not work in Tailwind v4
- Mobile overlay navs should use `bg-*` at 100% opacity, not 95% — content bleeds through during slide animations

## UX
- Close dropdowns and mobile menus on route change using `usePathname()` from next/navigation
- Add active state to nav links using pathname comparison

## Auto-play bet adjustment in separate useEffect
- When auto-play bet adjustment logic lives in a SEPARATE useEffect from the auto-play loop (HiLo, Flip pattern), it can fire on auto-play START if deps like `sessionBetCount > 0` from manual play. This processes stale manual round results.
- Fix: track `sessionBetCount` at auto-play start via a ref, and guard the adjustment effect with `sessionBetCount <= startRef`. This ensures only auto-play results trigger adjustment.
- Safer pattern (Dice, Limbo, Keno): put adjustment logic in the SAME auto-play loop effect, guarded by `progress.currentBet > 0` to skip the first round.
- Safer pattern (Mines): adjustment runs in a setTimeout that only fires from GAME_OVER phase — auto-play start is in IDLE phase so no stale processing occurs.

## React useEffect + setTimeout + dispatch
- NEVER put state that your own effect modifies into the dependency array. If an effect dispatches `POST_REVEAL_START` (setting `postRevealPhase = true`), and `postRevealPhase` is in the deps, React re-renders → cleanup fires → cancels all setTimeout handles created in the same callback. This silently breaks staggered animations.
- Use a **ref guard** (`postRevealInitiatedRef`) for one-time effects that manage their own lifecycle via setTimeout chains. Only depend on the trigger state (e.g., `state.phase`), not intermediate flags.
- Pattern: `if (state.phase !== "GAME_OVER") { ref.current = false; return; }; if (ref.current) return; ref.current = true;`
- Capture state values (`state.tileStates`, `state.minePositions`) in the closure at effect run time — they won't be stale since the effect only runs once per phase transition.
