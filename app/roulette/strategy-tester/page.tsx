import type { Metadata } from "next";
import GameErrorBoundary from "@/components/shared/GameErrorBoundary";
import StrategyTester from "@/components/roulette/StrategyTester";
import { safeJsonLd } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Roulette Strategy Tester — Monte Carlo Simulator | PaperBet.io",
  description:
    "Test any roulette betting strategy with Monte Carlo simulation. Run thousands of sessions to see real statistical outcomes for Martingale, Fibonacci, D'Alembert and more.",
  alternates: {
    canonical: "https://paperbet.io/roulette/strategy-tester",
  },
  openGraph: {
    title: "Roulette Strategy Tester — Monte Carlo Simulator | PaperBet.io",
    description:
      "Run thousands of simulated roulette sessions to see how Martingale, Fibonacci, D'Alembert and other strategies actually perform statistically.",
    url: "https://paperbet.io/roulette/strategy-tester",
    siteName: "PaperBet.io",
    type: "website",
    images: [{ url: "https://paperbet.io/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Roulette Strategy Tester — Monte Carlo Simulator | PaperBet.io",
    description:
      "Run thousands of simulated roulette sessions to see how betting strategies really perform.",
    images: ["https://paperbet.io/opengraph-image"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PaperBet Roulette Strategy Tester",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Monte Carlo roulette simulator. Test Martingale, Fibonacci, D'Alembert, Labouchere, Oscar's Grind, Paroli and custom betting strategies across thousands of sessions.",
};

export default function StrategyTesterPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }}
      />
      <section className="min-h-screen pb-16">
        <GameErrorBoundary gameName="Strategy Tester">
          <StrategyTester />
        </GameErrorBoundary>
      </section>

      <footer className="px-4 py-6 border-t border-pb-border">
        <p className="max-w-3xl mx-auto text-xs text-pb-text-muted text-center">
          18+ only. This tool is for educational purposes only. All simulations use statistically
          accurate house-edge probabilities. PaperBet.io is a free simulator — not a gambling site.
          Past simulation results do not guarantee future outcomes. Gambling involves risk; only bet
          what you can afford to lose.
        </p>
      </footer>
    </>
  );
}
