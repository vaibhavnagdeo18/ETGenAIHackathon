# SignalOS — Convergence-Based Stock Intelligence

> A real-time NSE stock intelligence platform that surfaces high-probability trading opportunities by detecting when multiple independent signals converge on the same stock within a 7-day window. Powered by Google Gemini 2.5 Flash AI, Firebase, and live data ingestion from NSE, Yahoo Finance, and Google News.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Pages](#pages)
- [API Routes](#api-routes)
- [Convergence Engine](#convergence-engine)
- [AI Integration (Gemini)](#ai-integration-gemini)
- [Data Ingestion Pipelines](#data-ingestion-pipelines)
- [Notification System](#notification-system)
- [Firebase Integration](#firebase-integration)
- [Demo Mode vs Live Mode](#demo-mode-vs-live-mode)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)

---

## Overview

SignalOS monitors 40+ high-volume NSE equities across 4 distinct signal types:

| Signal Type | Source | What It Detects |
|---|---|---|
| **Bulk Deal** | NSE Archive | Large institutional block transactions (₹ Cr) |
| **Insider Trading** | NSE Archive / Simulated | Key management personnel buying |
| **Technical Breakout** | Yahoo Finance OHLC | Price breaking above 200-day MA on 1.8× volume |
| **News Sentiment** | Google News RSS | Positive news headlines scored via keyword analysis |

When **2 or more independent signal types** fire on the same stock within a **7-day sliding window**, the convergence engine triggers an alert with:

- A **confidence score (0–100)** based on signal count, diversity, recency, and time-tightness
- A **3-sentence AI summary** from Gemini 2.5 Flash (what happened, why it matters, historical precedent)
- **Real-time notifications** via email (Resend) and Telegram

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.1 (App Router, TypeScript) |
| UI | React 19.2.4, Tailwind CSS 4, Framer Motion 12 |
| Icons | Lucide React, Custom PNG icons |
| AI | Google Gemini 2.5 Flash (primary), 2.0 Flash, 1.5 Flash (fallbacks) |
| Database | Firebase Firestore (persistence), In-memory LiveStore (dev) |
| Email | Resend API |
| Messaging | Telegram Bot API |
| Prices | Yahoo Finance OHLC API |
| News | Google News RSS |
| Bulk Deals | NSE Archive CSV |
| Components | shadcn/ui (Button, Card, Badge, Switch, Tooltip) |
| Animation | Framer Motion (transitions, layout, stagger, counters) |
| Fonts | Raleway (Google Fonts) |

---

## Features

- **4-Signal Convergence Detection** — Bulk deal + Insider trading + Technical breakout + News sentiment
- **Sliding 7-Day Window** — Configurable signal clustering with deduplication
- **Confidence Scoring (0–100)** — Signal count (40pts) + type diversity (30pts) + recency (20pts) + tightness (10pts)
- **Correlation Deduplication** — Removes same-actor signals to avoid double-counting (e.g. GQG Partners bulk deal + GQG insider = 1 source)
- **Gemini AI Summaries** — 3-sentence structured format with historical precedent; fallback to deterministic summaries if API unavailable
- **Live Price Integration** — Yahoo Finance with 60-second cache and rate-limit backoff
- **Email & Telegram Alerts** — Real-time formatted notifications on new convergences
- **Firestore Persistence** — Signals, alerts, insights, and outcomes survive server restarts
- **In-Memory LiveStore** — Fast dev testing without Firebase
- **Demo Mode** — Pre-seeded realistic convergences for instant onboarding
- **Watchlist** — User-defined stock tracking persisted in localStorage
- **Configurable Thresholds** — Adjust window size, minimum signals, confidence floor via UI modal
- **Backtest Proof** — Historical hit rates and average moves from 12-month NSE dataset (131 events)
- **CSV Export** — Download all convergence alerts as CSV
- **PWA** — Service worker for offline support
- **Responsive Design** — Mobile-first layout (1/2/3 column grids)
- **IST Market Clock** — Live clock with OPEN/PRE/CLOSED market status in navbar

---

## Pages

### `/` — Landing Page
Hero introduction to the convergence philosophy. Explains how 4 independent signal types are fused through the convergence engine, with animated pipeline visualizations, backtesting proof, platform preview, and a CTA to open the dashboard.

### `/dashboard` — Market Overview
- **Stats Bar** — Total convergences, active signals, stocks monitored, avg confidence (with custom icons)
- **Active Convergence Banner** — Collapsed view of active alerts with View more/less toggle (shows first 3, expands on click)
- **Sector Filter Pills** — Filter stocks by sector (Banking, Auto, IT, etc.) with horizontally scrollable pills (no scrollbar)
- **Expanding Search** — Animated search dock that filters by stock name or symbol in real-time
- **Sort Options** — Convergence First / Most Signals / Biggest Mover / A→Z
- **Stock Grid** — 3-column responsive grid of StockCards with live prices, signal badges, and watchlist toggle

### `/alerts` — Convergence Intel
- **Stats Strip** — Total alerts, avg confidence, high-confidence count (each with custom icon blending with container color)
- **Confidence Filter Tabs** — All / High (≥80) / Medium (60–79)
- **Alert Cards** — Full convergence detail: stock info, signal badges, date window, AI 3-sentence summary, confidence score
- **CSV Export** — Download all alerts with signal types, confidence, window dates, AI summaries

### `/feed` — Live Signal Feed
- **Animated Scan Bars** — Equalizer visualization showing "active monitoring"
- **Convergence Notice** — Stocks with active alerts highlighted
- **Vertical Timeline** — Signals stream in via staggered animation (750ms intervals); convergence stocks get indigo timeline dots
- **Signal Cards** — Type badge, stock name/symbol, timestamp, full metadata (deal size, insider name, volume multiple, headline)

### `/backtest` — Backtest Results
- **Summary Cards** — Weighted hit rate, total samples (131), best avg move, strong combo count (custom icons per card)
- **Signal Combination Table** — 12 combinations ranked by hit rate with animated progress bars and Strong/Moderate/Weak outcome badges
- **Active Pattern Mapping** — Current live alerts mapped to their historical combo matches
- **Verified Historical Outcomes** — 8 past alerts with actual price moves (including misses for transparency)
- **Hit/Miss Summary** — Honest accounting of the sample hit rate

### `/watchlist` — Watchlist
- Bookmarked stocks shown as StockCards
- Clear all button
- Persisted in localStorage

---

## API Routes

### Signal & Alert Endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/signals` | Fetch all signals (demo or live) |
| `POST` | `/api/convergence` | Run convergence engine, generate alerts + AI summaries |
| `GET` | `/api/alerts` | Fetch all convergence alerts |
| `GET` | `/api/insights` | Fetch AI summaries keyed by stock symbol |
| `GET` | `/api/prices` | Fetch real-time NSE prices from Yahoo Finance |

### Ingestion Pipelines

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/ingest/bulk-deals` | Ingest NSE bulk deal archive (with simulated fallback) |
| `POST` | `/api/ingest/news` | Ingest Google News RSS and score sentiment |
| `POST` | `/api/ingest/technicals` | Detect 200-day MA breakouts via Yahoo Finance OHLC |
| `POST` | `/api/simulate` | Inject 7–14 realistic signals to test convergence engine |
| `GET` | `/api/simulate` | Check simulator status |

### Notifications

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/notify/email` | Send HTML alert email via Resend |
| `POST` | `/api/notify/telegram` | Send formatted Telegram message |
| `GET/POST` | `/api/notify/status` | Notification service health check |

---

## Convergence Engine

**File:** `src/lib/convergence-engine.ts`

### Algorithm

```
Input: Signal[]
  ↓
1. Filter stale signals (> 48h old in live mode)
  ↓
2. Group signals by stock symbol
  ↓
3. For each stock with ≥ 2 signals:
   - Sort by timestamp ASC
   - Open 7-day sliding window from each signal
   - Collect all signals within window
   - Deduplicate by actor (same buyer/insider = 1 source)
   - Count distinct signalTypes
   - If distinctTypes ≥ minSignalTypes (default: 2) → CONVERGENCE
  ↓
4. Calculate confidence score (0–100):
   - Count score:     signals.length × 15, capped at 40
   - Diversity score: distinctTypes × 10, capped at 30
   - Recency score:   age of latest signal (< 1d=20, < 3d=15, < 7d=10, < 14d=5)
   - Tightness score: window span (≤ 2d=10, ≤ 4d=7, ≤ 7d=4)
  ↓
5. Generate ConvergenceAlert with aiSummary (Gemini or fallback)
  ↓
6. Sort alerts by confidence DESC
  ↓
Output: ConvergenceAlert[]
```

### Configurable Thresholds

| Setting | Default | Description |
|---|---|---|
| `windowDays` | 7 | Sliding window size in days |
| `minSignalTypes` | 2 | Minimum distinct signal types to trigger |
| `minVolumeMultiple` | 2.0 | Breakout volume threshold for technicals |
| `staleHours` | 48 | Max signal age in live mode |
| `minConfidenceToShow` | 0 | UI filter to hide low-confidence alerts |

All thresholds are adjustable via the Settings modal (⚙️ in navbar) and persisted in localStorage.

---

## AI Integration (Gemini)

**File:** `src/lib/ai-summary.ts`

### Model Fallback Chain

```
gemini-2.5-flash  →  gemini-2.0-flash  →  gemini-1.5-flash-latest  →  Deterministic Fallback
```

### Generation Config

```typescript
{
  temperature: 0.2,       // Factual, low variance
  maxOutputTokens: 2048,
  topP: 0.8,
  thinkingConfig: {
    thinkingBudget: 0,    // Disable extended thinking (avoids token exhaustion)
  }
}
```

> **Note:** `thinkingBudget: 0` is critical for Gemini 2.5 Flash. Without it, the model's internal reasoning consumes the entire token budget leaving no tokens for the actual response.

### Convergence Alert Prompt (3-sentence structured format)

**Sentence 1 — What Happened:** Stock name + exact figures from signal data (deal size in ₹ Cr, insider name, volume multiple, headline)

**Sentence 2 — Why It Matters:** What the convergence of these independent signals implies about institutional positioning or momentum

**Sentence 3 — Historical Precedent:** Exact numbers from 12-month NSE backtest: `"In X comparable cases, this pattern preceded a Y% move within Z days in W% of instances"`

**Hard Rules:**
- No "suggest", "recommend", "should buy/sell" language
- Every claim grounded in provided signal data
- No speculation beyond signal metadata
- Max 100 words

### Historical Stats Database

Pre-computed from 12-month NSE analysis across 15 stocks (131 total events):

| Signal Combination | Occurrences | Hit Rate | Avg Move | Window |
|---|---|---|---|---|
| All 4 Signals | 2 | 100% | 31.2% | 30d |
| Bulk + Insider + Breakout | 3 | 100% | 25.8% | 30d |
| Insider + Breakout + Sentiment | 5 | 80% | 19.4% | 21d |
| Insider + Breakout | 11 | 73% | 18.2% | 21d |
| Bulk + Insider | 8 | 75% | 12.4% | 30d |
| Breakout + Sentiment | 7 | 71% | 11.3% | 30d |

### Deterministic Fallback

When API is unavailable, generates summaries using:
- Stock symbol as seed (same stock = same output, every time)
- Richest signal metadata (deal size > insider name > event type)
- 3 rotating Sentence 2 templates for variety
- Historical stats populated from the same database above

---

## Data Ingestion Pipelines

### Bulk Deal Ingestion (`POST /api/ingest/bulk-deals`)

**Primary source:** NSE Archives CSV
```
https://archives.nseindia.com/archives/equities/bulk/bulk{DDMMYY}.csv
```

**Fallback (weekend/holiday/timeout):** Generates simulated deals from institutional buyer list (GQG Partners, SBI MF, HDFC AMC, etc.) with realistic ₹50–850 Cr deal sizes.

**Signal produced:** `bulk_deal` with buyer name, deal size (₹ Cr), volume

---

### News Sentiment Ingestion (`POST /api/ingest/news`)

**Source:** Google News RSS for each stock
```
https://news.google.com/rss/search?q={stock}+NSE+stock&hl=en-IN&gl=IN&ceid=IN:en
```

**Sentiment Scoring:**
- +1 per positive keyword: surge, jump, soar, rally, profit, growth, upgrade, buy, bullish, expansion, win, deal, partnership
- -1 per negative keyword: fall, drop, plunge, decline, loss, weak, miss, downgrade, sell, bearish, concern, risk, probe, penalty
- Only positive-scoring headlines emit a `news_sentiment` signal

**Scans:** 6 random stocks per run to avoid rate limiting

---

### Technical Breakout Ingestion (`POST /api/ingest/technicals`)

**Source:** Yahoo Finance 1-year OHLC
```
https://query1.finance.yahoo.com/v8/finance/chart/{SYMBOL}.NS?interval=1d&range=1y
```

**Breakout Criteria:**
```
currentPrice > 200-day Moving Average
AND
currentVolume ≥ 1.8 × 20-day Average Volume
```

**Signal produced:** `technical_breakout` with MA200 value, volume multiple, current price

**Rate limiting:** 500ms sleep between requests, 2 retries on 429 with 3s backoff

---

### Simulator (`POST /api/simulate`)

Injects 7–14 realistic signals to test the full pipeline:
1. Forces a convergence on 1 randomly selected stock (2–4 signals of different types within last 10 minutes)
2. Adds background noise (random signals across all stocks within last hour)
3. Triggers the convergence engine asynchronously

---

## Notification System

### Email (Resend)

**Trigger:** New convergence alert detected in live mode

**Format:** HTML email with:
- Confidence score badge (large, colored)
- Signal list with full descriptions
- AI synthesis block
- "View in SignalOS" CTA button
- Disclaimer footer

**Subject:** `⚡ Convergence Alert: {Stock Name} ({score}/100 confidence)`

---

### Telegram Bot

**Format:** HTML-escaped message with:
- Stock name, symbol, confidence score
- Signal list (truncated to 80 chars each)
- First 300 chars of AI summary
- Link to alerts page
- Disclaimer

**Delivery:** Parallel with email via `Promise.allSettled` (non-blocking; failure doesn't block alert creation)

---

## Firebase Integration

**File:** `src/lib/firestore-store.ts`

### Collections

| Collection | Document ID | Purpose |
|---|---|---|
| `signals` | `signal.id` | All ingested signals with metadata |
| `alerts` | `alert.id` | All convergence alerts with AI summaries |
| `insights` | Stock symbol | AI summary text per stock |
| `outcomes` | Auto-generated | Historical backtest outcomes |

### Circuit Breaker

If Firestore returns `NOT_FOUND` (database doesn't exist), the entire Firestore layer disables itself gracefully — the app continues operating using in-memory LiveStore only. No crashes, no errors surfaced to the user.

---

## Demo Mode vs Live Mode

### Demo Mode (Default)

Pre-seeded with 4 realistic convergences:

| Stock | Signals | Confidence | Window |
|---|---|---|---|
| Adani Enterprises | Bulk Deal + Insider + Sentiment | 92 | 5 days |
| Tata Motors | Breakout + Insider + Sentiment | 88 | 6 days |
| Zomato | Insider + Sentiment + Breakout | 85 | 8 days |
| IRCTC | Bulk Deal + Breakout | 76 | 4 days |

- No external API calls required
- No Firestore writes
- Instant onboarding — works without any `.env` configuration

### Live Mode

- Fetches real-time signals from NSE, Yahoo Finance, Google News RSS
- Runs the convergence engine on actual live data
- Generates AI summaries with Gemini 2.5 Flash
- Persists to Firestore
- Sends email + Telegram notifications on new convergences

**To activate:**
1. Toggle **Live** in the navbar
2. Click **Simulate Live** to inject test signals
3. Alerts appear within seconds with full Gemini AI summaries

---

## Environment Variables

Create a `.env` file in the project root:

```env
# ── AI (required for live AI summaries) ──────────────────────────────
GEMINI_API_KEY=AIza...
# Get from: https://aistudio.google.com/app/apikey
# Important: Create a NEW project each time for a fresh free-tier quota

# ── Firebase (recommended for persistence) ────────────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# ── Email Notifications via Resend (optional) ─────────────────────────
RESEND_API_KEY=re_...
# Get from: https://resend.com
ALERT_EMAIL_TO=you@example.com
RESEND_FROM_EMAIL=onboarding@resend.dev

# ── Telegram Notifications (optional) ────────────────────────────────
TELEGRAM_BOT_TOKEN=123456789:AAFxxx...
# Get from: @BotFather on Telegram
TELEGRAM_CHAT_ID=123456789
# Get from: @userinfobot on Telegram

# ── App URL ───────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/vaibhavnagdeo18/ETGenAIHackathon.git
cd ETGenAIHackathon

# Install dependencies
npm install

# Create your .env file and populate it (see above)
cp .env.example .env

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Quick Demo (No setup required)

1. Run `npm run dev` and open [http://localhost:3000](http://localhost:3000)
2. Click **Open Platform** — you land on the dashboard in Demo Mode
3. Explore pre-seeded convergences on the **Convergences** page
4. Check the **Backtest** page for historical hit rates
5. Toggle to **Live Mode** and click **Simulate Live** to see real-time convergence detection with Gemini AI summaries

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── dashboard/page.tsx        # Market overview
│   ├── alerts/page.tsx           # Convergence alerts
│   ├── feed/page.tsx             # Live signal feed
│   ├── backtest/page.tsx         # Historical backtest
│   ├── watchlist/page.tsx        # User watchlist
│   ├── layout.tsx                # Root layout + metadata
│   ├── globals.css               # Global styles
│   └── api/
│       ├── signals/              # Signal fetch
│       ├── alerts/               # Alert fetch
│       ├── convergence/          # Convergence engine trigger
│       ├── insights/             # AI summaries
│       ├── prices/               # Live price fetch
│       ├── simulate/             # Signal simulator
│       ├── ingest/
│       │   ├── bulk-deals/       # NSE bulk deal ingestion
│       │   ├── news/             # Google News RSS
│       │   └── technicals/       # Yahoo Finance breakouts
│       └── notify/
│           ├── email/            # Resend email alerts
│           ├── telegram/         # Telegram bot alerts
│           └── status/           # Notification status
├── components/
│   ├── Navbar.tsx                # Top navigation bar
│   ├── AppShell.tsx              # Layout shell
│   ├── AppContext.tsx            # Global state provider
│   ├── StatsBar.tsx              # Dashboard metrics cards
│   ├── StockCard.tsx             # Stock grid card
│   ├── AlertCard.tsx             # Convergence alert card
│   ├── LiveFeedItem.tsx          # Feed signal item
│   ├── DemoToggle.tsx            # Demo/Live mode toggle + Simulate Live button
│   ├── SettingsModal.tsx         # Threshold settings modal
│   ├── SignalBadge.tsx           # Signal type colored badge
│   ├── SignalDetailModal.tsx     # Signal drilldown modal
│   ├── TimelineView.tsx          # Feed vertical timeline
│   ├── landing/                  # Landing page section components
│   └── ui/                       # shadcn + custom UI components
└── lib/
    ├── convergence-engine.ts     # Core sliding-window algorithm
    ├── ai-summary.ts             # Gemini AI integration + fallback
    ├── engine-runner.ts          # Orchestration (ingest → converge → notify)
    ├── live-store.ts             # In-memory signal/alert store (singleton)
    ├── firestore-store.ts        # Firestore persistence layer
    ├── firebase.ts               # Firebase initialization
    ├── demo-data.ts              # Pre-seeded demo signals & alerts
    ├── types.ts                  # TypeScript type definitions
    └── utils.ts                  # Shared utility functions
```

---

## Disclaimer

SignalOS is a research and educational tool built for the ETGenAI Hackathon. It does not constitute financial advice. All signals, alerts, and AI-generated summaries are for informational purposes only. Past performance does not guarantee future results. Always do your own research before making investment decisions.

---

Built for the **ETGenAI Hackathon** · Powered by Next.js, Google Gemini 2.5 Flash, Firebase, and live NSE data
