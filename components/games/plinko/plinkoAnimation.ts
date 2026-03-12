import type { PlinkoRows, RiskLevel } from "@/lib/types";
import type {
  PlinkoBallPath,
  PlinkoBetResult,
  PegPosition,
  BallAnimationState,
} from "./plinkoTypes";
import {
  getPegPositions,
  getBallXAtRow,
  getBallSlotX,
  getSlotPositions,
} from "./plinkoEngine";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AnimatorOptions {
  rows: PlinkoRows;
  risk: RiskLevel;
  slotHeight: number;
  onPegHit?: (row: number, col: number) => void;
  onBallLand?: (slotIndex: number) => void;
}

interface PegState {
  peg: PegPosition;
  /** 0 = idle, >0 = remaining flash time (ms) */
  flashTime: number;
  /** current display scale (1 = normal, up to 1.2 during pulse) */
  scale: number;
  /** total flash duration used for fade-back lerp */
  flashTotal: number;
}

interface InternalBall {
  state: BallAnimationState;
  onComplete: () => void;
  /** Elapsed time in ms since drop start */
  elapsed: number;
  /** Total animation duration in ms */
  duration: number;
  /** Row timestamps: the elapsed-time at which the ball reaches each row */
  rowTimestamps: number[];
  /** Index of last peg-hit callback fired (-1 = none) */
  lastHitRow: number;
  /** Slot landing phase elapsed (ms), -1 = not started */
  slotBounceElapsed: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_PEG_RADIUS = 4;
const PEG_COLOR = "#374151";
const PEG_FLASH_COLOR = "#00E5A0";

// Pre-parsed RGB for hot-path color interpolation (avoids parseInt in 60fps loop)
const PEG_COLOR_RGB = { r: 0x37, g: 0x41, b: 0x51 };
const PEG_FLASH_COLOR_RGB = { r: 0x00, g: 0xe5, b: 0xa0 };
const PEG_FLASH_DURATION = 150; // ms active flash
const PEG_FADE_DURATION = 200; // ms fade-back after flash

const BASE_BALL_RADIUS = 6;
const BALL_COLOR = "#00E5A0";
const BALL_GLOW_COLOR = "rgba(0,229,160,0.4)";
const BALL_CENTER_COLOR = "#66FFD0";
const TRAIL_OPACITIES = [0.4, 0.2, 0.1] as const;
const TRAIL_LENGTH = 3;

const BOUNCE_DURATION = 50; // ms for peg bounce squash
const SLOT_BOUNCE_DURATION = 300; // ms for landing bounces
const PEG_PULSE_SCALE = 1.2;
const PEG_PULSE_DURATION = 100; // ms

const MAX_CONCURRENT_BALLS = 50;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Quadratic ease-in: starts slow, accelerates. */
function easeInQuad(t: number): number {
  return t * t;
}

/** Quadratic ease-out for bouncing. */
function easeOutQuad(t: number): number {
  return t * (2 - t);
}

/** Damped bounce: 2 small bounces with decreasing amplitude. */
function dampedBounce(t: number): number {
  // Two bounces in [0..1]: sin curve with decay
  const bounces = 2;
  const decay = 1 - t;
  return Math.abs(Math.sin(t * Math.PI * bounces)) * decay * 0.15;
}

/** Lerp between two values. */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Clamp value between min and max. */
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** Animation duration in ms for given row count. Scales 1500 (8 rows) to 3500 (16 rows). */
function getDuration(rows: PlinkoRows): number {
  return 1500 + ((rows - 8) / 8) * 2000;
}

/** Build timestamps for when the ball reaches each row (quadratic ease). */
function buildRowTimestamps(rows: PlinkoRows, duration: number): number[] {
  const stamps: number[] = [];
  for (let r = 0; r <= rows; r++) {
    // Use quadratic ease-in: ball accelerates as it falls
    const linearT = r / rows;
    // Allocate first 85% of duration to row traversal, last 15% to slot bounce
    const rowDuration = duration * 0.85;
    stamps.push(easeInQuad(linearT) * rowDuration);
  }
  return stamps;
}

// ---------------------------------------------------------------------------
// PlinkoAnimator
// ---------------------------------------------------------------------------

export class PlinkoAnimator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: AnimatorOptions;

