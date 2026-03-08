"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SpinResult } from "./dealWheelTypes";
import { CONFETTI_DURATION } from "./dealWheelEngine";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DealWheelResultProps {
  result: SpinResult | null;
  visible: boolean;
  showConfetti: boolean;
  hasMoreSpins: boolean;
  onDismiss: () => void;
  reducedMotion?: boolean;
}

// ---------------------------------------------------------------------------
// Tier config
// ---------------------------------------------------------------------------

const TIER_EMOJI: Record<string, string> = {
  common: "\uD83C\uDF81", // gift
  medium: "\u2B50",        // star
  rare: "\uD83C\uDF89",    // party popper
  jackpot: "\uD83C\uDFC6", // trophy
  respin: "\uD83D\uDD04",  // cycle arrows
};

// ---------------------------------------------------------------------------
// Confetti Canvas
// ---------------------------------------------------------------------------

function ConfettiCanvas({ tier }: { tier?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 400;
    const H = 500;
    canvas.width = W;
    canvas.height = H;

    const colors = [
      "#00E5A0", "#F59E0B", "#00B4D8", "#EC4899",
      "#8B5CF6", "#EF4444", "#FFD700", "#27AE60",
    ];

    interface Particle {
      x: number;
      y: number;
      w: number;
      h: number;
      color: string;
      vx: number;
      vy: number;
      rotation: number;
      rotationSpeed: number;
      shape: "rect" | "circle" | "ribbon";
    }

    const count = tier === "jackpot" || tier === "rare" ? 100 : 40;

    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: -10 - Math.random() * 100,
      w: 4 + Math.random() * 6,
      h: 3 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 4,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      shape: Math.random() < 0.4 ? "rect" : Math.random() < 0.7 ? "circle" : "ribbon",
    }));

    const startTime = performance.now();

    const animate = () => {
      const elapsed = performance.now() - startTime;
      if (elapsed > CONFETTI_DURATION) return;

      ctx.clearRect(0, 0, W, H);

      const fadeProgress = elapsed / CONFETTI_DURATION;
      const alpha = fadeProgress > 0.7 ? 1 - (fadeProgress - 0.7) / 0.3 : 1;

      for (const p of particles) {
        p.x += p.vx;
        p.vx *= 0.99; // air resistance
        p.y += p.vy;
        p.vy += 0.05; // gravity
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "ribbon") {
          ctx.fillRect(-p.w / 4, -p.h, p.w / 2, p.h * 2);
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }

        ctx.restore();
      }

      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [tier]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.8 }}
    />
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DealWheelResult({
  result,
  visible,
  showConfetti,
  hasMoreSpins,
  onDismiss,
  reducedMotion,
}: DealWheelResultProps) {
  const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key !== "Tab" || !dialogRef.current) return;

    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [visible, handleKeyDown]);

  // Auto-dismiss respin after 1.2 seconds
  useEffect(() => {
    if (!visible || !result) return;
    if (result.segment.tier === "respin") {
      autoCloseRef.current = setTimeout(() => {
        autoCloseRef.current = null;
        onDismiss();
      }, 1200);
      return () => {
        if (autoCloseRef.current !== null) {
          clearTimeout(autoCloseRef.current);
        }
      };
    }
  }, [visible, result, onDismiss]);

  if (!result) return null;

  const segment = result.segment;
  const isRespin = segment.tier === "respin";
  const isMystery = segment.id === "seg-mystery";

  // For mystery bonus, use the resolved casino
  const displayName = isMystery && result.resolvedCasino
    ? result.resolvedCasino.name
    : segment.label;
  const displayDeal = isMystery && result.resolvedCasino
    ? result.resolvedCasino.deal
    : segment.dealDescription;
  const displayColor = isMystery && result.resolvedCasino
    ? result.resolvedCasino.color
    : segment.color;
  const displayUrl = isMystery && result.resolvedCasino
    ? result.resolvedCasino.url
    : segment.affiliateUrl;

  const tierEmoji = TIER_EMOJI[segment.tier] ?? "\uD83C\uDF81";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            // Dismiss on backdrop click (but not during auto-dismissing respin)
            if (e.target === e.currentTarget && !isRespin) onDismiss();
          }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="deal-result-title"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={reducedMotion ? { duration: 0 } : { type: "spring", damping: 20, stiffness: 300 }}
            className="bg-pb-bg-secondary border-2 rounded-2xl p-8 max-w-md w-full mx-4 relative overflow-hidden"
            style={{ borderColor: displayColor }}
          >
            {/* Confetti canvas */}
            {showConfetti && !reducedMotion && <ConfettiCanvas tier={result.segment.tier} />}

            {/* Content */}
            <div className="text-center relative z-10">
              <div className="text-5xl mb-3">{tierEmoji}</div>
              <h2 id="deal-result-title" className="font-heading text-2xl font-bold">
                {isRespin ? "Free Re-Spin!" : "You Won!"}
              </h2>

              {/* Casino/Prize name */}
              {!isRespin && (
                <>
                  <p
                    className="text-xl font-heading font-bold mt-3"
                    style={{ color: displayColor }}
                  >
                    {displayName}
                  </p>
                  <p className="text-pb-text-secondary mt-2 text-lg">
                    {displayDeal}
                  </p>

                  {/* CTA */}
                  {displayUrl && (
                    <>
                      <a
                        href={displayUrl}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="inline-block mt-6 px-8 py-3 rounded-lg font-heading font-bold text-lg bg-pb-accent text-pb-bg-primary hover:shadow-[0_0_30px_rgba(0,229,160,0.3)] transition-shadow"
                      >
                        View This Deal &rarr;
                      </a>
                      <p className="text-xs text-pb-text-muted mt-2">
                        T&amp;Cs apply at partner site. Crypto Casino Partner Offer.
                      </p>
                      <p className="text-xs text-pb-text-muted mt-1">
                        18+ only. Gamble responsibly.
                      </p>
                    </>
                  )}
                </>
              )}

              {isRespin && (
                <p className="text-pb-text-secondary mt-2">
                  Spinning again...
                </p>
              )}

              {/* Dismiss */}
              {!isRespin && (
                <button
                  type="button"
                  onClick={onDismiss}
                  className="block mx-auto mt-4 text-sm text-pb-text-muted hover:text-pb-text-secondary transition-colors"
                >
                  {hasMoreSpins ? "Spin Again" : "Close"}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
