// ──────────────────────────────────────────
// SignalOS — Live Price API (Yahoo Finance)
// Fetches real-time NSE stock prices.
// ──────────────────────────────────────────

import { NextResponse, NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';

// Yahoo Finance uses .NS suffix for NSE stocks.
// Special mappings for symbols that differ from NSE convention.
const SYMBOL_OVERRIDES: Record<string, string> = {
  'M&M': 'MM.NS',
  'BAJAJ-AUTO': 'BAJAJ-AUTO.NS', // works as-is but explicit for clarity
};

function toYahooSymbol(nseSymbol: string): string {
  return SYMBOL_OVERRIDES[nseSymbol] ?? `${nseSymbol}.NS`;
}

function fromYahooSymbol(yahooSymbol: string): string {
  // Reverse-map special cases, then strip .NS
  const override = Object.entries(SYMBOL_OVERRIDES).find(([, v]) => v === yahooSymbol);
  if (override) return override[0];
  return yahooSymbol.replace(/\.NS$/, '');
}

export interface LivePriceData {
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
  marketState: string; // 'REGULAR' | 'PRE' | 'POST' | 'CLOSED'
}

// Module-level in-memory cache (survives across requests within same Node process)
let priceCache: { data: Record<string, LivePriceData>; ts: number } | null = null;
const CACHE_TTL_MS = 60_000; // 60 seconds — reduces Yahoo Finance rate-limit hits
let nextAllowedFetchAt = 0; // backoff: don't retry before this timestamp

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const symbolsParam = searchParams.get('symbols');

  if (!symbolsParam) {
    return NextResponse.json({ error: 'symbols query param required' }, { status: 400 });
  }

  const nseSymbols = symbolsParam.split(',').filter(Boolean);

  // Return cached data if still fresh, or if we're in a backoff window
  if (priceCache && (Date.now() - priceCache.ts < CACHE_TTL_MS || Date.now() < nextAllowedFetchAt)) {
    const result: Record<string, LivePriceData> = {};
    for (const s of nseSymbols) {
      if (priceCache.data[s]) result[s] = priceCache.data[s];
    }
    return NextResponse.json(result);
  }

  try {
    const yahooSymbols = nseSymbols.map(toYahooSymbol).join(',');
    const fields = 'regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketTime,marketState';
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(yahooSymbols)}&fields=${fields}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://finance.yahoo.com/',
        'Origin': 'https://finance.yahoo.com',
      },
      // Don't use Next.js data cache for this endpoint
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 429) {
        // Back off for 2 minutes on rate-limit
        nextAllowedFetchAt = Date.now() + 120_000;
      }
      throw new Error(`Yahoo Finance responded with HTTP ${response.status}`);
    }

    const json = await response.json();
    const quotes: Record<string, unknown>[] = json?.quoteResponse?.result ?? [];

    const freshData: Record<string, LivePriceData> = {};

    for (const quote of quotes) {
      const yahooSym = quote.symbol as string;
      const nseSym = fromYahooSymbol(yahooSym);

      const price = quote.regularMarketPrice as number | undefined;
      if (price == null) continue;

      freshData[nseSym] = {
        price,
        change: (quote.regularMarketChange as number | undefined) ?? 0,
        changePercent: (quote.regularMarketChangePercent as number | undefined) ?? 0,
        timestamp: quote.regularMarketTime
          ? (quote.regularMarketTime as number) * 1000
          : Date.now(),
        marketState: (quote.marketState as string | undefined) ?? 'CLOSED',
      };
    }

    priceCache = { data: freshData, ts: Date.now() };

    const result: Record<string, LivePriceData> = {};
    for (const s of nseSymbols) {
      if (freshData[s]) result[s] = freshData[s];
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('[SignalOS] Yahoo Finance fetch error:', error);

    // Return stale cache on error rather than nothing
    if (priceCache) {
      const result: Record<string, LivePriceData> = {};
      for (const s of nseSymbols) {
        if (priceCache.data[s]) result[s] = priceCache.data[s];
      }
      return NextResponse.json(result);
    }

    // Return empty — AppContext falls back to demo prices
    return NextResponse.json({});
  }
}
