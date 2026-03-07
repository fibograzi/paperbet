"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import type { PlinkoRows, RiskLevel } from "@/lib/types";
import type { PlinkoBallPath, PlinkoBetResult } from "./plinkoTypes";
import { PlinkoAnimator } from "./plinkoAnimation";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface PlinkoBoardRef {
  dropBall: (path: PlinkoBallPath, result: PlinkoBetResult) => Promise<void>;
}

interface PlinkoBoardProps {
  rows: PlinkoRows;
  risk: RiskLevel;
  slotHeight?: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const PlinkoBoard = forwardRef<PlinkoBoardRef, PlinkoBoardProps>(
  function PlinkoBoard({ rows, risk, slotHeight = 40 }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animatorRef = useRef<PlinkoAnimator | null>(null);

    // Track latest props in refs so the resize callback always sees current values
    const rowsRef = useRef(rows);
    const riskRef = useRef(risk);
    const slotHeightRef = useRef(slotHeight);

    rowsRef.current = rows;
    riskRef.current = risk;
    slotHeightRef.current = slotHeight;

    // -----------------------------------------------------------------------
    // Animator lifecycle
    // -----------------------------------------------------------------------

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dpr = window.devicePixelRatio || 1;
      const container = containerRef.current;
      const rect = container?.getBoundingClientRect();
      const w = rect?.width ?? canvas.clientWidth;
      const h = w * 1.25;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      const animator = new PlinkoAnimator(canvas, {
        rows: rowsRef.current,
        risk: riskRef.current,
        slotHeight: slotHeightRef.current * dpr,
        onPegHit: undefined,
        onBallLand: undefined,
      });

      animatorRef.current = animator;

      return () => {
        animator.destroy();
        animatorRef.current = null;
      };
      // Only mount/unmount once
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // -----------------------------------------------------------------------
    // Resize handling
    // -----------------------------------------------------------------------

    useEffect(() => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;

        // Debounce resize by 200ms per spec
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          const w = entry.contentRect.width;
          const h = w * 1.25;
          const dpr = window.devicePixelRatio || 1;

          canvas.width = w * dpr;
          canvas.height = h * dpr;
          canvas.style.width = `${w}px`;
          canvas.style.height = `${h}px`;

          animatorRef.current?.resize(w * dpr, h * dpr);
        }, 200);
      });

      observer.observe(container);
      return () => observer.disconnect();
    }, []);

    // -----------------------------------------------------------------------
    // Config changes
    // -----------------------------------------------------------------------

    useEffect(() => {
      animatorRef.current?.setConfig(rows, risk);
    }, [rows, risk]);

    // -----------------------------------------------------------------------
    // Reduced motion
    // -----------------------------------------------------------------------

    useEffect(() => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

      const update = () => {
        animatorRef.current?.setReducedMotion(mq.matches);
      };

      update();
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    }, []);

    // -----------------------------------------------------------------------
    // Imperative handle
    // -----------------------------------------------------------------------

    const dropBall = useCallback(
      (path: PlinkoBallPath, result: PlinkoBetResult): Promise<void> => {
        return new Promise<void>((resolve) => {
          animatorRef.current?.dropBall(path, result, resolve);
        });
      },
      []
    );

    useImperativeHandle(ref, () => ({ dropBall }), [dropBall]);

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    return (
      <div
        ref={containerRef}
        className="relative w-full rounded-lg"
        style={{
          border: "1px solid #1F2937",
          background: "transparent",
        }}
      >
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Plinko game board with pegs and dropping balls"
          style={{ display: "block", willChange: "transform" }}
        >
          Your browser does not support the canvas element. Please use a modern browser to play Plinko.
        </canvas>
      </div>
    );
  }
);

PlinkoBoard.displayName = "PlinkoBoard";

export default PlinkoBoard;
