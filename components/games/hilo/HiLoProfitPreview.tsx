"use client";

import type { HiLoPredictionInfo } from "./hiloTypes";
import {
  formatHiLoMultiplier,
  calculateProfit,
  getMultiplierColor,
} from "./hiloEngine";
import { formatCurrency } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface HiLoProfitPreviewProps {
  predictionInfo: HiLoPredictionInfo;
  cumulativeMultiplier: number;
  betAmount: number;
  correctPredictions: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HiLoProfitPreview({
  predictionInfo,
  cumulativeMultiplier,
  betAmount,
  correctPredictions,
}: HiLoProfitPreviewProps) {
  // Only visible after first correct prediction
  if (correctPredictions < 1) return null;

  // Prospective cumulative multipliers
  const higherCumulative =
    Math.round(cumulativeMultiplier * predictionInfo.higherMultiplier * 100) /
    100;
  const lowerCumulative =
    Math.round(cumulativeMultiplier * predictionInfo.lowerMultiplier * 100) /
    100;

  const higherProfit = calculateProfit(betAmount, higherCumulative);
  const lowerProfit = calculateProfit(betAmount, lowerCumulative);

  // Current total — what you'd get if you cash out now
  const currentProfit = calculateProfit(betAmount, cumulativeMultiplier);

  const higherColor = getMultiplierColor(higherCumulative);
  const lowerColor = getMultiplierColor(lowerCumulative);
  const totalColor = getMultiplierColor(cumulativeMultiplier);

  return (
    <div className="w-full space-y-2">
      {/* Side-by-side profit panels */}
      <div className="flex gap-2">
        {/* Higher profit panel */}
        {predictionInfo.higherAvailable && (
          <div
            className="flex-1 rounded-lg p-3"
            style={{
              backgroundColor: "#111827",
              borderLeft: "3px solid #00E5A0",
            }}
          >
            <div
              className="font-body text-xs mb-1"
              style={{ color: "#9CA3AF" }}
            >
              Profit Higher
            </div>
            <div className="font-mono-stats text-sm" style={{ color: "#00E5A0" }}>
              {formatHiLoMultiplier(higherCumulative)} →{" "}
              <span className="font-semibold">
                +{formatCurrency(higherProfit)}
              </span>
            </div>
          </div>
        )}

        {/* Lower profit panel */}
        {predictionInfo.lowerAvailable && (
          <div
            className="flex-1 rounded-lg p-3"
            style={{
              backgroundColor: "#111827",
              borderLeft: "3px solid #EF4444",
            }}
          >
            <div
              className="font-body text-xs mb-1"
              style={{ color: "#9CA3AF" }}
            >
              Profit Lower
            </div>
            <div className="font-mono-stats text-sm" style={{ color: "#EF4444" }}>
              {formatHiLoMultiplier(lowerCumulative)} →{" "}
              <span className="font-semibold">
                +{formatCurrency(lowerProfit)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Total Profit — current cashout value */}
      <div className="text-center py-1">
        <span
          className="font-body text-xs"
          style={{ color: "#6B7280" }}
        >
          Total Profit:{" "}
        </span>
        <span
          className="font-mono-stats text-base font-semibold"
          style={{ color: totalColor }}
        >
          {formatHiLoMultiplier(cumulativeMultiplier)} →{" "}
          {formatCurrency(currentProfit + betAmount)}
        </span>
      </div>
    </div>
  );
}
