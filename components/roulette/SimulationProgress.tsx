"use client";

import Button from "@/components/ui/Button";

interface SimulationProgressProps {
  percentage: number;
  sessionsCompleted: number;
  totalSessions: number;
  onCancel: () => void;
}

export default function SimulationProgress({
  percentage,
  sessionsCompleted,
  totalSessions,
  onCancel,
}: SimulationProgressProps) {
  const pct = Math.min(100, Math.max(0, percentage));

  return (
    <div className="flex flex-col items-center gap-5 py-8 px-4">
      {/* Spinner ring */}
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="#374151"
            strokeWidth="4"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="#00E5A0"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 28}`}
            strokeDashoffset={`${2 * Math.PI * 28 * (1 - pct / 100)}`}
            className="transition-all duration-300"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-mono-stats text-sm font-bold text-pb-accent">
          {Math.round(pct)}%
        </span>
      </div>

      <div className="text-center space-y-1">
        <p className="font-heading font-semibold text-pb-text-primary text-base">
          Running Simulation…
        </p>
        <p className="text-pb-text-secondary text-sm font-mono-stats">
          {sessionsCompleted.toLocaleString()} / {totalSessions.toLocaleString()} sessions
        </p>
      </div>

      {/* Bar */}
      <div className="w-full max-w-sm">
        <div className="h-2 rounded-full bg-pb-bg-tertiary overflow-hidden">
          <div
            className="h-full rounded-full bg-pb-accent transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <Button variant="ghost" size="sm" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}
