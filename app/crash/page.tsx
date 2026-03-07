import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CrashGame from "@/components/games/crash/CrashGame";
import { blogPosts } from "@/lib/blog-data";

export const metadata: Metadata = {
  title: "Free Crash Simulator — Test Cashout Strategies | PaperBet.io",
  description:
    "Play Crash for free with casino-accurate multiplier curves. Test auto-cashout strategies, track your win rate, and practice before playing for real at top crypto casinos.",
  alternates: {
    canonical: "https://paperbet.io/crash",
  },
  openGraph: {
    title: "Free Crash Simulator — Test Cashout Strategies | PaperBet.io",
    description:
      "Play Crash for free with casino-accurate multiplier curves. Test auto-cashout strategies and see how they perform.",
    url: "https://paperbet.io/crash",
    siteName: "PaperBet.io",
    type: "website",
    images: [{ url: "https://paperbet.io/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Crash Simulator — Test Cashout Strategies | PaperBet.io",
    description:
      "Play Crash for free with casino-accurate multiplier curves. Test auto-cashout strategies.",
    images: ["https://paperbet.io/og-image.png"],
  },
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
    "Free Crash simulator with casino-accurate multiplier curves. Test cashout strategies with $1,000 in paper money. 99% RTP, cryptographically random outcomes.",
};

const crashGuides = blogPosts.filter((p) => p.game === "crash");

export default function CrashPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="min-h-screen">
        <CrashGame />
      </section>

      {/* Related Guides */}
      {crashGuides.length > 0 && (
        <section className="px-4 py-12 md:py-16">
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
