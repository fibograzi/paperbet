import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import LimboGame from "@/components/games/limbo/LimboGame";
import GameErrorBoundary from "@/components/shared/GameErrorBoundary";
import GameSEOContent from "@/components/shared/GameSEOContent";
import GameFAQ from "@/components/shared/GameFAQ";
import CrossGameLinks from "@/components/shared/CrossGameLinks";
import { blogPosts } from "@/lib/blog-data";
import { safeJsonLd } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Free Limbo Simulator — Instant Multiplier Game | PaperBet",
  description:
    "Play Limbo free. Set a target multiplier, bet, and see if the random result beats your target. Instant rounds, 99% RTP. The fastest crypto casino game.",
  alternates: {
    canonical: "https://paperbet.io/limbo",
  },
  openGraph: {
    title: "Free Limbo Simulator — Instant Multiplier Game | PaperBet",
    description:
      "Play Limbo free. Set a target multiplier, bet, and see if the result beats your target.",
    url: "https://paperbet.io/limbo",
    siteName: "PaperBet.io",
    type: "website",
    images: [{ url: "https://paperbet.io/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Limbo Simulator — Instant Multiplier Game | PaperBet",
    description:
      "Play Limbo free. Set a target multiplier and test strategies risk-free.",
    images: ["https://paperbet.io/opengraph-image"],
  },
  keywords: [
    "limbo simulator",
    "limbo game",
    "limbo crypto game",
    "limbo multiplier",
    "limbo casino",
  ],
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PaperBet Limbo Simulator",
  applicationCategory: "GameApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Free Limbo game simulator with casino-accurate 99% RTP. Set your target multiplier from 1.01x to 1,000,000x and test strategies with $1,000 in paper money.",
};

const limboFAQ = [
  {
    question: "What is Limbo and how does it work?",
    answer:
      "Limbo is an instant crypto casino game. You set a target multiplier (e.g., 2x, 5x, 100x), place a bet, and the game instantly generates a random multiplier. If the result meets or exceeds your target, you win that multiplier applied to your bet. Higher targets pay more but hit less frequently.",
  },
  {
    question: "What is the RTP of Limbo?",
    answer:
      "Limbo has a 99% RTP at every target multiplier setting. The house edge is 1%. A 2x target wins roughly 49.5% of the time. A 100x target wins roughly 0.99% of the time. The expected return is always 99% regardless of your chosen target.",
  },
  {
    question: "What is the difference between Limbo and Crash?",
    answer:
      "Both games involve multipliers, but they play differently. In Crash, a multiplier rises in real-time and you decide when to cash out. In Limbo, you set your target before the round and get an instant result — no watching, no timing. Limbo is faster but removes the active decision-making element.",
  },
  {
    question: "Is this Limbo simulator provably fair?",
    answer:
      "This simulator uses a cryptographically secure random number generator. Each round independently generates a multiplier result. The probability distribution matches real crypto casino Limbo implementations, making it a reliable practice tool.",
  },
  {
    question: "Where can I play Limbo for real money?",
    answer:
      "Limbo is available at Stake, BC.Game, and several other crypto casinos. It is popular for its speed — experienced players often use auto-bet for hundreds of rounds per minute. Practice your target settings here first, and always gamble responsibly.",
  },
];

const limboGuides = blogPosts.filter((p) => p.game === "limbo");

export default function LimboPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }}
      />

      <section>
        <GameErrorBoundary gameName="Limbo">
          <LimboGame />
        </GameErrorBoundary>
      </section>

      <GameSEOContent h1="Free Limbo Game Simulator" title="How Limbo Works">
        <p>
          Limbo is the fastest game in crypto casinos. You set a target
          multiplier — anywhere from 1.01x to over 1,000,000x — place your bet,
          and instantly see the result. If the generated multiplier meets or
          exceeds your target, you win that multiplier applied to your bet. There
          is no animation to watch, no timing decision to make. Pure probability.
        </p>
        <p>
          The probability of winning is inversely proportional to your target. A
          2x target wins roughly 49.5% of the time. A 10x target wins roughly
          9.9% of the time. A 1,000x target wins roughly 0.099% of the time. The
          99% RTP holds at every target setting — the house edge is a consistent
          1% regardless of risk level.
        </p>
        <p>
          Limbo is functionally the instant version of{" "}
          <Link
            href="/crash"
            className="text-pb-accent hover:underline"
          >
            Crash
          </Link>
          . Both games involve multiplier thresholds, but Crash adds a rising
          animation and requires you to time your cashout. Limbo removes that
          layer entirely, making it ideal for high-volume strategy testing
          through auto-bet. Experienced players often run hundreds of rounds per
          minute.
        </p>
      </GameSEOContent>

      <GameFAQ items={limboFAQ} gameName="Limbo" />

      <CrossGameLinks currentGame="limbo" />

      {limboGuides.length > 0 && (
        <section className="px-4 py-12 md:py-16 border-t border-pb-border">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-heading text-2xl font-bold text-pb-text-primary mb-6">
              Limbo Strategy Guides
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {limboGuides.map((post) => (
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
