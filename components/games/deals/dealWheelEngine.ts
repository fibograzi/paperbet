/**
 * Deal Wheel engine — pure functions for prize selection, spin physics,
 * and localStorage persistence.
 *
 * Uses crypto.getRandomValues() for fair randomness.
 */

import { CASINOS } from "@/lib/constants";
import type { WheelSegment, SpinResult } from "./dealWheelTypes";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const FREE_SPINS = 1;
export const EMAIL_SPINS = 2;
export const MIN_ROTATIONS = 3;
export const MAX_ROTATIONS = 5;
export const MIN_DURATION = 3500;
export const MAX_DURATION = 5000;
export const REVEAL_DELAY = 600;
export const CONFETTI_DURATION = 3000;
export const SEGMENT_COUNT = 8;

const STORAGE_KEY = "pb_deal_wheel";

// ---------------------------------------------------------------------------
// Weighted probability table
// ---------------------------------------------------------------------------

// Weights per segment index — total = 100
const SEGMENT_WEIGHTS: number[] = [
  10, // 0: Stake (rare)
  14, // 1: Rollbit (common)
  5,  // 2: BC.Game (jackpot)
  18, // 3: Wild.io (medium)
  13, // 4: Spin Again (respin)
  14, // 5: Jackbit (common)
  16, // 6: CoinCasino (medium)
  // Mystery Bonus gets the remainder — not in array, calculated below
];

// ---------------------------------------------------------------------------
// Build segments
// ---------------------------------------------------------------------------

function findCasino(id: string) {
  return CASINOS.find((c) => c.id === id);
}

export function buildSegments(): WheelSegment[] {
  const stake = findCasino("stake");
  const rollbit = findCasino("rollbit");
  const bcgame = findCasino("bcgame");
  const wildio = findCasino("wildio");
  const jackbit = findCasino("jackbit");
  const coincasino = findCasino("coincasino");

  return [
    {
      id: "seg-stake",
      casinoId: "stake",
      label: "Stake",
      dealTitle: "200% up to $2K",
      dealDescription: stake?.offer ?? "200% deposit match up to $2,000",
      color: stake?.color ?? "#1475E1",
      tier: "rare",
      affiliateUrl: stake?.url ?? "https://stake.com",
      icon: "Zap",
      emoji: "\u26A1",
    },
    {
      id: "seg-rollbit",
      casinoId: "rollbit",
      label: "Rollbit",
      dealTitle: "15% Rakeback",
      dealDescription: rollbit?.offer ?? "15% rakeback on all bets",
      color: rollbit?.color ?? "#FFD700",
      tier: "common",
      affiliateUrl: rollbit?.url ?? "https://rollbit.com",
      icon: "Coins",
      emoji: "\uD83E\uDE99",
    },
    {
      id: "seg-bcgame",
      casinoId: "bcgame",
      label: "BC.Game",
      dealTitle: "Win up to 5 BTC",
      dealDescription:
        bcgame?.offer ?? "Spin Lucky Wheel for up to 5 BTC",
      color: bcgame?.color ?? "#27AE60",
      tier: "jackpot",
      affiliateUrl: bcgame?.url ?? "https://bc.game",
      icon: "Trophy",
      emoji: "\uD83C\uDFC6",
    },
    {
      id: "seg-wildio",
      casinoId: "wildio",
      label: "Wild.io",
      dealTitle: "350% + 200 Spins",
      dealDescription:
        wildio?.offer ?? "350% up to $10,000 + 200 free spins",
      color: wildio?.color ?? "#8B5CF6",
      tier: "medium",
      affiliateUrl: wildio?.url ?? "https://wild.io",
      icon: "Sparkles",
      emoji: "\u2728",
    },
    {
      id: "seg-respin",
      casinoId: null,
      label: "Spin Again!",
      dealTitle: "Free Re-Spin",
      dealDescription: "You get another free spin!",
      color: "#00E5A0",
      tier: "respin",
      affiliateUrl: "",
      icon: "RotateCw",
      emoji: "\uD83D\uDD04",
    },
    {
      id: "seg-jackbit",
      casinoId: "jackbit",
      label: "Jackbit",
      dealTitle: "100 Free Spins",
      dealDescription: jackbit?.offer ?? "100 wager-free spins",
      color: jackbit?.color ?? "#F97316",
      tier: "common",
      affiliateUrl: jackbit?.url ?? "https://jackbit.com",
      icon: "Ticket",
      emoji: "\uD83C\uDF9F\uFE0F",
    },
    {
      id: "seg-coincasino",
      casinoId: "coincasino",
      label: "CoinCasino",
      dealTitle: "200% Welcome",
      dealDescription:
        coincasino?.offer ?? "200% welcome bonus + WalletConnect",
      color: coincasino?.color ?? "#EC4899",
      tier: "medium",
      affiliateUrl: coincasino?.url ?? "https://coincasino.com",
      icon: "Gem",
      emoji: "\uD83D\uDC8E",
    },
    {
      id: "seg-mystery",
      casinoId: null,
      label: "Mystery Bonus",
      dealTitle: "Random Deal",
      dealDescription: "A random featured deal from one of our partner casinos!",
      color: "#00B4D8",
      tier: "rare",
      affiliateUrl: "",
      icon: "HelpCircle",
      emoji: "\u2753",
    },
  ];
}

// ---------------------------------------------------------------------------
// Prize selection (weighted random)
// ---------------------------------------------------------------------------

function cryptoRandom(): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] / (0xffffffff + 1);
}