  private rows: PlinkoRows;
  private risk: RiskLevel;
  private width = 0;
  private height = 0;

  private pegStates: PegState[] = [];
  private balls: InternalBall[] = [];
  private rafId: number | null = null;
  private lastTime = 0;
  private reducedMotion = false;
  private destroyed = false;
  private dpr = 1;
  private pegRadius = BASE_PEG_RADIUS;
  private ballRadius = BASE_BALL_RADIUS;

  constructor(canvas: HTMLCanvasElement, options: AnimatorOptions) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("PlinkoAnimator: unable to get 2d context");
    }
    this.ctx = ctx;
    this.options = options;
    this.rows = options.rows;
    this.risk = options.risk;
    this.width = canvas.width;
    this.height = canvas.height;
    this.dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    this.pegRadius = BASE_PEG_RADIUS * this.dpr;
    this.ballRadius = BASE_BALL_RADIUS * this.dpr;

    this.rebuildPegs();
    this.render();
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  setConfig(rows: PlinkoRows, risk: RiskLevel): void {
    this.rows = rows;
    this.risk = risk;
    this.options.rows = rows;
    this.options.risk = risk;
    this.rebuildPegs();
    this.render();
  }

  dropBall(
    path: PlinkoBallPath,
    result: PlinkoBetResult,
    onComplete: () => void
  ): void {
    if (this.destroyed) return;

    // Enforce max concurrent balls — resolve immediately so cleanup still happens
    if (this.balls.length >= MAX_CONCURRENT_BALLS) {
      onComplete();
      return;
    }

    const duration = getDuration(this.rows);
    const rowTimestamps = buildRowTimestamps(this.rows, duration);

    // Starting x: center of the board (ball enters above first row)
    const startX = this.width / 2;
    const startY = 0;

    const ball: InternalBall = {
      state: {
        id: `ball-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        path,
        currentRow: -1,
        x: startX,
        y: startY,
        targetX: startX,
        targetY: startY,
        progress: 0,
        scaleX: 1,
        scaleY: 1,
        trail: [],
        done: false,
        slotBounce: 0,
        result,
      },
      onComplete,
      elapsed: 0,
      duration,
      rowTimestamps,
      lastHitRow: -1,
      slotBounceElapsed: -1,
    };

    if (this.reducedMotion || document.hidden) {
      // Skip animation — place ball at final slot immediately
      const finalX = getBallSlotX(path.slotIndex, this.rows, this.width);
      const usableHeight = this.height - this.options.slotHeight;
      ball.state.x = finalX;
      ball.state.y = usableHeight;
      ball.state.done = true;
      this.options.onBallLand?.(path.slotIndex);
      onComplete();
      return;
    }

    this.balls.push(ball);
    this.startLoop(); // restart rAF if paused
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    this.pegRadius = BASE_PEG_RADIUS * this.dpr;
    this.ballRadius = BASE_BALL_RADIUS * this.dpr;
    this.rebuildPegs();
    this.render();
  }

  setReducedMotion(reduced: boolean): void {
    this.reducedMotion = reduced;
  }

  /** Instantly complete all active ball animations (background tab support). */
  fastForwardAll(): void {
    const completedBalls = [...this.balls];
    this.balls = [];

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    for (const ball of completedBalls) {
      if (ball.slotBounceElapsed < 0) {
        this.options.onBallLand?.(ball.state.path.slotIndex);
      }
      ball.onComplete();
    }

    this.render();
  }

  destroy(): void {
    this.destroyed = true;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.balls = [];
    this.pegStates = [];
  }

  // -----------------------------------------------------------------------
  // Internals
  // -----------------------------------------------------------------------

  private rebuildPegs(): void {
    const pegs = getPegPositions(
      this.rows,
      this.width,
      this.height,
      this.options.slotHeight
    );
    this.pegStates = pegs.map((peg) => ({
      peg,
      flashTime: 0,
      scale: 1,
      flashTotal: 0,
    }));
  }

  private startLoop(): void {
    if (this.rafId !== null) return; // already running
    this.lastTime = performance.now();
    const loop = (now: number) => {
      if (this.destroyed) return;
      const dt = Math.min(now - this.lastTime, 50); // cap delta to avoid spiral
      this.lastTime = now;

      this.update(dt);
      this.render();

      // Pause loop when idle (no balls, no flashing pegs)
      const hasFlashing = this.pegStates.some((ps) => ps.flashTime > 0);
      if (this.balls.length === 0 && !hasFlashing) {
        this.rafId = null;
        return;
      }

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  private update(dt: number): void {
    // Update peg states (flash/fade timers)
    for (const ps of this.pegStates) {
      if (ps.flashTime > 0) {
        ps.flashTime = Math.max(0, ps.flashTime - dt);
        // Scale pulse: ramp up then back down over PEG_PULSE_DURATION
        const pulseElapsed = ps.flashTotal - ps.flashTime;
        if (pulseElapsed < PEG_PULSE_DURATION) {
          const t = pulseElapsed / PEG_PULSE_DURATION;
          ps.scale = lerp(1, PEG_PULSE_SCALE, easeOutQuad(t));
        } else {
          ps.scale = lerp(PEG_PULSE_SCALE, 1, clamp((pulseElapsed - PEG_PULSE_DURATION) / PEG_PULSE_DURATION, 0, 1));
        }
      } else {
        ps.scale = 1;
      }
    }

    // Update balls
    const completed: InternalBall[] = [];

    for (const ball of this.balls) {
      ball.elapsed += dt;

      const rowDuration = ball.duration * 0.85;
      const { rowTimestamps } = ball;
      const usableHeight = this.height - this.options.slotHeight;
      const pegs = this.pegStates;

      // Determine current row based on elapsed time
      let currentRow = -1;
      for (let r = 0; r < rowTimestamps.length - 1; r++) {
        if (ball.elapsed >= rowTimestamps[r] && ball.elapsed < rowTimestamps[r + 1]) {
          currentRow = r;
          break;
        }
      }
      if (ball.elapsed >= rowTimestamps[rowTimestamps.length - 1]) {
        currentRow = this.rows; // past last row
      }

      // Fire peg-hit callbacks and trigger flashes
      if (currentRow > ball.lastHitRow && currentRow < this.rows) {
        for (let r = ball.lastHitRow + 1; r <= currentRow; r++) {
          if (r >= 0 && r < this.rows) {
            this.options.onPegHit?.(r, 0);
            this.triggerPegFlash(r, ball.state.path.directions, r);
          }
        }
        ball.lastHitRow = currentRow;
      }

      // Calculate ball position
      if (ball.elapsed < rowDuration) {
        // Traversing rows
        if (currentRow >= 0 && currentRow < this.rows) {
          const segStart = rowTimestamps[currentRow];
          const segEnd = rowTimestamps[currentRow + 1];
          const segProgress = clamp((ball.elapsed - segStart) / (segEnd - segStart), 0, 1);

          // X: lerp between current row position and next row position
          const fromX = currentRow === 0
            ? this.width / 2
            : getBallXAtRow(ball.state.path.directions, currentRow, this.rows, this.width);
          const toX = getBallXAtRow(ball.state.path.directions, currentRow + 1, this.rows, this.width);
          ball.state.x = lerp(fromX, toX, segProgress);

          // Y: lerp between peg rows
          const fromY = this.getPegY(currentRow);
          const toY = currentRow + 1 < this.rows
            ? this.getPegY(currentRow + 1)
            : usableHeight;
          ball.state.y = lerp(fromY, toY, easeInQuad(segProgress));

          // Bounce squash/stretch near midpoint of segment
          const bounceMid = 0.5;
          const bounceHalf = BOUNCE_DURATION / (segEnd - segStart) / 2;
          if (Math.abs(segProgress - bounceMid) < bounceHalf) {
            const bounceT = (segProgress - (bounceMid - bounceHalf)) / (bounceHalf * 2);
            const squash = Math.sin(bounceT * Math.PI);
            ball.state.scaleY = lerp(1, 0.85, squash);
            ball.state.scaleX = lerp(1, 1.15, squash);
          } else {
            ball.state.scaleX = 1;
            ball.state.scaleY = 1;
          }
        } else if (currentRow === -1) {
          // Before first row: ball falling from top
          const segEnd = rowTimestamps[0];
          const segProgress = segEnd > 0 ? clamp(ball.elapsed / segEnd, 0, 1) : 1;
          ball.state.x = this.width / 2;
          ball.state.y = lerp(0, this.getPegY(0), easeInQuad(segProgress));
          ball.state.scaleX = 1;
          ball.state.scaleY = 1;
        }

        ball.state.currentRow = currentRow;
      } else if (ball.elapsed < ball.duration) {
        // Slot bounce phase
        if (ball.slotBounceElapsed < 0) {
          ball.slotBounceElapsed = 0;
          // Fire peg hit for last row if not yet done
          if (ball.lastHitRow < this.rows - 1) {
            for (let r = ball.lastHitRow + 1; r < this.rows; r++) {
              this.options.onPegHit?.(r, 0);
              this.triggerPegFlash(r, ball.state.path.directions, r);
            }
            ball.lastHitRow = this.rows - 1;
          }
          this.options.onBallLand?.(ball.state.path.slotIndex);
        }

        ball.slotBounceElapsed += dt;
        const bounceT = clamp(ball.slotBounceElapsed / SLOT_BOUNCE_DURATION, 0, 1);

        const finalX = getBallSlotX(ball.state.path.slotIndex, this.rows, this.width);
        ball.state.x = finalX;

        const baseY = usableHeight;
        const bounceOffset = dampedBounce(bounceT) * (usableHeight * 0.06);
        ball.state.y = baseY - bounceOffset;
        ball.state.slotBounce = bounceT;
        ball.state.scaleX = 1;
        ball.state.scaleY = 1;
        ball.state.currentRow = this.rows;
      } else {
        // Animation complete
        ball.state.done = true;
        const finalX = getBallSlotX(ball.state.path.slotIndex, this.rows, this.width);
        ball.state.x = finalX;
        ball.state.y = usableHeight;
        ball.state.scaleX = 1;
        ball.state.scaleY = 1;
        completed.push(ball);
      }

      // Update trail
      ball.state.trail.unshift({ x: ball.state.x, y: ball.state.y });
      if (ball.state.trail.length > TRAIL_LENGTH + 1) {
        ball.state.trail.length = TRAIL_LENGTH + 1;
      }
    }

    // Remove completed balls and fire callbacks
    for (const ball of completed) {
      const idx = this.balls.indexOf(ball);
      if (idx !== -1) {
        this.balls.splice(idx, 1);
      }
      ball.onComplete();
    }
  }

  /** Trigger flash on the peg the ball hit + faint neighbor glow. */
  private triggerPegFlash(
    row: number,
    directions: number[],
    directionRow: number
  ): void {
    const rightBounces = directions.slice(0, directionRow + 1).reduce((s, d) => s + d, 0);
    const pegIndex = 1 + rightBounces;

    // Find the peg state for this row and column
    for (const ps of this.pegStates) {
      if (ps.peg.row === row && ps.peg.col === pegIndex) {
        ps.flashTime = PEG_FLASH_DURATION + PEG_FADE_DURATION;
        ps.flashTotal = PEG_FLASH_DURATION + PEG_FADE_DURATION;
      }
    }

    // Neighbor glow: 50ms delayed (we approximate by giving them a shorter total)
    const neighborDelay = 50;
    const neighborFlash = PEG_FLASH_DURATION * 0.4 + PEG_FADE_DURATION;
    for (const ps of this.pegStates) {
      if (ps.peg.row === row && Math.abs(ps.peg.col - pegIndex) === 1) {
        if (ps.flashTime <= 0) {
          ps.flashTime = neighborFlash - neighborDelay;
          ps.flashTotal = neighborFlash - neighborDelay;
        }
      }
    }
  }

  /** Get the Y position for a given peg row. */
  private getPegY(row: number): number {
    // Find first peg in this row
    for (const ps of this.pegStates) {
      if (ps.peg.row === row) return ps.peg.y;
    }
    // Fallback: estimate
    const usableHeight = this.height - this.options.slotHeight;
    const topPadding = usableHeight * 0.06;
    const bottomPadding = usableHeight * 0.04;
    const availableHeight = usableHeight - topPadding - bottomPadding;
    const rowSpacing = availableHeight / this.rows;
    return topPadding + rowSpacing * (row + 0.5);
  }

  // -----------------------------------------------------------------------
  // Rendering
  // -----------------------------------------------------------------------

  private render(): void {
    const { ctx, width, height } = this;

    // Canvas dimensions are already DPR-scaled (set by PlinkoBoard).
    // Peg/ball positions are computed in these DPR-scaled coordinates.
    // No additional ctx.scale needed.
    ctx.clearRect(0, 0, width, height);

    this.drawPegs();
    this.drawBalls();
  }

  private drawPegs(): void {
    const { ctx } = this;

    for (const ps of this.pegStates) {
      const { peg, flashTime, scale, flashTotal } = ps;
      const radius = this.pegRadius * scale;

      // Determine color: flash -> fade-back -> idle
      let color: string;
      if (flashTime > PEG_FADE_DURATION) {
        // Active flash
        color = PEG_FLASH_COLOR;
      } else if (flashTime > 0) {
        // Fade back
        const fadeProgress = 1 - flashTime / PEG_FADE_DURATION;
        color = this.lerpPegColor(fadeProgress);
      } else {
        color = PEG_COLOR;
      }

      ctx.beginPath();
      ctx.arc(peg.x, peg.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }

  private drawBalls(): void {
    const { ctx } = this;

    for (const ball of this.balls) {
      const { state } = ball;

      // Draw trail
      for (let i = 1; i < state.trail.length && i <= TRAIL_LENGTH; i++) {
        const trailPos = state.trail[i];
        const opacity = TRAIL_OPACITIES[i - 1];
        const trailRadius = this.ballRadius * (1 - i * 0.15);

        ctx.beginPath();
        ctx.arc(trailPos.x, trailPos.y, trailRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,229,160,${opacity})`;
        ctx.fill();
      }

      // Draw ball with glow
      ctx.save();
      ctx.translate(state.x, state.y);
      ctx.scale(state.scaleX, state.scaleY);

      // Glow shadow
      ctx.shadowColor = BALL_GLOW_COLOR;
      ctx.shadowBlur = 8 * this.dpr;

      // Radial gradient fill
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.ballRadius);
      gradient.addColorStop(0, BALL_CENTER_COLOR);
      gradient.addColorStop(1, BALL_COLOR);

      ctx.beginPath();
      ctx.arc(0, 0, this.ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }

  /** Linearly interpolate between pre-parsed peg colors. */
  private lerpPegColor(t: number): string {
    const f = PEG_FLASH_COLOR_RGB;
    const tc = PEG_COLOR_RGB;
    const r = Math.round(lerp(f.r, tc.r, t));
    const g = Math.round(lerp(f.g, tc.g, t));
    const b = Math.round(lerp(f.b, tc.b, t));
    return `rgb(${r},${g},${b})`;
  }
}
