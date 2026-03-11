import type { Metadata } from "next";
import Link from "next/link";
import RouletteGame from "@/components/roulette/RouletteGame";
import GameErrorBoundary from "@/components/shared/GameErrorBoundary";
import { safeJsonLd } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Free Roulette Game — European & American Wheels | PaperBet.io",
  description:
    "Play roulette for free with $1,000 in paper money. Place inside and outside bets on European or American wheels with casino-accurate odds and probabilities.",
  alternates: {
    canonical: "https://paperbet.io/roulette/free-play",
  },
  openGraph: {
    title: "Free Roulette Game — European & American Wheels | PaperBet.io",
    description:
      "Play roulette for free with casino-accurate odds. European & American wheels, all bet types.",
    url: "https://paperbet.io/roulette/free-play",
    siteName: "PaperBet.io",
    type: "website",
    images: [
      { url: "https://paperbet.io/opengraph-image", width: 1200, height: 630 },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Roulette Game — European & American Wheels | PaperBet.io",
    description:
      "Play roulette for free with casino-accurate odds. European & American wheels.",
    images: ["https://paperbet.io/opengraph-image"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PaperBet Free Roulette",
  applicationCategory: "GameApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Free roulette simulator with European and American wheels. Place inside and outside bets with $1,000 in paper money. Casino-accurate odds and payouts.",
};

export default function FreePlayPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }}
      />
      <section className="min-h-screen">
        <GameErrorBoundary gameName="Roulette">
          <RouletteGame />
        </GameErrorBoundary>
      </section>
      <section className="px-4 py-8">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <p className="text-xs text-pb-text-muted">
            Each spin is independent. No betting system can overcome the house edge.
            This simulator is for educational and entertainment purposes only. 18+
          </p>
          <Link
            href="/responsible-gambling"
            className="text-xs text-pb-accent hover:underline"
          >
            Play responsibly
          </Link>
        </div>
      </section>
    </>
  );
}
