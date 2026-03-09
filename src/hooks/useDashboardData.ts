"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type {
  AssetQuote,
  MoversData,
  YieldCurveData,
  DIVariationData,
} from "@/lib/types";

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

interface DashboardData {
  yieldCurve: YieldCurveData | null;
  diVariation: DIVariationData | null;
  ibovespa: AssetQuote | null;
  dxy: AssetQuote | null;
  usdbrl: AssetQuote | null;
  petroleo: AssetQuote | null;
  minerio: AssetQuote | null;
  movers: MoversData | null;
}

interface UseDashboardReturn extends DashboardData {
  loading: boolean;
  lastRefresh: Date | null;
  refresh: () => void;
}

async function fetchJSON<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchAllData(): Promise<DashboardData> {
  const [yieldCurve, diVariation, ibovespa, dxy, usdbrl, petroleo, minerio, movers] =
    await Promise.all([
      fetchJSON<YieldCurveData>("/api/yield-curve"),
      fetchJSON<DIVariationData>("/api/di-variation"),
      fetchJSON<AssetQuote>("/api/assets/ibovespa"),
      fetchJSON<AssetQuote>("/api/assets/dxy"),
      fetchJSON<AssetQuote>("/api/assets/usdbrl"),
      fetchJSON<AssetQuote>("/api/assets/petroleo"),
      fetchJSON<AssetQuote>("/api/assets/minerio"),
      fetchJSON<MoversData>("/api/ibovespa/movers"),
    ]);

  return { yieldCurve, diVariation, ibovespa, dxy, usdbrl, petroleo, minerio, movers };
}

export function useDashboardData(): UseDashboardReturn {
  const [data, setData] = useState<DashboardData>({
    yieldCurve: null,
    diVariation: null,
    ibovespa: null,
    dxy: null,
    usdbrl: null,
    petroleo: null,
    minerio: null,
    movers: null,
  });
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const isMounted = useRef(true);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchAllData().then((result) => {
      if (isMounted.current) {
        setData(result);
        setLoading(false);
        setLastRefresh(new Date());
      }
    });
  }, []);

  useEffect(() => {
    isMounted.current = true;

    // Initial fetch
    let cancelled = false;
    fetchAllData().then((result) => {
      if (!cancelled) {
        setData(result);
        setLoading(false);
        setLastRefresh(new Date());
      }
    });

    // Periodic refresh
    const interval = setInterval(() => {
      fetchAllData().then((result) => {
        if (!cancelled) {
          setData(result);
          setLastRefresh(new Date());
        }
      });
    }, REFRESH_INTERVAL);

    return () => {
      cancelled = true;
      isMounted.current = false;
      clearInterval(interval);
    };
  }, []);

  return { ...data, loading, lastRefresh, refresh };
}
