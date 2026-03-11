"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { SimulationOutput } from "@/lib/roulette/simulationTypes";

interface SimulationChartProps {
  output: SimulationOutput;
}

type TabType = "distribution" | "paths";

const PATH_COLORS = [
  "#00E5A0",
  "#00B4D8",
  "#60A5FA",
  "#A78BFA",
  "#F472B6",
  "#FB923C",
  "#FBBF24",
  "#34D399",
  "#38BDF8",
  "#C084FC",
];

export default function SimulationChart({ output }: SimulationChartProps) {
  const [activeTab, setActiveTab] = useState<TabType>("distribution");

  const histogramData = output.histogram.map((bucket) => ({
    range:
      bucket.rangeStart >= 0
        ? `+$${Math.abs(Math.round(bucket.rangeStart))}`
        : `-$${Math.abs(Math.round(bucket.rangeStart))}`,
    count: bucket.count,
    isProfit: bucket.rangeStart >= 0,
  }));

  // Build sample paths data — take first 10 sample paths, subsample to 100 points max
  const samplePaths = output.samplePathIndices.slice(0, 10).map((idx, i) => ({
    session: output.sessions[idx],
    color: output.sessions[idx].wentBankrupt
      ? "#EF4444"
      : PATH_COLORS[i % PATH_COLORS.length],
  }));

  const maxPathLength = Math.max(
    ...samplePaths.map((p) => p.session.bankrollHistory.length),
  );
  const subsampleStep = Math.max(1, Math.floor(maxPathLength / 100));

  const pathsData: Record<string, number>[] = [];
  for (let i = 0; i < maxPathLength; i += subsampleStep) {
    const point: Record<string, number> = { spin: i };
    samplePaths.forEach((p, j) => {
      point[`path${j}`] = p.session.bankrollHistory[i] ?? 0;
    });
    pathsData.push(point);
  }

  const tabClass = (tab: TabType) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
      activeTab === tab
        ? "bg-pb-accent text-pb-bg-primary"
        : "text-pb-text-secondary hover:text-pb-text-primary"
    }`;

  const tooltipStyle = {
    backgroundColor: "#1F2937",
    border: "1px solid #374151",
    borderRadius: "8px",
    color: "#F9FAFB",
    fontSize: "12px",
  };

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex gap-2">
        <button
          type="button"
          className={tabClass("distribution")}
          onClick={() => setActiveTab("distribution")}
        >
          Distribution
        </button>
        <button
          type="button"
          className={tabClass("paths")}
          onClick={() => setActiveTab("paths")}
        >
          Sample Paths
        </button>
      </div>

      <div className="h-72 w-full">
        {activeTab === "distribution" ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={histogramData}
              margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                vertical={false}
              />
              <XAxis
                dataKey="range"
                tick={{ fill: "#6B7280", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "#6B7280", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `${v}`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                formatter={(value) => [
                  (value as number).toLocaleString(),
                  "Sessions",
                ]}
              />
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {histogramData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isProfit ? "#00E5A0" : "#EF4444"}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={pathsData}
              margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="spin"
                tick={{ fill: "#6B7280", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                label={{
                  value: "Spins",
                  position: "insideBottomRight",
                  offset: -4,
                  fill: "#6B7280",
                  fontSize: 10,
                }}
              />
              <YAxis
                tick={{ fill: "#6B7280", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `$${v.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                cursor={{ stroke: "#374151" }}
                formatter={(value) => [
                  `$${(value as number).toFixed(0)}`,
                  "Bankroll",
                ]}
              />
              {samplePaths.map((p, i) => (
                <Line
                  key={`path${i}`}
                  type="monotone"
                  dataKey={`path${i}`}
                  stroke={p.color}
                  strokeWidth={p.session.wentBankrupt ? 1 : 1.5}
                  dot={false}
                  strokeOpacity={0.8}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <p className="text-xs text-pb-text-muted text-center">
        {activeTab === "distribution"
          ? "Green bars = sessions that ended in profit. Red bars = sessions that ended in a loss."
          : "Each line shows one session's bankroll over time. Red lines = sessions that went bankrupt."}
      </p>
    </div>
  );
}
