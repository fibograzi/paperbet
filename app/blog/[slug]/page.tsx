import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Lightbulb,
  Info,
} from "lucide-react";
import {
  blogPosts,
  getBlogPost,
  getRelatedPosts,
  getCasinoForCta,
} from "@/lib/blog-data";
import type { BlogSection } from "@/lib/blog-data";
import CasinoCard from "@/components/shared/CasinoCard";
import { SITE } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Static params
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

// ---------------------------------------------------------------------------
// Dynamic metadata
// ---------------------------------------------------------------------------

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { robots: { index: false } };

  return {
    title: post.metaTitle,
    description: post.metaDescription,
    alternates: {
      canonical: `https://paperbet.io/blog/${post.slug}`,
    },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      url: `https://paperbet.io/blog/${post.slug}`,
      siteName: "PaperBet.io",
      type: "article",
      publishedTime: post.publishDate,
      images: [
        {
          url: "https://paperbet.io/opengraph-image",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle,
      description: post.metaDescription,
      images: ["https://paperbet.io/opengraph-image"],
    },
    keywords: post.keywords,
  };
}

// ---------------------------------------------------------------------------
// Section renderers
// ---------------------------------------------------------------------------

function SectionRenderer({
  section,
}: {
  section: BlogSection;
}) {
  switch (section.type) {
    case "paragraph":
      return (
        <p className="text-pb-text-secondary leading-[1.75] text-base">
          {section.content}
        </p>
      );

    case "heading2":
      return (
        <h2
          id={slugify(section.content)}
          className="font-heading text-2xl font-bold text-pb-text-primary mt-10 mb-4 scroll-mt-24"
        >
          {section.content}
        </h2>
      );

    case "heading3":
      return (
        <h3 className="font-heading text-xl font-semibold text-pb-text-primary mt-8 mb-3">
          {section.content}
        </h3>
      );

    case "list":
      return (
        <div className="my-4">
          {section.content && (
            <p className="text-pb-text-secondary text-base mb-2">
              {section.content}
            </p>
          )}
          <ul className="list-disc pl-6 space-y-2">
            {section.items?.map((item, i) => (
              <li
                key={i}
                className="text-pb-text-secondary text-base leading-relaxed"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      );

    case "callout":
      return <CalloutBlock variant={section.variant} content={section.content} />;

    case "simulator-cta":
      return <SimulatorCta content={section.content} game={section.game} />;

    case "casino-cta":
      return <CasinoCta casino={section.casino} />;

    case "table":
      return (
        <DataTable
          content={section.content}
          headers={section.headers}
          rows={section.rows}
        />
      );

    case "stat-highlight":
      return (
        <div className="my-6 text-center">
          <p className="font-mono-stats text-5xl md:text-6xl font-bold text-pb-accent">
            {section.content}
          </p>
        </div>
      );

    default:
      return null;
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CalloutBlock({
  variant = "info",
  content,
}: {
  variant?: string;
  content: string;
}) {
  const styles: Record<string, { border: string; bg: string; icon: React.ReactNode }> =
    {
      tip: {
        border: "border-[#00E5A0]/30",
        bg: "bg-[#00E5A0]/5",
        icon: <Lightbulb className="w-5 h-5 text-[#00E5A0] shrink-0 mt-0.5" />,
      },
      warning: {
        border: "border-amber-500/30",
        bg: "bg-amber-500/5",
        icon: (
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        ),
      },
      info: {
        border: "border-[#00B4D8]/30",
        bg: "bg-[#00B4D8]/5",
        icon: <Info className="w-5 h-5 text-[#00B4D8] shrink-0 mt-0.5" />,
      },
    };

  const s = styles[variant ?? "info"] ?? styles.info;

  return (
    <div
      className={`flex gap-3 rounded-xl border p-4 my-6 ${s.border} ${s.bg}`}
    >
      {s.icon}
      <p className="text-sm text-pb-text-secondary leading-relaxed">
        {content}
      </p>
    </div>
  );
}

function SimulatorCta({
  content,
  game,
}: {
  content: string;
  game?: string;
}) {
  const href = game === "deals" ? "/deals" : `/${game ?? "plinko"}`;
  const label = game === "deals" ? "Spin the Wheel" : "Play Free Now";

  return (
    <div className="my-8 bg-pb-bg-secondary border border-pb-accent/30 rounded-xl p-5 text-center">
      <p className="text-pb-text-primary font-heading font-semibold text-base">
        {content}
      </p>
      <Link
        href={href}
        className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 rounded-lg bg-pb-accent text-pb-bg-primary font-semibold text-sm hover:brightness-110 transition-all"
      >
        {label} <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

function CasinoCta({ casino }: { casino?: string }) {
  if (!casino) return null;
  const c = getCasinoForCta(casino);
  if (!c) return null;

  return (
    <div className="my-6">
      <p className="text-[11px] text-pb-text-muted uppercase tracking-wider font-semibold mb-2">
        Crypto Casino Partner Offer
      </p>
      <CasinoCard
        name={c.name}
        color={c.color}
        offer={c.offer}
        features={c.features}
        url={c.url}
        termsUrl={c.termsUrl}
        regionNote={c.regionNote}
      />
    </div>
  );
}

function DataTable({
  content,
  headers,
  rows,
}: {
  content: string;
  headers?: string[];
  rows?: string[][];
}) {
  if (!headers || !rows) return null;

  return (
    <div className="my-6 overflow-x-auto rounded-lg border border-pb-border">
      <table className="w-full text-sm" aria-label={content}>
        <thead className="bg-pb-bg-secondary">
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="text-xs text-pb-text-muted uppercase text-left px-4 py-2.5 font-semibold whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className={
                ri % 2 === 0 ? "bg-pb-bg-primary" : "bg-pb-bg-secondary"
              }
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={`px-4 py-2 text-pb-text-secondary whitespace-nowrap ${
                    ci === 0 ? "font-medium text-pb-text-primary" : ""
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Table of Contents (desktop sidebar)
// ---------------------------------------------------------------------------

function TableOfContents({ sections }: { sections: BlogSection[] }) {
  const headings = sections.filter((s) => s.type === "heading2");
  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-24" aria-label="Table of contents">
      <p className="text-xs text-pb-text-muted uppercase tracking-wider font-semibold mb-3">
        In This Article
      </p>
      <ul className="space-y-2">
        {headings.map((h, i) => (
          <li key={i}>
            <a
              href={`#${slugify(h.content)}`}
              className="text-sm text-pb-text-secondary hover:text-pb-accent transition-colors leading-snug block"
            >
              {h.content}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Related Posts
// ---------------------------------------------------------------------------

function RelatedPosts({ currentSlug }: { currentSlug: string }) {
  const related = getRelatedPosts(currentSlug, 2);
  if (related.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-pb-border">
      <h3 className="font-heading text-xl font-bold text-pb-text-primary mb-4">
        Related Guides
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {related.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block bg-pb-bg-secondary border border-pb-border rounded-xl p-4 hover:border-pb-accent/50 transition-colors group"
          >
            <p className="text-xs text-pb-text-muted uppercase tracking-wide mb-1">
              {post.category}
            </p>
            <h4 className="font-heading font-semibold text-pb-text-primary group-hover:text-pb-accent transition-colors text-sm leading-tight">
              {post.title}
            </h4>
            <p className="text-xs text-pb-text-muted mt-2 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {post.readingTime} min read
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Safe JSON-LD serializer
// ---------------------------------------------------------------------------

function safeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.publishDate,
    author: {
      "@type": "Person",
      name: "PaperBet Editorial Team",
      url: "https://paperbet.io/blog",
    },
    publisher: {
      "@type": "Organization",
      name: "PaperBet.io",
      url: "https://paperbet.io",
    },
    image: "https://paperbet.io/opengraph-image",
    mainEntityOfPage: `https://paperbet.io/blog/${post.slug}`,
    keywords: post.keywords.join(", "),
  };

  const formattedDate = new Date(post.publishDate).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }}
      />

      <div className="min-h-screen px-4 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-pb-text-muted hover:text-pb-accent transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Strategy Hub
          </Link>

          <div className="flex gap-10">
            {/* Main content */}
            <article className="flex-1 min-w-0 max-w-[720px]">
              {/* Article header */}
              <header className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-medium uppercase tracking-wide px-2 py-0.5 rounded bg-pb-accent/10 text-pb-accent">
                    {post.category}
                  </span>
                  <span className="text-xs text-pb-text-muted capitalize">
                    {post.game}
                  </span>
                </div>

                <h1 className="font-heading text-3xl md:text-4xl font-bold text-pb-text-primary leading-tight">
                  {post.title}
                </h1>

                <div className="flex items-center gap-4 mt-4 text-sm text-pb-text-muted">
                  <time dateTime={post.publishDate}>{formattedDate}</time>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {post.readingTime} min read
                  </span>
                </div>
              </header>

              {/* Article body */}
              <div className="space-y-4">
                {post.content.map((section, i) => (
                  <SectionRenderer key={i} section={section} />
                ))}
              </div>

              {/* Related posts */}
              <RelatedPosts currentSlug={post.slug} />

              {/* Disclaimer */}
              <div className="mt-10 pt-6 border-t border-pb-border">
                <p className="text-xs text-pb-text-muted leading-relaxed">
                  {SITE.disclaimer}
                </p>
              </div>
            </article>

            {/* Sidebar (desktop only) */}
            <aside className="hidden lg:block w-56 shrink-0">
              <TableOfContents sections={post.content} />
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
