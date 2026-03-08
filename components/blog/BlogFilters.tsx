"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import type { BlogPost } from "@/lib/blog-data";

const FILTERS = ["All", "Plinko", "Crash", "Mines"] as const;
type Filter = (typeof FILTERS)[number];

const categoryColors: Record<string, string> = {
  strategy: "#00E5A0",
  guide: "#00B4D8",
  comparison: "#F59E0B",
};

type BlogPostMeta = Omit<BlogPost, "content">;

interface BlogFiltersProps {
  posts: BlogPostMeta[];
}

export default function BlogFilters({ posts }: BlogFiltersProps) {
  const [filter, setFilter] = useState<Filter>("All");

  const filteredPosts = useMemo(() => {
    if (filter === "All") return posts;
    return posts.filter((p) => p.game === filter.toLowerCase());
  }, [filter, posts]);

  return (
    <>
      {/* Filter Tabs */}
      <div className="flex gap-2 justify-center mb-10">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? "bg-pb-accent text-pb-bg-primary"
                : "bg-pb-bg-secondary text-pb-text-secondary hover:text-pb-text-primary border border-pb-border"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Post Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-pb-text-muted text-lg">
            No articles for {filter} yet — check back soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block bg-pb-bg-secondary border border-pb-border rounded-xl overflow-hidden hover:border-pb-accent/50 transition-colors"
            >
              {/* Gradient header */}
              <div
                className="h-3"
                style={{
                  background: `linear-gradient(to right, ${
                    categoryColors[post.category] ?? "#00E5A0"
                  }33, transparent)`,
                }}
              />

              <div className="p-5 sm:p-6">
                {/* Badge row */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="text-xs font-medium uppercase tracking-wide px-2 py-0.5 rounded"
                    style={{
                      color: categoryColors[post.category],
                      backgroundColor: `${categoryColors[post.category]}1A`,
                    }}
                  >
                    {post.category}
                  </span>
                  <span className="text-xs text-pb-text-muted capitalize">
                    {post.game}
                  </span>
                </div>

                {/* Title */}
                <h2 className="font-heading text-lg sm:text-xl font-bold text-pb-text-primary group-hover:text-pb-accent transition-colors leading-tight">
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p className="text-sm text-pb-text-secondary mt-3 leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Bottom row */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3 text-xs text-pb-text-muted">
                    <time dateTime={post.publishDate}>
                      {new Date(post.publishDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readingTime} min
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-sm text-pb-accent font-medium group-hover:underline">
                    Read More <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
