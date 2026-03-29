// ──────────────────────────────────────────
// SignalOS — Server Instrumentation
// Runs once on server startup. Starts the background ingestion loop
// so signals are collected automatically without manual triggers.
// ──────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

const INTERVALS = {
  technicals: 15 * 60 * 1000,
  news:       10 * 60 * 1000,
  bulkDeals:  20 * 60 * 1000,
};

async function post(path: string) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, { method: 'POST' });
    if (!res.ok) console.warn(`[SignalOS Scheduler] ${path} responded ${res.status}`);
  } catch (err) {
    console.warn(`[SignalOS Scheduler] ${path} failed:`, err);
  }
}

async function runCycle(label: string, ingestPath: string) {
  console.log(`[SignalOS Scheduler] Running ${label} ingest…`);
  await post(ingestPath);
  await post('/api/convergence?demo=false');
  console.log(`[SignalOS Scheduler] ${label} cycle complete.`);
}

let started = false;

function startIngestionLoop() {
  if (started) return;
  started = true;

  setTimeout(() => runCycle('Technicals', '/api/ingest/technicals'), 10_000);
  setTimeout(() => runCycle('News',        '/api/ingest/news'),       30_000);
  setTimeout(() => runCycle('Bulk Deals',  '/api/ingest/bulk-deals'), 50_000);

  setInterval(() => runCycle('Technicals', '/api/ingest/technicals'), INTERVALS.technicals);
  setInterval(() => runCycle('News',       '/api/ingest/news'),       INTERVALS.news);
  setInterval(() => runCycle('Bulk Deals', '/api/ingest/bulk-deals'), INTERVALS.bulkDeals);

  console.log('[SignalOS Scheduler] Background ingestion loop started.');
}

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  startIngestionLoop();
}
