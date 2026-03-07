"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useReducer,
  useSyncExternalStore,
} from "react";
import { CrashChartRenderer } from "./crashAnimation";
import { formatCrashMultiplier, getMultiplierColor, getTimeForMultiplier } from "./crashEngine";
import type { CrashPhase, ChartPoint } from "./crashTypes";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CrashChartProps {
  phase: CrashPhase;
  currentMultiplier: number;
  crashPoint: number | null;
  elapsedTime: number;
  countdown: number;
  cashedOut: boolean;
  cashoutMultiplier: number | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CHART_PADDING = { top: 24, right: 24, bottom: 24, left: 60 };
const POINT_INTERVAL = 50; // ms between recorded chart points
const CRASH_DURATION = 600; // ms total crash animation
const GO_DURATION = 300; // ms to show "GO!"
const CASHOUT_FLOAT_DURATION = 1500; // ms for cashout float animation
const CRASH_FLASH_DURATION = 100; // ms for red flash
const CRASH_SHAKE_START = 100; // ms offset for shake start
const CRASH_SHAKE_END = 200; // ms offset for shake end
const DEBOUNCE_MS = 200;

// ---------------------------------------------------------------------------
// Reduced motion hook (useSyncExternalStore — no setState in effect)
// ---------------------------------------------------------------------------

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(callback: () => void): () => void {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CrashChart({
  phase,
  currentMultiplier,
  crashPoint: _crashPoint,
  elapsedTime: _elapsedTime,
  countdown,
  cashedOut,
  cashoutMultiplier,
}: CrashChartProps) {
  // Force re-renders from rAF loop without triggering "setState in effect"
  const [, forceRender] = useReducer((x: number) => x + 1, 0);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CrashChartRenderer | null>(null);
  const pointsRef = useRef<ChartPoint[]>([]);
  const lastPointTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  // Refs for values that change frequently — read by rAF loop without
  // needing it in the useEffect dependency array
  const phaseRef = useRef<CrashPhase>(phase);
  phaseRef.current = phase;
  const multiplierRef = useRef<number>(currentMultiplier);
  multiplierRef.current = currentMultiplier;

  // Animation timing refs (no setState — derived during render)
  const crashStartRef = useRef<number>(0);
  const crashAnimDone = useRef(false);
  const goStartRef = useRef<number>(0);
  const cashoutStartRef = useRef<number>(0);
  const crashCompletionFired = useRef(false);

  const reducedMotion = usePrefersReducedMotion();

  // Previous phase ref removed — transitions now handled by useLayoutEffect

  // -----------------------------------------------------------------------
  // Renderer setup + ResizeObserver
  // -----------------------------------------------------------------------

  const initRenderer = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width;
    const height = rect.height;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    if (rendererRef.current) {
      rendererRef.current.resize(width, height, dpr);
    } else {
      rendererRef.current = new CrashChartRenderer(canvas, {
        width,
        height,
        dpr,
        padding: CHART_PADDING,
      });
    }
  }, []);

  useEffect(() => {
    initRenderer();

    const container = containerRef.current;
    if (!container) return;

    let debounceTimer: ReturnType<typeof setTimeout>;
    const observer = new ResizeObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(initRenderer, DEBOUNCE_MS);
    });
    observer.observe(container);

    return () => {
      clearTimeout(debounceTimer);
      observer.disconnect();
      rendererRef.current?.destroy();
      rendererRef.current = null;
      cancelAnimationFrame(rafRef.current);
    };
  }, [initRenderer]);

  // -----------------------------------------------------------------------
  // Phase transition handling (useLayoutEffect — fires synchronously before
  // paint, so the rAF draw loop always sees consistent refs)
  // -----------------------------------------------------------------------

  useLayoutEffect(() => {
    if (phase === "running") {
      // New round started — reset chart data
      pointsRef.current = [{ time: 0, multiplier: 1 }];
      lastPointTimeRef.current = 0;
      crashAnimDone.current = false;
      crashCompletionFired.current = false;
      goStartRef.current = performance.now();
    } else if (phase === "crashed") {
      crashStartRef.current = performance.now();
      crashAnimDone.current = false;
      crashCompletionFired.current = false;
    }
  }, [phase]);

  // Track cashout animation timing
  useLayoutEffect(() => {
    if (cashedOut && cashoutMultiplier !== null) {
      cashoutStartRef.current = performance.now();
    } else {
      cashoutStartRef.current = 0;
    }
  }, [cashedOut, cashoutMultiplier]);

  // Note: chart points are now recorded in the rAF draw loop (below)
  // instead of the render body, for React 19 concurrent-mode safety.

  // -----------------------------------------------------------------------
  // Derive animation states from timing refs (no useState)
  // -----------------------------------------------------------------------

  const now = performance.now();

  const goElapsed = now - goStartRef.current;
  const showGo = phase === "running" && goStartRef.current > 0 && goElapsed < GO_DURATION;

  const crashElapsed = now - crashStartRef.current;
  const crashFlash =
    phase === "crashed" &&
    !reducedMotion &&
    crashStartRef.current > 0 &&
    crashElapsed < CRASH_FLASH_DURATION;
  const crashShake =
    phase === "crashed" &&
    !reducedMotion &&
    crashStartRef.current > 0 &&
    crashElapsed >= CRASH_SHAKE_START &&
    crashElapsed < CRASH_SHAKE_END;

  const cashoutElapsed = now - cashoutStartRef.current;
  const cashoutAnim =
    cashedOut &&
    cashoutMultiplier !== null &&
    cashoutStartRef.current > 0 &&
    cashoutElapsed < CASHOUT_FLOAT_DURATION;

  // -----------------------------------------------------------------------
  // Render loop — stable rAF that reads from refs, not closure state
  // -----------------------------------------------------------------------

  useEffect(() => {
    let active = true;

    const draw = () => {
      if (!active) return;

      const renderer = rendererRef.current;
      if (renderer) {
        const currentPhase = phaseRef.current;
        const currentMult = multiplierRef.current;

        // Record chart points during running phase (done here in rAF
        // instead of React render body for concurrent-mode reliability)
        if (currentPhase === "running" && currentMult > 1) {
          const time = getTimeForMultiplier(currentMult);
          const timeSinceLastPoint = time - lastPointTimeRef.current;
          if (timeSinceLastPoint >= POINT_INTERVAL / 1000) {
            pointsRef.current.push({ time, multiplier: currentMult });
            lastPointTimeRef.current = time;
          }
        }

        const points = pointsRef.current;
        const bounds = renderer.getChartBounds(points);

        renderer.clear();
        renderer.drawGrid(bounds.maxMultiplier);

        if (currentPhase === "running" && points.length >= 2) {
          const color = getMultiplierColor(currentMult);
          renderer.drawLine(points, color);
        } else if (currentPhase === "crashed" && points.length >= 2) {
          if (reducedMotion) {
            renderer.drawCrashState(points, 1);
          } else {
            const elapsed = performance.now() - crashStartRef.current;
            const progress = Math.min(elapsed / CRASH_DURATION, 1);
            renderer.drawCrashState(points, progress);
          }
        }
      }

      // Fire crash completion callback once
      if (
        phaseRef.current === "crashed" &&
        !crashCompletionFired.current &&
        crashStartRef.current > 0
      ) {
        const elapsed = performance.now() - crashStartRef.current;
        if (elapsed >= CRASH_DURATION) {
          crashCompletionFired.current = true;
          crashAnimDone.current = true;
        }
      }

      // Force React re-render to update HTML overlays during active animations
      const hasActiveAnimation =
        phaseRef.current === "running" ||
        (phaseRef.current === "crashed" && crashStartRef.current > 0 && !crashAnimDone.current) ||
        (cashoutStartRef.current > 0 && performance.now() - cashoutStartRef.current < CASHOUT_FLOAT_DURATION);

      if (hasActiveAnimation) {
        forceRender();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      active = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion, forceRender]);

  // -----------------------------------------------------------------------
  // Derived values
  // -----------------------------------------------------------------------

  const multiplierColor =
    phase === "crashed" ? "#EF4444" : getMultiplierColor(currentMultiplier);

  const formattedMultiplier = formatCrashMultiplier(currentMultiplier);

  const cashoutProfit =
    cashedOut && cashoutMultiplier !== null
      ? `+${cashoutMultiplier.toFixed(2)}x`
      : null;

  // Suppress unused variable warnings (props available for future annotations)
  void _crashPoint;
  void _elapsedTime;

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div
      ref={containerRef}
      className="relative w-full border border-pb-border rounded-xl overflow-hidden"
      style={{
        aspectRatio: "16 / 10",
        maxHeight: "50vh",
        background: "#0B0F1A",
      }}
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Crash game chart showing multiplier curve"
        className="absolute inset-0 w-full h-full"
      >
        Your browser does not support the canvas element. Please use a modern browser to play Crash.
      </canvas>

      {/* Red flash overlay */}
      {crashFlash && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
        />
      )}

      {/* --- HTML Overlays --- */}

      {/* Betting phase: countdown */}
      {phase === "betting" && !showGo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className="font-mono-stats text-5xl md:text-6xl font-bold text-pb-text-secondary select-none"
            style={{ textShadow: "0 0 20px rgba(156, 163, 175, 0.3)" }}
          >
            {countdown > 0 ? `Starting in ${countdown}...` : ""}
          </span>
        </div>
      )}

      {/* "GO!" flash */}
      {showGo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className="font-mono-stats text-5xl md:text-6xl font-bold select-none"
            style={{
              color: "#00E5A0",
              textShadow: "0 0 30px rgba(0, 229, 160, 0.5)",
            }}
          >
            GO!
          </span>
        </div>
      )}

      {/* Running phase: live multiplier */}
      {phase === "running" && !showGo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className="font-mono-stats text-5xl md:text-7xl font-bold select-none transition-colors duration-150"
            style={{
              color: multiplierColor,
              textShadow: `0 0 20px ${multiplierColor}40`,
            }}
          >
            {formattedMultiplier}
          </span>
        </div>
      )}

      {/* Crashed phase: crash display */}
      {phase === "crashed" && (
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none ${
            crashShake && !reducedMotion ? "crash-shake" : ""
          }`}
        >
          <span
            className="font-mono-stats text-5xl md:text-7xl font-bold select-none"
            style={{
              color: "#EF4444",
              textShadow: "0 0 20px rgba(239, 68, 68, 0.4)",
            }}
          >
            {formattedMultiplier}
          </span>
          <span
            className="font-mono-stats text-xl md:text-2xl font-bold uppercase mt-2 select-none"
            style={{ color: "#EF4444" }}
          >
            CRASHED
          </span>
        </div>
      )}

      {/* Cash-out marker */}
      {cashoutAnim && cashoutProfit && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ marginTop: "-80px" }}
        >
          <span
            className="font-mono-stats text-2xl md:text-3xl font-bold select-none cashout-float"
            style={{
              color: "#00E5A0",
              textShadow: "0 0 16px rgba(0, 229, 160, 0.5)",
            }}
          >
            {cashoutProfit}
          </span>
        </div>
      )}

    </div>
  );
}
