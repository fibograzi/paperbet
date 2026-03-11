import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import FlipGame from "@/components/games/flip/FlipGame";
import GameErrorBoundary from "@/components/shared/GameErrorBoundary";
import { blogPosts } from "@/lib/blog-data";
import { safeJsonLd } from "@/lib/utils";

export const metadata: Metadata = {
  title:
    "Free Coin Flip Game Simulator — Heads or Tails | PaperBet.io",
  description:
    "Play Coin Flip for free with casino-accurate probabilities. Pick Heads or Tails, build multiplier chains up to 1,027,604x, and practice double-or-nothing strategies before playing for real at top crypto casinos.",
  alternates: {
    canonical: "https://paperbet.io/flip",
  },
  openGraph: {
    title:
      "Free Coin Flip Game Simulator — Heads or Tails | PaperBet.io",
    description:
      "Play Coin Flip for free with casino-accurate probabilities. Build multiplier chains up to 1,027,604x risk-free.",
    url: "https://paperbet.io/flip",
    siteName: "PaperBet.io",
    type: "website",
    images: [
      { url: "https://paperbet.io/opengraph-image", width: 1200, height: 630 },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Free Coin Flip Game Simulator — Heads or Tails | PaperBet.io",
    description:
      "Play Coin Flip for free with casino-accurate probabilities. Pick Heads or Tails and build chains.",
    images: ["https://paperbet.io/opengraph-image"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PaperBet Coin Flip Simulator",
  applicationCategory: "GameApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Free coin flip game simulator with casino-accurate probabilities. Pick Heads or Tails, chain winning flips for multipliers up to 1,027,604x with $1,000 in paper money. 98% RTP, cryptographically random outcomes.",
};

const flipGuides = blogPosts.filter((p) => p.game === "flip");

export default function FlipPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }}
      />
      <section className="min-h-screen">
        <GameErrorBoundary gameName="Flip">
          <FlipGame />
        </GameErrorBoundary>
      </section>

      {/* Related Guides */}
      {flipGuides.length > 0 && (
        <section className="px-4 py-12 md:py-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-heading text-2xl font-bold text-pb-text-primary mb-6">
              Coin Flip Strategy Guides
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {flipGuides.map((post) => (
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
