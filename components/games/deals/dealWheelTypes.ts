// ---------------------------------------------------------------------------
// Prize tiers & game phases
// ---------------------------------------------------------------------------

export type PrizeTier = "common" | "medium" | "rare" | "jackpot" | "respin";
export type DealWheelPhase = "idle" | "spinning" | "revealing";

// ---------------------------------------------------------------------------
// Wheel segment (one slice of the wheel)
// ---------------------------------------------------------------------------

export interface WheelSegment {
  id: string;
  casinoId: string | null; // null for "Spin Again" / "Mystery Bonus"
  label: string; // casino name or "Spin Again!"
  dealTitle: string; // short: "200% Match"
  dealDescription: string; // full: "200% deposit match up to $2,000"
  color: string; // segment fill color
  tier: PrizeTier;
  affiliateUrl: string;
  icon: string; // lucide icon name for segment
  emoji: string; // emoji character for canvas rendering
}

// ---------------------------------------------------------------------------
// Spin result
// ---------------------------------------------------------------------------

export interface SpinResult {
  id: string;
  segmentIndex: number;
  segment: WheelSegment;
  timestamp: number;
  resolvedCasino?: {
    name: string;
    color: string;
    deal: string;
    url: string;
  };
}

// ---------------------------------------------------------------------------
// Email capture state
// ---------------------------------------------------------------------------

export interface EmailState {
  email: string | null;
  captured: boolean;
  showForm: boolean;
}

// ---------------------------------------------------------------------------
// Session stats
// ---------------------------------------------------------------------------

export interface DealWheelStats {
  totalSpins: number;
  freeSpinsUsed: number; // max 1
  emailSpinsRemaining: number; // starts at 2 after email capture
  prizesWon: SpinResult[];
}

// ---------------------------------------------------------------------------
// Full game state
// ---------------------------------------------------------------------------

export interface DealWheelState {
  phase: DealWheelPhase;
  segments: WheelSegment[];
  currentAngle: number; // radians — current wheel rotation
  targetAngle: number; // radians — final target
  spinStartTime: number | null;
  spinDuration: number;
  currentResult: SpinResult | null;
  email: EmailState;
  stats: DealWheelStats;
  showConfetti: boolean;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type DealWheelAction =
  | { type: "INIT_SESSION"; email: string | null; spins: SpinResult[] }
  | {
      type: "START_SPIN";
      targetAngle: number;
      duration: number;
      segmentIndex: number;
    }
  | { type: "SPIN_COMPLETE"; result: SpinResult; finalAngle: number }
  | { type: "SHOW_EMAIL_FORM" }
  | { type: "SUBMIT_EMAIL"; email: string }
  | { type: "DISMISS_RESULT" }
  | { type: "TRIGGER_CONFETTI" }
  | { type: "CLEAR_CONFETTI" };
