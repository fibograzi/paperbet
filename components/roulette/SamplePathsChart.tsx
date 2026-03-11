"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { SamplePath } from "@/lib/roulette/riskOfRuinEngine";

interface SamplePathsChartProps {
  paths: SamplePath[];
  bankrollUnits: number;
}

// Lazy-load Recharts to avoid SSR issues and reduce initial bundle
const LineChart = dynamic(
  () => import("recharts").then((mod) => mod.LineChart),
  { ssr: false }
);
const Line = dynamic(
  () => import("recharts").then((mod) => mod.Line),
  { ssr: false }
);
const XAxis = dynamic(
  () => import("recharts").then((mod) => mod.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import("recharts").then((mod) => mod.YAxis),
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import("recharts").then((mod) => mod.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import("recharts").then((mod) => mod.Tooltip),
  { ssr: false }
);
const ReferenceLine = dynamic(
  () => import("recharts").then((mod) => mod.ReferenceLine),
  { ssr: false }
);
const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);

const SURVIVING_COLORS = [
  "#00E5A0",
  "#00B4D8",
  "#34d399",
  "#22d3ee",
  "#4ade80",
  "#38bdf8",
  "#6ee7b7",
];
const BANKRUPT_COLOR = "#EF4444";

export default function SamplePathsChart({ paths, bankrollUnits }: SamplePathsChartProps) {
  const chartData = useMemo(() => {
    if (paths.length === 0) return [];

    // Limit to 10 paths max
    const displayPaths = paths.slice(0, 10);

    // Find max path length
    const maxLen = Math.max(...displayPaths.map((p) => p.bankrollHistory.length));

    // Build data array: each row is a spin index
    return Array.from({ length: maxLen }, (_, spinIndex) => {
      const row: Record<string, number | undefined> = { spin: spinIndex };
      displayPaths.forEach((path, pathIndex) => {
        row[`path_${pathIndex}`] = path.bankrollHistory[spinIndex];
      });
      return row;
    });
  }, [paths]);

  const displayPaths = paths.slice(0, 10);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-pb-text-muted text-sm">
        No paths to display
      </div>
    );
  }

  let survivingColorIndex = 0;

  return (
    <div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.4} />
            <XAxis
              dataKey="spin"
              tick={{ fill: "#6B7280", fontSize: 11, fontFamily: "JetBrains Mono" }}
              label={{
                value: "Spins",
                position: "insideBottom",
                offset: -4,
                fill: "#6B7280",
                fontSize: 11,
              }}
              tickLine={false}
              axisLine={{ stroke: "#374151" }}
            />
            <YAxis
              tick={{ fill: "#6B7280", fontSize: 11, fontFamily: "JetBrains Mono" }}
              tickLine={false}
              axisLine={{ stroke: "#374151" }}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#F9FAFB",
              }}
              labelStyle={{ color: "#9CA3AF", marginBottom: "4px" }}
              formatter={(value) => [`${value} units`, ""]}
              labelFormatter={(label) => `Spin ${label}`}
            />
            {/* Reference line at zero (bankrupt) */}
            <ReferenceLine
              y={0}
              stroke="#EF4444"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
              label={{ value: "Bankrupt", fill: "#EF4444", fontSize: 10, position: "insideLeft" }}
            />
            {/* Reference line at starting bankroll */}
            <ReferenceLine
              y={bankrollUnits}
              stroke="#374151"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
            />

            {displayPaths.map((path, index) => {
              const color = path.wentBankrupt
                ? BANKRUPT_COLOR
                : SURVIVING_COLORS[survivingColorIndex++ % SURVIVING_COLORS.length];

              return (
                <Line
                  key={`path_${index}`}
                  type="monotone"
                  dataKey={`path_${index}`}
                  stroke={color}
                  strokeWidth={path.wentBankrupt ? 1.5 : 2}
                  dot={false}
                  strokeOpacity={path.wentBankrupt ? 0.7 : 0.85}
                  connectNulls={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs text-pb-text-muted justify-center">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-6 h-0.5 rounded"
            style={{ backgroundColor: SURVIVING_COLORS[0] }}
            aria-hidden
          />
          Surviving path
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-6 h-0.5 rounded"
            style={{ backgroundColor: BANKRUPT_COLOR, opacity: 0.7 }}
            aria-hidden
          />
          Bankrupt path
        </span>
      </div>
    </div>
  );
}
