import YahooFinance from "yahoo-finance2";
import { withCache } from "@/lib/cache";
import type { AssetQuote, IntradayPoint } from "@/lib/types";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

const YAHOO_ASSETS: Record<string, { yahooTicker: string; name: string }> = {
  ibovespa: { yahooTicker: "^BVSP", name: "Ibovespa" },
  dxy: { yahooTicker: "DX-Y.NYB", name: "DXY Curncy" },
  usdbrl: { yahooTicker: "USDBRL=X", name: "USDBRL Index" },
  petroleo: { yahooTicker: "BZ=F", name: "Petróleo" },
};

async function fetchIntradayFromYahoo(
  yahooTicker: string
): Promise<{ points: IntradayPoint[]; price: number; prevClose: number }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = await yahooFinance.chart(yahooTicker, {
    period1: getMarketOpenToday(),
    interval: "5m" as const,
  });

  const quotes = result?.quotes ?? [];
  const points: IntradayPoint[] = quotes
    .filter((q: { close?: number | null; date: Date }) => q.close != null)
    .map((q: { close: number; date: Date }) => ({
      time: Math.floor(new Date(q.date).getTime() / 1000),
      value: q.close,
    }));

  const meta = result?.meta;
  const price = meta?.regularMarketPrice ?? points[points.length - 1]?.value ?? 0;
  const prevClose = meta?.chartPreviousClose ?? meta?.previousClose ?? price;

  return { points, price, prevClose };
}

// ----- SGX Iron Ore 62% Fe CFR via Sina Finance -----
// Sina code hf_FEF returns: open,,close?,settle?,high,low,time,prevSettle,prevClose,volume,...,date,name,OI
// Price is already in USD/ton

async function fetchIronOre62FeCFR(): Promise<{
  points: IntradayPoint[];
  price: number;
  prevClose: number;
}> {
  // Fetch real-time price from Sina (SGX 62% Fe CFR)
  const res = await fetch("https://hq.sinajs.cn/list=hf_FEF", {
    headers: { Referer: "https://finance.sina.com.cn" },
  });
  if (!res.ok) throw new Error(`Sina API error: ${res.status}`);

  const text = await res.text();
  const match = text.match(/="(.+)"/);
  if (!match) throw new Error("Could not parse Sina iron ore data");

  const fields = match[1].split(",");
  // fields[2] = current/close price, fields[8] = previous close
  const price = parseFloat(fields[2]) || parseFloat(fields[0]);
  const prevClose = parseFloat(fields[8]);

  // No intraday minute data available for SGX from free APIs
  // Use DCE intraday as visual proxy (highly correlated, rescaled to match SGX price)
  let points: IntradayPoint[] = [];
  try {
    points = await fetchDCEIntradayRescaled(price, prevClose);
  } catch {
    // If DCE data unavailable, show without intraday chart
  }

  return { points, price, prevClose };
}

// Fetch DCE intraday and rescale to match SGX price level
async function fetchDCEIntradayRescaled(
  sgxPrice: number,
  sgxPrevClose: number
): Promise<IntradayPoint[]> {
  const url =
    `https://push2his.eastmoney.com/api/qt/stock/trends2/get` +
    `?secid=114.IM` +
    `&fields1=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13` +
    `&fields2=f51,f52,f53,f54,f55,f56,f57,f58` +
    `&iscr=0&ndays=1`;

  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) return [];

  const json = await res.json();
  const { preClose: dcePreClose, trends } = json.data;
  if (!trends?.length) return [];

  // Rescale: map DCE % change at each point to SGX price level
  return trends.map((line: string) => {
    const parts = line.split(",");
    const dt = new Date(parts[0].replace(" ", "T") + "+08:00");
    const dcePrice = parseFloat(parts[2]);
    const dcePctChange = (dcePrice - dcePreClose) / dcePreClose;
    return {
      time: Math.floor(dt.getTime() / 1000),
      value: sgxPrevClose * (1 + dcePctChange),
    };
  });
}

function getMarketOpenToday(): Date {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  today.setHours(0, 0, 0, 0);
  return today;
}

export async function getAssetQuote(assetKey: string): Promise<AssetQuote> {
  if (assetKey === "minerio") {
    return withCache("asset:minerio", async () => {
      const { points, price, prevClose } = await fetchIronOre62FeCFR();
      const change = price - prevClose;
      const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;
      return {
        ticker: "SGX.FEF",
        name: "Minério 62% Fe CFR",
        price,
        change,
        changePercent,
        data: points,
        lastUpdate: new Date().toISOString(),
      };
    });
  }

  const config = YAHOO_ASSETS[assetKey];
  if (!config) {
    throw new Error(`Unknown asset: ${assetKey}`);
  }

  return withCache(`asset:${assetKey}`, async () => {
    const { points, price, prevClose } = await fetchIntradayFromYahoo(
      config.yahooTicker
    );

    const change = price - prevClose;
    const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;

    return {
      ticker: config.yahooTicker,
      name: config.name,
      price,
      change,
      changePercent,
      data: points,
      lastUpdate: new Date().toISOString(),
    };
  });
}

export const VALID_ASSETS = [...Object.keys(YAHOO_ASSETS), "minerio"];
