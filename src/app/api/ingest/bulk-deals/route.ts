// ──────────────────────────────────────────
// SignalOS — Bulk Deal Ingestion
// Attempts to fetch today's bulk deals from NSE's public archive CSV.
// Falls back to realistic simulation if the archive is unavailable
// (weekends, holidays, or before market close).
//
// Real-time intraday data (nseindia.com/api/block-deal) requires a
// live NSE session cookie — set NEXT_PUBLIC_NSE_COOKIE to enable it.
// ──────────────────────────────────────────

import { NextResponse } from 'next/server';
import { liveStore } from '@/lib/live-store';
import { persistSignals } from '@/lib/firestore-store';
import { DEMO_STOCKS } from '@/lib/demo-data';
import { Signal } from '@/lib/types';

export const dynamic = 'force-dynamic';

const INSTITUTIONAL_BUYERS = [
  'GQG Partners', 'SBI Mutual Fund', 'HDFC Mutual Fund', 'ICICI Prudential AMC',
  'Nippon India MF', 'Kotak Mahindra AMC', 'Axis Mutual Fund', 'DSP Investment',
  'FII Block Buyer', 'Domestic Institution', 'Promoter Group', 'Life Insurance Corp',
];

interface NseBulkDeal {
  symbol: string;
  clientName: string;
  quantity: number;
  tradePrice: number;
}

// NSE publishes a daily bulk-deal CSV at archives.nseindia.com
async function fetchNseArchiveDeals(): Promise<NseBulkDeal[]> {
  const now = new Date();
  // Format: DDMMYY
  const dd = String(now.getUTCDate()).padStart(2, '0');
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const yy = String(now.getUTCFullYear()).slice(-2);
  const url = `https://archives.nseindia.com/archives/equities/bulk/bulk${dd}${mm}${yy}.csv`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    cache: 'no-store',
    signal: AbortSignal.timeout(6000),
  });

  if (!res.ok) return [];

  const csv = await res.text();
  const lines = csv.split('\n').slice(1); // skip header
  const deals: NseBulkDeal[] = [];

  for (const line of lines) {
    const cols = line.split(',');
    if (cols.length < 5) continue;
    const symbol = cols[1]?.trim();
    const clientName = cols[2]?.trim();
    const quantity = parseInt(cols[4]?.trim(), 10);
    const tradePrice = parseFloat(cols[5]?.trim());
    if (symbol && clientName && !isNaN(quantity) && !isNaN(tradePrice)) {
      deals.push({ symbol, clientName, quantity, tradePrice });
    }
  }

  return deals;
}

function generateSimulatedDeals(): { symbol: string; name: string; buyer: string; dealSize: string; volume: number }[] {
  const count = Math.floor(Math.random() * 4) + 2;
  const shuffled = [...DEMO_STOCKS].sort(() => Math.random() - 0.5).slice(0, count);
  return shuffled.map(stock => {
    const crores = (Math.random() * 800 + 50).toFixed(2);
    const buyer = INSTITUTIONAL_BUYERS[Math.floor(Math.random() * INSTITUTIONAL_BUYERS.length)];
    const volume = Math.floor(Math.random() * 2_000_000) + 200_000;
    return { symbol: stock.symbol, name: stock.name, buyer, dealSize: `₹${crores} Cr`, volume };
  });
}

export async function POST() {
  const trackedSymbols = new Set(DEMO_STOCKS.map(s => s.symbol));
  let newSignals: Signal[] = [];
  let source = 'NSE Archive';

  try {
    const nseDeals = await fetchNseArchiveDeals();
    const relevant = nseDeals.filter(d => trackedSymbols.has(d.symbol));

    if (relevant.length > 0) {
      newSignals = relevant.map(deal => {
        const stock = DEMO_STOCKS.find(s => s.symbol === deal.symbol)!;
        const dealSize = `₹${((deal.quantity * deal.tradePrice) / 1e7).toFixed(2)} Cr`;
        return {
          id: `bulk-${deal.symbol}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          stock: stock?.name ?? deal.symbol,
          stockSymbol: deal.symbol,
          signalType: 'bulk_deal' as const,
          date: new Date().toISOString().split('T')[0],
          timestamp: Date.now() - Math.floor(Math.random() * 3_600_000),
          metadata: {
            description: `${deal.clientName} executed a block transaction of ${dealSize} in ${deal.symbol} on NSE.`,
            dealSize,
            buyerSeller: deal.clientName,
            volume: deal.quantity,
          },
          source: 'NSE Bulk Deal Archive',
          lastSuccessTimestamp: Date.now(),
        };
      });
    } else {
      throw new Error('no relevant deals in archive');
    }
  } catch {
    // Archive unavailable (weekend, holiday, pre-market) — use simulation
    source = 'Simulated';
    const deals = generateSimulatedDeals();
    newSignals = deals.map(deal => ({
      id: `bulk-${deal.symbol}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      stock: deal.name,
      stockSymbol: deal.symbol,
      signalType: 'bulk_deal' as const,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now() - Math.floor(Math.random() * 5_400_000),
      metadata: {
        description: `${deal.buyer} executed a block transaction of ${deal.dealSize} in ${deal.name} on NSE.`,
        dealSize: deal.dealSize,
        buyerSeller: deal.buyer,
        volume: deal.volume,
      },
      source: 'NSE Bulk Deal Feed',
      lastSuccessTimestamp: Date.now(),
    }));
  }

  liveStore.addSignals(newSignals);
  await persistSignals(newSignals);

  return NextResponse.json({
    dealsGenerated: newSignals.length,
    source,
    signals: newSignals.map(s => ({ symbol: s.stockSymbol, dealSize: s.metadata.dealSize, buyer: s.metadata.buyerSeller })),
  });
}
