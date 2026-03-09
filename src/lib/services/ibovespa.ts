import YahooFinance from "yahoo-finance2";
import { withCache } from "@/lib/cache";
import { IBOVESPA_TICKERS, IBOVESPA_TICKER_LIST } from "@/data/ibovespa-composition";
import type { MoversData, StockMover } from "@/lib/types";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

function toYahooTicker(b3Ticker: string): string {
  return `${b3Ticker}.SA`;
}

export async function getIbovespaMovers(): Promise<MoversData> {
  return withCache("ibovespa:movers", async () => {
    const yahooTickers = IBOVESPA_TICKER_LIST.map(toYahooTicker);

    // Fetch quotes in batches to avoid rate limiting
    const BATCH_SIZE = 20;
    const allQuotes: StockMover[] = [];

    for (let i = 0; i < yahooTickers.length; i += BATCH_SIZE) {
      const batch = yahooTickers.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map(async (ticker) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const q: any = await yahooFinance.quote(ticker);
          return {
            ticker: ticker.replace(".SA", ""),
            name:
              IBOVESPA_TICKERS[ticker.replace(".SA", "")] ??
              q?.shortName ??
              ticker,
            price: q?.regularMarketPrice ?? 0,
            changePercent: q?.regularMarketChangePercent ?? 0,
          };
        })
      );

      for (const result of results) {
        if (result.status === "fulfilled") {
          allQuotes.push(result.value);
        }
      }

      // Small delay between batches
      if (i + BATCH_SIZE < yahooTickers.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // Sort by change percent
    const sorted = allQuotes.sort(
      (a, b) => b.changePercent - a.changePercent
    );

    return {
      gainers: sorted.slice(0, 5),
      losers: sorted.slice(-5).reverse(),
      lastUpdate: new Date().toISOString(),
    };
  });
}
