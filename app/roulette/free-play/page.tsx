import type { Metadata } from "next";
import Link from "next/link";
import RouletteGame from "@/components/roulette/RouletteGame";
import GameErrorBoundary from "@/components/shared/GameErrorBoundary";
import { safeJsonLd } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Free Roulette Game — European & American Wheels | PaperBet",
  description:
    "Play free roulette with European and American wheel options. Place inside and outside bets with casino-accurate odds. No signup, no download needed.",
  keywords: [
    "free roulette simulator game",
    "free roulette",
    "play roulette online",
    "roulette game free",
    "european roulette free",
  ],
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
      <section className="pt-8 pb-4 md:pt-12 md:pb-6 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-pb-text-primary">
            Free Roulette Game
          </h1>
          <p className="text-pb-text-secondary text-base md:text-lg mt-3 max-w-2xl mx-auto leading-relaxed">
            Spin the wheel on European or American roulette with real casino odds. Place inside bets, outside bets, or neighbor bets — all with $1,000 in paper money.
          </p>
        </div>
      </section>
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
