/**
 * Canvas-based wheel renderer for the Deal Wheel.
 *
 * This class handles all 2D canvas drawing: outer ring, light dots,
 * segments, segment text, and center hub. It does NOT run its own
 * animation loop — the React wrapper calls draw methods each frame via rAF.
 */

import type { WheelSegment, DealWheelPhase } from "./dealWheelTypes";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DealWheelConfig {
  width: number;
  height: number;
  dpr: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BG_COLOR = "#0B0F1A";
const RIM_WIDTH = 16;
const DOT_COUNT = 32;
const CENTER_RATIO = 0.22;
const TEXT_NAME_RADIUS_RATIO = 0.6;
const TEXT_DEAL_RADIUS_RATIO = 0.42;

const GOLD_LIGHT = "#F59E0B";
const GOLD_DIM = "rgba(245, 158, 11, 0.3)";
const ACCENT = "#00E5A0";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function darkenHex(hex: string, amount: number): string {
  const r = Math.max(0, Math.round(parseInt(hex.slice(1, 3), 16) * (1 - amount)));
  const g = Math.max(0, Math.round(parseInt(hex.slice(3, 5), 16) * (1 - amount)));
  const b = Math.max(0, Math.round(parseInt(hex.slice(5, 7), 16) * (1 - amount)));
  return `rgb(${r}, ${g}, ${b})`;
}

function lightenHex(hex: string, amount: number): string {
  const r = Math.min(255, Math.round(parseInt(hex.slice(1, 3), 16) * (1 + amount)));
  const g = Math.min(255, Math.round(parseInt(hex.slice(3, 5), 16) * (1 + amount)));
  const b = Math.min(255, Math.round(parseInt(hex.slice(5, 7), 16) * (1 + amount)));
  return `rgb(${r}, ${g}, ${b})`;
}

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

export class DealWheelRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: DealWheelConfig;
  private rimCache: OffscreenCanvas | null = null;
  private rimCacheSize: number = 0;

  constructor(canvas: HTMLCanvasElement, config: DealWheelConfig) {
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
    this.rimCache = null;
    this.applyDpr();
  }

  drawWheel(
    segments: WheelSegment[],
    currentAngle: number,
    phase: DealWheelPhase,
    frameTime: number
  ): void {
    const { ctx, config } = this;
    const { width, height } = config;
    const cx = width / 2;
    const cy = height / 2;
    const outerRadius = Math.min(cx, cy) - 4;
    const innerRadius = outerRadius - RIM_WIDTH;
    const segmentCount = segments.length;
    const segmentArc = (2 * Math.PI) / segmentCount;

    // 1. Clear
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, width * config.dpr, height * config.dpr);
    ctx.restore();

    // Ambient radial glow
    const glowAlpha = phase === "spinning" ? 0.08 : 0.04;
    const ambientGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, outerRadius * 1.2);
    ambientGlow.addColorStop(0, `rgba(0, 229, 160, ${glowAlpha})`);
    ambientGlow.addColorStop(1, "transparent");
    ctx.fillStyle = ambientGlow;
    ctx.fillRect(0, 0, width, height);

    // Wheel drop shadow
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.01)";
    ctx.fill();
    ctx.restore();

    // 2. Outer ring — cached metallic rim
    const rimOC = this.getRimCache(cx, cy, outerRadius, innerRadius);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(rimOC, 0, 0);
    ctx.restore();

    // 3. Light dots on rim (animated, not cached)
    const dotRingRadius = (outerRadius + innerRadius) / 2;
    const dotRadius = Math.max(2.5, outerRadius * 0.012);

    for (let i = 0; i < DOT_COUNT; i++) {
      const dotAngle = (i / DOT_COUNT) * Math.PI * 2 - Math.PI / 2;
      const dx = cx + Math.cos(dotAngle) * dotRingRadius;
      const dy = cy + Math.sin(dotAngle) * dotRingRadius;

      let dotColor: string;
      let dotGlow = false;

      if (phase === "spinning") {
        // Smooth chase with trail falloff
        const chasePos = (frameTime / 40) % DOT_COUNT;
        const dist = Math.min(
          Math.abs(i - chasePos),
          DOT_COUNT - Math.abs(i - chasePos)
        );
        if (dist < 1) {
          dotColor = "#FFFACD";
          dotGlow = true;
        } else if (dist < 2) {
          dotColor = GOLD_LIGHT;
          dotGlow = true;
        } else if (dist < 3) {
          dotColor = hexToRgba(GOLD_LIGHT, 0.6);
        } else {
          dotColor = GOLD_DIM;
        }
      } else if (phase === "revealing") {
        // Sequential pulse wave
        const wavePos = (frameTime / 100) % DOT_COUNT;
        const dist = Math.min(
          Math.abs(i - wavePos),
          DOT_COUNT - Math.abs(i - wavePos)
        );
        const alpha = dist < 3 ? 1.0 - dist * 0.25 : 0.3;
        dotColor = hexToRgba(GOLD_LIGHT, alpha);
        dotGlow = dist < 2;
      } else {
        // Idle: slow wave animation
        const wave = 0.3 + 0.4 * Math.sin(frameTime / 1000 + (i / DOT_COUNT) * Math.PI * 2);
        dotColor = hexToRgba(GOLD_LIGHT, wave);
      }

      ctx.beginPath();
      ctx.arc(dx, dy, dotRadius, 0, Math.PI * 2);

      if (dotGlow) {
        ctx.save();
        ctx.shadowColor = GOLD_LIGHT;
        ctx.shadowBlur = 8;
        ctx.fillStyle = dotColor;
        ctx.fill();
        ctx.restore();
      } else {
        ctx.fillStyle = dotColor;
        ctx.fill();
      }
    }

    // 4. Segments — draw rotated
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(currentAngle);

    for (let i = 0; i < segmentCount; i++) {
      const startAngle = i * segmentArc;
      const endAngle = startAngle + segmentArc;
      const segment = segments[i];

      // Pie slice path
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, innerRadius - 1, startAngle, endAngle);
      ctx.closePath();

      // Radial gradient fill: lighter center -> base -> darker edge
      const segGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, innerRadius);
      segGrad.addColorStop(0, lightenHex(segment.color, 0.15));
      segGrad.addColorStop(0.5, segment.color);
      segGrad.addColorStop(1, darkenHex(segment.color, 0.3));
      ctx.fillStyle = segGrad;
      ctx.fill();

      // Glossy highlight: top half of segment
      ctx.save();
      ctx.clip();
      const midAngle = startAngle + segmentArc / 2;
      const glossX = Math.cos(midAngle) * innerRadius * 0.5;
      const glossY = Math.sin(midAngle) * innerRadius * 0.5;
      const glossGrad = ctx.createRadialGradient(glossX, glossY, 0, glossX, glossY, innerRadius * 0.6);
      glossGrad.addColorStop(0, "rgba(255, 255, 255, 0.12)");
      glossGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glossGrad;
      ctx.fill();
      ctx.restore();

      // Re-draw path for bevel borders (after clip was released)
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, innerRadius - 1, startAngle, endAngle);
      ctx.closePath();

      // Bevel borders
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Dark divider line between segments
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const edgeX = Math.cos(startAngle) * (innerRadius - 1);
      const edgeY = Math.sin(startAngle) * (innerRadius - 1);
      ctx.lineTo(edgeX, edgeY);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // 5. Segment text
    for (let i = 0; i < segmentCount; i++) {
      const midAngle = i * segmentArc + segmentArc / 2;
      const nameRadius = innerRadius * TEXT_NAME_RADIUS_RATIO;
      const dealRadius = innerRadius * TEXT_DEAL_RADIUS_RATIO;

      ctx.save();
      ctx.rotate(midAngle);

      // Casino name (bold, white with outline)
      const nameSize = Math.max(11, innerRadius * 0.075);
      ctx.font = `bold ${nameSize}px "Outfit", system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.save();
      ctx.translate(nameRadius, 0);
      ctx.rotate(Math.PI / 2);

      // Shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
      ctx.shadowBlur = 4;
      // Stroke outline
      ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
      ctx.lineWidth = 2.5;
      ctx.lineJoin = "round";
      ctx.strokeText(segments[i].label, 0, 0);
      // Fill white
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(segments[i].label, 0, 0);

      ctx.restore();

      // Deal title (smaller, with subtle outline)
      const dealSize = Math.max(9, innerRadius * 0.058);
      ctx.font = `${dealSize}px "Outfit", system-ui, sans-serif`;

      ctx.save();
      ctx.translate(dealRadius, 0);
      ctx.rotate(Math.PI / 2);

      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 3;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.strokeText(segments[i].dealTitle, 0, 0);
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fillText(segments[i].dealTitle, 0, 0);

      ctx.restore();

      ctx.restore();
    }

    // 5b. Segment emojis
    for (let i = 0; i < segmentCount; i++) {
      const midAngle = i * segmentArc + segmentArc / 2;
      const emojiRadius = innerRadius * 0.78;
      const emojiSize = Math.max(14, innerRadius * 0.09);

      ctx.save();
      ctx.rotate(midAngle);
      ctx.translate(emojiRadius, 0);
      ctx.rotate(Math.PI / 2);

      ctx.font = `${emojiSize}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.fillText(segments[i].emoji, 0, 0);

      ctx.restore();
    }

    ctx.restore(); // un-rotate

    // 6. Center hub
    const hubRadius = innerRadius * CENTER_RATIO;

    // Glow ring
    const glowPulse = phase === "idle"
      ? 0.15 + 0.1 * Math.sin(frameTime / 800)
      : phase === "spinning"
        ? 0.2 + 0.15 * Math.sin(frameTime / 200)
        : 0.25;

    ctx.save();
    ctx.shadowColor = ACCENT;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, hubRadius + 4, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(ACCENT, glowPulse);
    ctx.fill();
    ctx.restore();

    // Hub gradient fill (3D effect with offset highlight)
    const hubGrad = ctx.createRadialGradient(
      cx - hubRadius * 0.2, cy - hubRadius * 0.2, 0,
      cx, cy, hubRadius
    );
    hubGrad.addColorStop(0, "#1E293B");
    hubGrad.addColorStop(0.6, "#111827");
    hubGrad.addColorStop(1, "#0B0F1A");

    ctx.beginPath();
    ctx.arc(cx, cy, hubRadius, 0, Math.PI * 2);
    ctx.fillStyle = hubGrad;
    ctx.fill();

    // Hub accent border with glow
    ctx.save();
    ctx.shadowColor = ACCENT;
    ctx.shadowBlur = 8;
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Inner ring detail
    ctx.beginPath();
    ctx.arc(cx, cy, hubRadius * 0.7, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(0, 229, 160, 0.2)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Hub text
    const hubText = phase === "spinning" ? "..." : "SPIN";
    ctx.save();
    if (phase === "idle") {
      ctx.shadowColor = ACCENT;
      ctx.shadowBlur = 10;
    }
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `bold ${Math.max(14, hubRadius * 0.45)}px "Outfit", system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(hubText, cx, cy);
    ctx.restore();
  }

  drawHighlight(
    segmentIndex: number,
    segments: WheelSegment[],
    currentAngle: number,
    pulseProgress: number
  ): void {
    const { ctx, config } = this;
    const { width, height } = config;
    const cx = width / 2;
    const cy = height / 2;
    const outerRadius = Math.min(cx, cy) - 4;
    const innerRadius = outerRadius - RIM_WIDTH;
    const segmentCount = segments.length;
    const segmentArc = (2 * Math.PI) / segmentCount;

    const startAngle = currentAngle + segmentIndex * segmentArc;
    const endAngle = startAngle + segmentArc;

    // Pulsing highlight overlay — stronger
    const alpha = 0.15 + 0.25 * Math.sin(pulseProgress * Math.PI * 4);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, innerRadius - 1, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fill();

    // Glowing accent border on winning segment
    ctx.save();
    ctx.shadowColor = ACCENT;
    ctx.shadowBlur = 15;
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  destroy(): void {
    this.rimCache = null;
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

  private getRimCache(cx: number, cy: number, outerRadius: number, innerRadius: number): OffscreenCanvas {
    const size = Math.ceil(Math.max(this.config.width, this.config.height) * this.config.dpr);
    if (this.rimCache && this.rimCacheSize === size) return this.rimCache;

    const oc = new OffscreenCanvas(size, size);
    const octx = oc.getContext("2d");
    if (!octx) {
      this.rimCache = null;
      this.rimCacheSize = 0;
      return oc; // fallback
    }

    octx.setTransform(this.config.dpr, 0, 0, this.config.dpr, 0, 0);

    // Draw rim gradient
    const rimGrad = octx.createRadialGradient(cx, cy, innerRadius - 2, cx, cy, outerRadius + 2);
    rimGrad.addColorStop(0, "#8B6914");
    rimGrad.addColorStop(0.15, "#B8860B");
    rimGrad.addColorStop(0.3, "#DAA520");
    rimGrad.addColorStop(0.45, "#FFD700");
    rimGrad.addColorStop(0.55, "#FFFACD");
    rimGrad.addColorStop(0.7, "#FFD700");
    rimGrad.addColorStop(0.85, "#B8860B");
    rimGrad.addColorStop(1, "#8B6914");

    octx.beginPath();
    octx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
    octx.arc(cx, cy, innerRadius, 0, Math.PI * 2, true);
    octx.fillStyle = rimGrad;
    octx.fill();

    // Inner border ring
    octx.beginPath();
    octx.arc(cx, cy, innerRadius + 1, 0, Math.PI * 2);
    octx.strokeStyle = "rgba(0, 0, 0, 0.4)";
    octx.lineWidth = 1;
    octx.stroke();

    // Outer border ring
    octx.beginPath();
    octx.arc(cx, cy, outerRadius - 1, 0, Math.PI * 2);
    octx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    octx.lineWidth = 1;
    octx.stroke();

    this.rimCache = oc;
    this.rimCacheSize = size;
    return oc;
  }
}
