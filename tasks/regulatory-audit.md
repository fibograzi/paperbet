# PaperBet.io Regulatory Compliance Audit

> Date: March 7, 2026
> Scope: Full regulatory review of free casino simulator + gambling affiliate site
> Research: 4 parallel research agents covering affiliate regulations, responsible gambling, IP/trademarks, and offer accuracy

---

## Executive Summary

PaperBet.io has significant regulatory exposure across multiple jurisdictions. While the core concept (free casino simulators) is legally sound, the current implementation has **7 critical issues**, **12 high-risk issues**, and **8 medium-risk issues** that need addressing. Several features are likely illegal in 11+ jurisdictions in their current form.

---

## PART 1: WHAT WE'RE DOING WELL (GREEN)

These areas are legally sound and don't need changes:

### 1. Game Mechanics Replication -- SAFE
- Game mechanics (multiplier formulas, crash curves, grid sizes, RTP calculations) **cannot be copyrighted**
- Well-established law: Baker v. Selden (1879), Lotus v. Borland (1995), Google v. Oracle (2021)
- Using the same math as real casinos is entirely legal
- Our own code, our own visual design, our own UI -- no copyright issue

### 2. "Crash" and "Mines" Game Names -- SAFE
- "Crash" is a generic/descriptive term for this game type, used by dozens of providers
- "Mines" is generic, derived from classic Minesweeper. IGT's MINESWEEPER trademark was abandoned in 2017
- Neither name carries trademark risk

### 3. Free-to-Play Model (Core Concept) -- SAFE
- No real money wagered, no cash-out, virtual currency only
- In most jurisdictions, genuinely free games are not classified as gambling
- The "educational/practice" positioning is appropriate

### 4. Casino Names in Text -- SAFE (with caveats)
- Nominative fair use allows referring to real casinos by name
- You need the name to identify them -- this is legally permitted
- Caveat: must not imply endorsement (see issues below)

### 5. CSS Animations & Visual Design -- SAFE
- PaperBet has its own distinct visual identity (green accent, custom UI components)
- Not copying Stake's specific trade dress or visual style
- Generic game elements (peg board, rising line, 5x5 grid) are industry conventions, not protectable

### 6. Disclaimer Exists -- PARTIAL
- "18+ | Gambling involves risk..." disclaimer is present in footer and game sidebars
- Good start, but needs significant expansion (see issues)

---

## PART 2: WHAT'S QUESTIONABLE / NEEDS ATTENTION (AMBER)

### 7. "Provably Fair" Claims for Our Own Games -- MISLEADING
**Risk: MEDIUM-HIGH**

The term "provably fair" has a specific technical meaning: cryptographic seed-based verification where users can verify each outcome. PaperBet's games use `crypto.getRandomValues()` (client-side RNG) -- there is no server seed, no committed hash, no verification tool.

**Where it appears:**
- `app/crash/page.tsx` meta: "99% RTP, provably fair"
- `app/mines/page.tsx` meta: "provably fair mine placement"

**Fix:** Replace "provably fair" with "cryptographically random" or "transparent RNG" for our own games. The casino feature badges for Stake/CoinCasino can stay (factual description of their platforms).

### 8. "Real Game Mechanics" Claim -- POTENTIALLY MISLEADING
**Risk: MEDIUM**

Hero section: "Real game mechanics". Also: "real casino multipliers", "real casino multiplier curves".

This implies exact replication of specific casino implementations. If there are any differences (different RTP, different distributions), the claim becomes misleading under FTC Section 5.

**Fix:** Change to "Casino-accurate mechanics" or "Realistic casino mechanics". Add footnote: "Mechanics modeled after publicly available casino game specifications."

### 9. RTP Inconsistency -- CREDIBILITY RISK
**Risk: MEDIUM**

Homepage stats section shows "97%+" while individual game cards show "99% RTP". This inconsistency undermines credibility and could be challenged as misleading.

**Fix:** Pick one consistent number. Since the actual code uses 1% house edge (99% RTP), show "99%" everywhere. Add "Theoretical RTP" qualifier.

