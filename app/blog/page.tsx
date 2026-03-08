import type { Metadata } from "next";
import { blogPosts } from "@/lib/blog-data";
import BlogFilters from "@/components/blog/BlogFilters";

export const metadata: Metadata = {
  title: "Strategy Hub — PaperBet.io",
  description:
    "Data-driven guides, strategy breakdowns, and casino comparisons to sharpen your edge before playing for real.",
  alternates: {
    canonical: "https://paperbet.io/blog",
  },
  openGraph: {
    title: "Strategy Hub — PaperBet.io",
    description:
      "Data-driven guides, strategy breakdowns, and casino comparisons to sharpen your edge before playing for real.",
    url: "https://paperbet.io/blog",
    siteName: "PaperBet.io",
    type: "website",
    images: [{ url: "https://paperbet.io/opengraph-image", width: 1200, height: 630 }],
  },
};

export default function BlogPage() {
  // Strip content from posts — only pass metadata to the client component
  const postsMeta = blogPosts.map(({ content: _content, ...meta }) => meta);

  return (
    <div className="min-h-screen px-4 py-12 md:py-20">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-pb-text-primary">
            Strategy Hub
          </h1>
          <p className="text-pb-text-secondary text-lg mt-4 max-w-2xl mx-auto">
            Data-driven guides, strategy breakdowns, and casino comparisons to
            sharpen your edge before playing for real.
          </p>
        </div>

        <BlogFilters posts={postsMeta} />
      </div>
    </div>
  );
}
