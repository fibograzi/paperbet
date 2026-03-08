import type { Metadata } from "next";
import DealWheelGame from "@/components/games/deals/DealWheelGame";
import GameErrorBoundary from "@/components/shared/GameErrorBoundary";
import { safeJsonLd } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Featured Casino Deals — Spin the Wheel | PaperBet.io",
  description:
    "Spin the Deal Wheel to unlock featured bonuses at top crypto casinos like Stake, Rollbit, and BC.Game.",
  alternates: {
    canonical: "https://paperbet.io/deals",
  },
  openGraph: {
    title: "Featured Casino Deals — Spin the Wheel | PaperBet.io",
    description:
      "Spin the Deal Wheel to unlock featured bonuses at top crypto casinos. Win 200% deposit matches, free spins, and more.",
    url: "https://paperbet.io/deals",
    siteName: "PaperBet.io",
    type: "website",
    images: [{ url: "https://paperbet.io/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Featured Casino Deals — Spin the Wheel | PaperBet.io",
    description:
      "Spin the Deal Wheel for featured bonuses at top crypto casinos.",
    images: ["https://paperbet.io/opengraph-image"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "PaperBet Deal Wheel — Featured Casino Bonuses",
  description:
    "Spin the Deal Wheel to win featured bonuses at top crypto casinos. Free spins, deposit matches, and rakeback deals.",
  url: "https://paperbet.io/deals",
};

export default function DealsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }}
      />
      <section className="min-h-screen">
        <GameErrorBoundary gameName="Deal Wheel">
          <DealWheelGame />
        </GameErrorBoundary>
      </section>
    </>
  );
}
