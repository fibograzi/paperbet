"use client";

import { cn } from "@/lib/utils";

interface CasinoCardProps {
  name: string;
  color: string;
  offer: string;
  features: string[];
  url: string;
  compact?: boolean;
  termsUrl?: string;
  regionNote?: string;
}

export default function CasinoCard({
  name,
  color,
  offer,
  features,
  url,
  compact = false,
  termsUrl,
  regionNote,
}: CasinoCardProps) {
  return (
    <div
      className={cn(
        "bg-pb-bg-secondary border border-pb-border rounded-xl transition-colors duration-200",
        compact ? "p-3" : "p-4"
      )}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = color;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "";
      }}
    >
      {/* Casino name */}
      <h3
        className={cn(
          "font-heading font-bold",
          compact ? "text-base" : "text-lg"
        )}
        style={{ color }}
      >
        {name}
      </h3>

      {/* Offer */}
      <p className={cn("text-sm text-pb-text-primary", compact ? "mt-1" : "mt-2")}>
        {offer}
      </p>

      {/* Features — hidden in compact mode */}
      {!compact && features.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {features.map((feature) => (
            <span
              key={feature}
              className="text-xs bg-pb-bg-tertiary text-pb-text-muted rounded-full px-2.5 py-0.5"
            >
              {feature}
            </span>
          ))}
        </div>
      )}

      {/* Region note */}
      {regionNote && (
        <p className={cn("text-xs text-amber-400", compact ? "mt-1" : "mt-2")}>
          {regionNote}
        </p>
      )}

      {/* CTA */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={cn(
          "inline-block text-pb-accent text-sm hover:underline",
          compact ? "mt-2" : "mt-3"
        )}
      >
        View Offer &rarr;
      </a>

      {/* T&Cs — always shown for compliance */}
      {termsUrl ? (
        <a
          href={termsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-[11px] text-pb-text-muted hover:underline mt-1"
        >
          T&amp;Cs apply
        </a>
      ) : (
        <p className="text-[11px] text-pb-text-muted mt-1">T&amp;Cs apply</p>
      )}
    </div>
  );
}
