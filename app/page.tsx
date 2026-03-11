import type { Metadata } from "next";
import Link from "next/link";
import {
  Gamepad2,
  BarChart3,
  Gift,
  ArrowRight,
} from "lucide-react";
import Button from "@/components/ui/Button";
import GameCard from "@/components/shared/GameCard";
import CasinoCard from "@/components/shared/CasinoCard";
import { GAMES, CASINOS } from "@/lib/constants";
import {
  AnimatedSection,
  ScrollIndicator,
  EmailCapture,
} from "@/components/home/HomeClient";

export const metadata: Metadata = {
  title: "PaperBet — Free Crypto Casino Simulators",
  description:
    "9 free crypto casino simulators. Practice Plinko, Crash, Mines, Roulette, Dice, HiLo, Keno, Limbo, and Coin Flip risk-free before playing for real.",
  alternates: {
    canonical: "https://paperbet.io",
  },
  openGraph: {
    title: "PaperBet — Free Crypto Casino Simulators",
    description:
      "9 free crypto casino simulators. Practice Plinko, Crash, Mines, Roulette, Dice, HiLo, Keno, Limbo, and Coin Flip risk-free.",
    url: "https://paperbet.io",
    siteName: "PaperBet.io",
    type: "website",
    images: [{ url: "https://paperbet.io/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PaperBet — Free Crypto Casino Simulators",
    description:
      "9 free crypto casino simulators. Practice Plinko, Crash, Mines, Roulette, Dice, and more risk-free.",
    images: ["https://paperbet.io/opengraph-image"],
  },
  keywords: [
    "crypto casino simulator",
    "free casino games",
    "crypto casino free play",
    "casino simulator online",
    "plinko simulator",
    "crash game simulator",
    "mines simulator",
    "roulette simulator",
  ],
};

export default function Home() {
  return (
    <>
      {/* ═══ SECTION 1: HERO ═══ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden -mt-16 lg:-mt-[72px] pt-16 lg:pt-[72px]">
        {/* Background grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 49px, #9CA3AF 49px, #9CA3AF 50px), repeating-linear-gradient(90deg, transparent, transparent 49px, #9CA3AF 49px, #9CA3AF 50px)",
          }}
        />

        {/* Radial gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(17,24,39,1)_0%,_rgba(11,15,26,1)_70%)]" />

        {/* Green glow orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-pb-accent/10 blur-[120px] animate-glow" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          {/* Badge */}
          <div className="hero-animate">
            <span className="inline-flex items-center gap-2 rounded-full border border-pb-border bg-pb-bg-secondary/50 px-4 py-2 text-sm text-pb-text-secondary backdrop-blur-sm">
              <span>🎰</span> Test Your Edge
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold mt-8 leading-tight hero-animate-delay-1">
            Free Crypto Casino{" "}
            <span className="text-pb-accent">Simulators</span>
          </h1>

          {/* Subheadline */}
          <p className="text-pb-text-secondary text-lg md:text-xl mt-6 max-w-2xl mx-auto leading-relaxed hero-animate-delay-2">
            Practice with $1,000 in paper money across 9 casino
            games&mdash;Plinko, Crash, Mines, Roulette, Dice, HiLo, Keno,
            Limbo, and Coin Flip. Sharpen your strategy, then discover
            featured deals at top crypto casinos.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 hero-animate-delay-3">
            <Button variant="primary" size="lg" href="/plinko">
              Play Plinko Free <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="secondary" size="lg" href="/deals">
              Spin the Deal Wheel
            </Button>
          </div>

          {/* Trust line */}
          <p className="text-pb-text-muted text-sm mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 hero-animate-delay-3">
            <span>✓ No signup required</span>
            <span>✓ No deposits</span>
            <span>✓ Casino-accurate mechanics</span>
          </p>
        </div>

        {/* Scroll indicator */}
        <ScrollIndicator />
      </section>

      {/* ═══ SECTION 2: GAME CARDS ═══ */}
      <AnimatedSection className="py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold">
              Choose Your Game
            </h2>
            <p className="text-pb-text-secondary mt-4 text-lg">
              Practice casino-accurate crypto games with full strategy tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {GAMES.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ═══ SECTION 3: HOW IT WORKS ═══ */}
      <AnimatedSection className="py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold">
              How PaperBet Works
            </h2>
            <p className="text-pb-text-secondary mt-4 text-lg">
              From practice to play in 3 steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-12 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-pb-accent/20 via-pb-accent/40 to-pb-accent/20" />

            {[
              {
                icon: Gamepad2,
                num: "1",
                title: "Practice Free",
                desc: "Play accurate crypto casino simulators with adjustable risk levels, bet sizes, and strategy presets. No signup needed.",
              },
              {
                icon: BarChart3,
                num: "2",
                title: "Analyze Your Edge",
                desc: "Track your session stats, compare strategies, and see exactly what you would have won with real money.",
              },
              {
                icon: Gift,
                num: "3",
                title: "Discover Featured Deals",
                desc: "Spin the Deal Wheel to win featured bonuses at top crypto casinos. Enter your email to unlock.",
              },
            ].map((step) => (
              <div key={step.num} className="text-center relative">
                {/* Numbered circle */}
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-pb-accent text-pb-bg-primary font-heading font-bold text-sm mb-6 relative z-10">
                  {step.num}
                </div>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 rounded-xl bg-pb-bg-secondary border border-pb-border flex items-center justify-center">
                    <step.icon className="w-7 h-7 text-pb-accent" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="font-heading text-xl font-semibold mt-4">
                  {step.title}
                </h3>
                <p className="text-pb-text-secondary text-sm mt-3 leading-relaxed max-w-xs mx-auto">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ═══ SECTION 4: CASINO PARTNERS ═══ */}
      <AnimatedSection className="py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold">
              Crypto Casino Partner Offers
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {CASINOS.map((casino) => (
              <CasinoCard
                key={casino.id}
                name={casino.name}
                color={casino.color}
                offer={casino.offerShort}
                features={casino.features}
                url={casino.url}
                termsUrl={casino.termsUrl}
                regionNote={casino.regionNote}
              />
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ═══ SECTION 5: STATS / SOCIAL PROOF ═══ */}
      <AnimatedSection className="py-12 md:py-20 bg-pb-bg-secondary">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "6+", label: "Featured Casinos" },
              { value: "1,000x", label: "Max Multiplier" },
              { value: "99%", label: "Game RTP" },
              { value: "$0", label: "Cost to Play" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-mono-stats text-3xl md:text-4xl font-bold text-pb-accent">
                  {stat.value}
                </p>
                <p className="text-pb-text-muted text-sm mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ═══ SECTION 6: STRATEGY HUB TEASER ═══ */}
      <AnimatedSection className="py-12 md:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold">
            Strategy Hub
          </h2>
          <p className="text-pb-text-secondary text-lg mt-4">
            Data-driven guides to help you understand the math before you play.
          </p>
          <div className="mt-8">
            <Button variant="secondary" size="md" href="/blog">
              Read Strategy Guides <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </AnimatedSection>

      {/* ═══ SECTION 7: FINAL CTA ═══ */}
      <AnimatedSection className="py-12 md:py-20 px-4 relative overflow-hidden">
        {/* Green gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-b from-pb-bg-primary via-pb-accent/5 to-pb-bg-primary" />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold">
            Ready to Test Your Edge?
          </h2>
          <p className="text-pb-text-secondary text-lg mt-4">
            Join thousands of smart players who practice before they play.
          </p>

          {/* Email capture */}
          <EmailCapture />
        </div>
      </AnimatedSection>
    </>
  );
}
