import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Home, Gamepad2, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found | PaperBet.io",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* 404 display */}
        <p className="font-mono-stats text-8xl md:text-9xl font-bold text-pb-accent/20">
          404
        </p>

        <h1 className="font-heading text-3xl md:text-4xl font-bold text-pb-text-primary -mt-4">
          Page Not Found
        </h1>

        <p className="text-pb-text-secondary mt-4 text-lg leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Try one of these instead:
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-pb-accent text-pb-bg-primary font-semibold text-sm hover:brightness-110 transition-all"
          >
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <Link
            href="/plinko"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-pb-bg-secondary border border-pb-border text-pb-text-primary font-semibold text-sm hover:border-pb-accent/50 transition-colors"
          >
            <Gamepad2 className="w-4 h-4" /> Play Plinko
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-pb-bg-secondary border border-pb-border text-pb-text-primary font-semibold text-sm hover:border-pb-accent/50 transition-colors"
          >
            <BookOpen className="w-4 h-4" /> Strategy Hub
          </Link>
        </div>

        {/* Subtle back link */}
        <p className="mt-8 text-sm text-pb-text-muted">
          Or{" "}
          <Link
            href="/"
            className="text-pb-accent hover:underline inline-flex items-center gap-1"
          >
            go back to the homepage <ArrowRight className="w-3 h-3" />
          </Link>
        </p>
      </div>
    </div>
  );
}
