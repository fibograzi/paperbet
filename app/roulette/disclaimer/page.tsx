import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Roulette Lab Disclaimer | PaperBet.io",
  description:
    "PaperBet.io Roulette Lab is a free educational simulator. No real money, no gambling. All strategies are for educational purposes only.",
  alternates: {
    canonical: "https://paperbet.io/roulette/disclaimer",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RouletteDisclaimerPage() {
  return (
    <main className="bg-pb-bg-primary min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-12 lg:py-16">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-pb-accent text-sm font-medium mb-4">
            <ShieldCheck className="w-4 h-4" />
            <span>Legal & Transparency</span>
          </div>
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-pb-text-primary leading-tight mb-4">
            Roulette Lab Disclaimer
          </h1>
          <p className="text-pb-text-secondary">
            Last updated: March 2026
          </p>
        </div>

        <div className="space-y-8 text-pb-text-secondary leading-relaxed">

          {/* Educational simulator */}
          <section>
            <h2 className="font-heading font-semibold text-xl text-pb-text-primary mb-3">
              1. Educational Simulator Only
            </h2>
            <p>
              PaperBet.io and the Roulette Lab are free educational simulators. All games on
              this platform — including the Roulette Lab&apos;s free play, strategy tester,
              and simulators — use virtual paper money only. No real money is ever at stake.
            </p>
            <p className="mt-3">
              PaperBet.io is <strong className="text-pb-text-primary">not a gambling site</strong>.
              We do not offer real-money gambling, take deposits, or pay out winnings.
              The sole purpose of this platform is to help users understand casino game mathematics
              and the statistical behavior of betting strategies.
            </p>
          </section>

          {/* No real money */}
          <section>
            <h2 className="font-heading font-semibold text-xl text-pb-text-primary mb-3">
              2. No Real Money Involved
            </h2>
            <p>
              All currency displayed on PaperBet.io — including the $1,000 starting balance in the
              Free Play tool and any simulated winnings or losses — is{" "}
              <strong className="text-pb-text-primary">virtual and has no real-world monetary value</strong>.
              Winning or losing in our simulators does not result in any real financial gain or loss.
            </p>
          </section>

          {/* RNG */}
          <section>
            <h2 className="font-heading font-semibold text-xl text-pb-text-primary mb-3">
              3. Random Number Generation
            </h2>
            <p>
              Game outcomes in the Roulette Lab use browser-based pseudorandom number generation.
              This RNG is designed to replicate the statistical properties of a fair roulette wheel
              (uniform distribution across all numbers) for educational purposes. It is{" "}
              <strong className="text-pb-text-primary">not connected to any real casino</strong>,
              not provably fair in the cryptographic sense used by real crypto casinos, and not
              certified by any gambling authority.
            </p>
            <p className="mt-3">
              Results are statistically valid for educational modeling but should not be used to
              make financial decisions.
            </p>
          </section>

          {/* Affiliate links */}
          <section>
            <h2 className="font-heading font-semibold text-xl text-pb-text-primary mb-3">
              4. Affiliate Links & Third-Party Casinos
            </h2>
            <p>
              PaperBet.io may contain links to third-party online casinos. These links are
              affiliate links — if you sign up and deposit at a partner casino, PaperBet.io
              may earn a commission at no additional cost to you.
            </p>
            <p className="mt-3">
              We only link to casinos we believe to be reputable based on publicly available
              information. However, we make no guarantee about the safety, legality, or
              reliability of any third-party site. You are solely responsible for verifying
              that online gambling is legal in your jurisdiction before using any real-money
              casino.
            </p>
          </section>

          {/* Strategies */}
          <section>
            <h2 className="font-heading font-semibold text-xl text-pb-text-primary mb-3">
              5. Strategies Are for Education Only
            </h2>
            <p>
              All betting strategies presented on this platform — including Martingale, Fibonacci,
              D&apos;Alembert, and others — are for educational purposes only. We make no
              representation that any strategy will produce positive results in real-world gambling.
            </p>
            <p className="mt-3">
              In fact, our simulators exist specifically to demonstrate that{" "}
              <strong className="text-pb-text-primary">
                no betting system can overcome the house edge
              </strong>{" "}
              in the long run. The house edge in European roulette is 2.70% per spin, and this
              applies regardless of bet sizing strategy.
            </p>
          </section>

          {/* Age requirement */}
          <section>
            <h2 className="font-heading font-semibold text-xl text-pb-text-primary mb-3">
              6. Age Requirement
            </h2>
            <p>
              PaperBet.io is intended for users aged{" "}
              <strong className="text-pb-text-primary">18 and over</strong>. While our platform
              does not involve real gambling, the content discusses real-money casino games and
              gambling mathematics. Users under 18 should not use this site.
            </p>
          </section>

          {/* Responsible gambling */}
          <section>
            <h2 className="font-heading font-semibold text-xl text-pb-text-primary mb-3">
              7. Responsible Gambling
            </h2>
            <p>
              If you or someone you know has a gambling problem, please seek help immediately.
              Gambling addiction is a serious condition that can have severe financial and personal
              consequences.
            </p>
            <div className="mt-4 bg-pb-bg-secondary border border-pb-border rounded-xl p-5 space-y-2">
              <p className="text-pb-text-primary text-sm font-medium">Free support resources:</p>
              <ul className="space-y-2 text-sm">
                {[
                  { name: "GambleAware", url: "https://www.begambleaware.org/" },
                  { name: "GamStop (UK self-exclusion)", url: "https://www.gamstop.co.uk/" },
                  { name: "National Council on Problem Gambling", url: "https://www.ncpgambling.org/" },
                  { name: "Gamblers Anonymous", url: "https://www.gamblersanonymous.org/" },
                ].map((resource) => (
                  <li key={resource.name}>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pb-accent hover:underline"
                    >
                      {resource.name}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="text-pb-text-muted text-xs mt-3">
                Helpline (US): 1-800-522-4700
              </p>
            </div>
          </section>

          {/* No warranty */}
          <section>
            <h2 className="font-heading font-semibold text-xl text-pb-text-primary mb-3">
              8. No Warranty
            </h2>
            <p>
              PaperBet.io is provided &ldquo;as is&rdquo; without any warranty, express or implied.
              We make no guarantees about the accuracy of the simulations, calculators, or
              educational content on this site. Use all information at your own risk.
            </p>
          </section>

        </div>

        {/* Back links */}
        <div className="mt-12 pt-8 border-t border-pb-border flex flex-wrap gap-4">
          <Link href="/roulette" className="text-sm text-pb-accent hover:underline font-medium">
            ← Back to Roulette Lab
          </Link>
          <Link href="/responsible-gambling" className="text-sm text-pb-text-secondary hover:text-pb-text-primary transition-colors">
            Responsible Gambling →
          </Link>
          <Link href="/terms" className="text-sm text-pb-text-secondary hover:text-pb-text-primary transition-colors">
            Terms of Service →
          </Link>
        </div>
      </div>
    </main>
  );
}
