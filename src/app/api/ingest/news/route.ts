// ──────────────────────────────────────────
// SignalOS — News Sentiment Ingestion
// Fetches Google News RSS for NSE stocks, scores headlines
// using positive/negative keyword lists, injects news_sentiment signals.
// ──────────────────────────────────────────

import { NextResponse } from 'next/server';
import { liveStore } from '@/lib/live-store';
import { persistSignals } from '@/lib/firestore-store';
import { DEMO_STOCKS } from '@/lib/demo-data';
import { Signal } from '@/lib/types';

export const dynamic = 'force-dynamic';

const POSITIVE_WORDS = [
  'surge', 'jump', 'soar', 'rally', 'gain', 'rise', 'record', 'profit',
  'growth', 'beat', 'strong', 'outperform', 'upgrade', 'buy', 'bullish',
  'expansion', 'win', 'deal', 'partnership', 'acquisition', 'approved',
  'dividend', 'order', 'contract', 'launch', 'positive', 'up',
];

const NEGATIVE_WORDS = [
  'fall', 'drop', 'plunge', 'decline', 'loss', 'weak', 'miss', 'downgrade',
  'sell', 'bearish', 'concern', 'risk', 'probe', 'penalty', 'default',
  'debt', 'down', 'cut', 'delay', 'reject', 'negative', 'fraud', 'scam',
];

function scoreHeadline(headline: string): { sentiment: 'positive' | 'negative' | 'neutral'; score: number } {
  const lower = headline.toLowerCase();
  let score = 0;
  POSITIVE_WORDS.forEach(w => { if (lower.includes(w)) score++; });
  NEGATIVE_WORDS.forEach(w => { if (lower.includes(w)) score--; });
  if (score > 0) return { sentiment: 'positive', score };
  if (score < 0) return { sentiment: 'negative', score };
  return { sentiment: 'neutral', score };
}

function parseRSSItems(xml: string): { title: string; link: string; pubDate: string }[] {
  const items: { title: string; link: string; pubDate: string }[] = [];
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
  for (const match of itemMatches) {
    const block = match[1];
    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
      ?? block.match(/<title>(.*?)<\/title>/)?.[1]
      ?? '';
    const link = block.match(/<link>(.*?)<\/link>/)?.[1] ?? '';
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? '';
    if (title) items.push({ title, link, pubDate });
  }
  return items.slice(0, 5);
}

async function fetchNewsSentiment(stock: { name: string; symbol: string }): Promise<Signal | null> {
  try {
    const query = encodeURIComponent(`${stock.name} NSE stock`);
    const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=en-IN&gl=IN&ceid=IN:en`;

    const res = await fetch(rssUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;

    const xml = await res.text();
    const items = parseRSSItems(xml);
    if (items.length === 0) return null;

    // Score all headlines, pick the strongest signal
    const scored = items
      .map(item => ({ ...item, ...scoreHeadline(item.title) }))
      .filter(i => i.sentiment !== 'neutral')
      .sort((a, b) => Math.abs(b.score) - Math.abs(a.score));

    if (scored.length === 0) return null;

    const best = scored[0];
    // Only emit a signal for clearly positive news (negative sentiment has different use cases)
    if (best.sentiment !== 'positive') return null;

    return {
      id: `news-${stock.symbol}-${Date.now()}`,
      stock: stock.name,
      stockSymbol: stock.symbol,
      signalType: 'news_sentiment',
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now() - Math.floor(Math.random() * 7_200_000),
      metadata: {
        description: `Positive news sentiment detected: "${best.title.slice(0, 100)}"`,
        sentiment: best.sentiment,
        newsHeadline: best.title.slice(0, 120),
        newsSource: 'Google News',
      },
      source: 'Google News RSS',
      lastSuccessTimestamp: Date.now(),
    };
  } catch {
    return null;
  }
}

export async function POST() {
  const stockSubset = [...DEMO_STOCKS]
    .sort(() => Math.random() - 0.5)
    .slice(0, 6);

  const results = await Promise.allSettled(
    stockSubset.map(s => fetchNewsSentiment(s))
  );

  const newSignals: Signal[] = results
    .map(r => (r.status === 'fulfilled' ? r.value : null))
    .filter((s): s is Signal => s !== null);

  if (newSignals.length > 0) {
    liveStore.addSignals(newSignals);
    await persistSignals(newSignals);
  }

  return NextResponse.json({
    scanned: stockSubset.length,
    positiveSignals: newSignals.length,
    signals: newSignals.map(s => ({ symbol: s.stockSymbol, headline: s.metadata.newsHeadline })),
  });
}
