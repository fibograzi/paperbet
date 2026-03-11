"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { WheelType, SpinResult } from "@/lib/roulette/rouletteTypes";
import { getWheelOrder, getPocketColor } from "@/lib/roulette/rouletteEngine";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface RouletteWheelProps {
  wheelType: WheelType;
  spinResult: SpinResult | null;
  isSpinning: boolean;
  onSpinComplete: () => void;
}

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

const COLORS = {
  red: "#DC2626",
  black: "#1C1C1E",
  green: "#059669",
  redHighlight: "#FF4444",
  blackHighlight: "#3A3A3C",
  greenHighlight: "#00E5A0",
};

// ---------------------------------------------------------------------------
// SVG arc helper
// ---------------------------------------------------------------------------

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function arcPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
): string {
  const outerStart = polarToCartesian(cx, cy, outerR, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerR, endAngle);
  const innerStart = polarToCartesian(cx, cy, innerR, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerR, startAngle);

  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
    "Z",
  ].join(" ");
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RouletteWheel({
  wheelType,
  spinResult,
  isSpinning,
  onSpinComplete,
}: RouletteWheelProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const wheelRef = useRef<SVGGElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [winningPocketIdx, setWinningPocketIdx] = useState<number | null>(null);
  const completedRef = useRef(false);

  const wheelOrder = getWheelOrder(wheelType);
  const pocketCount = wheelOrder.length;
  const degreesPerPocket = 360 / pocketCount;

  // Center and radii (viewBox 400x400)
  const cx = 200;
  const cy = 200;
  const outerR = 190;
  const innerR = 80;
  const labelR = 150;
  const ballR = 175;

  // ---------------------------------------------------------------------------
  // Spin animation
  // ---------------------------------------------------------------------------

  const runSpin = useCallback(() => {
    if (!wheelRef.current || !spinResult) return;

    completedRef.current = false;

    // Find the pocket index in wheel order
    const targetIdx = wheelOrder.indexOf(spinResult.winningNumber);
    if (targetIdx < 0) return;

    // The angle where this pocket is centered
    const pocketCenterAngle = targetIdx * degreesPerPocket + degreesPerPocket / 2;

    // We want the pocket to land at the top (0°). The wheel needs to rotate so
    // that pocketCenterAngle ends up at 0. Additional full rotations for drama.
    const extraSpins = 5 * 360;
    const targetAngle = extraSpins + (360 - pocketCenterAngle + currentRotation % 360);
    const finalAngle = currentRotation + targetAngle;

    if (prefersReducedMotion) {
      // Instant result
      setCurrentRotation(finalAngle % 360);
      setWinningPocketIdx(targetIdx);
      completedRef.current = true;
      onSpinComplete();
      return;
    }

    const el = wheelRef.current;

    // Cancel any existing animation
    if (animationRef.current) {
      animationRef.current.cancel();
    }

    const startAngle = currentRotation;
    const duration = 4000; // ms

    const anim = el.animate(
      [
        { transform: `rotate(${startAngle}deg)`, offset: 0 },
        { transform: `rotate(${finalAngle}deg)`, offset: 1 },
      ],
      {
        duration,
        easing: "cubic-bezier(0.17, 0.67, 0.12, 1.0)",
        fill: "forwards",
      },
    );

    animationRef.current = anim;

    anim.onfinish = () => {
      if (!completedRef.current) {
        completedRef.current = true;
        setCurrentRotation(finalAngle % 360);
        setWinningPocketIdx(targetIdx);
        onSpinComplete();
      }
    };
  }, [spinResult, wheelOrder, degreesPerPocket, currentRotation, prefersReducedMotion, onSpinComplete]);

  useEffect(() => {
    if (isSpinning && spinResult) {
      setWinningPocketIdx(null); // eslint-disable-line react-hooks/set-state-in-effect
      runSpin();
    }
  }, [isSpinning, spinResult]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset winning highlight when not spinning
  useEffect(() => {
    if (!isSpinning && !spinResult) {
      setWinningPocketIdx(null); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [isSpinning, spinResult]);

  // ---------------------------------------------------------------------------
  // Render pockets
  // ---------------------------------------------------------------------------

  const pockets = wheelOrder.map((num, idx) => {
    const startAngle = idx * degreesPerPocket;
    const endAngle = startAngle + degreesPerPocket;
    const color = getPocketColor(num);
    const isWinning = winningPocketIdx === idx;

    const fillColor = isWinning
      ? COLORS[`${color}Highlight` as keyof typeof COLORS] ?? COLORS[color]
      : COLORS[color];

    const midAngle = startAngle + degreesPerPocket / 2;
    const labelPos = polarToCartesian(cx, cy, labelR, midAngle);

    // Rotate label text so it's radially aligned
    const labelRotation = midAngle - 90;

    const label = num === -1 ? "00" : String(num);

    return (
      <g key={`pocket-${idx}`}>
        <path
          d={arcPath(cx, cy, outerR, innerR, startAngle, endAngle)}
          fill={fillColor}
          stroke="#0B0F1A"
          strokeWidth="1"
          style={{
            transition: isWinning ? "fill 0.3s ease" : "none",
            filter: isWinning ? `drop-shadow(0 0 6px ${fillColor})` : "none",
          }}
        />
        <text
          x={labelPos.x}
          y={labelPos.y}
          transform={`rotate(${labelRotation}, ${labelPos.x}, ${labelPos.y})`}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={pocketCount <= 37 ? "8" : "7"}
          fontWeight={isWinning ? "700" : "600"}
          fill={color === "black" ? "#F9FAFB" : "#FFFFFF"}
          style={{ userSelect: "none", pointerEvents: "none" }}
        >
          {label}
        </text>
      </g>
    );
  });

  // ---------------------------------------------------------------------------
  // Ball position — orbits around wheel
  // ---------------------------------------------------------------------------

  // Ball sits at the top of the track when not spinning; moves to winning pocket when done
  const ballAngle = winningPocketIdx !== null
    ? winningPocketIdx * degreesPerPocket + degreesPerPocket / 2
    : 0;

  const ballPos = polarToCartesian(cx, cy, ballR, ballAngle);

  return (
    <div className="relative flex items-center justify-center">
      {/* Responsive wrapper */}
      <div
        className="relative"
        style={{ width: "min(280px, 100%)", maxWidth: "400px" }}
      >
        <svg
          viewBox="0 0 400 400"
          className="w-full h-auto"
          aria-label={`Roulette wheel, ${wheelType} style`}
          role="img"
        >
          <defs>
            {/* Outer rim gradient */}
            <radialGradient id="rimGradient" cx="50%" cy="50%" r="50%">
              <stop offset="88%" stopColor="#1F2937" />
              <stop offset="95%" stopColor="#374151" />
              <stop offset="100%" stopColor="#4B5563" />
            </radialGradient>
            {/* Center hub gradient */}
            <radialGradient id="hubGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#374151" />
              <stop offset="100%" stopColor="#111827" />
            </radialGradient>
            {/* Ball glow filter */}
            <filter id="ballGlow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Winning glow */}
            <filter id="winGlow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer rim */}
          <circle cx={cx} cy={cy} r={outerR + 8} fill="url(#rimGradient)" />
          {/* Decorative border ring */}
          <circle
            cx={cx}
            cy={cy}
            r={outerR + 4}
            fill="none"
            stroke="#4B5563"
            strokeWidth="1.5"
          />

          {/* Spinning wheel group */}
          <g
            ref={wheelRef}
            style={{
              transformOrigin: `${cx}px ${cy}px`,
              transform: `rotate(${currentRotation}deg)`,
            }}
          >
            {pockets}
          </g>

          {/* Inner hub (static) */}
          <circle cx={cx} cy={cy} r={innerR - 4} fill="url(#hubGradient)" />
          <circle
            cx={cx}
            cy={cy}
            r={innerR - 4}
            fill="none"
            stroke="#374151"
            strokeWidth="1.5"
          />

          {/* PaperBet logo text in center */}
          <text
            x={cx}
            y={cy - 8}
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill="#00E5A0"
            style={{ userSelect: "none" }}
          >
            PAPER
          </text>
          <text
            x={cx}
            y={cy + 8}
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill="#9CA3AF"
            style={{ userSelect: "none" }}
          >
            BET
          </text>

          {/* Ball track ring */}
          <circle
            cx={cx}
            cy={cy}
            r={ballR}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="4"
          />

          {/* Ball */}
          {isSpinning && !winningPocketIdx && (
            <circle
              cx={cx}
              cy={cy - ballR}
              r="7"
              fill="#F9FAFB"
              filter="url(#ballGlow)"
              style={{
                transformOrigin: `${cx}px ${cy}px`,
                animation: "roulette-ball-spin 0.4s linear infinite",
              }}
            />
          )}

          {winningPocketIdx !== null && (
            <circle
              cx={ballPos.x}
              cy={ballPos.y}
              r="7"
              fill="#F9FAFB"
              filter="url(#ballGlow)"
            />
          )}

          {/* Top pointer */}
          <polygon
            points={`${cx - 8},${cy - outerR - 8} ${cx + 8},${cy - outerR - 8} ${cx},${cy - outerR + 4}`}
            fill="#00E5A0"
          />
        </svg>

        {/* Winning number display overlay */}
        {winningPocketIdx !== null && spinResult && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ paddingBottom: "20%" }}
          >
            <div
              className="rounded-full w-12 h-12 flex items-center justify-center font-heading font-bold text-lg shadow-lg"
              style={{
                backgroundColor: COLORS[spinResult.pocket.color],
                color: "#FFFFFF",
                border: `2px solid ${COLORS[`${spinResult.pocket.color}Highlight` as keyof typeof COLORS] ?? "#F9FAFB"}`,
                boxShadow: `0 0 20px ${COLORS[`${spinResult.pocket.color}Highlight` as keyof typeof COLORS] ?? COLORS[spinResult.pocket.color]}66`,
              }}
            >
              {spinResult.pocket.label}
            </div>
          </div>
        )}
      </div>

      {/* Spinning indicator */}
      {isSpinning && !winningPocketIdx && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs font-mono-stats text-pb-text-muted animate-pulse">
          Spinning...
        </div>
      )}

      <style>{`
        @keyframes roulette-ball-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
