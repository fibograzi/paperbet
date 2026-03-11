"use client";

import { useMemo } from "react";
import { getWheelOrder, getPocketColor } from "@/lib/roulette/rouletteEngine";
import type { WheelType } from "@/lib/roulette/rouletteTypes";

interface WheelCoverageProps {
  coveredNumbers: number[];
  wheelType: WheelType;
}

const SVG_SIZE = 280;
const CENTER = SVG_SIZE / 2;
const OUTER_RADIUS = 125;
const INNER_RADIUS = 75;
const LABEL_RADIUS = 103;

export default function WheelCoverage({ coveredNumbers, wheelType }: WheelCoverageProps) {
  const wheelOrder = useMemo(() => getWheelOrder(wheelType), [wheelType]);
  const coveredSet = useMemo(() => new Set(coveredNumbers), [coveredNumbers]);

  const totalPockets = wheelOrder.length;
  const coveragePercent = ((coveredNumbers.length / totalPockets) * 100).toFixed(1);

  const segments = useMemo(() => {
    return wheelOrder.map((num, index) => {
      const startAngle = (index / totalPockets) * 2 * Math.PI - Math.PI / 2;
      const endAngle = ((index + 1) / totalPockets) * 2 * Math.PI - Math.PI / 2;

      const x1Outer = CENTER + OUTER_RADIUS * Math.cos(startAngle);
      const y1Outer = CENTER + OUTER_RADIUS * Math.sin(startAngle);
      const x2Outer = CENTER + OUTER_RADIUS * Math.cos(endAngle);
      const y2Outer = CENTER + OUTER_RADIUS * Math.sin(endAngle);
      const x1Inner = CENTER + INNER_RADIUS * Math.cos(startAngle);
      const y1Inner = CENTER + INNER_RADIUS * Math.sin(startAngle);
      const x2Inner = CENTER + INNER_RADIUS * Math.cos(endAngle);
      const y2Inner = CENTER + INNER_RADIUS * Math.sin(endAngle);

      const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

      const path = [
        `M ${x1Inner} ${y1Inner}`,
        `L ${x1Outer} ${y1Outer}`,
        `A ${OUTER_RADIUS} ${OUTER_RADIUS} 0 ${largeArc} 1 ${x2Outer} ${y2Outer}`,
        `L ${x2Inner} ${y2Inner}`,
        `A ${INNER_RADIUS} ${INNER_RADIUS} 0 ${largeArc} 0 ${x1Inner} ${y1Inner}`,
        "Z",
      ].join(" ");

      const midAngle = (startAngle + endAngle) / 2;
      const labelX = CENTER + LABEL_RADIUS * Math.cos(midAngle);
      const labelY = CENTER + LABEL_RADIUS * Math.sin(midAngle);

      const isCovered = coveredSet.has(num);
      const pocketColor = getPocketColor(num);

      let fillColor: string;
      if (isCovered) {
        if (pocketColor === "green") fillColor = "#00E5A0";
        else if (pocketColor === "red") fillColor = "#22c55e";
        else fillColor = "#16a34a";
      } else {
        if (pocketColor === "green") fillColor = "#374151";
        else if (pocketColor === "red") fillColor = "#2d1515";
        else fillColor = "#1a1a1a";
      }

      const label = num === -1 ? "00" : String(num);

      return {
        path,
        fillColor,
        isCovered,
        labelX,
        labelY,
        label,
        num,
      };
    });
  }, [wheelOrder, coveredSet, totalPockets]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: SVG_SIZE, height: SVG_SIZE }}>
        <svg
          width={SVG_SIZE}
          height={SVG_SIZE}
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          aria-label={`Roulette wheel showing ${coveredNumbers.length} covered pockets out of ${totalPockets}`}
          role="img"
        >
          {/* Background circle */}
          <circle cx={CENTER} cy={CENTER} r={OUTER_RADIUS + 4} fill="#1F2937" />

          {/* Segments */}
          {segments.map((seg) => (
            <g key={seg.num}>
              <path
                d={seg.path}
                fill={seg.fillColor}
                stroke="#0B0F1A"
                strokeWidth="0.5"
                opacity={seg.isCovered ? 1 : 0.4}
              />
              {totalPockets <= 38 && (
                <text
                  x={seg.labelX}
                  y={seg.labelY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={seg.isCovered ? "#F9FAFB" : "#6B7280"}
                  fontSize={totalPockets > 20 ? "5" : "7"}
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight={seg.isCovered ? "600" : "400"}
                >
                  {seg.label}
                </text>
              )}
            </g>
          ))}

          {/* Center circle with coverage stat */}
          <circle cx={CENTER} cy={CENTER} r={INNER_RADIUS - 2} fill="#111827" />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={INNER_RADIUS - 2}
            fill="none"
            stroke="#374151"
            strokeWidth="1"
          />

          {/* Coverage text */}
          <text
            x={CENTER}
            y={CENTER - 10}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#00E5A0"
            fontSize="22"
            fontFamily="JetBrains Mono, monospace"
            fontWeight="700"
          >
            {coveragePercent}%
          </text>
          <text
            x={CENTER}
            y={CENTER + 12}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#9CA3AF"
            fontSize="9"
            fontFamily="DM Sans, sans-serif"
          >
            coverage
          </text>
          <text
            x={CENTER}
            y={CENTER + 25}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#6B7280"
            fontSize="8"
            fontFamily="DM Sans, sans-serif"
          >
            {coveredNumbers.length} / {totalPockets}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-pb-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-pb-accent opacity-80" aria-hidden />
          Covered
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-pb-bg-tertiary opacity-60" aria-hidden />
          Not covered
        </span>
      </div>
    </div>
  );
}
