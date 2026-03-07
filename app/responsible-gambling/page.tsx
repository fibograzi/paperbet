import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Responsible Gambling | PaperBet.io",
  description:
    "PaperBet.io promotes responsible gambling. Learn about warning signs of problem gambling, support organizations, and self-exclusion tools.",
  alternates: {
    canonical: "https://paperbet.io/responsible-gambling",
  },
  openGraph: {
    title: "Responsible Gambling | PaperBet.io",
    description:
      "Learn about warning signs of problem gambling, support organizations, and self-exclusion tools.",
    url: "https://paperbet.io/responsible-gambling",
    siteName: "PaperBet.io",
    type: "website",
  },
};

export default function ResponsibleGamblingPage() {
  return (
    <div className="min-h-screen px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-heading text-4xl font-bold text-pb-text-primary">
          Responsible Gambling
        </h1>
        <p className="mt-2 text-sm text-pb-text-muted">
          Last updated: March 7, 2026
        </p>

        <div className="mt-8 space-y-0">
          {/* 1. Our Commitment */}
          <h2 className="font-heading text-2xl font-bold text-pb-text-primary mt-10 mb-4">
            1. Our Commitment
          </h2>
          <p className="text-pb-text-secondary leading-relaxed">
            PaperBet.io is a free casino simulator built for education and
            entertainment. No real money is used on our platform. While our
            simulators let you explore game mechanics risk-free, we recognize
            that some users may also engage with real-money gambling platforms.
            We are committed to promoting responsible gambling awareness and
            encouraging healthy habits.
          </p>

          {/* 2. Understanding the Odds */}
          <h2 className="font-heading text-2xl font-bold text-pb-text-primary mt-10 mb-4">
            2. Understanding the Odds
          </h2>
          <p className="text-pb-text-secondary leading-relaxed">
            Every casino game has a built-in{" "}
            <strong className="text-pb-text-primary">house edge</strong> &mdash;
            a mathematical advantage that ensures the casino profits over time.
            This is expressed through the Return to Player (RTP) percentage.
          </p>
          <p className="mt-3 text-pb-text-secondary leading-relaxed">
            Our simulator uses an RTP of approximately 99%, which is similar to
            what many real crypto casinos offer for games like Plinko, Crash, and
            Mines. While this means you get back 99 cents for every dollar on
            average, the remaining 1% house edge compounds over time. The more
            you play, the more the house edge works against you.
          </p>
          <p className="mt-3 text-pb-text-secondary leading-relaxed">
            <strong className="text-pb-text-primary">
              The house always has a mathematical edge over time.
            </strong>{" "}
            Short-term wins are possible, but long-term, the odds favor the
            casino. Understanding this fundamental truth is the first step
            toward gambling responsibly.
          </p>

          {/* 3. Warning Signs */}
          <h2 className="font-heading text-2xl font-bold text-pb-text-primary mt-10 mb-4">
            3. Warning Signs
          </h2>
          <p className="text-pb-text-secondary leading-relaxed">
            Problem gambling can develop gradually. Be honest with yourself and
            watch for these warning signs:
          </p>
          <ul className="mt-3 list-disc pl-6 space-y-2 text-pb-text-secondary leading-relaxed">
            <li>Spending more money or time gambling than you can afford.</li>
            <li>
              Chasing losses by increasing bets to try to win back money.
            </li>
            <li>
              Feeling restless, irritable, or anxious when not gambling.
            </li>
            <li>Lying to family or friends about how much you gamble.</li>
            <li>
              Borrowing money or selling possessions to fund gambling.
            </li>
            <li>
              Neglecting work, school, or personal responsibilities because of
              gambling.
            </li>
            <li>
              Gambling to escape stress, anxiety, depression, or other problems.
            </li>
            <li>
              Repeatedly trying to cut back or stop gambling without success.
            </li>
            <li>
              Feeling a need to bet larger amounts to get the same excitement.
            </li>
            <li>
              Continuing to gamble despite it causing relationship or financial
              problems.
            </li>
          </ul>
          <p className="mt-3 text-pb-text-secondary leading-relaxed">
            If you recognize any of these signs in yourself or someone you know,
            please reach out to one of the support organizations below.
          </p>

          {/* 4. Support Organizations */}
          <h2 className="font-heading text-2xl font-bold text-pb-text-primary mt-10 mb-4">
            4. Support Organizations
          </h2>
          <p className="text-pb-text-secondary leading-relaxed">
            If you or someone you know is struggling with problem gambling, these
            organizations provide free, confidential support:
          </p>
          <ul className="mt-4 space-y-3 text-pb-text-secondary leading-relaxed">
            <li>
              <strong className="text-pb-text-primary">GambleAware</strong>{" "}
              &mdash;{" "}
              <a
                href="https://www.begambleaware.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pb-accent hover:underline"
              >
                www.begambleaware.org
              </a>
            </li>
            <li>
              <strong className="text-pb-text-primary">GamStop</strong> &mdash;{" "}
              <a
                href="https://www.gamstop.co.uk/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pb-accent hover:underline"
              >
                www.gamstop.co.uk
              </a>
            </li>
            <li>
              <strong className="text-pb-text-primary">
                National Council on Problem Gambling (NCPG)
              </strong>{" "}
              &mdash;{" "}
              <a
                href="https://www.ncpgambling.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pb-accent hover:underline"
              >
                www.ncpgambling.org
              </a>
            </li>
            <li>
              <strong className="text-pb-text-primary">
                Gamblers Anonymous
              </strong>{" "}
              &mdash;{" "}
              <a
                href="https://www.gamblersanonymous.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pb-accent hover:underline"
              >
                www.gamblersanonymous.org
              </a>
            </li>
            <li>
              <strong className="text-pb-text-primary">
                National Problem Gambling Helpline
              </strong>{" "}
              &mdash;{" "}
              <span className="text-pb-text-primary font-semibold">
                1-800-522-4700
              </span>{" "}
              (available 24/7)
            </li>
          </ul>

          {/* 5. Self-Exclusion Tools */}
          <h2 className="font-heading text-2xl font-bold text-pb-text-primary mt-10 mb-4">
            5. Self-Exclusion Tools
          </h2>
          <p className="text-pb-text-secondary leading-relaxed">
            Self-exclusion is a voluntary program that allows you to ban yourself
            from gambling platforms for a set period of time. Once enrolled, you
            will be blocked from accessing participating gambling sites,
            giving you the space to step back and regain control.
          </p>
          <p className="mt-3 text-pb-text-secondary leading-relaxed">
            <strong className="text-pb-text-primary">GamStop</strong> offers a
            free self-exclusion service for online gambling. You can register at{" "}
            <a
              href="https://www.gamstop.co.uk/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pb-accent hover:underline"
            >
              www.gamstop.co.uk
            </a>{" "}
            to exclude yourself from all licensed UK gambling sites for 6 months,
            1 year, or 5 years. Many individual casino platforms also offer their
            own self-exclusion and cool-off tools in account settings.
          </p>

          {/* 6. Tips for Responsible Gambling */}
          <h2 className="font-heading text-2xl font-bold text-pb-text-primary mt-10 mb-4">
            6. Tips for Responsible Gambling
          </h2>
          <ul className="mt-3 list-disc pl-6 space-y-2 text-pb-text-secondary leading-relaxed">
            <li>
              <strong className="text-pb-text-primary">Set limits</strong>{" "}
              &mdash; decide on a budget and time limit before you start, and
              stick to them no matter what.
            </li>
            <li>
              <strong className="text-pb-text-primary">
                Don&apos;t chase losses
              </strong>{" "}
              &mdash; if you&apos;re on a losing streak, walk away. Increasing
              bets to recover losses almost always makes things worse.
            </li>
            <li>
              <strong className="text-pb-text-primary">Take breaks</strong>{" "}
              &mdash; step away regularly. Gambling for extended periods clouds
              judgment and leads to poor decisions.
            </li>
            <li>
              <strong className="text-pb-text-primary">
                Never gamble with money you can&apos;t afford to lose
              </strong>{" "}
              &mdash; only use disposable income, never rent money, savings, or
              borrowed funds.
            </li>
            <li>
              <strong className="text-pb-text-primary">
                Keep it fun
              </strong>{" "}
              &mdash; treat gambling as entertainment, not as a way to make
              money. The moment it stops being fun, stop playing.
            </li>
            <li>
              <strong className="text-pb-text-primary">
                Don&apos;t gamble under the influence
              </strong>{" "}
              &mdash; alcohol and other substances impair judgment and can lead
              to reckless betting.
            </li>
          </ul>

          {/* 7. Age Restrictions */}
          <h2 className="font-heading text-2xl font-bold text-pb-text-primary mt-10 mb-4">
            7. Age Restrictions
          </h2>
          <p className="text-pb-text-secondary leading-relaxed">
            PaperBet.io is strictly for users aged 18 and older. Underage
            gambling is illegal and harmful. If you are under 18, you are not
            permitted to use this website or any gambling platform. Parents and
            guardians should use parental controls to prevent minors from
            accessing gambling-related content online.
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-16 border-t border-pb-border pt-8">
          <Link
            href="/"
            className="text-pb-accent hover:underline text-sm"
          >
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
