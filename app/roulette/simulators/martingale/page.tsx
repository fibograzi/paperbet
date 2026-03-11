import type { Metadata } from "next";
import GameErrorBoundary from "@/components/shared/GameErrorBoundary";
import MartingaleSimulator from "@/components/roulette/MartingaleSimulator";
import { safeJsonLd } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Martingale Roulette Simulator — Test the Double-Up Strategy | PaperBet.io",
  description:
    "Simulate the Martingale roulette strategy with Monte Carlo analysis. See exactly why doubling up fails against table limits and finite bankrolls, backed by real probability math.",
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
