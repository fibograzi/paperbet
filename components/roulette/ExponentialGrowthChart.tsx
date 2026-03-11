"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ExponentialGrowthChartProps {
  baseBet: number;
  maxSteps: number;
  strategyId: "martingale" | "fibonacci";
}

function fibonacci(n: number): number {
  if (n <= 0) return 1;
  if (n === 1) return 1;
  let a = 1, b = 1;
  for (let i = 2; i <= n; i++) {
    const t = a + b;
    a = b;
    b = t;
  }
  return b;
}

export default function ExponentialGrowthChart({
  baseBet,
  maxSteps,
  strategyId,
}: ExponentialGrowthChartProps) {
  const data = Array.from({ length: maxSteps }, (_, i) => {
    const multiplier =
      strategyId === "martingale" ? Math.pow(2, i) : fibonacci(i);
    return {
      step: i + 1,
      bet: baseBet * multiplier,
    };
  });

  const tooltipStyle = {
    backgroundColor: "#1F2937",
    border: "1px solid #374151",
    borderRadius: "8px",
    color: "#F9FAFB",
    fontSize: "12px",
  };

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 8 }}>
          <defs>
            <linearGradient id="betGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00E5A0" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00E5A0" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="step"
            tick={{ fill: "#6B7280", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            label={{
              value: "Consecutive Losses",
              position: "insideBottomRight",
              offset: -4,
              fill: "#6B7280",
              fontSize: 10,
            }}
          />
          <YAxis
            scale={strategyId === "martingale" ? "log" : "auto"}
            domain={strategyId === "martingale" ? ["auto", "auto"] : undefined}
            allowDataOverflow
            tick={{ fill: "#6B7280", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) =>
              `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toFixed(0)}`
            }
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => [`$${(value as number).toFixed(2)}`, "Bet Size"]}
            labelFormatter={(label) => `Loss #${label}`}
          />
          <Area
            type="monotone"
            dataKey="bet"
            stroke="#00E5A0"
            strokeWidth={2}
            fill="url(#betGradient)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
