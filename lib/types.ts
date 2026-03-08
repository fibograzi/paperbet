export interface Casino {
  id: string;
  name: string;
  url: string;
  logo?: string;
  color: string;
  offer: string;
  offerShort: string;
  games: string[];
  features: string[];
  termsUrl?: string;
  regionNote?: string;
}

export interface Game {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc: string;
  icon: string;
  color: string;
  available: boolean;
  rtp: number;
}

export interface BetResult {
  id: string;
  amount: number;
  multiplier: number;
  profit: number;
  timestamp: number;
}

export interface SessionStats {
  totalBets: number;
  totalWagered: number;
  totalReturns: number;
  netProfit: number;
  biggestWin: number;
  biggestLoss: number;
  currentStreak: number;
  bestStreak: number;
}

export type RiskLevel = "low" | "medium" | "high" | "expert";
export type PlinkoRows = 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;
export type AutoPlaySpeed = "normal" | "fast" | "turbo";
