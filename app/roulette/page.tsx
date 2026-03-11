import type { Metadata } from "next";
import Link from "next/link";
import RouletteHubHero from "@/components/roulette/RouletteHubHero";
import RouletteToolCard from "@/components/roulette/RouletteToolCard";
import RouletteFAQ from "@/components/roulette/RouletteFAQ";

export const metadata: Metadata = {
  title: "Free Roulette Simulator & Tools | PaperBet",
  description:
    "7 free roulette tools: simulator, strategy tester, odds calculator, risk of ruin calculator, Martingale and Fibonacci simulators, and a learning guide. No signup.",
  alternates: {
    canonical: "https://paperbet.io/roulette",
  },
  openGraph: {
    title: "Free Roulette Simulator & Tools | PaperBet",
    description:
      "7 free roulette tools: play free, test strategies, calculate odds, and model risk of ruin.",
    url: "https://paperbet.io/roulette",
    siteName: "PaperBet.io",
    type: "website",
    images: [{ url: "https://paperbet.io/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Roulette Simulator & Tools | PaperBet",
    description:
      "7 free roulette tools. Play free, test strategies, calculate odds — no real money needed.",
    images: ["https://paperbet.io/opengraph-image"],
  },
  keywords: [
    "roulette simulator",
    "free roulette",
    "roulette tools",
    "roulette strategy tester",
    "roulette calculator",
  ],
};

const tools = [
  {
    title: "Free Play",
    description:
      "Spin a full European roulette wheel with $1,000 in paper money. Place any bet, track results, no risk.",
    href: "/roulette/free-play",
    icon: "Play",
    badge: "Interactive",
  },
  {
    title: "Strategy Tester",
    description:
      "Run Monte Carlo simulations of any betting strategy across thousands of sessions. See the real distribution.",
    href: "/roulette/strategy-tester",
    icon: "BarChart2",
    badge: "Simulator",
  },
  {
    title: "Odds Calculator",
    description:
      "Exact probabilities and house edge for every roulette bet type. European vs American comparison.",
    href: "/roulette/odds-calculator",
    icon: "Calculator",
    badge: "Calculator",
  },
  {
    title: "Risk of Ruin",
    description:
      "Calculate your probability of going bankrupt before hitting your profit target. Model any scenario.",
    href: "/roulette/risk-of-ruin",
    icon: "TrendingDown",
    badge: "Calculator",
  },
  {
    title: "Martingale Simulator",
    description:
      "See why doubling your bet after every loss fails in the long run. Animated simulation with stats.",
    href: "/roulette/simulators/martingale",
    icon: "RefreshCw",
    badge: "Simulator",
  },
  {
    title: "Fibonacci Simulator",
    description:
      "Test the Fibonacci progression betting system across thousands of simulated sessions.",
    href: "/roulette/simulators/fibonacci",
    icon: "GitBranch",
    badge: "Simulator",
  },
  {
    title: "Learn Roulette",
    description:
      "Complete guide: rules, bet types, house edge math, and why no system beats the wheel.",
    href: "/roulette/learn",
    icon: "BookOpen",
  },
];

const educationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Roulette Lab",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "7 free roulette tools including a free play simulator, strategy tester with Monte Carlo simulation, odds calculator, and risk of ruin calculator.",
  url: "https://paperbet.io/roulette",
};

export default function RouletteHubPage() {
  return (
    <main className="bg-pb-bg-primary min-h-screen">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(educationJsonLd) }}
      />

      {/* Hero */}
      <RouletteHubHero />

      {/* Tool cards */}
      <section className="py-12 lg:py-16 max-w-7xl mx-auto px-4" id="tools">
        <div className="mb-10">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-pb-text-primary mb-2">
            All Tools
          </h2>
          <p className="text-pb-text-secondary text-sm">
            Pick a tool to get started. All free, no account required.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {tools.map((tool) => (
            <RouletteToolCard
              key={tool.href}
              title={tool.title}
              description={tool.description}
              href={tool.href}
              icon={tool.icon}
              badge={tool.badge}
            />
          ))}
        </div>
      </section>

      {/* Educational section */}
      <section className="py-12 max-w-7xl mx-auto px-4">
        <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-8">
          <h2 className="font-heading font-bold text-xl md:text-2xl text-pb-text-primary mb-4">
            Why Roulette Math Matters
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-pb-text-secondary text-sm leading-relaxed">
            <div className="space-y-3">
              <p>
                Roulette is one of the most studied games in probability theory.
                Its mechanics are simple — a ball, a wheel, numbered pockets —
                yet most players misunderstand the mathematics completely.
              </p>
              <p>
                The house edge in European roulette is exactly{" "}
                <span className="font-mono-stats text-pb-accent">1/37 ≈ 2.70%</span>. This comes
                from the single zero: there are 37 pockets, but straight-up
                bets pay only 35:1. That gap of 1 unit across 37 spins is where
                the casino&apos;s profit lives — on every bet, every spin.
              </p>
            </div>
            <div className="space-y-3">
              <p>
                Betting systems like Martingale and Fibonacci cannot change this
                edge. They rearrange <em>when</em> you lose, not{" "}
                <em>whether</em> you lose. Over millions of simulated spins,
                the outcome is always the same: losses converge toward 2.7% of
                total money wagered.
              </p>
              <p>
                That&apos;s why this lab exists — to let you prove it yourself
                with data, not just take our word for it. Run 10,000 simulated
                sessions and watch the math unfold.
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/roulette/learn"
              className="text-sm text-pb-accent hover:underline font-medium"
            >
              Read the full guide →
            </Link>
            <Link
              href="/roulette/odds-calculator"
              className="text-sm text-pb-text-secondary hover:text-pb-text-primary transition-colors"
            >
              See exact odds →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <div className="max-w-7xl mx-auto px-4">
        <RouletteFAQ />
      </div>

      {/* Disclaimer */}
      <section className="max-w-7xl mx-auto px-4 py-8 pb-16">
        <div className="bg-pb-bg-secondary/50 border border-pb-border/50 rounded-xl p-5 text-center">
          <p className="text-pb-text-muted text-xs leading-relaxed max-w-2xl mx-auto">
            <strong className="text-pb-text-secondary">18+</strong> | For educational purposes only. No real money involved. No system beats the house edge.{" "}
            <Link href="/roulette/disclaimer" className="text-pb-accent hover:underline">
              Full disclaimer
            </Link>{" "}
            |{" "}
            <Link href="/responsible-gambling" className="text-pb-accent hover:underline">
              Responsible gambling resources
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
