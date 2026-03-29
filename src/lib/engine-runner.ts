import { findConvergences } from '@/lib/convergence-engine';
import { generateAISummary, generateFallbackSummary } from '@/lib/ai-summary';
import { DEMO_SIGNALS } from '@/lib/demo-data';
import { liveStore } from '@/lib/live-store';
import { persistAlerts, persistInsight } from '@/lib/firestore-store';
import { Signal, ConvergenceAlert } from '@/lib/types';

async function fireNotifications(alert: ConvergenceAlert): Promise<void> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  await Promise.allSettled([
    fetch(`${base}/api/notify/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert),
    }),
    fetch(`${base}/api/notify/telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert),
    }),
  ]);
}

export async function runConvergenceEngine(isDemo: boolean = false) {
  let signalsToProcess: Signal[] = [];

  if (isDemo) {
    signalsToProcess = DEMO_SIGNALS;
  } else {
    signalsToProcess = liveStore.getSignals();
  }

  console.log(`📡 [SignalOS] Engine Runner: Processing ${signalsToProcess.length} signals (Mode: ${isDemo ? 'Demo' : 'Live'})`);

  const convergences = findConvergences(signalsToProcess, { filterStale: !isDemo });
  console.log(`🔍 [SignalOS] Convergence Engine: Found ${convergences.length} alerts for ${signalsToProcess.length} signals.`);

  // Generate AI summaries for convergence alerts in parallel
  await Promise.all(
    convergences
      .filter(conv => !conv.aiSummary)
      .map(async conv => {
        console.log(`Generating AI Summary for ${conv.stockSymbol}...`);
        conv.aiSummary = await generateAISummary(conv);
      })
  );

  if (!isDemo) {
    // Determine which alerts are genuinely new (not already in store)
    const existingIds = new Set(liveStore.getAlerts().map(a => a.id));
    const newAlerts = convergences.filter(c => !existingIds.has(c.id));

    // Store alerts immediately so they're available to the UI without waiting for insight generation
    liveStore.addAlerts(convergences);
    await persistAlerts(convergences);

    // Fire email + Telegram — don't block the response on delivery
    if (newAlerts.length > 0) {
      Promise.allSettled(newAlerts.map(fireNotifications)).then(results => {
        results.forEach((r, i) => {
          if (r.status === 'rejected') {
            console.warn(`[SignalOS] Notification failed for ${newAlerts[i].stockSymbol}:`, r.reason);
          }
        });
      });
    }

    const stocksWithSignals = new Set(signalsToProcess.map(s => s.stockSymbol));
    const stocksWithConvergences = new Set(convergences.map(c => c.stockSymbol));

    // Single-signal stocks: use instant deterministic fallback — no Gemini call
    for (const symbol of stocksWithSignals) {
      if (!stocksWithConvergences.has(symbol)) {
        const stockSignals = signalsToProcess.filter(s => s.stockSymbol === symbol);
        const latestSignal = stockSignals.sort((a, b) => b.timestamp - a.timestamp)[0];
        const insight = generateFallbackSummary(latestSignal);
        liveStore.setStockInsight(symbol, insight);
        // Persist in background — don't await
        persistInsight(symbol, insight).catch(() => {});
      }
    }

    // Convergence stocks: store AI summary (already generated above) in background
    for (const conv of convergences) {
      liveStore.setStockInsight(conv.stockSymbol, conv.aiSummary);
      persistInsight(conv.stockSymbol, conv.aiSummary).catch(() => {});
    }
  }

  return convergences;
}
