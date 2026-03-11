import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import DiceGame from "@/components/games/dice/DiceGame";
import GameErrorBoundary from "@/components/shared/GameErrorBoundary";
import GameHero from "@/components/shared/GameHero";
import GameSEOContent from "@/components/shared/GameSEOContent";
import GameFAQ from "@/components/shared/GameFAQ";
import CrossGameLinks from "@/components/shared/CrossGameLinks";
import { blogPosts } from "@/lib/blog-data";
import { safeJsonLd } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Free Dice Simulator — Roll Over or Under | PaperBet",
  description:
    "Play casino Dice free. Set your target number, pick Roll Over or Roll Under, and see the result. Adjust win probability from 0.01% to 98%. 99% RTP.",
  alternates: {
    canonical: "https://paperbet.io/dice",
  },
  openGraph: {
    title: "Free Dice Simulator — Roll Over or Under | PaperBet",
    description:
      "Play casino Dice free. Set your target number, pick Roll Over or Roll Under, and test strategies.",
    url: "https://paperbet.io/dice",
    siteName: "PaperBet.io",
    type: "website",
    images: [{ url: "https://paperbet.io/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Dice Simulator — Roll Over or Under | PaperBet",
    description:
      "Play casino Dice free. Set your target and test strategies risk-free.",
    images: ["https://paperbet.io/opengraph-image"],
  },
  keywords: [
    "dice simulator",
    "dice game online",
    "roll over under",
    "dice casino game",
    "dice probability game",
  ],
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
    "Free Dice game simulator with casino-accurate 99% RTP. Pick Roll Over or Roll Under, set your target number, and test strategies with $1,000 in paper money.",
};

const diceFAQ = [
  {
    question: "What is casino Dice and how does it work?",
    answer:
      "Casino Dice is a game where you set a target number between 0 and 99.99, then choose Roll Over or Roll Under. A random number is generated — if it meets your condition, you win. The multiplier is inversely proportional to your win chance. A 50% chance pays 1.98x; a 1% chance pays 98x.",
  },
  {
    question: "What is the RTP of Dice?",
    answer:
      "Dice has a 99% RTP at every target setting. The house edge is a fixed 1% regardless of whether you set a high win probability (small multiplier) or a low win probability (large multiplier). This makes Dice one of the most transparent casino games.",
  },
  {
    question: "What is the difference between Roll Over and Roll Under?",
    answer:
      "Roll Over wins when the result is higher than your target. Roll Under wins when the result is lower. At target 50, both directions give a roughly 50% chance and 1.98x payout. Moving the target changes your win probability and multiplier equally in either direction.",
  },
  {
    question: "Is this Dice simulator provably fair?",
    answer:
      "This simulator uses a cryptographically secure random number generator. Each roll produces an independent random value between 0 and 99.99. The math matches real crypto casino implementations, making it accurate for strategy testing.",
  },
  {
    question: "Where can I play Dice for real money?",
    answer:
      "Casino Dice is available at Stake, BC.Game, Rollbit, and most other crypto casinos. It is one of the most popular games due to its mathematical transparency. Practice setting targets here first, and always gamble responsibly with a set budget.",
  },
];

const diceGuides = blogPosts.filter((p) => p.game === "dice");

export default function DicePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }}
      />

      <GameHero
        h1="Free Dice Game Simulator"
        subtitle="Set your target number and pick Roll Over or Roll Under. You control the win probability — higher risk means higher multipliers."
        stats={[
          { value: "99%", label: "RTP" },
          { value: "~9,900x", label: "Max Multiplier" },
          { value: "You Set", label: "The Odds" },
        ]}
      />

      <section>
        <GameErrorBoundary gameName="Dice">
          <DiceGame />
        </GameErrorBoundary>
      </section>

      <GameSEOContent title="How Casino Dice Works">
        <p>
          Casino Dice is one of the most transparent crypto casino games. You set
          a target number between 0 and 99.99, then choose Roll Over or Roll
          Under. The game generates a random number — if it meets your condition,
          you win. The payout multiplier is calculated directly from your win
          probability, minus the 1% house edge.
        </p>
        <p>
          The key mechanic is that you control the exact win probability through
          the target slider. Set a target of 50 with Roll Over for a roughly 50%
          win chance and 1.98x payout. Move it to 10 with Roll Under for a 10%
          chance and 9.8x payout. The relationship is straightforward: lower
          probability equals higher multiplier.
        </p>
        <p>
          Casino Dice has a fixed 99% RTP regardless of your target setting. This
          makes it ideal for testing betting strategies like Martingale and
          D&apos;Alembert, since the math is completely transparent. Note that
          this is casino dice (roll over/under), not craps — there are no dice
          combinations, just a single random number.
        </p>
      </GameSEOContent>

      <GameFAQ items={diceFAQ} gameName="Dice" />

      <CrossGameLinks currentGame="dice" />

      {diceGuides.length > 0 && (
        <section className="px-4 py-12 md:py-16 border-t border-pb-border">
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
