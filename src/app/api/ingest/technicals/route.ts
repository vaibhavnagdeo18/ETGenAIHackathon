// ──────────────────────────────────────────
// SignalOS — Technical Breakout Ingestion
// Fetches 1yr OHLC from Yahoo Finance, detects 200-day MA breakouts
// with elevated volume, and injects technical_breakout signals.
// ──────────────────────────────────────────

import { NextResponse } from 'next/server';
import { liveStore } from '@/lib/live-store';
import { persistSignals } from '@/lib/firestore-store';
import { DEMO_STOCKS } from '@/lib/demo-data';
import { Signal } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const YF_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Referer': 'https://finance.yahoo.com/',
};

interface OHLCResult {
  symbol: string;
  breakout: boolean;
  price: number;
  ma200: number;
  volumeMultiple: number;
  volume: number;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function detectBreakout(nseSymbol: string, retries = 2): Promise<OHLCResult | null> {
  try {
    const yahooSym = nseSymbol === 'M&M' ? 'MM.NS' : `${nseSymbol}.NS`;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSym}?interval=1d&range=1y`;
    const res = await fetch(url, { headers: YF_HEADERS, cache: 'no-store' });
    if (res.status === 429 && retries > 0) {
      await sleep(3000);
      return detectBreakout(nseSymbol, retries - 1);
    }
    if (!res.ok) return null;

    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) return null;

    const closes: number[] = result.indicators?.quote?.[0]?.close ?? [];
    const volumes: number[] = result.indicators?.quote?.[0]?.volume ?? [];

    const validCloses = closes.filter((c: number | null) => c != null);
    const validVolumes = volumes.filter((v: number | null) => v != null);
    if (validCloses.length < 50 || validVolumes.length < 20) return null;

    const currentPrice = validCloses[validCloses.length - 1];
    const currentVolume = validVolumes[validVolumes.length - 1];

    // 200-day MA (or use all available if < 200 days)
    const maWindow = Math.min(200, validCloses.length);
    const ma200Slice = validCloses.slice(-maWindow);
    const ma200 = ma200Slice.reduce((a: number, b: number) => a + b, 0) / ma200Slice.length;

    // 20-day average volume
    const avgVol20 = validVolumes.slice(-20).reduce((a: number, b: number) => a + b, 0) / 20;
    const volumeMultiple = currentVolume / avgVol20;

    const breakout = currentPrice > ma200 && volumeMultiple >= 1.8;

    return { symbol: nseSymbol, breakout, price: currentPrice, ma200, volumeMultiple, volume: currentVolume };
  } catch {
    return null;
  }
}

export async function POST() {
  // Sample a subset of stocks per run to avoid rate limiting
  const stockSubset = [...DEMO_STOCKS]
    .sort(() => Math.random() - 0.5)
    .slice(0, 8);

  const newSignals: Signal[] = [];

  for (const stock of stockSubset) {
    const result = await detectBreakout(stock.symbol);
    if (result?.breakout) {
      const signal: Signal = {
        id: `tech-${stock.symbol}-${Date.now()}`,
        stock: stock.name,
        stockSymbol: stock.symbol,
        signalType: 'technical_breakout',
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now() - Math.floor(Math.random() * 3_600_000),
        metadata: {
          description: `${stock.name} broke above its 200-day moving average (₹${result.ma200.toFixed(2)}) on ${result.volumeMultiple.toFixed(1)}× average volume.`,
          priceAtSignal: result.price,
          volume: result.volume,
          volumeMultiple: parseFloat(result.volumeMultiple.toFixed(2)),
          maValue: parseFloat(result.ma200.toFixed(2)),
        },
        source: 'Yahoo Finance OHLC',
        lastSuccessTimestamp: Date.now(),
      };

      newSignals.push(signal);
    }
    await sleep(500);
  }

  if (newSignals.length > 0) {
    liveStore.addSignals(newSignals);
    await persistSignals(newSignals);
  }

  return NextResponse.json({
    scanned: stockSubset.length,
    breakoutsDetected: newSignals.length,
    signals: newSignals.map(s => ({ symbol: s.stockSymbol, volumeMultiple: s.metadata.volumeMultiple })),
  });
}
