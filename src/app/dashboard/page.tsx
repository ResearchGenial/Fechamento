"use client";

import { useDashboardData } from "@/hooks/useDashboardData";
import { YieldCurveChart } from "@/components/charts/YieldCurveChart";
import { DIVariationChart } from "@/components/charts/DIVariationChart";
import { IntradayChart } from "@/components/charts/IntradayChart";
import { MoversTable } from "@/components/charts/MoversTable";
import { RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const {
    yieldCurve,
    diVariation,
    ibovespa,
    dxy,
    usdbrl,
    petroleo,
    minerio,
    movers,
    loading,
    lastRefresh,
    refresh,
  } = useDashboardData();

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div />
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-xs text-muted">
              Atualizado:{" "}
              {lastRefresh.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          <button
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-card-bg border border-border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Row 1: Yield Curve + DI Variation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <YieldCurveChart data={yieldCurve} loading={loading} />
        <DIVariationChart data={diVariation} loading={loading} />
      </div>

      {/* Row 2: Global Assets (DXY, USDBRL, Petróleo, Minério) - 2 per row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IntradayChart data={dxy} loading={loading} decimals={2} />
        <IntradayChart data={usdbrl} loading={loading} decimals={4} />
        <IntradayChart data={petroleo} loading={loading} decimals={2} />
        <IntradayChart data={minerio} loading={loading} decimals={2} />
      </div>

      {/* Row 3: Ibovespa + Top Movers side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4 items-stretch">
        <IntradayChart data={ibovespa} loading={loading} decimals={0} tall />
        <MoversTable data={movers} loading={loading} stacked />
      </div>
    </div>
  );
}
