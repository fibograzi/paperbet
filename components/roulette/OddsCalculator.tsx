"use client";

import { useState } from "react";
import { BET_REGISTRY } from "@/lib/roulette/rouletteBets";
import {
  streakProbability,
  expectedSpinsToWin,
} from "@/lib/roulette/oddsCalculator";
import {
  getRedNumbers,
  getEvenNumbers,
  getLowNumbers,
  getDozenNumbers,
  getColumnNumbers,
} from "@/lib/roulette/rouletteBets";
import type { WheelType, BetType } from "@/lib/roulette/rouletteTypes";
import OddsTable from "./OddsTable";
import WheelCoverage from "./WheelCoverage";
import EducationalPanel from "./EducationalPanel";

const BET_TYPE_OPTIONS: { value: BetType; label: string }[] = Object.values(BET_REGISTRY).map(
  (def) => ({ value: def.type, label: def.name })
);

function getCoveredNumbers(betType: BetType): number[] {
  switch (betType) {
    case "straight":
      return [17]; // Example straight up on 17
    case "split":
      return [17, 18];
    case "street":
      return [16, 17, 18];
    case "corner":
      return [16, 17, 19, 20];
    case "sixLine":
      return [13, 14, 15, 16, 17, 18];
    case "dozen":
      return getDozenNumbers(1);
    case "column":
      return getColumnNumbers(1);
    case "redBlack":
      return getRedNumbers();
    case "evenOdd":
      return getEvenNumbers();
    case "highLow":
      return getLowNumbers();
    default:
      return getRedNumbers();
  }
}

export default function OddsCalculator() {
  const [wheelType, setWheelType] = useState<WheelType>("european");
  const [selectedBetType, setSelectedBetType] = useState<BetType>("redBlack");
  const [streakLength, setStreakLength] = useState<number>(5);
  const [streakType, setStreakType] = useState<"win" | "loss">("loss");

  const coveredNumbers = getCoveredNumbers(selectedBetType);

  const winStreakProb = streakProbability(selectedBetType, wheelType, streakLength, "win");
  const lossStreakProb = streakProbability(selectedBetType, wheelType, streakLength, "loss");
  const expectedSpins = expectedSpinsToWin(selectedBetType, wheelType);

  const streakProb = streakType === "win" ? winStreakProb : lossStreakProb;
  const streakPercent = (streakProb * 100).toFixed(4);
  const streakOneIn = streakProb > 0 ? Math.round(1 / streakProb) : Infinity;

  return (
    <div className="space-y-8">
      {/* Wheel type toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <p className="text-xs text-pb-text-muted uppercase tracking-wider mb-2 font-semibold">
            Wheel Type
          </p>
          <div className="inline-flex rounded-lg border border-pb-border bg-pb-bg-tertiary p-1 gap-1">
            {(["european", "american"] as WheelType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setWheelType(type)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${
                  wheelType === type
                    ? "bg-pb-accent text-pb-bg-primary shadow-sm"
                    : "text-pb-text-secondary hover:text-pb-text-primary"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="sm:ml-auto text-sm text-pb-text-secondary">
          <span className="text-pb-text-muted">House edge: </span>
          <span className="font-mono-stats text-pb-warning font-semibold">
            {wheelType === "european" ? "2.703%" : "5.263%"}
          </span>
        </div>
      </div>

      {/* Educational panel */}
      <EducationalPanel variant="tip" title="Equal house edge across all bets">
        On a single-zero (European) wheel, every bet type has the same house edge of 2.70%. The
        only exception is the American Five-Number bet (0, 00, 1, 2, 3) which carries 7.89%.
        Higher payouts mean lower probability, not better expected value.
      </EducationalPanel>

      {/* Odds table */}
      <div>
        <h2 className="font-heading text-lg font-bold text-pb-text-primary mb-4">
          All Bet Types — {wheelType === "european" ? "European (37 pockets)" : "American (38 pockets)"}
        </h2>
        <OddsTable wheelType={wheelType} />
      </div>

      {/* Wheel coverage + bet selector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-6 space-y-4">
          <h2 className="font-heading text-lg font-bold text-pb-text-primary">
            Wheel Coverage Visualizer
          </h2>
          <div>
            <label
              htmlFor="bet-type-select"
              className="block text-xs text-pb-text-muted uppercase tracking-wider mb-2 font-semibold"
            >
              Select Bet Type
            </label>
            <select
              id="bet-type-select"
              value={selectedBetType}
              onChange={(e) => setSelectedBetType(e.target.value as BetType)}
              className="w-full bg-pb-bg-tertiary border border-pb-border rounded-lg px-3 py-2.5 text-sm text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50 focus:border-pb-accent"
            >
              {BET_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-center">
            <WheelCoverage coveredNumbers={coveredNumbers} wheelType={wheelType} />
          </div>
        </div>

        {/* Streak calculator */}
        <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-6 space-y-4">
          <h2 className="font-heading text-lg font-bold text-pb-text-primary">
            Streak Probability Calculator
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="streak-bet-type"
                className="block text-xs text-pb-text-muted uppercase tracking-wider mb-2 font-semibold"
              >
                Bet Type
              </label>
              <select
                id="streak-bet-type"
                value={selectedBetType}
                onChange={(e) => setSelectedBetType(e.target.value as BetType)}
                className="w-full bg-pb-bg-tertiary border border-pb-border rounded-lg px-3 py-2.5 text-sm text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50 focus:border-pb-accent"
              >
                {BET_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label
                  htmlFor="streak-length"
                  className="block text-xs text-pb-text-muted uppercase tracking-wider mb-2 font-semibold"
                >
                  Streak Length
                </label>
                <input
                  id="streak-length"
                  type="number"
                  min={1}
                  max={50}
                  value={streakLength}
                  onChange={(e) =>
                    setStreakLength(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))
                  }
                  className="w-full bg-pb-bg-tertiary border border-pb-border rounded-lg px-3 py-2.5 text-sm text-pb-text-primary font-mono-stats focus:outline-none focus:ring-2 focus:ring-pb-accent/50 focus:border-pb-accent"
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="streak-type"
                  className="block text-xs text-pb-text-muted uppercase tracking-wider mb-2 font-semibold"
                >
                  Streak Of
                </label>
                <select
                  id="streak-type"
                  value={streakType}
                  onChange={(e) => setStreakType(e.target.value as "win" | "loss")}
                  className="w-full bg-pb-bg-tertiary border border-pb-border rounded-lg px-3 py-2.5 text-sm text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50 focus:border-pb-accent"
                >
                  <option value="win">Wins</option>
                  <option value="loss">Losses</option>
                </select>
              </div>
            </div>

            {/* Results */}
            <div className="bg-pb-bg-tertiary rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-pb-text-secondary">
                  Probability of {streakLength} consecutive {streakType}s
                </span>
                <span className="font-mono-stats text-pb-text-primary font-semibold text-sm">
                  {streakPercent}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-pb-text-secondary">1-in-N chance</span>
                <span className="font-mono-stats text-pb-warning font-semibold text-sm">
                  1 in {streakOneIn.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-pb-text-secondary">
                  Expected spins to win (avg)
                </span>
                <span className="font-mono-stats text-pb-accent-secondary font-semibold text-sm">
                  {expectedSpins.toFixed(2)}
                </span>
              </div>
            </div>

            <EducationalPanel variant="warning" title="Streaks are not patterns">
              Each spin is independent. A streak of 10 reds does not make black &ldquo;due.&rdquo; The
              probability of the next spin is always the same regardless of history.
            </EducationalPanel>
          </div>
        </div>
      </div>
    </div>
  );
}
