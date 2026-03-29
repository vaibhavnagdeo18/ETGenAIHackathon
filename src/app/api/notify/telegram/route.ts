// ──────────────────────────────────────────
// SignalOS — Telegram Notification
// Requires: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in env vars.
// Get a bot token from @BotFather on Telegram.
// Get your chat ID by messaging @userinfobot.
// ──────────────────────────────────────────

import { NextResponse, NextRequest } from 'next/server';
import { ConvergenceAlert } from '@/lib/types';

export const dynamic = 'force-dynamic';

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildTelegramMessage(alert: ConvergenceAlert): string {
  const signalLines = alert.signals
    .map(s => `  • <b>${escapeHtml(s.signalType.replace(/_/g, ' ').toUpperCase())}</b> — ${escapeHtml(s.metadata.description?.slice(0, 80) ?? '')}`)
    .join('\n');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const summary = alert.aiSummary ? `\n<b>AI Synthesis:</b>\n<i>${escapeHtml(alert.aiSummary.slice(0, 300))}…</i>\n` : '';

  return `⚡ <b>CONVERGENCE ALERT</b>

<b>${escapeHtml(alert.stock)}</b> (${escapeHtml(alert.stockSymbol)})
Confidence: <b>${alert.confidenceScore}/100</b>
Window: ${alert.windowStart} → ${alert.windowEnd}
Signals: ${alert.signals.length}

<b>Signals Detected:</b>
${signalLines}
${summary}
<a href="${appUrl}/alerts">View in SignalOS →</a>

<i>This is not financial advice.</i>`;
}

export async function POST(request: NextRequest) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured' }, { status: 501 });
  }

  let alert: ConvergenceAlert;
  try {
    alert = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: buildTelegramMessage(alert),
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Telegram API error: ${err}` }, { status: res.status });
    }

    return NextResponse.json({ sent: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
