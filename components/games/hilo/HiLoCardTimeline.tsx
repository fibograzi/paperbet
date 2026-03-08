"use client";

import { useRef, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { RoundPrediction, PlayingCard } from "./hiloTypes";
import { SUIT_SYMBOLS } from "./hiloEngine";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface HiLoCardTimelineProps {
  predictions: RoundPrediction[];
  startCard: PlayingCard;
  className?: string;
}

// ---------------------------------------------------------------------------
// Mini card component (48×67px)
// ---------------------------------------------------------------------------

function MiniCard({
  card,
  borderStyle,
  label,
  labelColor,
  labelBg,
}: {
  card: PlayingCard;
  borderStyle: "start" | "correct" | "loss" | "skip";
  label?: string;
  labelColor?: string;
  labelBg?: string;
}) {
  const suitSymbol = SUIT_SYMBOLS[card.suit];
  const color = card.suitColor === "red" ? "#EF4444" : "#1F2937";

  const borderMap = {
    start: "3px solid #6366F1",
    correct: "3px solid #00E5A0",
    loss: "3px solid #EF4444",
    skip: "2px dashed #6B7280",
  };

  const glowMap = {
    start: "none",
    correct: "none",
    loss: "0 0 8px rgba(239,68,68,0.3)",
    skip: "none",
  };

  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      {/* Label above card */}
      {label && (
        <span
          className="font-body uppercase rounded-full px-1.5 py-0.5"
          style={{
            fontSize: 9,
            letterSpacing: 1,
            color: labelColor || "#00E5A0",
            backgroundColor: labelBg || "rgba(0,229,160,0.15)",
            lineHeight: 1.2,
          }}
        >
          {label}
        </span>
      )}

      {/* Mini card */}
      <div
        className="flex flex-col items-start justify-start font-mono-stats select-none"
        style={{
          width: 48,
          height: 67,
          backgroundColor: "#F9FAFB",
          borderRadius: 8,
          borderBottom: borderMap[borderStyle],
          borderTop: "1px solid #374151",
          borderLeft: "1px solid #374151",
          borderRight: "1px solid #374151",
          boxShadow: glowMap[borderStyle],
          padding: 4,
          color,
        }}
      >
        <span className="font-bold leading-none" style={{ fontSize: 14 }}>
          {card.rank}
        </span>
        <span className="leading-none" style={{ fontSize: 10 }}>
          {suitSymbol}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Connection line between cards with prediction arrow
// ---------------------------------------------------------------------------

function ConnectionLine({
  prediction,
}: {
  prediction: "higher" | "lower" | "skip";
}) {
  if (prediction === "skip") {
    return (
      <div className="flex items-center shrink-0 self-end mb-[28px]">
        <div
          className="h-px w-3"
          style={{
            borderTop: "1px dashed #6B7280",
          }}
        />
      </div>
    );
  }

  const isHigher = prediction === "higher";

  return (
    <div className="flex flex-col items-center shrink-0 self-end mb-[22px]">
      <div className="flex items-center gap-0">
        <div
          className="h-px w-2"
          style={{ backgroundColor: "#374151" }}
        />
        {isHigher ? (
          <ChevronUp
            size={10}
            className="text-[#00E5A0]"
            strokeWidth={3}
            aria-label="Higher"
          />
        ) : (
          <ChevronDown
            size={10}
            className="text-[#EF4444]"
            strokeWidth={3}
            aria-label="Lower"
          />
        )}
        <div
          className="h-px w-2"
          style={{ backgroundColor: "#374151" }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

function HiLoCardTimelineInner({
  predictions,
  startCard,
  className = "",
}: HiLoCardTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest card
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const timer = setTimeout(() => {
      container.scrollTo({
        left: container.scrollWidth,
        behavior: "smooth",
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [predictions.length]);

  return (
    <div className={`relative ${className}`}>
      {/* Left fade gradient when scrolled */}
      <div
        className="absolute left-0 top-0 bottom-0 w-6 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(to right, #111827, transparent)",
        }}
      />

      {/* Scrollable timeline */}
      <div
        ref={scrollRef}
        className="flex items-end gap-2 overflow-x-auto scrollbar-hide py-2 px-1"
        style={{
          touchAction: "pan-x",
          WebkitOverflowScrolling: "touch",
        }}
        aria-label="Card prediction timeline"
        role="list"
      >
        <AnimatePresence initial={false}>
          {/* Start card */}
          <motion.div
            key="start"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            role="listitem"
          >
            <MiniCard
              card={startCard}
              borderStyle="start"
              label="Start"
              labelColor="#00E5A0"
              labelBg="rgba(0,229,160,0.15)"
            />
          </motion.div>

          {/* Prediction steps */}
          {predictions.map((pred, index) => {
            const borderStyle: "correct" | "loss" | "skip" =
              pred.prediction === "skip"
                ? "skip"
                : pred.correct
                  ? "correct"
                  : "loss";

            return (
              <motion.div
                key={`pred-${index}`}
                className="flex items-end"
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                  duration: 0.2,
                  ease: "easeOut",
                  delay: 0.05,
                }}
                role="listitem"
              >
                {/* Connection line */}
                <ConnectionLine prediction={pred.prediction} />

                {/* Result card */}
                <MiniCard
                  card={pred.nextCard}
                  borderStyle={borderStyle}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

const HiLoCardTimeline = memo(HiLoCardTimelineInner);
export default HiLoCardTimeline;
