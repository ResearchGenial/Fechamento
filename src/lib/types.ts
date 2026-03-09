export interface YieldCurvePoint {
  tenor: string;
  rateToday: number;
  rateD3: number;
}

export interface DIVariationPoint {
  tenor: string;
  variation: number; // in basis points
}

export interface IntradayPoint {
  time: number; // unix timestamp
  value: number;
}

export interface AssetQuote {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  data: IntradayPoint[];
  lastUpdate: string;
}

export interface StockMover {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
}

export interface MoversData {
  gainers: StockMover[];
  losers: StockMover[];
  lastUpdate: string;
}

export interface YieldCurveData {
  points: YieldCurvePoint[];
  lastUpdate: string;
}

export interface DIVariationData {
  points: DIVariationPoint[];
  lastUpdate: string;
}
