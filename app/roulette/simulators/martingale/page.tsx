import type { Metadata } from "next";
import GameErrorBoundary from "@/components/shared/GameErrorBoundary";
import MartingaleSimulator from "@/components/roulette/MartingaleSimulator";
import { safeJsonLd } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Martingale Roulette Simulator — Double-Up Test | PaperBet",
  description:
    "Test the Martingale strategy on roulette. Watch how doubling after losses plays out over hundreds of spins. See the math behind the risk.",
  keywords: [
    "martingale roulette simulator",
    "martingale strategy",
    "martingale system roulette",
    "double up strategy roulette",
    "martingale betting system",
  ],
  alternates: {
    canonical: "https://paperbet.io/roulette/simulators/martingale",
  },
  openGraph: {
    title: "Martingale Roulette Simulator — Test the Double-Up Strategy | PaperBet.io",
    description:
      "Explore the Martingale strategy's bet progression, bankruptcy risk, and why it fails long-term.",
    url: "https://paperbet.io/roulette/simulators/martingale",
    siteName: "PaperBet.io",
    type: "website",
    images: [{ url: "https://paperbet.io/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Martingale Roulette Simulator | PaperBet.io",
    description: "Explore why the Martingale strategy fails against table limits and finite bankrolls.",
    images: ["https://paperbet.io/opengraph-image"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PaperBet Martingale Simulator",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Interactive Martingale roulette simulator with progression tables, exponential growth charts, and Monte Carlo simulation over 1,000 sessions.",
};

export default function MartingalePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }}
      />
      <section className="pt-8 pb-4 md:pt-12 md:pb-6 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-pb-text-primary">
            Martingale Roulette Simulator
          </h1>
          <p className="text-pb-text-secondary text-base md:text-lg mt-3 max-w-2xl mx-auto leading-relaxed">
            The Martingale system doubles your bet after every loss. It sounds foolproof — until a losing streak wipes out your bankroll. Run this simulator to see exactly when and how it fails.
          </p>
        </div>
      </section>
      <section className="min-h-screen pb-16">
        <GameErrorBoundary gameName="Martingale Simulator">
          <MartingaleSimulator />
        </GameErrorBoundary>
      </section>

      <footer className="px-4 py-6 border-t border-pb-border">
        <p className="max-w-3xl mx-auto text-xs text-pb-text-muted text-center">
          18+ only. This tool is for educational purposes only. Simulations use statistically
          accurate European roulette probabilities. PaperBet.io is a free simulator — not a gambling
          site. Past simulation results do not guarantee future outcomes.
        </p>
      </footer>
    </>
  );
}
