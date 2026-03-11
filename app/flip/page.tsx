import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import FlipGame from "@/components/games/flip/FlipGame";
import GameErrorBoundary from "@/components/shared/GameErrorBoundary";
import GameHero from "@/components/shared/GameHero";
import GameSEOContent from "@/components/shared/GameSEOContent";
import GameFAQ from "@/components/shared/GameFAQ";
import CrossGameLinks from "@/components/shared/CrossGameLinks";
import { blogPosts } from "@/lib/blog-data";
import { safeJsonLd } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Free Coin Flip Simulator — Heads or Tails | PaperBet",
  description:
    "Play Coin Flip free. Pick heads or tails, double your bet on each win, and build chains up to 1,027,604x. The simplest casino game. 98% RTP.",
  alternates: {
    canonical: "https://paperbet.io/flip",
  },
  openGraph: {
    title: "Free Coin Flip Simulator — Heads or Tails | PaperBet",
    description:
      "Play Coin Flip free. Pick heads or tails, double your bet on each win.",
    url: "https://paperbet.io/flip",
    siteName: "PaperBet.io",
    type: "website",
    images: [{ url: "https://paperbet.io/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Coin Flip Simulator — Heads or Tails | PaperBet",
    description:
      "Play Coin Flip free. Pick heads or tails and build multiplier chains.",
    images: ["https://paperbet.io/opengraph-image"],
  },
  keywords: [
    "coin flip simulator",
    "coin flip game",
    "heads or tails casino",
    "coin flip casino game",
    "double or nothing game",
  ],
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
    "Free coin flip game simulator with casino-accurate probabilities. Pick Heads or Tails, chain winning flips for multipliers up to 1,027,604x with $1,000 in paper money.",
};

const flipFAQ = [
  {
    question: "What is Coin Flip and how does it work?",
    answer:
      "Coin Flip is a casino game where you pick heads or tails. If you guess correctly, your bet doubles. You can cash out after any win or continue the chain for bigger multipliers. Each additional correct guess doubles the previous multiplier. An incorrect guess at any point loses your entire bet.",
  },
  {
    question: "What is the RTP of Coin Flip?",
    answer:
      "Coin Flip has a 98% RTP, slightly lower than PaperBet's other games (which are 99%). The house edge is 2% per flip. This is built into the payout structure — a fair 50/50 flip would pay 2x, but Coin Flip pays slightly less to account for the house edge.",
  },
  {
    question: "What is the maximum chain multiplier in Coin Flip?",
    answer:
      "The theoretical maximum chain is 20 correct guesses in a row, which would multiply your bet by 1,027,604x. However, the probability of achieving this is approximately 0.0001% (1 in a million). Most players cash out after 3-5 correct guesses for a 4x-16x return.",
  },
  {
    question: "Is this Coin Flip simulator provably fair?",
    answer:
      "This simulator uses a cryptographically secure random number generator. Each flip is an independent 50/50 event. The outcome is determined before the animation plays. The probabilities match real crypto casino coin flip games.",
  },
  {
    question: "Where can I play Coin Flip for real money?",
    answer:
      "Coin flip games are available at Stake, BC.Game, and other crypto casinos, though the game may appear under different names. Practice chain strategies here first. Gamble responsibly.",
  },
];

const flipGuides = blogPosts.filter((p) => p.game === "flip");

export default function FlipPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }}
      />

      <GameHero
        h1="Free Coin Flip Simulator"
        subtitle="Pick heads or tails. Win and your bet doubles. Chain multiple wins for massive multipliers — or cash out after any correct guess."
        stats={[
          { value: "98%", label: "RTP" },
          { value: "1,027,604x", label: "Max Chain" },
          { value: "50/50", label: "Odds" },
        ]}
      />

      <section>
        <GameErrorBoundary gameName="Flip">
          <FlipGame />
        </GameErrorBoundary>
      </section>

      <GameSEOContent title="How Coin Flip Works">
        <p>
          Coin Flip is the simplest casino game. Pick Heads or Tails, and the
          coin is flipped. If you guess correctly, your bet is multiplied. The
          chain mechanic is what makes it interesting — after each win, you can
          choose to double down or cash out. Chain 5 correct guesses and your
          original bet has been multiplied approximately 16x.
        </p>
        <p>
          Each flip is a 50/50 event with a 98% RTP (2% house edge per flip).
          This is slightly higher than PaperBet&apos;s other games because the
          payout on each flip is less than the fair 2x. The maximum chain is 20
          consecutive correct guesses, which yields a theoretical multiplier of
          1,027,604x — though the probability of achieving this is roughly 1 in
          a million.
        </p>
        <p>
          The double-or-nothing structure makes Coin Flip a pure test of risk
          management. The math says your expected value decreases with each
          additional flip in a chain, but the psychological pull of doubling down
          is powerful. Practice here to develop the discipline to cash out at the
          right time before playing for real.
        </p>
      </GameSEOContent>

      <GameFAQ items={flipFAQ} gameName="Coin Flip" />

      <CrossGameLinks currentGame="flip" />

      {flipGuides.length > 0 && (
        <section className="px-4 py-12 md:py-16 border-t border-pb-border">
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
