import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    email: !!(process.env.RESEND_API_KEY && process.env.ALERT_EMAIL_TO),
    telegram: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
    emailTo: process.env.ALERT_EMAIL_TO ?? null,
  });
}
