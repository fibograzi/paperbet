import type { Metadata } from "next";
import GameErrorBoundary from "@/components/shared/GameErrorBoundary";
import FibonacciSimulator from "@/components/roulette/FibonacciSimulator";
import { safeJsonLd } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Fibonacci Roulette Simulator — Test the Fibonacci Strategy | PaperBet.io",
  description:
    "Simulate the Fibonacci roulette betting strategy with interactive progression tables, growth charts, and Monte Carlo analysis. Compare it to Martingale and see the real math.",
  alternates: {
    canonical: "https://paperbet.io/roulette/simulators/fibonacci",
  },
  openGraph: {
    title: "Fibonacci Roulette Simulator — Test the Fibonacci Strategy | PaperBet.io",
    description:
      "Explore the Fibonacci betting system's progression, risks, and outcomes with interactive simulation tools.",
    url: "https://paperbet.io/roulette/simulators/fibonacci",
    siteName: "PaperBet.io",
    type: "website",
    images: [{ url: "https://paperbet.io/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fibonacci Roulette Simulator | PaperBet.io",
    description:
      "Interactive Fibonacci roulette simulator with progression tables and Monte Carlo analysis.",
    images: ["https://paperbet.io/opengraph-image"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PaperBet Fibonacci Roulette Simulator",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Interactive Fibonacci roulette strategy simulator with progression tables, growth charts, and 1,000-session Monte Carlo simulation.",
};

export default function FibonacciPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }}
      />
      <section className="min-h-screen pb-16">
        <GameErrorBoundary gameName="Fibonacci Simulator">
          <FibonacciSimulator />
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
