import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import DiceGame from "@/components/games/dice/DiceGame";
import GameErrorBoundary from "@/components/shared/GameErrorBoundary";
import { blogPosts } from "@/lib/blog-data";
import { safeJsonLd } from "@/lib/utils";

export const metadata: Metadata = {
  title:
    "Free Dice Game Simulator — Roll Over or Under with 99% RTP | PaperBet.io",
  description:
    "Play Dice for free with casino-accurate math. Set your target, pick Roll Over or Roll Under, and test strategies like Martingale and D'Alembert before playing at real crypto casinos.",
  alternates: {
    canonical: "https://paperbet.io/dice",
  },
  openGraph: {
    title:
      "Free Dice Game Simulator — Roll Over or Under with 99% RTP | PaperBet.io",
    description:
      "Play Dice for free with casino-accurate math. Set your target and test betting strategies risk-free.",
    url: "https://paperbet.io/dice",
    siteName: "PaperBet.io",
    type: "website",
    images: [
      { url: "https://paperbet.io/opengraph-image", width: 1200, height: 630 },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Free Dice Game Simulator — Roll Over or Under with 99% RTP | PaperBet.io",
    description:
      "Play Dice for free with casino-accurate math. Set your target and test strategies risk-free.",
    images: ["https://paperbet.io/opengraph-image"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PaperBet Dice Simulator",
  applicationCategory: "GameApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Free Dice game simulator with casino-accurate 99% RTP. Pick Roll Over or Roll Under, set your target number, and test strategies like Martingale, D'Alembert, and more with $1,000 in paper money.",
};

const diceGuides = blogPosts.filter((p) => p.game === "dice");

export default function DicePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }}
      />
      <section className="min-h-screen">
        <GameErrorBoundary gameName="Dice">
          <DiceGame />
        </GameErrorBoundary>
      </section>

      {/* Related Guides */}
      {diceGuides.length > 0 && (
        <section className="px-4 py-12 md:py-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-heading text-2xl font-bold text-pb-text-primary mb-6">
              Dice Strategy Guides
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {diceGuides.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block bg-pb-bg-secondary border border-pb-border rounded-xl p-4 hover:border-pb-accent/50 transition-colors"
                >
                  <h3 className="font-heading font-semibold text-sm text-pb-text-primary group-hover:text-pb-accent transition-colors leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-xs text-pb-text-muted mt-2 leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs text-pb-accent mt-3 font-medium">
                    Read Guide <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              ))}
            </div>
            <p className="text-xs text-pb-text-muted mt-4 text-center">
              18+ only. Gambling involves risk.{" "}
              <Link
                href="/responsible-gambling"
                className="underline hover:text-pb-accent"
              >
                Play responsibly.
              </Link>
            </p>
          </div>
        </section>
      )}
    </>
  );
}
