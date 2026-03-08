/**
 * Canvas-based chart renderer for the Crash game.
 *
 * This class handles all 2D canvas drawing: grid, multiplier line, glow tip,
 * area fill, and crash animation states. It does NOT run its own animation
 * loop — the React wrapper calls draw methods each frame via rAF.
 */

import { getMultiplierColor } from "./crashEngine";
import type { ChartPoint } from "./crashTypes";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CrashChartConfig {
  width: number;
  height: number;
  dpr: number;
  padding: { top: number; right: number; bottom: number; left: number };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BG_COLOR = "#0B0F1A";
const GRID_COLOR = "#1F2937";
const GRID_OPACITY = 0.15;
const LABEL_COLOR = "#6B7280";
const LABEL_FONT = '11px "JetBrains Mono", monospace';
const LINE_WIDTH = 3;
const CRASH_RED = "#EF4444";
const GRADIENT_START = "#00E5A0";
const AREA_OPACITY = 0.05;
const GLOW_BLUR = 10;
const TIP_INNER_RADIUS = 4;
const TIP_OUTER_RADIUS = 12;

/** Logarithmic Y-axis label values */
const LOG_TICKS = [1, 1.5, 2, 3, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Pre-parsed RGB cache for hot-path color operations (avoids parseInt in 60fps loop)
const hexRgbCache = new Map<string, { r: number; g: number; b: number }>();

function parseHex(hex: string): { r: number; g: number; b: number } {
  let cached = hexRgbCache.get(hex);
  if (!cached) {
    cached = {
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16),
    };
    hexRgbCache.set(hex, cached);
  }
  return cached;
}

function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function lerpColor(a: string, b: string, t: number): string {
  const ca = parseHex(a);
  const cb = parseHex(b);
  const r = Math.round(ca.r + (cb.r - ca.r) * t);
  const g = Math.round(ca.g + (cb.g - ca.g) * t);
  const blue = Math.round(ca.b + (cb.b - ca.b) * t);
  return `rgb(${r}, ${g}, ${blue})`;
}

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

export class CrashChartRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: CrashChartConfig;

  // Cached off-screen canvas for grid (avoid redrawing every frame)
  private gridCanvas: OffscreenCanvas | null = null;
  private gridCtx: OffscreenCanvasRenderingContext2D | null = null;
  private cachedGridKey = "";

  constructor(canvas: HTMLCanvasElement, config: CrashChartConfig) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Could not get 2D context");
    this.ctx = ctx;
    this.config = config;
    this.applyDpr();
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  resize(width: number, height: number, dpr: number): void {
    this.config.width = width;
    this.config.height = height;
    this.config.dpr = dpr;
    this.applyDpr();
    // Invalidate cached grid
    this.cachedGridKey = "";
    this.gridCanvas = null;
    this.gridCtx = null;
  }

  clear(): void {
    const { ctx } = this;
    const { width, height, dpr } = this.config;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, width * dpr, height * dpr);
    ctx.restore();
  }

  drawGrid(maxMultiplier: number): void {
    const { dpr, width, height } = this.config;
    const clamped = Math.max(maxMultiplier, 1.5);
    const key = `${width}:${height}:${dpr}:${clamped.toFixed(2)}`;

    if (key === this.cachedGridKey && this.gridCanvas && this.gridCtx) {
      // Blit cached grid
      this.ctx.save();
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.drawImage(this.gridCanvas, 0, 0);
      this.ctx.restore();
      return;
    }

    // Create or resize off-screen canvas
    const pw = width * dpr;
    const ph = height * dpr;
    if (!this.gridCanvas || this.gridCanvas.width !== pw || this.gridCanvas.height !== ph) {
      this.gridCanvas = new OffscreenCanvas(pw, ph);
      this.gridCtx = this.gridCanvas.getContext("2d");
    }
    const gCtx = this.gridCtx;
    if (!gCtx) return;

    gCtx.clearRect(0, 0, pw, ph);
    gCtx.scale(dpr, dpr);

    const { left, right, top, bottom } = this.config.padding;
    const chartW = width - left - right;
    const chartH = height - top - bottom;

    // Horizontal grid lines at logarithmic ticks
    const visibleTicks = LOG_TICKS.filter((t) => t <= clamped);
    // Always include at least 1x
    if (!visibleTicks.includes(1)) visibleTicks.unshift(1);

    gCtx.strokeStyle = hexToRgba(GRID_COLOR, GRID_OPACITY);
    gCtx.lineWidth = 1;
    gCtx.font = LABEL_FONT;
    gCtx.fillStyle = LABEL_COLOR;
    gCtx.textAlign = "right";
    gCtx.textBaseline = "middle";

    const logMax = Math.log(clamped);

    for (const tick of visibleTicks) {
      const ratio = logMax > 0 ? Math.log(tick) / logMax : 0;
      const y = top + chartH - ratio * chartH;

      // Grid line
      gCtx.beginPath();
      gCtx.moveTo(left, y);
      gCtx.lineTo(left + chartW, y);
      gCtx.stroke();

      // Label
      const label = tick >= 1000 ? `${(tick / 1000).toFixed(0)}k` : `${tick}x`;
      gCtx.fillText(label, left - 8, y);
    }

    // Reset transform on off-screen canvas
    gCtx.setTransform(1, 0, 0, 1, 0, 0);

    this.cachedGridKey = key;

    // Blit to main canvas
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.drawImage(this.gridCanvas, 0, 0);
    this.ctx.restore();
  }

  drawLine(points: ChartPoint[], currentColor: string): void {
    if (points.length < 2) return;

    const { ctx } = this;
    const chartArea = this.getChartArea();
    const bounds = this.getChartBounds(points);
    const logMax = Math.log(bounds.maxMultiplier);

    // Map point to pixel coordinates
    const toX = (t: number): number =>
      chartArea.left + (t / bounds.maxTime) * chartArea.width;
    const toY = (m: number): number => {
      if (logMax <= 0) return chartArea.top + chartArea.height;
      const ratio = Math.log(m) / logMax;
      return chartArea.top + chartArea.height - ratio * chartArea.height;
    };

    // Build pixel array
    const pixels: Array<{ x: number; y: number }> = points.map((p) => ({
      x: toX(p.time),
      y: toY(p.multiplier),
    }));

    // --- Area fill (5% opacity gradient) ---
    ctx.save();
    this.drawAreaFill(pixels, currentColor, chartArea.top, chartArea.height);
    ctx.restore();

    // --- Line with glow ---
    ctx.save();
    ctx.shadowColor = currentColor;
    ctx.shadowBlur = GLOW_BLUR;
    ctx.lineWidth = LINE_WIDTH;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // Gradient along the line
    const gradient = ctx.createLinearGradient(
      pixels[0].x,
      pixels[0].y,
      pixels[pixels.length - 1].x,
      pixels[pixels.length - 1].y
    );
    gradient.addColorStop(0, GRADIENT_START);
    gradient.addColorStop(1, currentColor);
    ctx.strokeStyle = gradient;

    this.traceSmoothPath(pixels);
    ctx.stroke();
    ctx.restore();

    // --- Glow tip ---
    const tip = pixels[pixels.length - 1];
    this.drawGlowTip(tip.x, tip.y, currentColor);
  }

  drawGlowTip(x: number, y: number, color: string): void {
    const { ctx } = this;

    // Outer glow
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    const outerGrad = ctx.createRadialGradient(x, y, 0, x, y, TIP_OUTER_RADIUS);
    outerGrad.addColorStop(0, hexToRgba(color, 0.6));
    outerGrad.addColorStop(1, hexToRgba(color, 0));
    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.arc(x, y, TIP_OUTER_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Inner bright dot
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(x, y, TIP_INNER_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Draw the crashed state.
   * @param points - the full line of chart points
   * @param progress - 0..1 representing animation progress over 600ms
   */
  drawCrashState(points: ChartPoint[], progress: number): void {
    if (points.length < 2) return;

    const { ctx } = this;
    const chartArea = this.getChartArea();
    const bounds = this.getChartBounds(points);
    const logMax = Math.log(bounds.maxMultiplier);

    const toX = (t: number): number =>
      chartArea.left + (t / bounds.maxTime) * chartArea.width;
    const toY = (m: number): number => {
      if (logMax <= 0) return chartArea.top + chartArea.height;
      const ratio = Math.log(m) / logMax;
      return chartArea.top + chartArea.height - ratio * chartArea.height;
    };

    const pixels: Array<{ x: number; y: number }> = points.map((p) => ({
      x: toX(p.time),
      y: toY(p.multiplier),
    }));

    // Phase timing (normalized to 0-1):
    // 0 - 0.167 (0-100ms): red flash
    // 0.333 - 0.667 (200-400ms): line fades to red
    // 0.667 - 1.0 (400-600ms): stable red

    // Background flash (0-100ms)
    if (progress < 0.167) {
      const flashAlpha = 0.1 * (1 - progress / 0.167);
      ctx.save();
      ctx.fillStyle = hexToRgba(CRASH_RED, flashAlpha);
      ctx.fillRect(
        this.config.padding.left,
        this.config.padding.top,
        this.config.width - this.config.padding.left - this.config.padding.right,
        this.config.height - this.config.padding.top - this.config.padding.bottom
      );
      ctx.restore();
    }

    // Line color transition (200-400ms -> progress 0.333-0.667)
    let lineColor: string;
    const lastMultiplier = points[points.length - 1].multiplier;
    const originalColor = getMultiplierColor(lastMultiplier);

    if (progress < 0.333) {
      lineColor = originalColor;
    } else if (progress < 0.667) {
      const fadeProgress = (progress - 0.333) / 0.334;
      lineColor = lerpColor(originalColor, CRASH_RED, fadeProgress);
    } else {
      lineColor = CRASH_RED;
    }

    // Draw area fill
    ctx.save();
    this.drawAreaFill(pixels, lineColor, chartArea.top, chartArea.height);
    ctx.restore();

    // Draw line
    ctx.save();
    ctx.shadowColor = lineColor;
    ctx.shadowBlur = GLOW_BLUR;
    ctx.lineWidth = LINE_WIDTH;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = lineColor;
    this.traceSmoothPath(pixels);
    ctx.stroke();
    ctx.restore();

    // Glow tip (fades out during crash)
    const tipAlpha = Math.max(0, 1 - progress * 2);
    if (tipAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = tipAlpha;
      const tip = pixels[pixels.length - 1];
      this.drawGlowTip(tip.x, tip.y, lineColor);
      ctx.restore();
    }
  }

  getChartBounds(points: ChartPoint[]): {
    maxTime: number;
    maxMultiplier: number;
  } {
    if (points.length === 0) {
      return { maxTime: 5, maxMultiplier: 2 };
    }

    const lastPoint = points[points.length - 1];

    // Auto-scale X: keep current point at ~80% of chart width
    // Minimum 5 seconds visible
    const maxTime = Math.max(5, lastPoint.time / 0.8);

    // Auto-scale Y: keep current multiplier with some headroom
    // Minimum 2x visible, add 30% headroom
    const maxMultiplier = Math.max(2, lastPoint.multiplier * 1.3);

    return { maxTime, maxMultiplier };
  }

  destroy(): void {
    this.gridCanvas = null;
    this.gridCtx = null;
    // Clear references
    this.cachedGridKey = "";
  }

  // -----------------------------------------------------------------------
  // Private helpers
  // -----------------------------------------------------------------------

  private applyDpr(): void {
    const { width, height, dpr } = this.config;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private getChartArea(): {
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
  } {
    const { padding, width: cw, height: ch } = this.config;
    return {
      left: padding.left,
      right: padding.right,
      top: padding.top,
      bottom: padding.bottom,
      width: cw - padding.left - padding.right,
      height: ch - padding.top - padding.bottom,
    };
  }

  /**
   * Trace a smooth bezier curve through the given pixel points.
   * Uses quadraticCurveTo with midpoints for natural smoothing.
   */
  private traceSmoothPath(pixels: Array<{ x: number; y: number }>): void {
    const { ctx } = this;
    if (pixels.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(pixels[0].x, pixels[0].y);

    if (pixels.length === 2) {
      ctx.lineTo(pixels[1].x, pixels[1].y);
      return;
    }

    // For the first segment, use quadratic curve to midpoint
    for (let i = 0; i < pixels.length - 1; i++) {
      const curr = pixels[i];
      const next = pixels[i + 1];

      if (i === 0) {
        // First segment: straight to midpoint between 0 and 1
        const midX = (curr.x + next.x) / 2;
        const midY = (curr.y + next.y) / 2;
        ctx.lineTo(midX, midY);
      } else if (i === pixels.length - 2) {
        // Last segment: curve to final point using current as control
        ctx.quadraticCurveTo(curr.x, curr.y, next.x, next.y);
      } else {
        // Middle segments: curve to midpoint of curr-next
        const midX = (curr.x + next.x) / 2;
        const midY = (curr.y + next.y) / 2;
        ctx.quadraticCurveTo(curr.x, curr.y, midX, midY);
      }
    }
  }

  /**
   * Draw area fill below the line with low opacity.
   */
  private drawAreaFill(
    pixels: Array<{ x: number; y: number }>,
    color: string,
    chartTop: number,
    chartHeight: number
  ): void {
    if (pixels.length < 2) return;

    const { ctx } = this;
    const bottomY = chartTop + chartHeight;

    // Create gradient for area
    const areaGradient = ctx.createLinearGradient(0, chartTop, 0, bottomY);
    areaGradient.addColorStop(0, hexToRgba(color, AREA_OPACITY * 3));
    areaGradient.addColorStop(1, hexToRgba(color, 0));

    ctx.fillStyle = areaGradient;

    // Trace the line path
    this.traceSmoothPath(pixels);

    // Close the path along the bottom
    ctx.lineTo(pixels[pixels.length - 1].x, bottomY);
    ctx.lineTo(pixels[0].x, bottomY);
    ctx.closePath();
    ctx.fill();
  }
}
