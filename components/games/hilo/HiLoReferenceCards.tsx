"use client";

import { memo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import HiLoCard from "./HiLoCard";
import { cardFromIndex } from "./hiloEngine";

// ---------------------------------------------------------------------------
// Fixed reference cards: K♠ (highest) and A♠ (lowest)
// ---------------------------------------------------------------------------

// K♠ = index 44 (K is rank index 11, spades is suit index 2, 11*4+2=46)
// Actually using cardFromIndex: rankIdx 11 = K, suitIdx 2 = spades → index 46
// A♠ = index 50 (A is rank index 12, spades is suit index 2, 12*4+2=50)
const KING_SPADES = cardFromIndex(46);
const ACE_SPADES = cardFromIndex(50);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function HiLoReferenceCardsInner({ className = "" }: { className?: string }) {
  return (
    <>
      {/* Desktop layout: flanking cards with arrows */}
      <div
        className={`hidden md:flex items-center gap-3 ${className}`}
        aria-label="Reference cards showing King is highest and Ace is lowest"
      >
        {/* King reference */}
        <div className="flex flex-col items-center gap-2 hilo-reference-sway" style={{ opacity: 0.65 }}>
          <HiLoCard card={KING_SPADES} size="md" />
          <span
            className="font-body text-[#6B7280] uppercase"
            style={{ fontSize: 10, letterSpacing: 1 }}
          >
            Highest
          </span>
        </div>

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
        <div className="flex flex-col items-center gap-2 hilo-reference-sway" style={{ opacity: 0.65 }}>
          <HiLoCard card={ACE_SPADES} size="md" />
          <span
            className="font-body text-[#6B7280] uppercase"
            style={{ fontSize: 10, letterSpacing: 1 }}
          >
            Lowest
          </span>
        </div>
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
