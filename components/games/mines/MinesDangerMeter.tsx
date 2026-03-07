"use client";

import { getDangerColor } from "./minesCalculator";

interface MinesDangerMeterProps {
  danger: number; // 0–1
  visible: boolean;
}

export default function MinesDangerMeter({
  danger,
  visible,
}: MinesDangerMeterProps) {
  if (!visible) return null;

  const color = getDangerColor(danger);
  const pct = Math.round(danger * 100);
  const isPulsing = danger >= 0.75;

  return (
    <div className="w-full max-w-[500px] mx-auto px-0">
      <div className="flex items-center gap-2">
        {/* Track */}
        <div className="flex-1 h-1.5 md:h-2 bg-[#1F2937] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-200 ease-out ${
              isPulsing ? "mines-danger-pulse" : ""
            }`}
            style={{
              width: `${Math.min(pct, 100)}%`,
              backgroundColor: color,
            }}
          />
        </div>
        {/* Label */}
        <span
          className="text-[11px] font-mono-stats whitespace-nowrap"
          style={{ color: "#6B7280" }}
        >
          {pct}% danger
        </span>
      </div>
    </div>
  );
}
