import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import MinesGame from "@/components/games/mines/MinesGame";
import GameErrorBoundary from "@/components/shared/GameErrorBoundary";
import GameSEOContent from "@/components/shared/GameSEOContent";
import GameFAQ from "@/components/shared/GameFAQ";
import CrossGameLinks from "@/components/shared/CrossGameLinks";
import { blogPosts } from "@/lib/blog-data";
import { safeJsonLd } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Free Mines Simulator — Casino Mines Game Online | PaperBet",
  description:
    "Play Mines free on a 5x5 grid. Reveal gems, avoid mines, and cash out as multipliers rise. Test strategies with 1-24 mines before playing for real.",
  alternates: {
    canonical: "https://paperbet.io/mines",
  },
  openGraph: {
    title: "Free Mines Simulator — Casino Mines Game Online | PaperBet",
    description:
      "Play Mines free on a 5x5 grid. Reveal gems, avoid mines, and cash out as multipliers rise.",
    url: "https://paperbet.io/mines",
    siteName: "PaperBet.io",
    type: "website",
    images: [{ url: "https://paperbet.io/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Mines Simulator — Casino Mines Game Online | PaperBet",
    description:
      "Play Mines free on a 5x5 grid. Reveal gems, avoid mines, and test strategies risk-free.",
    images: ["https://paperbet.io/opengraph-image"],
  },
  keywords: [
    "mines simulator",
    "mines demo",
    "mines casino game",
    "mines game free",
    "mines multiplier game",
  ],
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PaperBet Mines Simulator",
  applicationCategory: "GameApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Free Mines simulator with casino-accurate multipliers. Test mine avoidance strategies risk-free with configurable mine counts (1-24) and auto-play.",
};

const minesFAQ = [
  {
    question: "What is Mines and how does it work?",
    answer:
      "Mines is a casino game played on a 5x5 grid containing hidden gems and mines. You choose how many mines to place (1-24), then reveal tiles one by one. Each gem you reveal increases your multiplier. You can cash out at any time, but if you reveal a mine, you lose your bet. More mines mean higher multipliers but greater risk.",
  },
  {
    question: "What is the RTP of Mines?",
    answer:
      "Mines has a 99% RTP regardless of how many mines you place on the grid. The house edge is 1%. Whether you play with 1 mine (low risk, low multipliers) or 24 mines (extreme risk, massive multipliers), your long-term expected return is the same.",
  },
  {
    question: "How many mines should I play with?",
    answer:
      "It depends on your risk tolerance. With 1-3 mines, you get frequent small wins. With 5-10 mines, rewards increase significantly but so does the chance of hitting a mine early. With 15+ mines, each safe reveal pays huge multipliers but survival past 3-4 reveals is unlikely.",
  },
  {
    question: "Is this Mines simulator provably fair?",
    answer:
      "This simulator uses cryptographically random mine placement. Each game generates a new random layout of mines and gems. The probabilities and multipliers match those used by real crypto casinos, making it accurate for practice and strategy testing.",
  },
  {
    question: "Where can I play Mines for real money?",
    answer:
      "Mines is popular at crypto casinos including Stake, BC.Game, and Wild.io. We recommend experimenting with different mine counts here to find your preferred risk level. Always set a budget and stick to it — gambling involves real financial risk.",
  },
];

const minesGuides = blogPosts.filter((p) => p.game === "mines");

export default function MinesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }}
      />

      <section>
        <GameErrorBoundary gameName="Mines">
          <MinesGame />
        </GameErrorBoundary>
      </section>

      <GameSEOContent h1="Free Mines Simulator" title="How Mines Works">
        <p>
          Casino Mines is played on a 5x5 grid of 25 hidden tiles. Before each
          round, you choose how many mines to place (1-24). The remaining tiles
          contain gems. Click tiles to reveal them — each gem you uncover
          increases your running multiplier. You can cash out at any point, or
          keep revealing tiles for higher payouts. Hit a mine and your bet is
          lost.
        </p>
        <p>
          The multiplier for each reveal is calculated from the exact probability
          of survival. With 3 mines, your first click has a 22/25 chance of
          being safe, paying approximately 1.13x. By the 10th safe reveal,
          you&apos;ve beaten increasingly unlikely odds and the multiplier
          reflects that. With 24 mines, even your first click has only a 1/25
          chance — but it pays 24x instantly.
        </p>
        <p>
          This Mines simulator uses 99% RTP at every mine count setting. The 1%
          house edge is built into the multiplier calculations. Use the stats
          panel to track your performance and experiment with different mine
          counts to find your risk preference. See our{" "}
          <Link
            href="/blog/mines-strategy-guide"
            className="text-pb-accent hover:underline"
          >
            Mines strategy guide
          </Link>{" "}
          for detailed probability tables.
        </p>
      </GameSEOContent>

      <GameFAQ items={minesFAQ} gameName="Mines" />

      <CrossGameLinks currentGame="mines" />

      {minesGuides.length > 0 && (
        <section className="px-4 py-12 md:py-16 border-t border-pb-border">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-heading text-2xl font-bold text-pb-text-primary mb-6">
              Mines Strategy Guides
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {minesGuides.map((post) => (
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
