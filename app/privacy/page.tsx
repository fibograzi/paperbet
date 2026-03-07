import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | PaperBet.io",
  description:
    "Learn how PaperBet.io collects, uses, and protects your personal information. We respect your privacy and are committed to transparency.",
  alternates: {
    canonical: "https://paperbet.io/privacy",
  },
  openGraph: {
    title: "Privacy Policy | PaperBet.io",
    description:
      "Learn how PaperBet.io collects, uses, and protects your personal information.",
    url: "https://paperbet.io/privacy",
    siteName: "PaperBet.io",
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-heading text-4xl font-bold text-pb-text-primary">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-pb-text-muted">
          Last updated: March 7, 2026
        </p>

        <div className="mt-8 space-y-0">
          <p className="text-pb-text-secondary leading-relaxed">
            At PaperBet.io, your privacy matters. This Privacy Policy explains
            what information we collect, how we use it, and what rights you have
            regarding your data.
          </p>

          {/* 1. Information We Collect */}
          <h2 className="font-heading text-2xl font-bold text-pb-text-primary mt-10 mb-4">
            1. Information We Collect
          </h2>
          <p className="text-pb-text-secondary leading-relaxed">
            We collect minimal information to provide our service:
          </p>
          <ul className="mt-3 list-disc pl-6 space-y-2 text-pb-text-secondary leading-relaxed">
            <li>
              <strong className="text-pb-text-primary">Email addresses</strong>{" "}
              &mdash; only when you voluntarily submit them (e.g., to receive
              deals or updates).
            </li>
            <li>
              <strong className="text-pb-text-primary">
                localStorage data
              </strong>{" "}
              &mdash; we store game progress, preferences, and simulator state
              locally in your browser. This data never leaves your device.
            </li>
          </ul>

          {/* 2. How We Use Your Information */}
          <h2 className="font-heading text-2xl font-bold text-pb-text-primary mt-10 mb-4">
            2. How We Use Your Information
          </h2>
          <p className="text-pb-text-secondary leading-relaxed">
            We use the information we collect for the following purposes:
          </p>
          <ul className="mt-3 list-disc pl-6 space-y-2 text-pb-text-secondary leading-relaxed">
            <li>
              To provide and maintain our free casino simulator experience.
            </li>
            <li>
              To send you featured deals and updates, but only if you have
              explicitly opted in.
            </li>
            <li>To improve our service based on how the simulator is used.</li>
          </ul>

          {/* 3. Your Rights */}
          <h2 className="font-heading text-2xl font-bold text-pb-text-primary mt-10 mb-4">
            3. Your Rights
          </h2>
          <p className="text-pb-text-secondary leading-relaxed">
            Under the General Data Protection Regulation (GDPR) and similar
            privacy laws, you have the right to:
          </p>
          <ul className="mt-3 list-disc pl-6 space-y-2 text-pb-text-secondary leading-relaxed">
            <li>
              <strong className="text-pb-text-primary">Access</strong> &mdash;
              request a copy of any personal data we hold about you.
            </li>
            <li>
              <strong className="text-pb-text-primary">Rectification</strong>{" "}
              &mdash; request correction of inaccurate personal data.
            </li>
            <li>
              <strong className="text-pb-text-primary">Deletion</strong> &mdash;
              request that we delete your personal data from our systems.
            </li>
            <li>
              <strong className="text-pb-text-primary">Restriction</strong>{" "}
              &mdash; request that we limit how we process your data.
            </li>
            <li>
              <strong className="text-pb-text-primary">Portability</strong>{" "}
              &mdash; request your data in a structured, commonly used format.
            </li>
            <li>
              <strong className="text-pb-text-primary">Object</strong> &mdash;
              object to processing of your personal data.
            </li>
            <li>
              <strong className="text-pb-text-primary">
                Withdraw Consent
              </strong>{" "}
              &mdash; withdraw consent at any time where processing is based on
              your consent (e.g., marketing emails).
            </li>
          </ul>
          <p className="mt-3 text-pb-text-secondary leading-relaxed">
            You also have the right to lodge a complaint with your local data
            protection supervisory authority.
          </p>
          <p className="mt-3 text-pb-text-secondary leading-relaxed">
            To exercise any of these rights, please contact us at{" "}
            <a
              href="mailto:contact@paperbet.io"
              className="text-pb-accent hover:underline"
            >
              contact@paperbet.io
            </a>
            .
          </p>

          {/* 4. Cookies & Local Storage */}
          <h2 className="font-heading text-2xl font-bold text-pb-text-primary mt-10 mb-4">
            4. Cookies & Local Storage
          </h2>
          <p className="text-pb-text-secondary leading-relaxed">
            PaperBet.io uses <strong className="text-pb-text-primary">localStorage</strong> to
            save your game state and preferences directly in your browser. We do
            not use tracking cookies.
          </p>
          <p className="mt-3 text-pb-text-secondary leading-relaxed">
            Please note that third-party websites we link to (including casino
            partners) may set their own cookies. We have no control over these
            cookies and recommend reviewing their respective privacy policies.
          </p>

          {/* 5. Third-Party Links */}
          <h2 className="font-heading text-2xl font-bold text-pb-text-primary mt-10 mb-4">
            5. Third-Party Links
          </h2>
          <p className="text-pb-text-secondary leading-relaxed">
            Our website contains affiliate links to third-party casino
            platforms. These links are provided for your convenience and to help
            support our free service. We are not responsible for the privacy
            practices, content, or policies of any third-party websites. We
            encourage you to read their privacy policies before providing any
            personal information.
          </p>

          {/* 6. Children */}
          <h2 className="font-heading text-2xl font-bold text-pb-text-primary mt-10 mb-4">
            6. Children
          </h2>
          <p className="text-pb-text-secondary leading-relaxed">
            PaperBet.io is intended for users aged 18 and older. We do not
            knowingly collect personal data from anyone under the age of 18. If
            you believe a minor has provided us with personal information, please
            contact us immediately so we can take steps to remove that
            information.
          </p>

          {/* 7. Contact */}
          <h2 className="font-heading text-2xl font-bold text-pb-text-primary mt-10 mb-4">
            7. Contact
          </h2>
          <p className="text-pb-text-secondary leading-relaxed">
            If you have any questions or concerns about this Privacy Policy,
            please reach out to us at{" "}
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
