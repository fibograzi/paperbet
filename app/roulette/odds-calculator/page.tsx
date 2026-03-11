import type { Metadata } from "next";
import Link from "next/link";
import GameErrorBoundary from "@/components/shared/GameErrorBoundary";
import OddsCalculator from "@/components/roulette/OddsCalculator";
import { safeJsonLd } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Roulette Odds Calculator — Probabilities & Payouts",
  description:
    "Calculate exact probabilities, expected values, and house edge for all 10 roulette bet types. European and American wheel comparison.",
  keywords: [
    "roulette odds calculator",
    "roulette probability calculator",
    "roulette payout calculator",
    "roulette odds chart",
    "roulette bet odds",
  ],
  alternates: {
    canonical: "https://paperbet.io/roulette/odds-calculator",
  },
  openGraph: {
    title: "Roulette Odds Calculator — Probabilities, Payouts & House Edge | PaperBet.io",
    description:
      "Calculate exact probabilities, expected values, and house edge for every roulette bet type. Compare European vs American wheels side by side.",
    url: "https://paperbet.io/roulette/odds-calculator",
    siteName: "PaperBet.io",
    type: "website",
    images: [{ url: "https://paperbet.io/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Roulette Odds Calculator — Probabilities, Payouts & House Edge | PaperBet.io",
    description:
      "Calculate exact probabilities, expected values, and house edge for every roulette bet type. Compare European vs American wheels.",
    images: ["https://paperbet.io/opengraph-image"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PaperBet Roulette Odds Calculator",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Free roulette odds calculator showing exact probabilities, expected values, and house edge for all 10 bet types on European and American wheels.",
  url: "https://paperbet.io/roulette/odds-calculator",
  provider: {
    "@type": "Organization",
    name: "PaperBet.io",
    url: "https://paperbet.io",
  },
};

export default function OddsCalculatorPage() {
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
                <li className="text-pb-text-secondary">Odds Calculator</li>
              </ol>
            </nav>

            <h1 className="font-heading text-3xl md:text-4xl font-bold text-pb-text-primary mb-3">
              Roulette Odds Calculator
            </h1>
            <p className="text-pb-text-secondary max-w-2xl leading-relaxed">
              Exact probabilities, expected values, and house edge for all 10 roulette bet types.
              Toggle between European and American wheels to see how the extra zero affects your
              odds.
            </p>
          </div>

          {/* Main calculator */}
          <GameErrorBoundary gameName="Roulette Odds Calculator">
            <OddsCalculator />
          </GameErrorBoundary>

          {/* Educational disclaimer */}
          <footer className="mt-12 pt-8 border-t border-pb-border">
            <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-5 space-y-2">
              <p className="text-xs text-pb-text-muted leading-relaxed">
                <strong className="text-pb-text-secondary">Important:</strong> Spins are
                independent events. No betting system can overcome the house edge over a large
                number of spins. Past results have no influence on future outcomes (Gambler&apos;s
                Fallacy). The odds shown are mathematically exact for a fair wheel.
              </p>
              <p className="text-xs text-pb-text-muted">
                For educational purposes only. 18+.{" "}
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
