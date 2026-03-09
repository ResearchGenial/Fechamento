"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { YieldCurveData } from "@/lib/types";

interface Props {
  data: YieldCurveData | null;
  loading?: boolean;
}

export function YieldCurveChart({ data, loading }: Props) {
  if (loading) {
    return <ChartSkeleton />;
  }

  if (!data || data.points.length === 0) {
    return <ChartEmpty message="Sem dados da curva de juros" />;
  }

  const chartData = data.points.map((p) => ({
    tenor: p.tenor,
    Hoje: p.rateToday,
    "D-1": p.rateD3,
  }));

  return (
    <div className="bg-card-bg rounded-xl border border-border p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-primary mb-3">
        Curva de Juros Brasil
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="tenor"
            tick={{ fontSize: 11, fill: "#64748b" }}
            angle={-45}
            textAnchor="end"
            height={50}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748b" }}
            domain={["auto", "auto"]}
            tickFormatter={(v: number) => v.toFixed(2)}
          />
          <Tooltip
            formatter={(value) => `${Number(value).toFixed(2)}%`}
            contentStyle={{
              fontSize: 12,
              border: "1px solid #e2e8f0",
              borderRadius: 8,
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />
          <Line
            type="monotone"
            dataKey="Hoje"
            stroke="#0d1b3e"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#0d1b3e" }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="D-1"
            stroke="#38bdf8"
            strokeWidth={2}
            dot={{ r: 3, fill: "#38bdf8" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-card-bg rounded-xl border border-border p-4 shadow-sm animate-pulse">
      <div className="h-4 w-40 bg-gray-200 rounded mb-3" />
      <div className="h-[280px] bg-gray-100 rounded" />
    </div>
  );
}

function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="bg-card-bg rounded-xl border border-border p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-primary mb-3">
        Curva de Juros Brasil
      </h3>
      <div className="h-[280px] flex items-center justify-center text-muted text-sm">
        {message}
      </div>
    </div>
  );
}
