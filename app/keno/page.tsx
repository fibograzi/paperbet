import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import KenoGame from "@/components/games/keno/KenoGame";
import GameErrorBoundary from "@/components/shared/GameErrorBoundary";
import { blogPosts } from "@/lib/blog-data";
import { safeJsonLd } from "@/lib/utils";

export const metadata: Metadata = {
  title:
    "Free Keno Game Simulator — Number Lottery with 99% RTP | PaperBet.io",
  description:
    "Play Keno for free with casino-accurate math. Pick up to 10 numbers, choose your difficulty, and see how many match the draw. Test strategies risk-free with $1,000 in paper money.",
  alternates: {
    canonical: "https://paperbet.io/keno",
  },
  openGraph: {
    title:
      "Free Keno Game Simulator — Number Lottery with 99% RTP | PaperBet.io",
    description:
      "Play Keno for free. Pick your lucky numbers and test strategies risk-free with $1,000 in paper money.",
    url: "https://paperbet.io/keno",
    siteName: "PaperBet.io",
    type: "website",
    images: [
      { url: "https://paperbet.io/opengraph-image", width: 1200, height: 630 },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Free Keno Game Simulator — Number Lottery with 99% RTP | PaperBet.io",
    description:
      "Play Keno for free. Pick numbers and test strategies risk-free.",
    images: ["https://paperbet.io/opengraph-image"],
  },
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
    "Free Keno number lottery simulator with casino-accurate 99% RTP. Pick 1-10 numbers from a 40-number grid, choose from 4 difficulty levels, and win up to 1,000x your bet with $1,000 in paper money.",
};

const kenoGuides = blogPosts.filter((p) => p.game === "keno");

export default function KenoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }}
      />
      <section className="min-h-screen">
        <GameErrorBoundary gameName="Keno">
          <KenoGame />
        </GameErrorBoundary>
      </section>

      {/* Related Guides */}
      {kenoGuides.length > 0 && (
        <section className="px-4 py-12 md:py-16">
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
