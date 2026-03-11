"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { getAllStrategies } from "@/lib/roulette/strategyEngine";
import type { SimulationConfig, CustomStrategyConfig } from "@/lib/roulette/strategyTypes";
import CustomStrategyBuilder from "./CustomStrategyBuilder";

interface StrategyConfigPanelProps {
  onRun: (config: SimulationConfig) => void;
  isRunning: boolean;
}

const BET_TYPES: { value: SimulationConfig["betType"]; label: string }[] = [
  { value: "redBlack", label: "Red / Black (1:1)" },
  { value: "evenOdd", label: "Even / Odd (1:1)" },
  { value: "highLow", label: "High / Low (1:1)" },
  { value: "dozen", label: "Dozen (2:1)" },
  { value: "column", label: "Column (2:1)" },
  { value: "straight", label: "Straight Up (35:1)" },
];

const SESSION_OPTIONS = [100, 500, 1000, 5000, 10000];

const DEFAULT_CUSTOM: CustomStrategyConfig = {
  onWin: "reset",
  onLoss: "double",
  maxBetUnits: 64,
  resetAfterWins: null,
  resetAfterLosses: null,
};

export default function StrategyConfigPanel({ onRun, isRunning }: StrategyConfigPanelProps) {
  const strategies = getAllStrategies();

  const [strategyId, setStrategyId] = useState("flat");
  const [wheelType, setWheelType] = useState<SimulationConfig["wheelType"]>("european");
  const [betType, setBetType] = useState<SimulationConfig["betType"]>("redBlack");
  const [baseBet, setBaseBet] = useState(5);
  const [startingBankroll, setStartingBankroll] = useState(500);
  const [numberOfSessions, setNumberOfSessions] = useState(1000);
  const [maxSpins, setMaxSpins] = useState(500);
  const [stopOnProfit, setStopOnProfit] = useState<string>("");
  const [stopOnLoss, setStopOnLoss] = useState<string>("");
  const [tableLimit, setTableLimit] = useState<string>("");
  const [customConfig, setCustomConfig] = useState<CustomStrategyConfig>(DEFAULT_CUSTOM);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const config: SimulationConfig = {
      strategyId,
      wheelType,
      betType,
      baseBet: Math.max(1, Math.min(100, baseBet)),
      startingBankroll: Math.max(100, Math.min(100000, startingBankroll)),
      numberOfSessions,
      stopConditions: {
        maxSpins: Math.max(10, maxSpins),
        stopOnBankrupt: true,
        stopOnProfit: stopOnProfit ? parseFloat(stopOnProfit) : null,
        stopOnLoss: stopOnLoss ? parseFloat(stopOnLoss) : null,
        maxBetLimit: tableLimit ? parseFloat(tableLimit) : null,
      },
      customConfig: strategyId === "custom" ? customConfig : undefined,
    };

    onRun(config);
  };

  const inputClass =
    "w-full bg-pb-bg-tertiary border border-pb-border rounded-lg px-3 py-2 text-pb-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-pb-accent/50 focus:border-pb-accent transition-colors";
  const labelClass = "block text-xs font-medium text-pb-text-secondary mb-1.5";
  const sectionClass = "space-y-4";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Strategy */}
      <div className={sectionClass}>
        <h3 className="font-heading font-semibold text-sm text-pb-text-primary border-b border-pb-border pb-2">
          Strategy
        </h3>
        <div>
          <label className={labelClass}>Betting Strategy</label>
          <select
            value={strategyId}
            onChange={(e) => setStrategyId(e.target.value)}
            className={inputClass}
          >
            {strategies.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
            <option value="custom">Custom Strategy</option>
          </select>
          {strategyId !== "custom" && strategyId !== "flat" && (
            <p className="text-xs text-pb-text-muted mt-1.5">
              {strategies.find((s) => s.id === strategyId)?.description}
            </p>
          )}
        </div>

        {strategyId === "custom" && (
          <CustomStrategyBuilder config={customConfig} onChange={setCustomConfig} />
        )}
      </div>

      {/* Wheel & Bet */}
      <div className={sectionClass}>
        <h3 className="font-heading font-semibold text-sm text-pb-text-primary border-b border-pb-border pb-2">
          Wheel & Bet
        </h3>
        <div>
          <label className={labelClass}>Wheel Type</label>
          <div className="flex gap-2">
            {(["european", "american"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setWheelType(type)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  wheelType === type
                    ? "bg-pb-accent text-pb-bg-primary"
                    : "bg-pb-bg-tertiary border border-pb-border text-pb-text-secondary hover:border-pb-accent/50"
                }`}
              >
                {type === "european" ? "European (2.7%)" : "American (5.26%)"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelClass}>Bet Type</label>
          <select
            value={betType}
            onChange={(e) => setBetType(e.target.value as SimulationConfig["betType"])}
            className={inputClass}
          >
            {BET_TYPES.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bankroll */}
      <div className={sectionClass}>
        <h3 className="font-heading font-semibold text-sm text-pb-text-primary border-b border-pb-border pb-2">
          Bankroll
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Base Bet ($)</label>
            <input
              type="number"
              min={1}
              max={100}
              value={baseBet}
              onChange={(e) => setBaseBet(Number(e.target.value))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Starting Bankroll ($)</label>
            <input
              type="number"
              min={100}
              max={100000}
              value={startingBankroll}
              onChange={(e) => setStartingBankroll(Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>
        <p className="text-xs text-pb-text-muted">
          Bankroll-to-base ratio: {Math.round(startingBankroll / baseBet)}x
        </p>
      </div>

      {/* Sessions */}
      <div className={sectionClass}>
        <h3 className="font-heading font-semibold text-sm text-pb-text-primary border-b border-pb-border pb-2">
          Simulation
        </h3>
        <div>
          <label className={labelClass}>Number of Sessions</label>
          <select
            value={numberOfSessions}
            onChange={(e) => setNumberOfSessions(Number(e.target.value))}
            className={inputClass}
          >
            {SESSION_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n.toLocaleString()} sessions
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Max Spins per Session</label>
          <input
            type="number"
            min={10}
            max={10000}
            value={maxSpins}
            onChange={(e) => setMaxSpins(Number(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>

      {/* Stop Conditions */}
      <div className={sectionClass}>
        <h3 className="font-heading font-semibold text-sm text-pb-text-primary border-b border-pb-border pb-2">
          Stop Conditions <span className="text-pb-text-muted font-normal">(optional)</span>
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Stop on Profit ($)</label>
            <input
              type="number"
              min={1}
              placeholder="e.g. 200"
              value={stopOnProfit}
              onChange={(e) => setStopOnProfit(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Stop on Loss ($)</label>
            <input
              type="number"
              min={1}
              placeholder="e.g. 300"
              value={stopOnLoss}
              onChange={(e) => setStopOnLoss(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Table Limit ($)</label>
          <input
            type="number"
            min={1}
            placeholder="e.g. 500"
            value={tableLimit}
            onChange={(e) => setTableLimit(e.target.value)}
            className={inputClass}
          />
          <p className="text-xs text-pb-text-muted mt-1">
            Session ends if next bet would exceed this limit.
          </p>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={isRunning}
        className="w-full"
      >
        {isRunning ? "Running…" : `Run ${numberOfSessions.toLocaleString()} Sessions`}
      </Button>
    </form>
  );
}
