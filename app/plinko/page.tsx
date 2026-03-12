import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PlinkoGame from "@/components/games/plinko/PlinkoGame";
import GameErrorBoundary from "@/components/shared/GameErrorBoundary";
import GameSEOContent from "@/components/shared/GameSEOContent";
import GameFAQ from "@/components/shared/GameFAQ";
import CrossGameLinks from "@/components/shared/CrossGameLinks";
import { blogPosts } from "@/lib/blog-data";
import { safeJsonLd } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Free Plinko Simulator — 1,000x Multipliers | PaperBet",
  description:
    "Play Plinko free with casino-accurate multipliers. Choose low, medium, or high risk across 8-16 rows. Track results and test strategies before real play.",
  alternates: {
    canonical: "https://paperbet.io/plinko",
  },
  openGraph: {
    title: "Free Plinko Simulator — 1,000x Multipliers | PaperBet",
    description:
      "Play Plinko free with casino-accurate multipliers. Choose low, medium, or high risk across 8-16 rows.",
    url: "https://paperbet.io/plinko",
    siteName: "PaperBet.io",
    type: "website",
    images: [{ url: "https://paperbet.io/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Plinko Simulator — 1,000x Multipliers | PaperBet",
    description:
      "Play Plinko free with casino-accurate multipliers. Choose low, medium, or high risk.",
    images: ["https://paperbet.io/opengraph-image"],
  },
  keywords: [
    "plinko simulator",
    "plinko demo",
    "plinko free",
    "plinko game online",
    "plinko practice",
  ],
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PaperBet Plinko Simulator",
  applicationCategory: "GameApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Free Plinko simulator with casino-accurate multipliers. Test low, medium, and high risk strategies with $1,000 in paper money.",
};

const plinkoFAQ = [
  {
    question: "What is Plinko and how does it work?",
    answer:
      "Plinko is a casino game where you drop a ball from the top of a pegged board. The ball bounces randomly through rows of pegs and lands in a multiplier slot at the bottom. Higher risk levels spread the multipliers further apart — low risk gives frequent small wins, high risk gives rare large wins up to 1,000x.",
  },
  {
    question: "What is the RTP of Plinko?",
    answer:
      "The return to player (RTP) of Plinko is 99% across all three risk levels (low, medium, high) and all row counts (8-16). This means that on average, for every $100 wagered, $99 is returned to players over the long run. The 1% house edge is among the lowest in casino games.",
  },
  {
    question: "Does risk level affect Plinko RTP?",
    answer:
      "No. All three risk levels — low, medium, and high — have the same 99% RTP. What changes is the variance. Low risk produces frequent small multipliers (0.5x-5.6x). High risk produces rare large multipliers (0.2x-1,000x). Your average return is identical regardless of risk level.",
  },
  {
    question: "Is this Plinko simulator provably fair?",
    answer:
      "This simulator uses a cryptographically secure random number generator to determine ball paths. Each drop is independent and random. While this is a practice simulator (not real money), the math and probabilities match those used by major crypto casinos like Stake.",
  },
  {
    question: "Where can I play Plinko for real money?",
    answer:
      "You can play Plinko for real money at crypto casinos like Stake, BC.Game, and Rollbit. We recommend practicing here first to understand the risk levels and variance before wagering real funds. Always gamble responsibly and never bet more than you can afford to lose.",
  },
];

const plinkoGuides = blogPosts.filter((p) => p.game === "plinko");

export default function PlinkoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }}
      />

      <section>
        <GameErrorBoundary gameName="Plinko">
          <PlinkoGame />
        </GameErrorBoundary>
      </section>

      <GameSEOContent h1="Free Plinko Simulator" title="How Plinko Works">
        <p>
          A Plinko simulator lets you drop a ball from the top of a pegged board
          and watch it bounce randomly through rows of pins before landing in a
          multiplier slot at the bottom. Each drop is independent — the
          ball&apos;s path through the pegs is determined by physics-accurate
          random bounces, producing a natural bell curve distribution across the
          slots.
        </p>
        <p>
          PaperBet&apos;s free Plinko simulator offers three risk levels — low,
          medium, and high — each with different multiplier distributions. Low
          risk concentrates payouts in the center (frequent 1x-2x wins). High
          risk pushes payouts to the edges, creating rare but massive wins up to
          1,000x. You can also adjust the row count from 8 to 16, which changes
          how many pegs the ball passes through and affects the spread of
          outcomes.
        </p>
        <p>
          The 99% RTP means that for every $100 wagered over time, $99 is
          statistically returned. This applies across all risk levels and row
          counts. Use the session stats panel to track your actual results and
          compare them against the theoretical expectation. Read our{" "}
          <Link
            href="/blog/plinko-strategy-guide"
            className="text-pb-accent hover:underline"
          >
            Plinko strategy guide
          </Link>{" "}
          for a deeper breakdown of the math behind each risk level.
        </p>
      </GameSEOContent>

      <GameFAQ items={plinkoFAQ} gameName="Plinko" />

      <CrossGameLinks currentGame="plinko" />

      {plinkoGuides.length > 0 && (
        <section className="px-4 py-12 md:py-16 border-t border-pb-border">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-heading text-2xl font-bold text-pb-text-primary mb-6">
              Plinko Strategy Guides
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {plinkoGuides.map((post) => (
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
