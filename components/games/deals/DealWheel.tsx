"use client";

import { useRef, useEffect } from "react";
import { DealWheelRenderer } from "./dealWheelAnimation";
import type { WheelSegment, DealWheelPhase } from "./dealWheelTypes";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DealWheelProps {
  segments: WheelSegment[];
  angleRef: React.RefObject<number>;
  phase: DealWheelPhase;
  resultIndex: number | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DealWheel({
  segments,
  angleRef,
  phase,
  resultIndex,
}: DealWheelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<DealWheelRenderer | null>(null);
  const drawRafRef = useRef<number | null>(null);
  const revealStartRef = useRef<number | null>(null);
  const pointerRef = useRef<HTMLDivElement>(null);
  const lastSegmentRef = useRef<number>(-1);
  const pointerBounceRef = useRef(0);

  // Refs for values read in the draw loop (avoids recreating drawFrame every frame)
  const segmentsRef = useRef(segments);
  const phaseRef = useRef(phase);
  const resultIndexRef = useRef(resultIndex);
  segmentsRef.current = segments;
  phaseRef.current = phase;
  resultIndexRef.current = resultIndex;

  // Track reveal start for pulse animation + restart rAF if paused
  useEffect(() => {
    if (phase === "revealing") {
      revealStartRef.current = performance.now();
    } else {
      revealStartRef.current = null;
    }

    // Restart draw loop when transitioning out of idle
    if (phase !== "idle" && drawRafRef.current === null) {
      const drawFrame = () => {
        const renderer = rendererRef.current;
        if (!renderer) {
          drawRafRef.current = requestAnimationFrame(drawFrame);
          return;
        }
        const now = performance.now();
        const segs = segmentsRef.current;
        const angle = angleRef.current;
        const ph = phaseRef.current;
        const ri = resultIndexRef.current;

        const segCount = segs.length;
        const segArc = (2 * Math.PI) / segCount;
        const TWO_PI = 2 * Math.PI;
        const pointerLocal = ((3 * Math.PI / 2 - angle) % TWO_PI + TWO_PI) % TWO_PI;
        const currentSeg = Math.floor(pointerLocal / segArc) % segCount;

        if (ph === "spinning" && lastSegmentRef.current !== -1 && currentSeg !== lastSegmentRef.current) {
          pointerBounceRef.current = 1.0;
        }
        lastSegmentRef.current = currentSeg;
        pointerBounceRef.current *= 0.85;
        if (pointerBounceRef.current < 0.01) pointerBounceRef.current = 0;

        renderer.drawWheel(segs, angle, ph, now);

        if (ph === "revealing" && ri !== null && revealStartRef.current) {
          const elapsed = now - revealStartRef.current;
          const pulseProgress = Math.min(elapsed / 2000, 1);
          renderer.drawHighlight(ri, segs, angle, pulseProgress);
        }

        if (pointerRef.current) {
          const bounceY = pointerBounceRef.current * 6;
          pointerRef.current.style.transform = `translateX(-50%) translateY(${bounceY}px)`;
        }

        const isIdle = ph === "idle" && pointerBounceRef.current === 0;
        if (isIdle) {
          drawRafRef.current = null;
          return;
        }
        drawRafRef.current = requestAnimationFrame(drawFrame);
      };
      drawRafRef.current = requestAnimationFrame(drawFrame);
    }
  }, [phase, angleRef]);

  // -----------------------------------------------------------------------
  // Renderer lifecycle
  // -----------------------------------------------------------------------

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    rendererRef.current = new DealWheelRenderer(canvas, {
      width,
      height,
      dpr,
    });

    // Draw initial idle frame so the wheel is visible immediately
    rendererRef.current.drawWheel(
      segmentsRef.current,
      angleRef.current,
      phaseRef.current,
      performance.now()
    );

    // ResizeObserver with debounce
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const observer = new ResizeObserver((entries) => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const entry = entries[0];
        if (!entry) return;
        const { width: w, height: h } = entry.contentRect;
        const newDpr = window.devicePixelRatio || 1;
        rendererRef.current?.resize(w, h, newDpr);
      }, 200);
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
      clearTimeout(resizeTimeout);
      rendererRef.current?.destroy();
      rendererRef.current = null;
    };
  }, []);

  // -----------------------------------------------------------------------
  // Continuous draw loop
  // -----------------------------------------------------------------------

  // Stable draw loop — reads from refs, never recreated
  useEffect(() => {
    const drawFrame = () => {
      const renderer = rendererRef.current;
      if (!renderer) {
        drawRafRef.current = requestAnimationFrame(drawFrame);
        return;
      }

      const now = performance.now();
      const segs = segmentsRef.current;
      const angle = angleRef.current;
      const ph = phaseRef.current;
      const ri = resultIndexRef.current;

      // Detect segment tick for pointer bounce
      const segCount = segs.length;
      const segArc = (2 * Math.PI) / segCount;
      const TWO_PI = 2 * Math.PI;
      const pointerLocal = ((3 * Math.PI / 2 - angle) % TWO_PI + TWO_PI) % TWO_PI;
      const currentSeg = Math.floor(pointerLocal / segArc) % segCount;

      if (ph === "spinning" && lastSegmentRef.current !== -1 && currentSeg !== lastSegmentRef.current) {
        pointerBounceRef.current = 1.0;
      }
      lastSegmentRef.current = currentSeg;

      // Decay bounce
      pointerBounceRef.current *= 0.85;
      if (pointerBounceRef.current < 0.01) pointerBounceRef.current = 0;

      renderer.drawWheel(segs, angle, ph, now);

      // Highlight during reveal
      if (ph === "revealing" && ri !== null && revealStartRef.current) {
        const elapsed = now - revealStartRef.current;
        const pulseProgress = Math.min(elapsed / 2000, 1);
        renderer.drawHighlight(ri, segs, angle, pulseProgress);
      }

      // Apply pointer bounce
      if (pointerRef.current) {
        const bounceY = pointerBounceRef.current * 6;
        pointerRef.current.style.transform = `translateX(-50%) translateY(${bounceY}px)`;
      }

      // Pause loop when idle and pointer bounce has settled
      const isIdle = ph === "idle" && pointerBounceRef.current === 0;
      if (isIdle) {
        drawRafRef.current = null;
        return;
      }

      drawRafRef.current = requestAnimationFrame(drawFrame);
    };

    drawRafRef.current = requestAnimationFrame(drawFrame);
    return () => {
      if (drawRafRef.current !== null) {
        cancelAnimationFrame(drawRafRef.current);
      }
    };
  }, [angleRef]);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{
        aspectRatio: "1/1",
        maxWidth: 500,
        margin: "0 auto",
        filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.4))",
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        role="img"
        aria-label={`Deal wheel with ${segments.length} prize segments`}
      >
        Your browser does not support the canvas element. Please use a modern browser to spin the Deal Wheel.
      </canvas>

      {/* Gold pointer at top */}
      <div
        ref={pointerRef}
        className="absolute top-0 left-1/2 -translate-x-1/2 z-10"
        style={{
          marginTop: -4,
          filter: phase === "spinning"
            ? "drop-shadow(0 2px 8px rgba(245, 158, 11, 0.6))"
            : "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
          transition: "filter 0.3s ease",
        }}
      >
        <svg width="36" height="44" viewBox="0 0 36 44">
          <defs>
            <linearGradient id="pointer-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
          </defs>
          <path
            d="M18 44 L0 10 Q0 0 10 0 L26 0 Q36 0 36 10 Z"
            fill="url(#pointer-grad)"
            stroke="#92400E"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Glow ring during spinning */}
      {phase === "spinning" && (
        <div
          className="absolute inset-[10%] rounded-full pointer-events-none animate-pulse"
          style={{
            boxShadow:
              "0 0 60px rgba(0, 229, 160, 0.25), inset 0 0 60px rgba(0, 229, 160, 0.1)",
          }}
        />
      )}
    </div>
  );
}
