"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import type { DIVariationData } from "@/lib/types";

interface Props {
  data: DIVariationData | null;
  loading?: boolean;
}

export function DIVariationChart({ data, loading }: Props) {
  if (loading) {
    return <ChartSkeleton />;
  }

  if (!data || data.points.length === 0) {
    return <ChartEmpty />;
  }

  const chartData = data.points.map((p) => ({
    tenor: p.tenor,
    variation: p.variation,
  }));

  return (
    <div className="bg-card-bg rounded-xl border border-border p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-primary mb-3">
        Variação DI Futuro (bps vs fechamento anterior)
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
        >
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
            tickFormatter={(v: number) => v.toFixed(1)}
          />
          <Tooltip
            formatter={(value) => [
              `${Number(value) > 0 ? "+" : ""}${Number(value).toFixed(2)} bps`,
              "Variação",
            ]}
            contentStyle={{
              fontSize: 12,
              border: "1px solid #e2e8f0",
              borderRadius: 8,
            }}
          />
          <Bar dataKey="variation" radius={[4, 4, 0, 0]}>
            <LabelList
              dataKey="variation"
              position="top"
              formatter={(v: unknown) => {
                const num = Number(v ?? 0);
                return `${num > 0 ? "" : ""}${num.toFixed(2).replace(".", ",")}`;
              }}
              style={{ fontSize: 10, fill: "#334155", fontWeight: 600 }}
            />
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.variation >= 0 ? "#0d1b3e" : "#0d1b3e"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-card-bg rounded-xl border border-border p-4 shadow-sm animate-pulse">
      <div className="h-4 w-56 bg-gray-200 rounded mb-3" />
      <div className="h-[280px] bg-gray-100 rounded" />
    </div>
  );
}

function ChartEmpty() {
  return (
    <div className="bg-card-bg rounded-xl border border-border p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-primary mb-3">
        Variação DI Futuro (bps vs fechamento anterior)
      </h3>
      <div className="h-[280px] flex items-center justify-center text-muted text-sm">
        Sem dados de variação
      </div>
    </div>
  );
}
