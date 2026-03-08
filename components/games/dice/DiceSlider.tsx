"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DiceDirection } from "./diceTypes";
import { formatDiceResult } from "./diceEngine";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DiceSliderProps {
  target: number;
  direction: DiceDirection;
  winChance: number;
  result: number | null;
  isWin: boolean | null;
  isRolling: boolean;
  onTargetChange: (target: number) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MIN_TARGET = 0.01;
const MAX_TARGET = 99.98;
const TICK_LABELS = [0, 25, 50, 75, 100];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DiceSlider({
  target,
  direction,
  winChance,
  result,
  isWin,
  isRolling,
  onTargetChange,
}: DiceSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Position as percentage (0-100)
  const thumbPercent = (target / 99.99) * 100;
  const resultPercent = result !== null ? (result / 99.99) * 100 : null;

  // Green zone width based on direction
  const greenStart = direction === "over" ? thumbPercent : 0;
  const greenEnd = direction === "over" ? 100 : thumbPercent;
  const greenWidth = greenEnd - greenStart;

  // ---------------------------------------------------------------------------
  // Drag handling
  // ---------------------------------------------------------------------------

  const getTargetFromPosition = useCallback((clientX: number) => {
    if (!trackRef.current) return target;
    const rect = trackRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const raw = (percent / 100) * 99.99;
    return Math.max(MIN_TARGET, Math.min(MAX_TARGET, Math.round(raw * 100) / 100));
  }, [target]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (isRolling) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    const newTarget = getTargetFromPosition(e.clientX);
    onTargetChange(newTarget);
  }, [isRolling, getTargetFromPosition, onTargetChange]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || isRolling) return;
    const newTarget = getTargetFromPosition(e.clientX);
    onTargetChange(newTarget);
  }, [isDragging, isRolling, getTargetFromPosition, onTargetChange]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // ---------------------------------------------------------------------------
  // Keyboard navigation (when slider is focused)
  // ---------------------------------------------------------------------------

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isRolling) return;
    const step = e.shiftKey ? 1.00 : 0.01;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onTargetChange(Math.min(MAX_TARGET, Math.round((target + step) * 100) / 100));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onTargetChange(Math.max(MIN_TARGET, Math.round((target - step) * 100) / 100));
    }
  }, [isRolling, target, onTargetChange]);

  // Result glow color
  const resultGlowColor = isWin === true
    ? "rgba(0, 229, 160, 0.6)"
    : isWin === false
      ? "rgba(239, 68, 68, 0.6)"
      : "none";

  return (
    <div className="w-full select-none">
      <style>{`
        .dice-slider-container { height: 48px; }
        @media (min-width: 768px) { .dice-slider-container { height: 56px; } }
      `}</style>
      {/* Slider container */}
      <div
        className="dice-slider-container relative rounded-xl px-2"
        style={{
          backgroundColor: "#1F2937",
          border: "1px solid #374151",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Track */}
        <div
          ref={trackRef}
          className="relative w-full rounded-full cursor-pointer"
          style={{ height: 12 }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          role="slider"
          aria-valuemin={MIN_TARGET}
          aria-valuemax={MAX_TARGET}
          aria-valuenow={target}
          aria-label="Dice target number"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          {/* Red (losing) zone */}
          <div
            className="absolute inset-0 rounded-full transition-none"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.6)",
            }}
          />

          {/* Green (winning) zone */}
          <div
            className="absolute top-0 bottom-0 rounded-full"
            style={{
              left: `${greenStart}%`,
              width: `${Math.max(0.2, greenWidth)}%`,
              backgroundColor: "#00E5A0",
              transition: isDragging ? "none" : "left 150ms, width 150ms",
            }}
          />

          {/* Rolling pulse overlay */}
          {isRolling && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
              animate={{ opacity: [0, 0.15, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
          )}

          {/* Result marker */}
          <AnimatePresence>
            {resultPercent !== null && !isRolling && (
              <motion.div
                key={`result-${result}`}
                className="absolute top-0 bottom-0 z-10"
                style={{
                  left: `${resultPercent}%`,
                  width: 3,
                  marginLeft: -1.5,
                  backgroundColor: "#F9FAFB",
                  borderRadius: 1.5,
                  boxShadow: `0 0 8px ${resultGlowColor}`,
                }}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                {/* Result label above marker */}
                <div
                  className="absolute font-mono-stats text-xs font-bold"
                  style={{
                    top: -22,
                    left: "50%",
                    transform: "translateX(-50%)",
                    color: isWin ? "#00E5A0" : "#EF4444",
                    whiteSpace: "nowrap",
                  }}
                >
                  {result !== null ? formatDiceResult(result) : ""}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Slider thumb */}
          <div
            className="absolute z-20"
            style={{
              left: `${thumbPercent}%`,
              top: "50%",
              transform: `translate(-50%, -50%) scale(${isDragging ? 1.1 : 1})`,
              width: 28,
              height: 28,
              borderRadius: "50%",
              backgroundColor: "#F9FAFB",
              border: `${isDragging ? 4 : 3}px solid ${isHovering || isDragging ? "#2DD4BF" : "#14B8A6"}`,
              boxShadow: isDragging
                ? "0 2px 12px rgba(0,0,0,0.4)"
                : "0 2px 8px rgba(0,0,0,0.3)",
              cursor: isDragging ? "grabbing" : "grab",
              transition: isDragging ? "none" : "transform 150ms, border 150ms",
              willChange: "transform",
            }}
          />

          {/* Target number label (above thumb) */}
          {(isDragging || isHovering) && (
            <div
              className="absolute z-30 pointer-events-none"
              style={{
                left: `${thumbPercent}%`,
                top: -36,
                transform: "translateX(-50%)",
              }}
            >
              <div
                className="font-mono-stats text-sm font-bold px-2 py-1 rounded-md"
                style={{
                  backgroundColor: "#374151",
                  color: "#F9FAFB",
                  whiteSpace: "nowrap",
                }}
              >
                {target.toFixed(2)}
              </div>
              {/* Arrow */}
              <div
                className="mx-auto"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "5px solid transparent",
                  borderRight: "5px solid transparent",
                  borderTop: "5px solid #374151",
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Scale labels below */}
      <div className="relative w-full px-2 mt-1.5" style={{ height: 18 }}>
        {TICK_LABELS.map((label) => {
          const pct = (label / 100) * 100;
          return (
            <div
              key={label}
              className="absolute"
              style={{
                left: `${pct}%`,
                transform: "translateX(-50%)",
              }}
            >
              {/* Tick mark */}
              <div
                style={{
                  width: 1,
                  height: 4,
                  backgroundColor: "#6B7280",
                  margin: "0 auto 2px",
                }}
              />
              <span
                className="font-mono-stats block text-center"
                style={{ fontSize: 11, color: "#6B7280" }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
