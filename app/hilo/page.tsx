import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import HiLoGame from "@/components/games/hilo/HiLoGame";
import GameErrorBoundary from "@/components/shared/GameErrorBoundary";
import GameSEOContent from "@/components/shared/GameSEOContent";
import GameFAQ from "@/components/shared/GameFAQ";
import CrossGameLinks from "@/components/shared/CrossGameLinks";
import { blogPosts } from "@/lib/blog-data";
import { safeJsonLd } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Free HiLo Card Game — Predict Higher or Lower | PaperBet",
  description:
    "Play HiLo free. A card is shown — predict if the next is higher or lower. Build multiplier chains with correct guesses. 99% RTP crypto casino simulator.",
  alternates: {
    canonical: "https://paperbet.io/hilo",
  },
  openGraph: {
    title: "Free HiLo Card Game — Predict Higher or Lower | PaperBet",
    description:
      "Play HiLo free. Predict higher or lower, build multiplier chains with correct guesses.",
    url: "https://paperbet.io/hilo",
    siteName: "PaperBet.io",
    type: "website",
    images: [{ url: "https://paperbet.io/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free HiLo Card Game — Predict Higher or Lower | PaperBet",
    description:
      "Play HiLo free. Build multiplier chains and test strategies risk-free.",
    images: ["https://paperbet.io/opengraph-image"],
  },
  keywords: [
    "hilo simulator",
    "hilo casino game",
    "higher or lower game",
    "hilo card game",
    "hilo crypto",
  ],
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PaperBet HiLo Simulator",
  applicationCategory: "GameApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Free HiLo card game simulator with casino-accurate probabilities. Predict higher or lower, build multiplier chains with $1,000 in paper money.",
};

const hiloFAQ = [
  {
    question: "What is HiLo and how does it work?",
    answer:
      "HiLo is a casino card game. A card is shown face-up, and you predict whether the next card will be higher or lower. Each correct prediction multiplies your bet. You can cash out after any correct guess, or continue the chain for bigger multipliers. An incorrect prediction loses your bet.",
  },
  {
    question: "What is the RTP of HiLo?",
    answer:
      "HiLo has a 99% RTP. The house edge is 1%, applied per prediction in the chain. The payout for each prediction depends on the current card — predicting \"higher\" on a 2 pays less than predicting \"higher\" on a King, because a 2 has more cards above it.",
  },
  {
    question: "Is there a strategy for HiLo?",
    answer:
      "The optimal strategy is straightforward: always predict \"higher\" when the current card is low (2-7) and \"lower\" when it is high (8-King). Middle cards (7-8) are the riskiest since the probability is close to 50/50. No strategy changes the 99% RTP.",
  },
  {
    question: "Is this HiLo simulator provably fair?",
    answer:
      "This simulator uses a cryptographically secure random number generator to draw cards. Each card is independent and random. The probabilities match a standard 52-card deck, making this an accurate practice environment.",
  },
  {
    question: "Where can I play HiLo for real money?",
    answer:
      "HiLo is available at crypto casinos including Stake and BC.Game. It is less widely available than games like Crash or Plinko but offers a unique card-based experience. Practice building chains here first, and always set loss limits when playing for real.",
  },
];

const hiloGuides = blogPosts.filter((p) => p.game === "hilo");

export default function HiLoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }}
      />

      <section>
        <GameErrorBoundary gameName="HiLo">
          <HiLoGame />
        </GameErrorBoundary>
      </section>

      <GameSEOContent h1="Free HiLo Card Game Simulator" title="How HiLo Works">
        <p>
          HiLo is a card-based casino game built around sequential predictions.
          A card from a standard 52-card deck is shown face-up. You predict
          whether the next card will be higher or lower. Each correct prediction
          extends your chain and multiplies your running payout. Cash out after
          any correct guess, or keep the chain going for bigger returns.
        </p>
        <p>
          The payout for each prediction depends on the current card. Predicting
          &quot;higher&quot; when showing a 2 is very likely (many cards are
          higher) and pays a small multiplier. Predicting &quot;higher&quot; when
          showing a King is very unlikely (only Ace is higher) and pays a large
          multiplier. Middle cards like 7 and 8 offer roughly 50/50 odds with
          near-2x payouts.
        </p>
        <p>
          HiLo has a 99% RTP with the house edge applied per prediction in the
          chain. The optimal approach is straightforward — always predict
          &quot;higher&quot; on low cards and &quot;lower&quot; on high cards.
          The real decision is when to cash out, as each additional prediction
          multiplies both your potential win and your risk.
        </p>
      </GameSEOContent>

      <GameFAQ items={hiloFAQ} gameName="HiLo" />

      <CrossGameLinks currentGame="hilo" />

      {hiloGuides.length > 0 && (
        <section className="px-4 py-12 md:py-16 border-t border-pb-border">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-heading text-2xl font-bold text-pb-text-primary mb-6">
              HiLo Strategy Guides
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {hiloGuides.map((post) => (
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
          </div>
        </section>
      )}

      <div className="px-4 pb-8">
        <p className="text-xs text-pb-text-muted text-center max-w-5xl mx-auto">
          18+ only. Gambling involves risk.{" "}
          <Link
            href="/responsible-gambling"
            className="underline hover:text-pb-accent"
          >
            Play responsibly.
          </Link>
        </p>
      </div>
    </>
  );
}
