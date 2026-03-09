"use client";

import type { MoversData } from "@/lib/types";
import { formatNumber, formatPercent } from "@/lib/utils";

interface Props {
  data: MoversData | null;
  loading?: boolean;
  stacked?: boolean;
}

export function MoversTable({ data, loading, stacked }: Props) {
  const gridClass = stacked
    ? "flex flex-col gap-4 h-full"
    : "grid grid-cols-1 md:grid-cols-2 gap-4";

  if (loading) {
    return (
      <div className={gridClass}>
        <TableSkeleton title="5 Maiores Altas" />
        <TableSkeleton title="5 Maiores Baixas" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className={gridClass}>
        <TableEmpty title="5 Maiores Altas" />
        <TableEmpty title="5 Maiores Baixas" />
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {/* Gainers */}
      <div className="bg-card-bg rounded-xl border border-border shadow-sm overflow-hidden flex-1">
        <div className="bg-emerald-700 px-4 py-2">
          <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-white">
            <div className="col-span-1">#</div>
            <div className="col-span-2">Ticker</div>
            <div className="col-span-4">Nome</div>
            <div className="col-span-3 text-right">Preço</div>
            <div className="col-span-2 text-right">% Var</div>
          </div>
        </div>
        <div className="divide-y divide-border">
          {data.gainers.map((stock, i) => (
            <div
              key={stock.ticker}
              className="grid grid-cols-12 gap-2 px-4 py-2 text-xs hover:bg-gray-50 transition-colors"
            >
              <div className="col-span-1 text-muted font-medium">{i + 1}</div>
              <div className="col-span-2 font-semibold text-primary">
                {stock.ticker}
              </div>
              <div className="col-span-4 text-muted truncate">{stock.name}</div>
              <div className="col-span-3 text-right font-medium">
                {formatNumber(stock.price)}
              </div>
              <div className="col-span-2 text-right font-bold text-accent-green">
                {formatPercent(stock.changePercent)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Losers */}
      <div className="bg-card-bg rounded-xl border border-border shadow-sm overflow-hidden flex-1">
        <div className="bg-red-700 px-4 py-2">
          <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-white">
            <div className="col-span-1">#</div>
            <div className="col-span-2">Ticker</div>
            <div className="col-span-4">Nome</div>
            <div className="col-span-3 text-right">Preço</div>
            <div className="col-span-2 text-right">% Var</div>
          </div>
        </div>
        <div className="divide-y divide-border">
          {data.losers.map((stock, i) => (
            <div
              key={stock.ticker}
              className="grid grid-cols-12 gap-2 px-4 py-2 text-xs hover:bg-gray-50 transition-colors"
            >
              <div className="col-span-1 text-muted font-medium">{i + 1}</div>
              <div className="col-span-2 font-semibold text-primary">
                {stock.ticker}
              </div>
              <div className="col-span-4 text-muted truncate">{stock.name}</div>
              <div className="col-span-3 text-right font-medium">
                {formatNumber(stock.price)}
              </div>
              <div className="col-span-2 text-right font-bold text-accent-red">
                {formatPercent(stock.changePercent)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TableSkeleton({ title: _title }: { title: string }) {
  return (
    <div className="bg-card-bg rounded-xl border border-border shadow-sm overflow-hidden animate-pulse">
      <div className="bg-gray-300 px-4 py-2">
        <div className="h-4 w-32 bg-gray-400 rounded" />
      </div>
      <div className="p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-100 rounded" />
        ))}
      </div>
    </div>
  );
}

function TableEmpty({ title }: { title: string }) {
  return (
    <div className="bg-card-bg rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="bg-primary px-4 py-2">
        <span className="text-xs font-semibold text-white">{title}</span>
      </div>
      <div className="p-8 text-center text-sm text-muted">
        Sem dados disponíveis
      </div>
    </div>
  );
}