export function selectPrizeSegment(segments: WheelSegment[]): number {
  const mysteryWeight =
    100 - SEGMENT_WEIGHTS.reduce((sum, w) => sum + w, 0);
  const weights = [...SEGMENT_WEIGHTS, mysteryWeight];
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  const rand = cryptoRandom() * totalWeight;
  let cumulative = 0;

  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (rand < cumulative) return i;
  }

  return segments.length - 1;
}

// ---------------------------------------------------------------------------
// Spin target calculation
// ---------------------------------------------------------------------------

export function calculateSpinTarget(
  segmentIndex: number,
  segmentCount: number,
  currentAngle: number
): { targetAngle: number; duration: number } {
  const segmentArc = (2 * Math.PI) / segmentCount;

  // Segment center in wheel-local coordinates
  const segmentCenter = segmentIndex * segmentArc + segmentArc / 2;

  // Random offset within segment (within 70% of segment width to avoid edges)
  const variance = (cryptoRandom() - 0.5) * segmentArc * 0.7;

  // The pointer is at 3PI/2 (top / 12 o'clock) in canvas coords.
  // For the pointer to land on this segment:
  //   currentAngle + segmentCenter + variance ≡ 3PI/2 (mod 2PI)
  //   currentAngle ≡ 3PI/2 - segmentCenter - variance (mod 2PI)
  const TWO_PI = 2 * Math.PI;
  const landingAngle =
    (((3 * Math.PI) / 2 - segmentCenter - variance) % TWO_PI + TWO_PI) % TWO_PI;

  // Full rotations (3-5)
  const rotations =
    MIN_ROTATIONS + cryptoRandom() * (MAX_ROTATIONS - MIN_ROTATIONS);
  const fullRotation = rotations * TWO_PI;

  // Normalize current angle to [0, 2PI)
  const normCurrent = ((currentAngle % TWO_PI) + TWO_PI) % TWO_PI;

  // How much additional rotation to reach the landing angle from current
  const angleToAdd = ((landingAngle - normCurrent) % TWO_PI + TWO_PI) % TWO_PI;
  const targetAngle = currentAngle + fullRotation + angleToAdd;

  // Duration: 3500-5000ms
  const duration =
    MIN_DURATION + cryptoRandom() * (MAX_DURATION - MIN_DURATION);

  return { targetAngle, duration };
}

// ---------------------------------------------------------------------------
// Easing function (compound: cubic 0-80%, quint 80-100%)
// ---------------------------------------------------------------------------

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeOutQuint(t: number): number {
  return 1 - Math.pow(1 - t, 5);
}

export function getAngleAtTime(
  startAngle: number,
  targetAngle: number,
  elapsed: number,
  duration: number
): number {
  const t = Math.min(elapsed / duration, 1);
  const totalDelta = targetAngle - startAngle;

  let easedT: number;
  if (t < 0.8) {
    // 0-80%: easeOutCubic mapped to 0-0.95 of the journey
    const localT = t / 0.8;
    easedT = easeOutCubic(localT) * 0.95;
  } else {
    // 80-100%: easeOutQuint for dramatic slowdown, covering remaining 5%
    const localT = (t - 0.8) / 0.2;
    easedT = 0.95 + easeOutQuint(localT) * 0.05;
  }

  return startAngle + totalDelta * easedT;
}

// ---------------------------------------------------------------------------
// Segment detection from angle
// ---------------------------------------------------------------------------

export function getSegmentAtAngle(
  wheelAngle: number,
  segmentCount: number
): number {
  const segmentArc = (2 * Math.PI) / segmentCount;
  const TWO_PI = 2 * Math.PI;
  // The pointer is at 3PI/2 (top). In the wheel's rotated frame,
  // the pointer is at local angle: 3PI/2 - wheelAngle
  const pointerLocal =
    (((3 * Math.PI) / 2 - wheelAngle) % TWO_PI + TWO_PI) % TWO_PI;
  return Math.floor(pointerLocal / segmentArc) % segmentCount;
}

// ---------------------------------------------------------------------------
// Mystery bonus resolution
// ---------------------------------------------------------------------------

export function resolveMysteryBonus(wonCasinoIds: string[] = []): {
  name: string;
  color: string;
  deal: string;
  url: string;
} {
  const available = wonCasinoIds.length > 0
    ? CASINOS.filter((c) => !wonCasinoIds.includes(c.id))
    : CASINOS;
  const pool = available.length > 0 ? available : CASINOS;
  const index = Math.floor(cryptoRandom() * pool.length);
  const casino = pool[index];
  return {
    name: casino.name,
    color: casino.color,
    deal: casino.offer,
    url: casino.url,
  };
}

// ---------------------------------------------------------------------------
// localStorage persistence
// ---------------------------------------------------------------------------

interface WheelSession {
  email: string | null;
  spins: SpinResult[];
  lastSpinDate: string;
}

export function saveWheelSession(
  email: string | null,
  spins: SpinResult[]
): void {
  try {
    const data: WheelSession = {
      email,
      spins,
      lastSpinDate: new Date().toISOString().slice(0, 10),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage may be unavailable
  }
}

export function loadWheelSession(): WheelSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as WheelSession;
    const today = new Date().toISOString().slice(0, 10);
    if (session.lastSpinDate && session.lastSpinDate !== today) {
      // New day — keep email but clear spins
      return { email: session.email, spins: [], lastSpinDate: today };
    }
    return session;
  } catch {
    return null;
  }
}
