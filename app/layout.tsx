import type { Metadata, Viewport } from "next";
import { Outfit, DM_Sans, JetBrains_Mono } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ClientOverlays from "@/components/overlays/ClientOverlays";
import { safeJsonLd } from "@/lib/utils";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://paperbet.io"),
  title: "PaperBet.io — Test Your Edge",
  description:
    "Free crypto casino simulators. Practice Plinko, Crash, Mines strategies risk-free, then discover featured deals at top crypto casinos.",
  icons: {
    icon: "/logos/favicon.png",
    apple: "/logos/favicon.png",
  },
  alternates: {
    canonical: "https://paperbet.io",
  },
  openGraph: {
    title: "PaperBet.io — Test Your Edge",
    description:
      "Free crypto casino simulators. Practice Plinko, Crash, Mines strategies risk-free, then discover featured deals at top crypto casinos.",
    url: "https://paperbet.io",
    siteName: "PaperBet.io",
    type: "website",
    images: [{ url: "https://paperbet.io/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PaperBet.io — Test Your Edge",
    description:
      "Free crypto casino simulators. Practice Plinko, Crash, Mines strategies risk-free.",
    images: ["https://paperbet.io/opengraph-image"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0F1A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PaperBet.io",
    url: "https://paperbet.io",
    inLanguage: "en",
    description:
      "Free crypto casino simulators. Practice Plinko, Crash, Mines strategies risk-free, then discover featured deals at top crypto casinos.",
    publisher: {
      "@type": "Organization",
      name: "PaperBet.io",
      url: "https://paperbet.io",
      logo: {
        "@type": "ImageObject",
        url: "https://paperbet.io/logos/beeldlogo.png",
      },
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(siteJsonLd) }}
        />
      </head>
      <body
        className={`${outfit.variable} ${dmSans.variable} ${jetbrainsMono.variable} ${dmSans.className} antialiased`}
      >
        {/* Skip to content — visible on focus for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-pb-accent focus:text-pb-bg-primary focus:font-semibold focus:text-sm focus:outline-none"
        >
          Skip to content
        </a>
        <Header />
        <main id="main-content" className="min-h-screen pt-16 lg:pt-[72px]">{children}</main>
        <Footer />
        <ClientOverlays />
      </body>
    </html>
  );
}
