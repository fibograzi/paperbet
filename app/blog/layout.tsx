import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Strategy Hub — Crypto Casino Guides | PaperBet.io",
  description:
    "Data-driven strategy guides for Plinko, Crash, and Mines. Learn the math, compare casinos, and sharpen your edge before playing for real.",
  alternates: {
    canonical: "https://paperbet.io/blog",
  },
  openGraph: {
    title: "Strategy Hub — Crypto Casino Guides | PaperBet.io",
    description:
      "Data-driven strategy guides for Plinko, Crash, and Mines. Learn the math, compare casinos, and sharpen your edge.",
    url: "https://paperbet.io/blog",
    siteName: "PaperBet.io",
    type: "website",
    images: [
      {
        url: "https://paperbet.io/og-image.png",
        width: 1200,
        height: 630,
        alt: "PaperBet.io Strategy Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Strategy Hub — Crypto Casino Guides | PaperBet.io",
    description:
      "Data-driven strategy guides for Plinko, Crash, and Mines. Learn the math, compare casinos, and sharpen your edge.",
    images: ["https://paperbet.io/og-image.png"],
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
