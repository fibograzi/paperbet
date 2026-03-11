import type { Metadata } from "next";
import Link from "next/link";
import GameErrorBoundary from "@/components/shared/GameErrorBoundary";
import RiskOfRuinCalculator from "@/components/roulette/RiskOfRuinCalculator";
import { safeJsonLd } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Risk of Ruin Calculator — Roulette Strategy Risk",
  description:
    "Calculate the probability of losing your entire bankroll using Martingale, Fibonacci, or flat betting on roulette. Understand the math behind strategy risk.",
  keywords: [
    "roulette risk of ruin calculator",
    "risk of ruin calculator",
    "martingale risk calculator",
    "roulette bankroll calculator",
    "gambling risk of ruin",
  ],
  alternates: {
    canonical: "https://paperbet.io/roulette/risk-of-ruin",
  },
  openGraph: {
    title: "Risk of Ruin Calculator — Martingale & Roulette Strategy Risk | PaperBet.io",
    description:
      "Calculate your exact risk of losing your entire roulette bankroll. Model Martingale progression danger, compare bankroll sizes, and visualize sample session paths.",
    url: "https://paperbet.io/roulette/risk-of-ruin",
    siteName: "PaperBet.io",
    type: "website",
    images: [{ url: "https://paperbet.io/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Risk of Ruin Calculator — Martingale & Roulette Strategy Risk | PaperBet.io",
    description:
      "Calculate your exact risk of losing your entire roulette bankroll. See the true math behind Martingale and other betting systems.",
    images: ["https://paperbet.io/opengraph-image"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PaperBet Roulette Risk of Ruin Calculator",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Free Risk of Ruin calculator for roulette. Model Martingale progression danger, sensitivity analysis across bankroll sizes, and sample bankroll path visualizations for European and American wheels.",
  url: "https://paperbet.io/roulette/risk-of-ruin",
  provider: {
    "@type": "Organization",
    name: "PaperBet.io",
    url: "https://paperbet.io",
  },
};

export default function RiskOfRuinPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }}
      />

      <section className="px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Page header */}
          <div className="mb-8">
            <nav className="text-xs text-pb-text-muted mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center gap-1.5">
                <li>
                  <Link href="/" className="hover:text-pb-accent transition-colors">
                    Home
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li>
                  <Link href="/roulette/learn" className="hover:text-pb-accent transition-colors">
                    Roulette
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li className="text-pb-text-secondary">Risk of Ruin</li>
              </ol>
            </nav>

            <h1 className="font-heading text-3xl md:text-4xl font-bold text-pb-text-primary mb-3">
              Risk of Ruin Calculator
            </h1>
            <p className="text-pb-text-secondary max-w-2xl leading-relaxed">
              Calculate the exact probability of losing your entire bankroll before reaching a
              profit target. See the mathematical reality behind the Martingale system and other
              betting strategies — before playing with real money.
            </p>
          </div>

          {/* Main calculator */}
          <GameErrorBoundary gameName="Risk of Ruin Calculator">
            <RiskOfRuinCalculator />
          </GameErrorBoundary>

          {/* Educational disclaimer */}
          <footer className="mt-12 pt-8 border-t border-pb-border">
            <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-5 space-y-2">
              <p className="text-xs text-pb-text-muted leading-relaxed">
                <strong className="text-pb-text-secondary">Important:</strong> No betting system
                can overcome the house edge over the long run. Risk of Ruin is a mathematical
                certainty for any negative-EV game with infinite play. The Martingale, Fibonacci,
                Labouchere, and D&apos;Alembert systems all suffer from the same fundamental flaw:
                they cannot change the expected value of the game.
              </p>
              <p className="text-xs text-pb-text-muted">
                Spins are independent. Past results have no bearing on future outcomes. For
                educational purposes only. 18+.{" "}
                <Link
                  href="/responsible-gambling"
                  className="text-pb-accent-secondary underline hover:text-pb-accent transition-colors"
                >
                  Responsible Gambling
                </Link>
              </p>
            </div>
          </footer>
        </div>
      </section>
    </>
  );
}