### 10. Unverified Casino Feature Claims -- SUBSTANTIATION RISK
**Risk: MEDIUM**

- Stake: "25M+ Users" -- can we substantiate this?
- Stake/CoinCasino: "Provably Fair" -- have we verified they actually provide verification tools?

Under ASA/CAP Code Rule 3.7, claims about third parties require documentary evidence.

**Fix:** Either cite sources ("25M+ users per Stake.com") or remove. Verify provably fair claims with evidence.

### 11. Casino Brand Colors -- BORDERLINE
**Risk: MEDIUM**

Displaying casino names in their exact brand colors (#1475E1 for Stake, #FFD700 for Rollbit) goes beyond "reasonably necessary" for identification and starts replicating their branding, potentially suggesting endorsement.

**Fix:** Consider using neutral text colors for casino names, or at minimum add clear "not affiliated" disclaimer.

### 12. Deal Wheel as Sweepstakes -- MISSING DISCLOSURES
**Risk: MEDIUM**

The Deal Wheel is a "spin to win" mechanic that legally classifies as a sweepstakes/prize draw in many US states. Currently missing: odds disclosure, "no purchase necessary" language, eligibility criteria, prize descriptions.

**Fix:** Add sweepstakes-style disclaimers, or restructure the Deal Wheel to not function as a randomized prize draw.

### 13. Hardcoded Casino Offers -- ACCURACY RISK
**Risk: MEDIUM-HIGH**

All 6 casino offers are hardcoded in `lib/constants.ts`. Casino offers change frequently. If any offer becomes outdated, PaperBet displays misleading information -- a breach under both ASA/CAP and FTC rules.

**Fix:** Add "Offers subject to change. Visit [casino] for current terms." Implement periodic offer verification (weekly minimum). Consider adding "last verified" dates.

### 14. Social Casino Classification Risk -- EVOLVING
**Risk: MEDIUM**

The 2025 US crackdown on social/sweepstakes casinos is expanding. While PaperBet's free-play-only model is safer than dual-currency sweepstakes, the combination of free casino games + affiliate links to real casinos could attract regulatory scrutiny in states like Connecticut, Washington, California.

**Monitor:** Keep watching legislative developments. Consider geo-blocking for highest-risk US states.

---

## PART 3: WHAT ABSOLUTELY MUST CHANGE (RED / CRITICAL)

### 15. CRITICAL: "No KYC" Promotion -- REMOVE IMMEDIATELY
**Risk: CRITICAL | Effort: LOW**

Promoting casinos as "No KYC" is the single highest legal risk on the site. KYC compliance is a fundamental regulatory requirement in virtually every jurisdiction. Promoting its absence:
- Could constitute **advertising unlawful gambling** (UK Gambling Act 2005 -- criminal offense)
- Could implicate PaperBet in **facilitating money laundering**
- UKGC fines up to GBP 19.6 million for KYC failures
- Australia: civil penalties up to AUD 2.5 million
- Regulators increasingly pursue affiliates who promote non-compliant operators

**Where it appears:**
- `lib/constants.ts`: Rollbit features: `"No KYC"`, Wild.io features: `"No KYC"`
- `components/layout/Footer.tsx`: "No KYC Casinos" navigation link

**Fix:** Remove ALL "No KYC" references. Do not promote lack of identity verification as a feature.

### 16. CRITICAL: Missing Affiliate Disclosure -- ADD IMMEDIATELY
**Risk: CRITICAL | Effort: LOW**

FTC requires "clear and conspicuous" disclosure of material connections (affiliate commissions). PaperBet has ZERO affiliate disclosure anywhere. Penalty: **$53,088 per violation** (each page = separate violation).

**Where needed:**
- Near every affiliate link (CasinoCard, DealWheelResult, DealWheelSidebar, RealMoneyDisplay, game sidebars)
- Prominently on every page with casino links
- Dedicated Affiliate Disclosure page

**Fix:** Add disclosure text: "Affiliate Disclosure: PaperBet.io may earn commissions when you sign up through our links." Place near affiliate links, not just in footer.

### 17. CRITICAL: "Exclusive" Deal Claims -- MISLEADING
**Risk: HIGH | Effort: LOW**

Using "exclusive" for standard publicly available offers is deceptive advertising under both ASA/CAP Rule 3.1 and FTC Act. The word appears extensively across the site.

**Where it appears:**
- `app/page.tsx`: "Exclusive Deals from Top Crypto Casinos", "Unlock Exclusive Deals"
- `app/deals/page.tsx`: "Exclusive Casino Deals" (page title + meta)
- All game sidebars: "Win exclusive [Game] bonuses"
- Meta descriptions, Deal Wheel engine

**Fix:** Replace "exclusive" with "featured", "top", or "recommended" unless genuinely exclusive offers have been negotiated.

### 18. CRITICAL: "Casino Partners" Without Partnership -- MISLEADING
**Risk: HIGH | Effort: LOW**

Calling casinos "partners" implies formal commercial relationships and endorsement/vetting. If no formal affiliate agreements exist, this is misleading.

**Where it appears:**
- `app/page.tsx`: "CASINO PARTNERS" section heading
- `app/page.tsx`: `{ value: "6+", label: "Casino Partners" }` stat
- Deal Wheel engine: "partner casinos"

**Fix:** Change to "Featured Casinos" or "Recommended Casinos". Only use "Affiliate Partners" if formal agreements exist. Add: "We may earn commissions from the casinos listed on this page."

### 19. CRITICAL: No Age Gate -- LEGALLY REQUIRED
**Risk: CRITICAL | Effort: MEDIUM**

The UK Gambling Commission has issued specific guidance: free-to-play games on affiliate sites MUST have age verification. COPPA requires neutral age gating for sites that could attract minors.

No age gate = casinos PaperBet links to could lose their UK licenses. Multiple jurisdictions require this.

**Fix:** Implement a date-of-birth age gate splash page on first visit (stored in localStorage). Must be "neutral" (no pre-filled values, no hints about required age).

### 20. CRITICAL: No Privacy Policy -- LEGALLY MANDATORY
**Risk: CRITICAL | Effort: MEDIUM**

PaperBet collects email addresses but has NO privacy policy. This is a direct GDPR violation if any EU visitors exist (they will). Also violates CCPA, FTC requirements.

**Fix:** Create `/privacy` page covering: what data is collected, how it's used, third-party sharing, cookie usage, user rights (GDPR/CCPA), data retention, contact information.

### 21. CRITICAL: No Terms of Service -- LEGALLY NEEDED
**Risk: HIGH | Effort: MEDIUM**

No Terms of Service page exists. This leaves PaperBet legally unprotected and is expected by all casino affiliate programs.

**Fix:** Create `/terms` page covering: service description, user responsibilities, age restrictions, gambling disclaimer, limitation of liability, affiliate relationship disclosure.

### 22. CRITICAL: No Responsible Gambling Page -- INDUSTRY REQUIRED
**Risk: HIGH | Effort: MEDIUM**

Every established gambling affiliate has a dedicated Responsible Gambling page. PaperBet has none. Required by UKGC (via operator obligations), expected by all affiliate programs.

**Fix:** Create `/responsible-gambling` page with: signs of problem gambling, self-assessment questions, links to support organizations, self-exclusion scheme information.

### 23. CRITICAL: No Cookie Consent Banner -- GDPR REQUIRED
**Risk: HIGH | Effort: MEDIUM**

No cookie consent mechanism exists. Affiliate tracking cookies require explicit consent under GDPR/ePrivacy Directive. Must offer Accept/Reject/Customize options.

**Fix:** Implement cookie consent banner that appears before non-essential cookies are set.

### 24. CRITICAL: No Responsible Gambling Links in Footer -- REQUIRED
**Risk: HIGH | Effort: LOW**

Footer is missing links to gambling support organizations. Required by UKGC LCCP, expected by all affiliate programs.

**Missing elements:**
- GambleAware (begambleaware.org)
- GamStop (gamstop.co.uk)
- GamCare (gamcare.org.uk)
- NCPG / 1-800-522-4700 helpline
- Gambling Therapy (gamblingtherapy.org)
- 18+ badge/icon (currently text only)

**Fix:** Add organization links, helpline number, and prominent 18+ badge to footer.

### 25. CRITICAL: No T&Cs on Casino Offers -- ASA VIOLATION
**Risk: HIGH | Effort: MEDIUM**

Every casino offer is displayed without any terms: no wagering requirements, no "New customers only", no minimum deposit, no "T&Cs apply" link. ASA specifically targets this -- it's the #1 complaint category for gambling ads.

**Where it applies:** All 6 casino offers in `lib/constants.ts` and every place they're displayed.

**Fix:** Add to each offer at minimum:
1. "New customers only" (if applicable)
2. Wagering requirements
3. "T&Cs apply" with link to casino's full terms
4. "18+" age restriction

### 26. HIGH: "Plinko" Trademark Risk
**Risk: HIGH | Effort: LOW-MEDIUM**

"Plinko" is a registered trademark of FremantleMedia Netherlands B.V. Active USPTO registrations explicitly cover: gambling services, online gaming, internet wagering, online slot machines. The most recent filing directly overlaps with PaperBet's use.

Major casino game providers (Spribe, BGaming) use the name -- but either have undisclosed licenses or haven't been enforced against yet. PaperBet is a smaller target and more vulnerable.

**Fix options (pick one):**
- **Safest:** Rename to "Ball Drop", "Peg Drop", "PaperDrop", or similar
- **Middle ground:** Add disclaimer: "'Plinko' is a registered trademark of FremantleMedia Netherlands B.V. PaperBet.io is not affiliated with Fremantle or The Price Is Right."

### 27. HIGH: "What You Would Have Won" Display -- INDUCEMENT RISK
**Risk: HIGH | Effort: MEDIUM**

This feature shows real money amounts tied to simulator results and links directly to casinos. Regulators are likely to classify this as:
- A **gambling inducement** (illegal in Belgium, Italy, Netherlands, Germany)
- **Deceptive advertising** under FTC (implies achievable winnings without balanced risk disclosure)
- **Near-miss psychology exploitation** (UKGC responsible gambling rules)

**Fix options:**
- Add prominent disclaimer: "Past simulator results do not predict real-money outcomes. House edge means most players lose over time."
- Add balanced loss statistics alongside win displays
- Consider removing the direct casino CTA from this component
- Consider geo-blocking this feature for strictest jurisdictions

### 28. HIGH: Promoting Stake to UK Users
**Risk: HIGH | Effort: LOW**

Stake.com exited the UK market in early 2025. Promoting Stake to UK users means promoting an unlicensed operator -- a potential criminal offense under the UK Gambling Act 2005.

**Fix:** Implement geo-based filtering to hide Stake from UK visitors, or add a disclaimer that Stake is not available in the UK.

### 29. HIGH: Casino Logo Usage Without Authorization
**Risk: HIGH | Effort: LOW**

Code references logo SVG files (`/casinos/stake.svg`, etc.). Using actual casino logos creates the strongest impression of endorsement/partnership. Casino operators actively pursue unauthorized logo use.

**Fix:** Only use logos if you have explicit written permission or an affiliate agreement that permits it. Otherwise, remove them and use text-only casino names.

---

## PART 4: JURISDICTION BLOCKLIST

### Countries/States Where PaperBet's Current Model Is Likely ILLEGAL

| Jurisdiction | Reason | Action Needed |
|---|---|---|
| Belgium | Advertising ban + free game incentive prohibition | Geo-block |
| Italy | Complete gambling advertising ban | Geo-block |
| Netherlands | Untargeted advertising ban; promoting unlicensed operators | Geo-block or get KSA compliance |
| Germany | Revenue-share ban; advertising time restrictions | Restrict or restructure |
| Connecticut | Criminalized promotion of simulated gambling | Geo-block |
| New York | Illegal promotion of sweepstakes-style casino games | Geo-block |
| California | AB 831 criminal misdemeanor for supporting sweepstakes games | Geo-block |
| New Jersey | Sweepstakes casino ban | Geo-block |
| Montana | Online casino ban | Geo-block |
| Washington State | Virtual currency gambling prohibition | Geo-block |
| UK | Promoting unlicensed operators (Stake) | Remove Stake for UK users |

---

## PART 5: IMPLEMENTATION PRIORITY

### Immediate (Before Launch / This Week)
1. Remove all "No KYC" references
2. Add affiliate disclosure text near all affiliate links
3. Replace "exclusive" with "featured" / "recommended"
4. Change "Casino Partners" to "Featured Casinos"
5. Add responsible gambling links to footer (GambleAware, GamStop, NCPG, helpline)
6. Add "T&Cs apply" + link to each casino offer
7. Remove "provably fair" from own game descriptions
8. Fix RTP inconsistency (97% vs 99%)

### Short-Term (Before Public Traffic)
9. Create Privacy Policy page (`/privacy`)
10. Create Terms of Service page (`/terms`)
11. Create Responsible Gambling page (`/responsible-gambling`)
12. Implement age gate (date-of-birth splash page)
13. Implement cookie consent banner
14. Add "not affiliated/endorsed" disclaimer to footer
15. Rename "Plinko" or add trademark disclaimer
16. Add balanced disclaimer to "What You Would Have Won" display
17. Verify all casino offers are current and accurate

### Medium-Term (Ongoing Operations)
18. Implement geo-blocking for banned jurisdictions
19. Set up offer verification process (weekly)
20. Consider removing casino logos unless authorized
21. Monitor evolving social casino legislation
22. Consult gaming attorney for US state affiliate licensing (NJ, PA, MI)

---

## PART 6: FILES THAT NEED CHANGES

| File | Changes Needed |
|---|---|
| `lib/constants.ts` | Remove "No KYC" from features; fix disclaimer text; add T&C info to offers; verify "25M+ Users" |
| `app/page.tsx` | Change "Casino Partners" to "Featured Casinos"; remove "exclusive"; change "Real game mechanics" |
| `app/layout.tsx` | Update meta description (remove "exclusive") |
| `app/deals/page.tsx` | Update title/meta (remove "exclusive") |
| `app/crash/page.tsx` | Remove "provably fair" from meta |
| `app/mines/page.tsx` | Remove "provably fair" from meta |
| `components/layout/Footer.tsx` | Remove "No KYC Casinos" link; add responsible gambling links; add affiliate disclosure; add 18+ badge; expand disclaimer |
| `components/shared/CasinoCard.tsx` | Add "T&Cs apply" near CTA; add affiliate indicator |
| `components/shared/RealMoneyDisplay.tsx` | Add balanced risk disclaimer |
| `components/games/deals/DealWheelResult.tsx` | Add affiliate disclosure near "Claim This Deal" |
| `components/games/deals/DealWheelSidebar.tsx` | Add affiliate disclosure |
| `components/games/deals/dealWheelEngine.ts` | Remove "exclusive" language |
| All game sidebars | Add affiliate disclosure; remove "exclusive" language |
| NEW: `app/privacy/page.tsx` | Create Privacy Policy page |
| NEW: `app/terms/page.tsx` | Create Terms of Service page |
| NEW: `app/responsible-gambling/page.tsx` | Create Responsible Gambling page |
| NEW: `components/shared/AgeGate.tsx` | Create age verification splash |
| NEW: `components/shared/CookieConsent.tsx` | Create cookie consent banner |

---

## Sources

Full source lists available in the detailed research files:
- `tasks/regulatory-research.md` -- Gambling affiliate regulations (60+ sources)
- Agent reports on: IP/trademarks, responsible gambling, casino offer accuracy

Key regulatory bodies referenced:
- FTC (US), ASA/CAP (UK), UKGC (UK), KSA (Netherlands), AGCOM (Italy), Belgian Gaming Commission, German state authorities, ONJN (Romania)
