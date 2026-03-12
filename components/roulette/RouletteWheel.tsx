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
// Pocket colors — rich casino colors
// ---------------------------------------------------------------------------

const COLORS: Record<string, { fill: string; highlight: string }> = {
  red: { fill: "#B71C1C", highlight: "#EF5350" },
  black: { fill: "#1A1A1A", highlight: "#555555" },
  green: { fill: "#1B5E20", highlight: "#4CAF50" },
};

// ---------------------------------------------------------------------------
// SVG geometry
// ---------------------------------------------------------------------------

const CX = 200;
const CY = 200;
const RIM_R = 195; // outermost decorative rim
const POCKET_OUTER = 184; // outer edge of colored pockets
const POCKET_INNER = 108; // inner edge of colored pockets
const NUMBER_R = 150; // center of number labels
const BALL_R = 176; // ball orbit radius (between rim and pocket outer)
const HUB_R = 103; // inner hub
const BALL_SIZE = 6.5;
const SPIN_MS = 4200;

// ---------------------------------------------------------------------------
// SVG helpers
// ---------------------------------------------------------------------------

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function sectorPath(
  cx: number, cy: number,
  rOuter: number, rInner: number,
  a0: number, a1: number,
): string {
  const os = polar(cx, cy, rOuter, a0);
  const oe = polar(cx, cy, rOuter, a1);
  const is_ = polar(cx, cy, rInner, a1);
  const ie = polar(cx, cy, rInner, a0);
  const lg = a1 - a0 > 180 ? 1 : 0;
  return [
    `M ${os.x} ${os.y}`,
    `A ${rOuter} ${rOuter} 0 ${lg} 1 ${oe.x} ${oe.y}`,
    `L ${is_.x} ${is_.y}`,
    `A ${rInner} ${rInner} 0 ${lg} 0 ${ie.x} ${ie.y}`,
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
  const ballRef = useRef<SVGGElement>(null);
  const wheelAnimRef = useRef<Animation | null>(null);
  const ballAnimRef = useRef<Animation | null>(null);
  const rotationRef = useRef(0); // current wheel rotation (avoids stale closure)
  const [displayRotation, setDisplayRotation] = useState(0);
  const [winningIdx, setWinningIdx] = useState<number | null>(null);
  const completedRef = useRef(false);

  const order = getWheelOrder(wheelType);
  const count = order.length;
  const degPer = 360 / count;

  // -------------------------------------------------------------------------
  // Spin animation — starts wheel rotation + counter-rotating ball
  // -------------------------------------------------------------------------

  const runSpin = useCallback(() => {
    if (!wheelRef.current || !ballRef.current || !spinResult) return;

    completedRef.current = false;
    setWinningIdx(null);

    const targetIdx = order.indexOf(spinResult.winningNumber);
    if (targetIdx < 0) return;

    // Pocket center angle on the un-rotated wheel
    const pocketAngle = targetIdx * degPer + degPer / 2;

    // We want the pocket to land at the top (0°).
    // After rotation: (pocketAngle + finalAngle) % 360 ≡ 0
    // So finalAngle % 360 must equal (360 - pocketAngle) % 360.
    const desiredRemainder = (360 - pocketAngle + 360) % 360;
    const cur = rotationRef.current;
    const extraSpins = 5 * 360;
    const base = cur + extraSpins;
    const baseRemainder = ((base % 360) + 360) % 360;
    const delta = ((desiredRemainder - baseRemainder) % 360 + 360) % 360;
    const finalAngle = base + delta;

    if (prefersReducedMotion) {
      const r = finalAngle % 360;
      rotationRef.current = r;
      setDisplayRotation(r);
      setWinningIdx(targetIdx);
      completedRef.current = true;
      onSpinComplete();
      return;
    }

    // Cancel any running animations
    wheelAnimRef.current?.cancel();
    ballAnimRef.current?.cancel();

    const easing = "cubic-bezier(0.12, 0.60, 0.08, 1.0)";

    // Wheel spins forward
    const wAnim = wheelRef.current.animate(
      [
        { transform: `rotate(${cur}deg)` },
        { transform: `rotate(${finalAngle}deg)` },
      ],
      { duration: SPIN_MS, easing, fill: "forwards" },
    );
    wheelAnimRef.current = wAnim;

    // Ball orbits opposite direction (4 full counter-clockwise turns → ends at 0°)
    const bAnim = ballRef.current.animate(
      [
        { transform: "rotate(0deg)" },
        { transform: "rotate(-1440deg)" },
      ],
      { duration: SPIN_MS, easing, fill: "forwards" },
    );
    ballAnimRef.current = bAnim;

    wAnim.onfinish = () => {
      if (completedRef.current) return;
      completedRef.current = true;

      const r = finalAngle % 360;
      rotationRef.current = r;
      setDisplayRotation(r);
      setWinningIdx(targetIdx);

      // Clean up ball animation (ball ends at 0° = top, matching pocket)
      ballAnimRef.current?.cancel();

      onSpinComplete();
    };
  }, [spinResult, order, degPer, prefersReducedMotion, onSpinComplete]);

  // Trigger spin when props indicate spinning with a result
  useEffect(() => {
    if (isSpinning && spinResult) {
      runSpin(); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [isSpinning, spinResult]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear winning highlight when idle and no result
  useEffect(() => {
    if (!isSpinning && !spinResult) {
      setWinningIdx(null); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [isSpinning, spinResult]);

  // -------------------------------------------------------------------------
  // Render pocket sectors
  // -------------------------------------------------------------------------

  const pocketElements = order.map((num, idx) => {
    const a0 = idx * degPer;
    const a1 = a0 + degPer;
    const color = getPocketColor(num);
    const isWin = winningIdx === idx;
    const { fill, highlight } = COLORS[color];
    const fillColor = isWin ? highlight : fill;

    // Number label
    const mid = a0 + degPer / 2;
    const lp = polar(CX, CY, NUMBER_R, mid);
    const bottomHalf = mid > 90 && mid < 270;
    const rot = bottomHalf ? mid + 90 : mid - 90;
    const label = num === -1 ? "00" : String(num);

    return (
      <g key={idx}>
        <path
          d={sectorPath(CX, CY, POCKET_OUTER, POCKET_INNER, a0, a1)}
          fill={fillColor}
          stroke="#8B7D5B"
          strokeWidth="0.6"
        />
        {/* Pocket divider highlight */}
        {idx > 0 && (
          <line
            x1={polar(CX, CY, POCKET_OUTER, a0).x}
            y1={polar(CX, CY, POCKET_OUTER, a0).y}
            x2={polar(CX, CY, POCKET_INNER, a0).x}
            y2={polar(CX, CY, POCKET_INNER, a0).y}
            stroke="#A08E6C"
            strokeWidth="0.4"
            opacity="0.5"
          />
        )}
        <text
          x={lp.x}
          y={lp.y}
          transform={`rotate(${rot}, ${lp.x}, ${lp.y})`}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={count <= 37 ? "10.5" : "9.5"}
          fontWeight="700"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="2.5"
          paintOrder="stroke"
          style={{ userSelect: "none", pointerEvents: "none" }}
        >
          {label}
        </text>
      </g>
    );
  });

  // -------------------------------------------------------------------------
  // Ball deflector diamonds on the rim
  // -------------------------------------------------------------------------

  const deflectors = Array.from({ length: 8 }, (_, i) => {
    const a = i * 45;
    const p = polar(CX, CY, POCKET_OUTER + 4.5, a);
    return (
      <g key={`d${i}`}>
        <polygon
          points={`${p.x},${p.y - 4} ${p.x + 3},${p.y} ${p.x},${p.y + 4} ${p.x - 3},${p.y}`}
          transform={`rotate(${a}, ${p.x}, ${p.y})`}
          fill="#9E8E6C"
          stroke="#C4B48A"
          strokeWidth="0.4"
        />
      </g>
    );
  });

  // -------------------------------------------------------------------------
  // Winning number center badge (visible after spin settles)
  // -------------------------------------------------------------------------

  const winBadge =
    winningIdx !== null && spinResult ? (
      <g>
        <circle
          cx={CX}
          cy={CY}
          r="26"
          fill={COLORS[spinResult.pocket.color].fill}
          stroke={COLORS[spinResult.pocket.color].highlight}
          strokeWidth="2"
          filter="url(#rw-glow)"
        />
        <text
          x={CX}
          y={CY}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="18"
          fontWeight="800"
          fill="#FFFFFF"
          style={{ userSelect: "none", fontFamily: "var(--font-outfit, sans-serif)" }}
        >
          {spinResult.pocket.label}
        </text>
      </g>
    ) : (
      <g>
        <text
          x={CX}
          y={CY - 10}
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fill="#00E5A0"
          style={{ userSelect: "none", fontFamily: "var(--font-outfit, sans-serif)" }}
        >
          PAPER
        </text>
        <text
          x={CX}
          y={CY + 10}
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fill="#9CA3AF"
          style={{ userSelect: "none", fontFamily: "var(--font-outfit, sans-serif)" }}
        >
          BET
        </text>
      </g>
    );

  // -------------------------------------------------------------------------
  // SVG
  // -------------------------------------------------------------------------

  return (
    <div className="relative flex items-center justify-center">
      <div
        className="relative w-full"
        style={{ maxWidth: "380px" }}
      >
        <svg
          viewBox="0 0 400 400"
          className="w-full h-auto"
          role="img"
          aria-label={`Roulette wheel, ${wheelType} layout`}
        >
          <defs>
            {/* Outer rim gradient — dark wood */}
            <radialGradient id="rw-rim" cx="50%" cy="50%" r="50%">
              <stop offset="82%" stopColor="#1E1A14" />
              <stop offset="90%" stopColor="#2D261C" />
              <stop offset="96%" stopColor="#3D3426" />
              <stop offset="100%" stopColor="#2D261C" />
            </radialGradient>
            {/* Inner hub gradient */}
            <radialGradient id="rw-hub" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3A3226" />
              <stop offset="60%" stopColor="#251F16" />
              <stop offset="100%" stopColor="#1A160F" />
            </radialGradient>
            {/* Ball — 3D white sphere */}
            <radialGradient id="rw-ball" cx="35%" cy="30%" r="55%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor="#E8E8E8" />
              <stop offset="100%" stopColor="#A0A0A0" />
            </radialGradient>
            {/* Glow filter */}
            <filter id="rw-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Subtle ball glow */}
            <filter id="rw-ball-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ===== Outer rim ===== */}
          <circle cx={CX} cy={CY} r={RIM_R} fill="url(#rw-rim)" />
          {/* Rim edge ring */}
          <circle
            cx={CX}
            cy={CY}
            r={RIM_R}
            fill="none"
            stroke="#4A3E2E"
            strokeWidth="1.5"
          />
          {/* Inner rim ring (pocket boundary) */}
          <circle
            cx={CX}
            cy={CY}
            r={POCKET_OUTER + 1}
            fill="none"
            stroke="#8B7D5B"
            strokeWidth="1"
          />

          {/* Ball track groove */}
          <circle
            cx={CX}
            cy={CY}
            r={BALL_R}
            fill="none"
            stroke="rgba(160,142,108,0.12)"
            strokeWidth="4"
          />

          {/* Ball deflectors */}
          {deflectors}

          {/* ===== Spinning wheel group ===== */}
          <g
            ref={wheelRef}
            style={{
              transformOrigin: `${CX}px ${CY}px`,
              transform: `rotate(${displayRotation}deg)`,
            }}
          >
            {pocketElements}
          </g>

          {/* ===== Inner hub (static) ===== */}
          <circle cx={CX} cy={CY} r={HUB_R} fill="url(#rw-hub)" />
          <circle
            cx={CX}
            cy={CY}
            r={HUB_R}
            fill="none"
            stroke="#8B7D5B"
            strokeWidth="0.8"
          />
          {/* Decorative inner rings */}
          <circle
            cx={CX}
            cy={CY}
            r={HUB_R - 10}
            fill="none"
            stroke="rgba(160,142,108,0.2)"
            strokeWidth="0.5"
          />
          <circle
            cx={CX}
            cy={CY}
            r={HUB_R - 20}
            fill="none"
            stroke="rgba(160,142,108,0.15)"
            strokeWidth="0.5"
          />

          {/* Hub center / winning badge */}
          {winBadge}

          {/* ===== Ball ===== */}
          <g
            ref={ballRef}
            style={{ transformOrigin: `${CX}px ${CY}px` }}
          >
            {/* Shadow */}
            <ellipse
              cx={CX + 1.5}
              cy={CY - BALL_R + 2}
              rx={BALL_SIZE}
              ry={BALL_SIZE * 0.5}
              fill="rgba(0,0,0,0.35)"
            />
            {/* Ball body */}
            <circle
              cx={CX}
              cy={CY - BALL_R}
              r={BALL_SIZE}
              fill="url(#rw-ball)"
              filter="url(#rw-ball-glow)"
            />
            {/* Specular highlight */}
            <circle
              cx={CX - 1.5}
              cy={CY - BALL_R - 2}
              r={BALL_SIZE * 0.25}
              fill="rgba(255,255,255,0.7)"
            />
          </g>

          {/* ===== Pointer at top ===== */}
          <polygon
            points={`${CX - 10},${CY - RIM_R - 8} ${CX + 10},${CY - RIM_R - 8} ${CX},${CY - RIM_R + 5}`}
            fill="#00E5A0"
            stroke="#0B0F1A"
            strokeWidth="1.5"
            filter="url(#rw-glow)"
          />
        </svg>
      </div>

      {/* Spinning text indicator */}
      {isSpinning && winningIdx === null && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-mono-stats text-pb-text-muted animate-pulse">
          Spinning...
        </div>
      )}
    </div>
  );
}
