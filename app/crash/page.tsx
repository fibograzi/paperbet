import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CrashGame from "@/components/games/crash/CrashGame";
import GameErrorBoundary from "@/components/shared/GameErrorBoundary";
import GameHero from "@/components/shared/GameHero";
import GameSEOContent from "@/components/shared/GameSEOContent";
import GameFAQ from "@/components/shared/GameFAQ";
import CrossGameLinks from "@/components/shared/CrossGameLinks";
import { blogPosts } from "@/lib/blog-data";
import { safeJsonLd } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Free Crash Game Simulator — Test Strategies | PaperBet",
  description:
    "Play Crash free with casino-accurate multiplier curves. Set auto-cashout targets, track your win rate, and test strategies before playing at real crypto casinos.",
  alternates: {
    canonical: "https://paperbet.io/crash",
  },
  openGraph: {
    title: "Free Crash Game Simulator — Test Strategies | PaperBet",
    description:
      "Play Crash free with casino-accurate multiplier curves. Set auto-cashout targets and test strategies.",
    url: "https://paperbet.io/crash",
    siteName: "PaperBet.io",
    type: "website",
    images: [{ url: "https://paperbet.io/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Crash Game Simulator — Test Strategies | PaperBet",
    description:
      "Play Crash free with casino-accurate multiplier curves. Set auto-cashout targets.",
    images: ["https://paperbet.io/opengraph-image"],
  },
  keywords: [
    "crash game simulator",
    "crash game",
    "crash casino game",
    "crash multiplier game",
    "crash game free",
  ],
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PaperBet Crash Simulator",
  applicationCategory: "GameApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Free Crash simulator with casino-accurate multiplier curves. Test cashout strategies with $1,000 in paper money.",
};

const crashFAQ = [
  {
    question: "What is Crash and how does it work?",
    answer:
      "Crash is a crypto casino game where a multiplier starts at 1.00x and rises until it randomly crashes. You place a bet and must cash out before the crash happens. If you cash out in time, your bet is multiplied by the cashout value. If the game crashes first, you lose your bet entirely.",
  },
  {
    question: "What is the RTP of Crash?",
    answer:
      "Crash has a 99% RTP (return to player), meaning the house edge is just 1%. This applies regardless of your cashout strategy. Whether you cash out early at 1.5x or wait for 10x+, the mathematical expected value remains the same over the long run.",
  },
  {
    question: "What is the best cashout strategy for Crash?",
    answer:
      "There is no strategy that changes the 99% RTP. Lower cashout targets (1.5x-2x) win more frequently but pay less. Higher targets (5x-10x) pay more but win rarely. Auto-cashout removes emotional decisions. The optimal choice depends on your risk tolerance, not math.",
  },
  {
    question: "Is this Crash simulator provably fair?",
    answer:
      "This simulator uses a cryptographically secure random number generator to determine crash points. Each round is independent. The probability distribution matches real crypto casino Crash games, making it accurate for strategy testing and practice.",
  },
  {
    question: "Where can I play Crash for real money?",
    answer:
      "Crash is available at most crypto casinos including Stake, BC.Game, Rollbit, and Wild.io. Practice your cashout timing and strategy here first. Remember that no strategy guarantees profits — always gamble responsibly and set loss limits.",
  },
];

const crashGuides = blogPosts.filter((p) => p.game === "crash");

export default function CrashPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }}
      />

      <GameHero
        h1="Free Crash Game Simulator"
        subtitle="Watch the multiplier rise and cash out before it crashes. The longer you wait, the bigger the win — or you lose everything."
        stats={[
          { value: "99%", label: "RTP" },
          { value: "Unlimited", label: "Max Multiplier" },
          { value: "Active", label: "Cashout Timing" },
        ]}
      />

      <section>
        <GameErrorBoundary gameName="Crash">
          <CrashGame />
        </GameErrorBoundary>
      </section>

      <GameSEOContent title="How Crash Works">
        <p>
          In a Crash game simulator, a multiplier starts at 1.00x and rises
          continuously until it randomly crashes. You place a bet and watch the
          multiplier climb — the challenge is deciding when to cash out. Cash out
          too early and you leave money on the table. Wait too long and the crash
          wipes out your bet entirely.
        </p>
        <p>
          The crash point for each round is determined before the animation
          begins using a cryptographically random algorithm. The distribution
          follows an exponential curve: roughly 33% of rounds crash below 1.5x,
          about 50% crash below 2x, and only 1% survive past 100x. This makes
          the game mathematically fair at 99% RTP while creating genuine tension.
        </p>
        <p>
          Auto-cashout lets you set a target multiplier in advance, removing
          emotional decision-making. This is useful for testing strategies over
          hundreds of rounds. Track your results in the session stats panel to
          see how different cashout targets perform over time. Learn more in
          our{" "}
          <Link
            href="/blog/crash-strategy-guide"
            className="text-pb-accent hover:underline"
          >
            Crash strategy guide
          </Link>
          .
        </p>
      </GameSEOContent>

      <GameFAQ items={crashFAQ} gameName="Crash" />

      <CrossGameLinks currentGame="crash" />

      {crashGuides.length > 0 && (
        <section className="px-4 py-12 md:py-16 border-t border-pb-border">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-heading text-2xl font-bold text-pb-text-primary mb-6">
              Crash Strategy Guides
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {crashGuides.map((post) => (
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
