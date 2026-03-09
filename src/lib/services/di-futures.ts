import { withCache } from "@/lib/cache";
import type { YieldCurveData, DIVariationData } from "@/lib/types";

// DI1 contract symbols for Jan maturities (F = January)
// Source: https://cotacao.b3.com.br/mds/api/v1/DerivativeQuotation/DI1
const DI_CONTRACTS = [
  { tenor: "Jan/27", symbol: "DI1F27" },
  { tenor: "Jan/28", symbol: "DI1F28" },
  { tenor: "Jan/29", symbol: "DI1F29" },
  { tenor: "Jan/30", symbol: "DI1F30" },
  { tenor: "Jan/31", symbol: "DI1F31" },
  { tenor: "Jan/32", symbol: "DI1F32" },
  { tenor: "Jan/33", symbol: "DI1F33" },
  { tenor: "Jan/34", symbol: "DI1F34" },
  { tenor: "Jan/35", symbol: "DI1F35" },
];

const B3_API_URL = "https://cotacao.b3.com.br/mds/api/v1/DerivativeQuotation/DI1";

interface B3Security {
  symb: string;
  SctyQtn: {
    curPrc?: number;
    prvsDayAdjstmntPric: number;
    opngPric?: number;
  };
  asset: {
    AsstSummry: {
      mtrtyCode: string;
    };
  };
}

interface B3Response {
  Scty: B3Security[];
}

async function fetchDIData(): Promise<Map<string, { rate: number; prevRate: number }>> {
  const res = await fetch(B3_API_URL, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`B3 API returned ${res.status}`);

  const data: B3Response = await res.json();
  const map = new Map<string, { rate: number; prevRate: number }>();

  for (const s of data.Scty) {
    const rate = s.SctyQtn.curPrc ?? s.SctyQtn.prvsDayAdjstmntPric;
    const prevRate = s.SctyQtn.prvsDayAdjstmntPric;
    map.set(s.symb, { rate, prevRate });
  }

  return map;
}

export async function getYieldCurve(): Promise<YieldCurveData> {
  return withCache("yield-curve", async () => {
    const diData = await fetchDIData();

    const points = DI_CONTRACTS.map((c) => {
      const d = diData.get(c.symbol);
      return {
        tenor: c.tenor,
        rateToday: d ? Math.round(d.rate * 1000) / 1000 : 0,
        rateD3: d ? Math.round(d.prevRate * 1000) / 1000 : 0,
      };
    });

    return {
      points,
      lastUpdate: new Date().toISOString(),
    };
  });
}

export async function getDIVariation(): Promise<DIVariationData> {
  return withCache("di-variation", async () => {
    const diData = await fetchDIData();

    const points = DI_CONTRACTS.map((c) => {
      const d = diData.get(c.symbol);
      // Variation in bps: (current - previous) * 100
      const variation = d ? Math.round((d.rate - d.prevRate) * 1000) / 10 : 0;
      return {
        tenor: c.tenor,
        variation,
      };
    });

    return {
      points,
      lastUpdate: new Date().toISOString(),
    };
  });
}
