import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Calculator, BarChart2, Play, RefreshCw, GitBranch } from "lucide-react";

export const metadata: Metadata = {
  title: "Learn Roulette — Rules, Odds & Strategy Guide | PaperBet",
  description:
    "Complete roulette guide: how roulette works, European vs American differences, inside/outside bets, house edge math, betting strategies, and why no system beats the wheel.",
  keywords: [
    "learn roulette",
    "roulette rules",
    "roulette strategy guide",
    "roulette house edge",
    "roulette for beginners",
  ],
  alternates: {
    canonical: "https://paperbet.io/roulette/learn",
  },
  openGraph: {
    title: "Learn Roulette — Rules, Odds & Strategy Guide | PaperBet.io",
    description:
      "Master roulette math: house edge explained, bet types compared, strategy analysis with Monte Carlo data.",
    url: "https://paperbet.io/roulette/learn",
    type: "article",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Learn Roulette — Rules, Odds & Strategy Guide",
  description:
    "Complete guide to roulette rules, odds, house edge mathematics, betting strategies, and responsible gambling.",
  url: "https://paperbet.io/roulette/learn",
  publisher: {
    "@type": "Organization",
    name: "PaperBet.io",
    url: "https://paperbet.io",
  },
};

const bets = [
  { name: "Straight Up", type: "Inside", numbers: "1", payout: "35:1", probability: "2.70%", houseEdge: "2.70%" },
  { name: "Split", type: "Inside", numbers: "2", payout: "17:1", probability: "5.41%", houseEdge: "2.70%" },
  { name: "Street", type: "Inside", numbers: "3", payout: "11:1", probability: "8.11%", houseEdge: "2.70%" },
  { name: "Corner", type: "Inside", numbers: "4", payout: "8:1", probability: "10.81%", houseEdge: "2.70%" },
  { name: "Six Line", type: "Inside", numbers: "6", payout: "5:1", probability: "16.22%", houseEdge: "2.70%" },
  { name: "Dozen", type: "Outside", numbers: "12", payout: "2:1", probability: "32.43%", houseEdge: "2.70%" },
  { name: "Column", type: "Outside", numbers: "12", payout: "2:1", probability: "32.43%", houseEdge: "2.70%" },
  { name: "Red / Black", type: "Outside", numbers: "18", payout: "1:1", probability: "48.65%", houseEdge: "2.70%" },
  { name: "Odd / Even", type: "Outside", numbers: "18", payout: "1:1", probability: "48.65%", houseEdge: "2.70%" },
  { name: "High / Low", type: "Outside", numbers: "18", payout: "1:1", probability: "48.65%", houseEdge: "2.70%" },
];

const strategies = [
  {
    name: "Martingale",
    description: "Double your bet after every loss. Reset to base bet after a win.",
    verdict: "High risk. Exponential bet growth hits table limits quickly.",
    href: "/roulette/simulators/martingale",
    icon: RefreshCw,
  },
  {
    name: "Fibonacci",
    description: "Follow the Fibonacci sequence (1,1,2,3,5,8…) for bet sizing after losses.",
    verdict: "Lower risk than Martingale but still unable to overcome house edge.",
    href: "/roulette/simulators/fibonacci",
    icon: GitBranch,
  },
  {
    name: "D'Alembert",
    description: "Increase bet by one unit after a loss, decrease by one after a win.",
    verdict: "Very slow progression. Still loses to house edge long-term.",
    href: "/roulette/strategy-tester",
    icon: BarChart2,
  },
  {
    name: "Labouchere",
    description: "Set a sequence of numbers. Bet the sum of first and last. Cross off winners.",
    verdict: "Complex but mathematically equivalent to all other systems.",
    href: "/roulette/strategy-tester",
    icon: BarChart2,
  },
  {
    name: "Paroli",
    description: "Double your bet after each win. Reset after 3 wins or any loss.",
    verdict: "Lower risk system. Capitalizes on win streaks but can't change expectation.",
    href: "/roulette/strategy-tester",
    icon: BarChart2,
  },
  {
    name: "Flat Betting",
    description: "Bet the same amount every spin. Simple, low variance.",
    verdict: "Best for bankroll longevity. Still loses to house edge at same rate.",
    href: "/roulette/free-play",
    icon: Play,
  },
  {
    name: "James Bond",
    description: "Cover 25 of 37 numbers each spin: $14 on high, $5 on six-line, $1 on zero.",
    verdict: "Fun but provides no mathematical advantage over flat betting.",
    href: "/roulette/strategy-tester",
    icon: BarChart2,
  },
];

export default function LearnRoulettePage() {
  return (
    <main className="bg-pb-bg-primary min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 py-12 lg:py-16">
        {/* Page header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-pb-accent text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            <span>Roulette Guide</span>
          </div>
          <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-pb-text-primary leading-tight mb-4">
            Learn Roulette
          </h1>
          <p className="text-pb-text-secondary text-lg leading-relaxed">
            A complete, math-first guide to roulette rules, odds, strategies, and why the house always wins.
          </p>
        </div>

        {/* Table of contents */}
        <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-6 mb-12">
          <h2 className="font-heading font-semibold text-pb-text-primary text-sm mb-4 uppercase tracking-wider">
            Contents
          </h2>
          <ol className="space-y-2 text-sm">
            {[
              ["#how-roulette-works", "How Roulette Works"],
              ["#european-vs-american", "European vs American Roulette"],
              ["#bet-types", "Inside vs Outside Bets"],
              ["#house-edge", "Understanding House Edge"],
              ["#betting-strategies", "Common Betting Strategies"],
              ["#independence-of-spins", "Why No System Beats the House"],
              ["#responsible-gambling", "Responsible Gambling"],
            ].map(([href, label]) => (
              <li key={href}>
                <a href={href} className="text-pb-text-secondary hover:text-pb-accent transition-colors">
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </div>

        {/* Section: How Roulette Works */}
        <section id="how-roulette-works" className="mb-14 scroll-mt-20">
          <h2 className="font-heading font-bold text-2xl text-pb-text-primary mb-4">
            How Roulette Works
          </h2>
          <div className="space-y-4 text-pb-text-secondary leading-relaxed">
            <p>
              Roulette is played on a numbered wheel with 37 (European) or 38 (American) pockets.
              Players place bets on the table layout, then the dealer spins the wheel and releases
              a ball in the opposite direction. When the ball settles into a pocket, all bets that
              cover that number win; the rest lose.
            </p>
            <p>
              Bets are placed before each spin. You can bet on a single number, groups of numbers,
              red or black, odd or even, or high (19–36) vs low (1–18). Each bet type has a
              different payout that reflects its probability — but all bets carry the same house edge.
            </p>
            <p>
              In online casino roulette, a Random Number Generator (RNG) replaces the physical wheel.
              The mathematics are identical. Each number has exactly the same probability on every spin.
            </p>
          </div>
        </section>

        {/* Section: European vs American */}
        <section id="european-vs-american" className="mb-14 scroll-mt-20">
          <h2 className="font-heading font-bold text-2xl text-pb-text-primary mb-4">
            European vs American Roulette
          </h2>
          <div className="space-y-4 text-pb-text-secondary leading-relaxed mb-6">
            <p>
              The fundamental difference is one pocket. European roulette has a single zero (0),
              American roulette has both a zero (0) and double-zero (00). This small change nearly
              doubles the casino&apos;s advantage.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-pb-border">
                  <th className="text-left py-3 px-4 text-pb-text-muted font-medium uppercase tracking-wider text-xs">Feature</th>
                  <th className="text-left py-3 px-4 text-pb-accent font-medium uppercase tracking-wider text-xs">European</th>
                  <th className="text-left py-3 px-4 text-pb-text-secondary font-medium uppercase tracking-wider text-xs">American</th>
                </tr>
              </thead>
              <tbody className="text-pb-text-secondary">
                {[
                  ["Pockets", "37", "38"],
                  ["Zeros", "0 only", "0 and 00"],
                  ["House Edge", "2.70%", "5.26%"],
                  ["Straight-up probability", "1/37 = 2.70%", "1/38 = 2.63%"],
                  ["Even-money probability", "18/37 = 48.65%", "18/38 = 47.37%"],
                  ["Best for players?", "Yes", "No"],
                ].map(([feature, eu, us]) => (
                  <tr key={feature} className="border-b border-pb-border/50 hover:bg-pb-bg-secondary/50">
                    <td className="py-3 px-4 text-pb-text-primary">{feature}</td>
                    <td className="py-3 px-4 font-mono-stats text-pb-accent">{eu}</td>
                    <td className="py-3 px-4 font-mono-stats">{us}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-pb-text-secondary text-sm mt-4 leading-relaxed">
            Always choose European roulette when given the option. The house edge is 2.70% vs 5.26%
            — you&apos;ll lose money roughly twice as slowly.
          </p>
        </section>

        {/* Section: Bet Types */}
        <section id="bet-types" className="mb-14 scroll-mt-20">
          <h2 className="font-heading font-bold text-2xl text-pb-text-primary mb-4">
            Inside vs Outside Bets
          </h2>
          <div className="space-y-4 text-pb-text-secondary leading-relaxed mb-6">
            <p>
              Roulette bets are divided into <strong className="text-pb-text-primary">inside bets</strong>{" "}
              (placed on specific numbers within the grid) and{" "}
              <strong className="text-pb-text-primary">outside bets</strong> (placed on the outer sections
              covering larger groups of numbers). All bets in European roulette carry the same 2.70% house
              edge — the difference is only variance.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-pb-border">
                  {["Bet Name", "Type", "Numbers Covered", "Payout", "Probability", "House Edge"].map((h) => (
                    <th key={h} className="text-left py-3 px-3 text-pb-text-muted font-medium uppercase tracking-wider text-xs">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-pb-text-secondary">
                {bets.map((bet) => (
                  <tr key={bet.name} className="border-b border-pb-border/50 hover:bg-pb-bg-secondary/50">
                    <td className="py-3 px-3 text-pb-text-primary font-medium">{bet.name}</td>
                    <td className="py-3 px-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        bet.type === "Inside"
                          ? "bg-pb-accent/10 text-pb-accent"
                          : "bg-pb-accent-secondary/10 text-pb-accent-secondary"
                      }`}>
                        {bet.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono-stats">{bet.numbers}</td>
                    <td className="py-3 px-3 font-mono-stats text-pb-accent">{bet.payout}</td>
                    <td className="py-3 px-3 font-mono-stats">{bet.probability}</td>
                    <td className="py-3 px-3 font-mono-stats">{bet.houseEdge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-start gap-2">
            <Link href="/roulette/odds-calculator" className="inline-flex items-center gap-1.5 text-sm text-pb-accent hover:underline font-medium">
              <Calculator className="w-3.5 h-3.5" />
              Use the Odds Calculator for more detail →
            </Link>
          </div>
        </section>

        {/* Section: House Edge */}
        <section id="house-edge" className="mb-14 scroll-mt-20">
          <h2 className="font-heading font-bold text-2xl text-pb-text-primary mb-4">
            Understanding House Edge
          </h2>
          <div className="space-y-4 text-pb-text-secondary leading-relaxed">
            <p>
              The house edge is the casino&apos;s built-in mathematical advantage. In European
              roulette, it equals exactly <span className="font-mono-stats text-pb-accent">1/37 ≈ 2.70%</span>.
            </p>
            <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-5 font-mono-stats text-sm">
              <p className="text-pb-text-muted text-xs mb-2">HOUSE EDGE FORMULA (Straight-up bet)</p>
              <p className="text-pb-text-primary">
                Expected value = (1/37) × 35 + (36/37) × (−1)
              </p>
              <p className="text-pb-text-primary mt-1">
                = 35/37 − 36/37 = −1/37 ≈ <span className="text-pb-accent">−0.0270</span>
              </p>
              <p className="text-pb-text-muted text-xs mt-2">Per $1 wagered, expected loss = $0.027</p>
            </div>
            <p>
              This formula applies to every bet type, including even-money bets like Red/Black:
            </p>
            <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-5 font-mono-stats text-sm">
              <p className="text-pb-text-muted text-xs mb-2">HOUSE EDGE (Red/Black)</p>
              <p className="text-pb-text-primary">
                Expected value = (18/37) × 1 + (19/37) × (−1)
              </p>
              <p className="text-pb-text-primary mt-1">
                = 18/37 − 19/37 = −1/37 ≈ <span className="text-pb-accent">−0.0270</span>
              </p>
            </div>
            <p>
              The house edge compounds over time. If you bet $10 per spin and play 100 spins,
              you&apos;ve wagered $1,000 total. The expected loss is{" "}
              <span className="font-mono-stats text-pb-accent">$1,000 × 2.70% = $27</span>.
              The more you play, the more precisely actual results converge on this mathematical
              expectation — this is the Law of Large Numbers.
            </p>
          </div>
        </section>

        {/* Section: Betting Strategies */}
        <section id="betting-strategies" className="mb-14 scroll-mt-20">
          <h2 className="font-heading font-bold text-2xl text-pb-text-primary mb-4">
            Common Betting Strategies
          </h2>
          <p className="text-pb-text-secondary leading-relaxed mb-6">
            Many betting systems exist for roulette. All of them adjust{" "}
            <em>how</em> you bet, not <em>whether</em> you win. None can change the 2.70% house edge.
          </p>
          <div className="space-y-3">
            {strategies.map((strategy) => (
              <div key={strategy.name} className="bg-pb-bg-secondary border border-pb-border rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold text-pb-text-primary mb-1">
                      {strategy.name}
                    </h3>
                    <p className="text-pb-text-secondary text-sm mb-2">{strategy.description}</p>
                    <p className="text-xs text-pb-text-muted">
                      <span className="text-pb-accent font-medium">Verdict: </span>
                      {strategy.verdict}
                    </p>
                  </div>
                  <Link
                    href={strategy.href}
                    className="shrink-0 flex items-center gap-1.5 text-xs text-pb-accent hover:underline font-medium"
                  >
                    <strategy.icon className="w-3.5 h-3.5" />
                    Test it
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Independence of Spins */}
        <section id="independence-of-spins" className="mb-14 scroll-mt-20">
          <h2 className="font-heading font-bold text-2xl text-pb-text-primary mb-4">
            Why No System Beats the House
          </h2>
          <div className="space-y-4 text-pb-text-secondary leading-relaxed">
            <p>
              The fundamental reason no betting system works is the{" "}
              <strong className="text-pb-text-primary">independence of spins</strong>. Each spin
              is a statistically independent event. The ball has no memory. Whether red has come
              up 10 times in a row or zero has not appeared in 200 spins, the probability on the
              next spin is exactly the same as it always was.
            </p>
            <p>
              The <strong className="text-pb-text-primary">Gambler&apos;s Fallacy</strong> is
              the mistaken belief that past outcomes influence future ones. It does not. A fair
              roulette wheel does not &quot;balance out.&quot;
            </p>
            <p>
              The <strong className="text-pb-text-primary">Law of Large Numbers</strong> does mean
              that over millions of spins, the actual win rate converges on the mathematical
              expectation — but this works in the casino&apos;s favor, not yours. The more you play,
              the more your total results approach the 2.70% house edge per spin.
            </p>
            <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-5">
              <p className="text-pb-accent text-sm font-medium mb-2">The mathematical proof</p>
              <p className="text-sm">
                Any betting system can be described as a series of bets{" "}
                <span className="font-mono-stats">b₁, b₂, b₃, ...</span> with outcomes. The
                expected value of each bet is{" "}
                <span className="font-mono-stats text-pb-accent">−2.70% × bₙ</span>. Since
                the total expected value is the sum of individual expected values, the system&apos;s
                total expected loss equals{" "}
                <span className="font-mono-stats text-pb-accent">2.70% × (total wagered)</span>.
                No combination of bet sizes can make this positive.
              </p>
            </div>
            <p>
              Betting systems can change the variance — Martingale produces many small wins and
              occasional large losses; flat betting produces a smooth, slow downward drift. But
              the expected outcome over time is the same: you lose 2.70% of everything you wager.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/roulette/strategy-tester" className="inline-flex items-center gap-1.5 text-sm text-pb-accent hover:underline font-medium">
              <BarChart2 className="w-3.5 h-3.5" />
              Run a Monte Carlo simulation →
            </Link>
          </div>
        </section>

        {/* Section: Responsible Gambling */}
        <section id="responsible-gambling" className="mb-8 scroll-mt-20">
          <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-6">
            <h2 className="font-heading font-bold text-xl text-pb-text-primary mb-3">
              Responsible Gambling
            </h2>
            <div className="space-y-3 text-pb-text-secondary text-sm leading-relaxed">
              <p>
                The math in this guide is not a reason to gamble — it&apos;s a reason to gamble
                less, or not at all. The house edge means that over time, most players lose money.
                There is no system, no strategy, and no pattern that changes this.
              </p>
              <p>
                If you choose to play real roulette, set strict limits on both time and money.
                Treat any losses as the cost of entertainment, not an investment. Never chase losses.
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
                <a href="https://www.begambleaware.org/" target="_blank" rel="noopener noreferrer" className="text-pb-accent hover:underline text-xs">GambleAware</a>
                <a href="https://www.gamstop.co.uk/" target="_blank" rel="noopener noreferrer" className="text-pb-accent hover:underline text-xs">GamStop</a>
                <a href="https://www.ncpgambling.org/" target="_blank" rel="noopener noreferrer" className="text-pb-accent hover:underline text-xs">NCPG</a>
                <Link href="/responsible-gambling" className="text-pb-accent hover:underline text-xs">More resources →</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Back to tools */}
        <div className="border-t border-pb-border pt-8">
          <p className="text-pb-text-muted text-sm mb-4">Explore all Roulette Lab tools:</p>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Free Play", href: "/roulette/free-play" },
              { label: "Strategy Tester", href: "/roulette/strategy-tester" },
              { label: "Odds Calculator", href: "/roulette/odds-calculator" },
              { label: "Risk of Ruin", href: "/roulette/risk-of-ruin" },
              { label: "Martingale Sim", href: "/roulette/simulators/martingale" },
              { label: "Fibonacci Sim", href: "/roulette/simulators/fibonacci" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm px-4 py-2 bg-pb-bg-secondary border border-pb-border rounded-lg text-pb-text-secondary hover:text-pb-accent hover:border-pb-accent/50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
