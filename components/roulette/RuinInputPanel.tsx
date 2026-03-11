"use client";

import { BET_REGISTRY } from "@/lib/roulette/rouletteBets";
import type { WheelType, BetType } from "@/lib/roulette/rouletteTypes";

export interface RuinConfig {
  wheelType: WheelType;
  betType: BetType;
  bankrollUnits: number;
  targetProfitUnits: number | null;
}

interface RuinInputPanelProps {
  config: RuinConfig;
  onChange: (config: RuinConfig) => void;
  isCalculating: boolean;
  onCalculate: () => void;
}

const BET_TYPE_OPTIONS = Object.values(BET_REGISTRY).map((def) => ({
  value: def.type,
  label: def.name,
  category: def.category,
}));

export default function RuinInputPanel({
  config,
  onChange,
  isCalculating,
  onCalculate,
}: RuinInputPanelProps) {
  const update = (partial: Partial<RuinConfig>) => {
    onChange({ ...config, ...partial });
  };

  return (
    <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-6 space-y-5">
      <h2 className="font-heading text-lg font-bold text-pb-text-primary">Parameters</h2>

      {/* Wheel type */}
      <div>
        <p className="text-xs text-pb-text-muted uppercase tracking-wider mb-2 font-semibold">
          Wheel Type
        </p>
        <div className="inline-flex rounded-lg border border-pb-border bg-pb-bg-tertiary p-1 gap-1 w-full">
          {(["european", "american"] as WheelType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => update({ wheelType: type })}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all capitalize ${
                config.wheelType === type
                  ? "bg-pb-accent text-pb-bg-primary shadow-sm"
                  : "text-pb-text-secondary hover:text-pb-text-primary"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Bet type */}
      <div>
        <label
          htmlFor="ruin-bet-type"
          className="block text-xs text-pb-text-muted uppercase tracking-wider mb-2 font-semibold"
        >
          Bet Type
        </label>
        <select
          id="ruin-bet-type"
          value={config.betType}
          onChange={(e) => update({ betType: e.target.value as BetType })}
          className="w-full bg-pb-bg-tertiary border border-pb-border rounded-lg px-3 py-2.5 text-sm text-pb-text-primary focus:outline-none focus:ring-2 focus:ring-pb-accent/50 focus:border-pb-accent"
        >
          <optgroup label="Outside Bets">
            {BET_TYPE_OPTIONS.filter((o) => o.category === "outside").map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </optgroup>
          <optgroup label="Inside Bets">
            {BET_TYPE_OPTIONS.filter((o) => o.category === "inside").map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Bankroll */}
      <div>
        <label
          htmlFor="ruin-bankroll"
          className="block text-xs text-pb-text-muted uppercase tracking-wider mb-2 font-semibold"
        >
          Starting Bankroll (units)
        </label>
        <input
          id="ruin-bankroll"
          type="number"
          min={1}
          max={10000}
          step={1}
          value={config.bankrollUnits}
          onChange={(e) =>
            update({ bankrollUnits: Math.max(1, parseInt(e.target.value) || 1) })
          }
          className="w-full bg-pb-bg-tertiary border border-pb-border rounded-lg px-3 py-2.5 text-sm text-pb-text-primary font-mono-stats focus:outline-none focus:ring-2 focus:ring-pb-accent/50 focus:border-pb-accent"
        />
        <p className="text-xs text-pb-text-muted mt-1">
          1 unit = 1 bet. E.g., 100 units means you can place 100 minimum bets.
        </p>
      </div>

      {/* Target profit (optional) */}
      <div>
        <label
          htmlFor="ruin-target"
          className="block text-xs text-pb-text-muted uppercase tracking-wider mb-2 font-semibold"
        >
          Target Profit (units){" "}
          <span className="normal-case font-normal text-pb-text-muted">— optional</span>
        </label>
        <input
          id="ruin-target"
          type="number"
          min={1}
          max={100000}
          step={1}
          placeholder="Leave blank for infinite play"
          value={config.targetProfitUnits ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            update({
              targetProfitUnits: val === "" ? null : Math.max(1, parseInt(val) || 1),
            });
          }}
          className="w-full bg-pb-bg-tertiary border border-pb-border rounded-lg px-3 py-2.5 text-sm text-pb-text-primary font-mono-stats placeholder-pb-text-muted focus:outline-none focus:ring-2 focus:ring-pb-accent/50 focus:border-pb-accent"
        />
        <p className="text-xs text-pb-text-muted mt-1">
          Leave blank to model infinite play. Set a target to model a session goal.
        </p>
      </div>

      {/* Calculate button */}
      <button
        type="button"
        onClick={onCalculate}
        disabled={isCalculating}
        className="w-full py-3 rounded-lg bg-pb-accent text-pb-bg-primary font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isCalculating ? "Calculating…" : "Calculate Risk of Ruin"}
      </button>
    </div>
  );
}
