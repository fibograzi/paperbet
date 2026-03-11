import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import KenoGame from "@/components/games/keno/KenoGame";
import GameErrorBoundary from "@/components/shared/GameErrorBoundary";
import GameHero from "@/components/shared/GameHero";
import GameSEOContent from "@/components/shared/GameSEOContent";
import GameFAQ from "@/components/shared/GameFAQ";
import CrossGameLinks from "@/components/shared/CrossGameLinks";
import { blogPosts } from "@/lib/blog-data";
import { safeJsonLd } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Free Keno Simulator — Play Casino Keno Online | PaperBet",
  description:
    "Play casino Keno free. Pick up to 10 numbers from a 40-number grid, choose your difficulty, and see instant results. 99% RTP, no real money needed.",
  alternates: {
    canonical: "https://paperbet.io/keno",
  },
  openGraph: {
    title: "Free Keno Simulator — Play Casino Keno Online | PaperBet",
    description:
      "Play casino Keno free. Pick numbers, choose difficulty, and see instant results.",
    url: "https://paperbet.io/keno",
    siteName: "PaperBet.io",
    type: "website",
    images: [{ url: "https://paperbet.io/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Keno Simulator — Play Casino Keno Online | PaperBet",
    description:
      "Play casino Keno free. Pick numbers and test strategies risk-free.",
    images: ["https://paperbet.io/opengraph-image"],
  },
  keywords: [
    "keno simulator",
    "free keno game",
    "keno online",
    "casino keno",
    "keno number game",
  ],
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PaperBet Keno Simulator",
  applicationCategory: "GameApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Free Keno number game simulator with casino-accurate 99% RTP. Pick 1-10 numbers from a 40-number grid, choose from 4 difficulty levels, and win up to 1,000x.",
};

const kenoFAQ = [
  {
    question: "What is casino Keno and how does it work?",
    answer:
      "Casino Keno is a number-picking game. You select 1-10 numbers from a grid of 40, choose a difficulty level, and the game randomly draws 10 numbers. Payouts depend on how many of your picks match the draw. Unlike state lottery Keno, casino Keno gives instant results with no waiting.",
  },
  {
    question: "What is the RTP of Keno?",
    answer:
      "This Keno simulator has a 99% RTP across all difficulty levels and pick counts. The house edge is 1%. Higher difficulty levels offer bigger payouts for the same number of matches but require more matches to break even.",
  },
  {
    question: "How many numbers should I pick in Keno?",
    answer:
      "Picking fewer numbers (1-3) gives more frequent wins with smaller payouts. Picking more numbers (7-10) gives rare wins with much larger payouts — up to 1,000x. The RTP stays at 99% regardless of pick count. Your choice depends on whether you prefer steady small wins or chasing big hits.",
  },
  {
    question: "Is this Keno simulator provably fair?",
    answer:
      "This simulator uses a cryptographically secure random number generator to draw the 10 result numbers. Each draw is independent and random. The probabilities are based on hypergeometric distribution, matching real casino Keno math.",
  },
  {
    question: "Where can I play Keno for real money?",
    answer:
      "Casino Keno is available at crypto casinos like Stake, BC.Game, and CoinCasino. Make sure you are playing casino Keno (instant results) and not lottery Keno (scheduled draws). Practice with different pick counts and difficulty levels here first. Gamble responsibly.",
  },
];

const kenoGuides = blogPosts.filter((p) => p.game === "keno");

export default function KenoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }}
      />

      <GameHero
        h1="Free Keno Game Simulator"
        subtitle="Pick your numbers, choose a difficulty, and see how many match the draw. Instant results — no waiting for a live draw."
        stats={[
          { value: "99%", label: "RTP" },
          { value: "1,000x", label: "Max Multiplier" },
          { value: "4", label: "Difficulty Levels" },
        ]}
      />

      <section>
        <GameErrorBoundary gameName="Keno">
          <KenoGame />
        </GameErrorBoundary>
      </section>

      <GameSEOContent title="How Casino Keno Works">
        <p>
          Casino Keno is a number-matching game. Pick 1 to 10 numbers from a
          40-number grid, choose one of four difficulty levels (Easy, Medium,
          Hard, Expert), and the game draws 10 random numbers. Your payout
          depends on how many of your picks match the draw. Unlike state lottery
          Keno, casino Keno delivers instant results — no waiting for live draws.
        </p>
        <p>
          The difficulty level changes the payout table without affecting the
          underlying probability. Easy pays smaller amounts for fewer matches,
          while Expert requires more matches to break even but offers
          dramatically larger payouts for high match counts — up to 1,000x your
          bet. The 99% RTP applies across all difficulty levels and pick counts.
        </p>
        <p>
          How many numbers you pick is a personal risk preference. Picking 1-3
          numbers gives frequent small wins. Picking 7-10 numbers creates a
          lottery-like experience where most rounds lose but occasional matches
          pay substantially. The math is based on hypergeometric probability —
          the same formula used by all legitimate casino Keno games.
        </p>
      </GameSEOContent>

      <GameFAQ items={kenoFAQ} gameName="Keno" />

      <CrossGameLinks currentGame="keno" />

      {kenoGuides.length > 0 && (
        <section className="px-4 py-12 md:py-16 border-t border-pb-border">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-heading text-2xl font-bold text-pb-text-primary mb-6">
              Keno Strategy Guides
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {kenoGuides.map((post) => (
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
