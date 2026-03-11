"use client";

import type { CustomStrategyConfig, ProgressionAction } from "@/lib/roulette/strategyTypes";

interface CustomStrategyBuilderProps {
  config: CustomStrategyConfig;
  onChange: (config: CustomStrategyConfig) => void;
}

const ACTION_OPTIONS: { value: ProgressionAction; label: string; description: string }[] = [
  { value: "same", label: "Keep same bet", description: "Bet doesn't change" },
  { value: "double", label: "Double bet", description: "Multiply current bet by 2" },
  { value: "add_unit", label: "Add 1 unit", description: "Increase by 1 base bet" },
  { value: "subtract_unit", label: "Subtract 1 unit", description: "Decrease by 1 base bet (min: 1)" },
  { value: "reset", label: "Reset to base", description: "Return to 1× base bet" },
];

export default function CustomStrategyBuilder({ config, onChange }: CustomStrategyBuilderProps) {
  const update = <K extends keyof CustomStrategyConfig>(key: K, value: CustomStrategyConfig[K]) => {
    onChange({ ...config, [key]: value });
  };

  const inputClass =
    "w-full bg-pb-bg-primary border border-pb-border rounded-lg px-3 py-2 text-pb-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-pb-accent/50 focus:border-pb-accent transition-colors";
  const labelClass = "block text-xs font-medium text-pb-text-secondary mb-1.5";

  return (
    <div className="rounded-xl border border-pb-accent/20 bg-pb-accent/5 p-4 space-y-4">
      <p className="text-xs font-heading font-semibold text-pb-accent uppercase tracking-wider">
        Custom Rules
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* On Win */}
        <div>
          <label className={labelClass}>On Win — Next Bet</label>
          <select
            value={config.onWin}
            onChange={(e) => update("onWin", e.target.value as ProgressionAction)}
            className={inputClass}
          >
            {ACTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-pb-text-muted mt-1">
            {ACTION_OPTIONS.find((o) => o.value === config.onWin)?.description}
          </p>
        </div>

        {/* On Loss */}
        <div>
          <label className={labelClass}>On Loss — Next Bet</label>
          <select
            value={config.onLoss}
            onChange={(e) => update("onLoss", e.target.value as ProgressionAction)}
            className={inputClass}
          >
            {ACTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-pb-text-muted mt-1">
            {ACTION_OPTIONS.find((o) => o.value === config.onLoss)?.description}
          </p>
        </div>
      </div>

      {/* Max Bet Units */}
      <div>
        <label className={labelClass}>Maximum Bet (units of base bet)</label>
        <input
          type="number"
          min={1}
          max={1000}
          value={config.maxBetUnits}
          onChange={(e) => update("maxBetUnits", Math.max(1, Number(e.target.value)))}
          className={inputClass}
        />
        <p className="text-xs text-pb-text-muted mt-1">
          The bet will never exceed this multiple of the base bet.
        </p>
      </div>

      {/* Reset conditions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Reset after N wins (optional)</label>
          <input
            type="number"
            min={1}
            placeholder="Never"
            value={config.resetAfterWins ?? ""}
            onChange={(e) =>
              update("resetAfterWins", e.target.value ? Number(e.target.value) : null)
            }
            className={inputClass}
          />
          <p className="text-xs text-pb-text-muted mt-1">
            Return to base bet after this many consecutive wins.
          </p>
        </div>

        <div>
          <label className={labelClass}>Reset after N losses (optional)</label>
          <input
            type="number"
            min={1}
            placeholder="Never"
            value={config.resetAfterLosses ?? ""}
            onChange={(e) =>
              update("resetAfterLosses", e.target.value ? Number(e.target.value) : null)
            }
            className={inputClass}
          />
          <p className="text-xs text-pb-text-muted mt-1">
            Return to base bet after this many consecutive losses.
          </p>
        </div>
      </div>
    </div>
  );
}
