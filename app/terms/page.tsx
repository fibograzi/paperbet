import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | PaperBet.io",
  description:
    "Read the Terms of Service for PaperBet.io. By using our free casino simulators, you agree to these terms.",
  alternates: {
    canonical: "https://paperbet.io/terms",
  },
  openGraph: {
    title: "Terms of Service | PaperBet.io",
    description:
      "Read the Terms of Service for PaperBet.io. By using our free casino simulators, you agree to these terms.",
    url: "https://paperbet.io/terms",
    siteName: "PaperBet.io",
    type: "website",
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-heading text-4xl font-bold text-pb-text-primary">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-pb-text-muted">
          Last updated: March 7, 2026
        </p>

        <div className="mt-8 space-y-0">
          <p className="text-pb-text-secondary leading-relaxed">
            Welcome to PaperBet.io. By accessing or using our website, you agree
            to be bound by these Terms of Service. If you do not agree with any
            part of these terms, please do not use our service.
          </p>

          {/* 1. Acceptance of Terms */}
          <h2 className="font-heading text-2xl font-bold text-pb-text-primary mt-10 mb-4">
            1. Acceptance of Terms
          </h2>
          <p className="text-pb-text-secondary leading-relaxed">
            By accessing and using PaperBet.io, you acknowledge that you have
            read, understood, and agree to be bound by these Terms of Service
            and our{" "}
            <Link href="/privacy" className="text-pb-accent hover:underline">
              Privacy Policy
            </Link>
            . These terms apply to all visitors, users, and others who access
            the service.
          </p>

          {/* 2. Service Description */}
          <h2 className="font-heading text-2xl font-bold text-pb-text-primary mt-10 mb-4">
            2. Service Description
          </h2>
          <p className="text-pb-text-secondary leading-relaxed">
            PaperBet.io provides free casino game simulators for educational and
            entertainment purposes only. Our platform is{" "}
            <strong className="text-pb-text-primary">
              not a gambling platform
            </strong>
            . No real money is involved in any of our simulations. The
            simulators are designed to help users understand game mechanics,
            probabilities, and strategies in a risk-free environment.
          </p>

          {/* 3. Eligibility */}
          <h2 className="font-heading text-2xl font-bold text-pb-text-primary mt-10 mb-4">
            3. Eligibility
          </h2>
          <p className="text-pb-text-secondary leading-relaxed">
            You must be at least 18 years of age to use PaperBet.io. By using
            our service, you represent and warrant that you meet this age
            requirement. If you are under 18, you are not permitted to use this
            website.
          </p>

          {/* 4. Intellectual Property */}
          <h2 className="font-heading text-2xl font-bold text-pb-text-primary mt-10 mb-4">
            4. Intellectual Property
          </h2>
          <p className="text-pb-text-secondary leading-relaxed">
            All content on PaperBet.io, including but not limited to text,
            graphics, logos, designs, and software, is the property of
            PaperBet.io and is protected by applicable intellectual property
            laws. You may not reproduce, distribute, or create derivative works
            from our content without express written permission.
          </p>
          <p className="mt-3 text-pb-text-secondary leading-relaxed">
            Game names such as &ldquo;Plinko,&rdquo; &ldquo;Crash,&rdquo; and
            &ldquo;Mines&rdquo; may be trademarks of their respective owners
            and are used on this website for descriptive purposes only.
            PaperBet.io is not affiliated with or endorsed by the trademark
            holders of these games.
          </p>

          {/* 5. Affiliate Links Disclosure */}
          <h2 className="font-heading text-2xl font-bold text-pb-text-primary mt-10 mb-4">
            5. Affiliate Links Disclosure
          </h2>
          <p className="text-pb-text-secondary leading-relaxed">
            PaperBet.io contains affiliate links to third-party casino
            platforms. When you click on these links and sign up or make a
            deposit, we may earn a commission at no extra cost to you. These
            commissions help us keep the simulator free for all users. Affiliate
            partnerships do not influence the content or recommendations on our
            site.
          </p>

          {/* 6. Disclaimers */}
          <h2 className="font-heading text-2xl font-bold text-pb-text-primary mt-10 mb-4">
            6. Disclaimers
          </h2>
          <p className="text-pb-text-secondary leading-relaxed">
            Our simulator results are for educational purposes only and{" "}
            <strong className="text-pb-text-primary">
              do not guarantee real-world outcomes
            </strong>
            . Gambling involves significant risk, and most players lose money
            over time. The house always has a mathematical edge. You should never
            gamble with money you cannot afford to lose.
          </p>
          <p className="mt-3 text-pb-text-secondary leading-relaxed">
            PaperBet.io is provided &ldquo;as is&rdquo; and &ldquo;as
            available&rdquo; without warranties of any kind, whether express or
            implied, including but not limited to implied warranties of
            merchantability or fitness for a particular purpose.
          </p>

          {/* 7. Limitation of Liability */}
          <h2 className="font-heading text-2xl font-bold text-pb-text-primary mt-10 mb-4">
            7. Limitation of Liability
          </h2>
          <p className="text-pb-text-secondary leading-relaxed">
            PaperBet.io, its owners, and contributors shall not be held liable
            for any direct, indirect, incidental, consequential, or punitive
            damages arising from your use of third-party casino platforms linked
            from our website. Any decisions to gamble with real money are made
            entirely at your own risk and discretion.
          </p>

          {/* 8. Third-Party Links */}
          <h2 className="font-heading text-2xl font-bold text-pb-text-primary mt-10 mb-4">
            8. Third-Party Links
          </h2>
          <p className="text-pb-text-secondary leading-relaxed">
            Our website contains links to third-party casino platforms and other
            external websites. We do not control and are not responsible for the
            content, privacy policies, or practices of these third-party sites.
            Visiting any linked website is at your own risk, and you should
            review their terms and policies before engaging with them.
          </p>

          {/* 9. Governing Law */}
          <h2 className="font-heading text-2xl font-bold text-pb-text-primary mt-10 mb-4">
            9. Governing Law
          </h2>
          <p className="text-pb-text-secondary leading-relaxed">
            These Terms of Service shall be governed by and construed in
            accordance with the laws of the jurisdiction in which PaperBet.io
            operates. Any disputes arising from or related to these terms shall
            be resolved in the competent courts of that jurisdiction.
          </p>

          {/* 10. Changes to Terms */}
          <h2 className="font-heading text-2xl font-bold text-pb-text-primary mt-10 mb-4">
            10. Changes to Terms
          </h2>
          <p className="text-pb-text-secondary leading-relaxed">
            We reserve the right to modify these Terms of Service at any time.
            Changes will be effective immediately upon posting the updated terms
            on this page. The &ldquo;Last updated&rdquo; date at the top of
            this page will be revised accordingly. Your continued use of the
            service after changes are posted constitutes acceptance of the
            revised terms.
          </p>

          {/* 11. Contact */}
          <h2 className="font-heading text-2xl font-bold text-pb-text-primary mt-10 mb-4">
            11. Contact
          </h2>
          <p className="text-pb-text-secondary leading-relaxed">
            If you have any questions about these Terms of Service, please
            contact us at{" "}
            <a
              href="mailto:contact@paperbet.io"
              className="text-pb-accent hover:underline"
            >
              contact@paperbet.io
            </a>
            .
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
