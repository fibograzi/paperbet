import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import MinesGame from "@/components/games/mines/MinesGame";
import GameErrorBoundary from "@/components/shared/GameErrorBoundary";
import { blogPosts } from "@/lib/blog-data";
import { safeJsonLd } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Free Mines Simulator — Test Strategies | PaperBet.io",
  description:
    "Play Mines for free. Reveal gems, avoid mines, and test different risk strategies on a 5×5 grid. 99% RTP simulator with cryptographically random mine placement.",
  alternates: {
    canonical: "https://paperbet.io/mines",
  },
  openGraph: {
    title: "Free Mines Simulator — Test Strategies | PaperBet.io",
    description:
      "Play Mines for free. Reveal gems, avoid mines, and test different risk strategies on a 5×5 grid.",
    url: "https://paperbet.io/mines",
    siteName: "PaperBet.io",
    type: "website",
    images: [{ url: "https://paperbet.io/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Mines Simulator — Test Strategies | PaperBet.io",
    description:
      "Play Mines for free. Reveal gems, avoid mines, and test different risk strategies on a 5×5 grid.",
    images: ["https://paperbet.io/opengraph-image"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Mines Simulator",
  applicationCategory: "GameApplication",
  description:
    "Free-to-play Mines simulator. Test mine avoidance strategies risk-free with configurable mine counts (1–24) and auto-play.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  operatingSystem: "Any",
  url: "https://paperbet.io/mines",
};

const minesGuides = blogPosts.filter((p) => p.game === "mines");

export default function MinesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }}
      />
      <section className="min-h-screen">
        <GameErrorBoundary gameName="Mines">
          <MinesGame />
        </GameErrorBoundary>
      </section>

      {/* Related Guides */}
      {minesGuides.length > 0 && (
        <section className="px-4 py-12 md:py-16">
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
