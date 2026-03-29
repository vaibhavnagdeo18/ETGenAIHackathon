// ──────────────────────────────────────────
// SignalOS — Email Notification (Resend)
// Requires: RESEND_API_KEY and ALERT_EMAIL_TO in env vars.
// ──────────────────────────────────────────

import { NextResponse, NextRequest } from 'next/server';
import { ConvergenceAlert } from '@/lib/types';

export const dynamic = 'force-dynamic';

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildEmailHTML(alert: ConvergenceAlert): string {
  const signalList = alert.signals
    .map(s => `<li style="margin-bottom:4px"><b>${escapeHtml(s.signalType.replace('_', ' ').toUpperCase())}</b> — ${escapeHtml(s.metadata.description)}</li>`)
    .join('');

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#f1f5f9;padding:32px;border-radius:12px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
        <span style="font-size:24px">⚡</span>
        <span style="font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.2em;color:#818cf8">SignalOS · Convergence Alert</span>
      </div>

      <h1 style="margin:0 0 4px;font-size:28px;font-weight:900;color:#ffffff">${alert.stock}</h1>
      <p style="margin:0 0 24px;color:#94a3b8;font-size:14px">${alert.stockSymbol} · ${alert.signals.length} signals · ${alert.windowStart} → ${alert.windowEnd}</p>

      <div style="background:#1e293b;border-radius:8px;padding:20px;margin-bottom:20px">
        <div style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.2em;color:#818cf8;margin-bottom:12px">Confidence Score</div>
        <div style="font-size:42px;font-weight:900;color:#818cf8">${alert.confidenceScore}<span style="font-size:20px;color:#64748b">/100</span></div>
      </div>

      <div style="background:#1e293b;border-radius:8px;padding:20px;margin-bottom:20px">
        <div style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.2em;color:#818cf8;margin-bottom:12px">Signals Detected</div>
        <ul style="margin:0;padding-left:20px;color:#cbd5e1;font-size:13px;line-height:1.6">${signalList}</ul>
      </div>

      ${alert.aiSummary ? `
      <div style="background:#1e293b;border-radius:8px;padding:20px;margin-bottom:20px">
        <div style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.2em;color:#818cf8;margin-bottom:12px">AI Synthesis</div>
        <p style="margin:0;color:#cbd5e1;font-size:13px;line-height:1.7">${alert.aiSummary}</p>
      </div>` : ''}

      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/alerts" style="display:inline-block;background:#6366f1;color:#fff;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px">
        View in SignalOS →
      </a>

      <p style="margin-top:24px;font-size:11px;color:#475569;line-height:1.6">
        This is an automated alert from SignalOS. This is not financial advice. Always do your own research before making investment decisions.
      </p>
    </div>
  `;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.ALERT_EMAIL_TO;

  if (!apiKey || !toEmail) {
    return NextResponse.json({ error: 'RESEND_API_KEY or ALERT_EMAIL_TO not configured' }, { status: 501 });
  }

  let alert: ConvergenceAlert;
  try {
    alert = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
        to: [toEmail],
        subject: `⚡ Convergence Alert: ${alert.stock} (${alert.confidenceScore}/100 confidence)`,
        html: buildEmailHTML(alert),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Resend API error: ${err}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ sent: true, id: data.id });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
