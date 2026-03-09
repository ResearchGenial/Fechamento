"use client";

import { useEffect, useRef } from "react";
import { createChart, type IChartApi, LineSeries, AreaSeries } from "lightweight-charts";
import type { AssetQuote } from "@/lib/types";
import { formatNumber, formatPercent } from "@/lib/utils";

interface Props {
  data: AssetQuote | null;
  loading?: boolean;
  decimals?: number;
  tall?: boolean;
}

export function IntradayChart({ data, loading, decimals = 2, tall }: Props) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const chartHeight = tall ? 340 : 200;

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.data.length === 0) return;

    // Clean up previous chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const isPositive = data.changePercent >= 0;
    const lineColor = isPositive ? "#22c55e" : "#ef4444";

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartHeight,
      layout: {
        background: { color: "#ffffff" },
        textColor: "#64748b",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#f1f5f9" },
        horzLines: { color: "#f1f5f9" },
      },
      rightPriceScale: {
        borderColor: "#e2e8f0",
      },
      timeScale: {
        borderColor: "#e2e8f0",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 0,
      },
    });

    const lineSeries = chart.addSeries(AreaSeries, {
      lineColor: lineColor,
      topColor: isPositive ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)",
      bottomColor: isPositive ? "rgba(34,197,94,0.02)" : "rgba(239,68,68,0.02)",
      lineWidth: 2,
      priceFormat: {
        type: "price",
        precision: decimals,
        minMove: Math.pow(10, -decimals),
      },
    });

    const chartData = data.data.map((p) => ({
      time: p.time as import("lightweight-charts").UTCTimestamp,
      value: p.value,
    }));

    lineSeries.setData(chartData);
    chart.timeScale().fitContent();
    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, [data, decimals, chartHeight]);

  if (loading) {
    return <ChartSkeleton />;
  }

  if (!data) {
    return <ChartEmpty />;
  }

  const isPositive = data.changePercent >= 0;
  const hasPoints = data.data.length > 0;

  return (
    <div className="bg-card-bg rounded-xl border border-border p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-primary">{data.name}</h3>
        <div className="flex items-center gap-3">
          <span
            className={`text-lg font-bold ${
              isPositive ? "text-accent-green" : "text-accent-red"
            }`}
          >
            {formatNumber(data.price, decimals)}
          </span>
          <span
            className={`text-sm font-semibold ${
              isPositive ? "text-accent-green" : "text-accent-red"
            }`}
          >
            {formatPercent(data.changePercent)}
          </span>
        </div>
      </div>
      {hasPoints ? (
        <div ref={chartContainerRef} className="w-full" />
      ) : (
        <div style={{ height: chartHeight }} className="flex items-center justify-center text-muted text-sm">
          Dados intraday indisponíveis
        </div>
      )}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-card-bg rounded-xl border border-border p-4 shadow-sm animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-5 w-32 bg-gray-200 rounded" />
      </div>
      <div className="h-[200px] bg-gray-100 rounded" />
    </div>
  );
}

function ChartEmpty() {
  return (
    <div className="bg-card-bg rounded-xl border border-border p-4 shadow-sm">
      <div className="h-[230px] flex items-center justify-center text-muted text-sm">
        Sem dados disponíveis
      </div>
    </div>
  );
}
