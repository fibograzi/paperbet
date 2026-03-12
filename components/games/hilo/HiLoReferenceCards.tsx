"use client";

import { memo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

// ---------------------------------------------------------------------------
// Ghost / outline reference card — not a playable card, just a label
// ---------------------------------------------------------------------------

function GhostCard({
  rank,
  label,
}: {
  rank: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 hilo-reference-sway" style={{ opacity: 0.65 }}>
      <div
        className="flex flex-col items-center justify-center rounded-xl select-none"
        style={{
          width: 100,
          height: 140,
          border: "1.5px dashed #374151",
          backgroundColor: "transparent",
        }}
      >
        <span
          className="font-mono-stats font-bold"
          style={{ fontSize: 28, color: "#6B7280", lineHeight: 1 }}
        >
          {rank}
        </span>
        <span
          className="font-body uppercase mt-1"
          style={{ fontSize: 9, color: "#6B7280", letterSpacing: 1 }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function HiLoReferenceCardsInner({ className = "" }: { className?: string }) {
  return (
    <>
      {/* Desktop layout: flanking ghost cards with arrows */}
      <div
        className={`hidden md:flex items-center gap-3 ${className}`}
        aria-label="Reference cards showing King is highest and Ace is lowest"
      >
        {/* King reference */}
        <GhostCard rank="K" label="Highest" />

        {/* Arrow: Higher direction (green ChevronUp) */}
        <div className="flex flex-col items-center justify-center">
          <ChevronUp
            className="text-[#00E5A0]"
            size={20}
            strokeWidth={2.5}
            aria-hidden
          />
        </div>

        {/* Spacer for current card (rendered elsewhere) */}
        <div className="w-[120px]" aria-hidden />

        {/* Arrow: Lower direction (red ChevronDown) */}
        <div className="flex flex-col items-center justify-center">
          <ChevronDown
            className="text-[#EF4444]"
            size={20}
            strokeWidth={2.5}
            aria-hidden
          />
        </div>

        {/* Ace reference */}
        <GhostCard rank="A" label="Lowest" />
      </div>

      {/* Mobile layout: text indicator */}
      <div
        className={`flex md:hidden items-center justify-center ${className}`}
        aria-label="King is highest, Ace is lowest"
      >
        <span
          className="font-body text-[#6B7280]"
          style={{ fontSize: 11 }}
        >
          <span className="font-bold">K</span>
          {" "}(highest)
          {" "}
          <span className="text-[#6B7280] mx-1">&larr; &rarr;</span>
          {" "}
          <span className="font-bold">A</span>
          {" "}(lowest)
        </span>
      </div>
    </>
  );
}

const HiLoReferenceCards = memo(HiLoReferenceCardsInner);
export default HiLoReferenceCards;
