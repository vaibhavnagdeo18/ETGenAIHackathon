// ──────────────────────────────────────────
// SignalOS — Core Type Definitions
// ──────────────────────────────────────────

import { LucideIcon, Package, User, TrendingUp, Newspaper } from 'lucide-react';

export type SignalType = 'bulk_deal' | 'insider_trading' | 'technical_breakout' | 'news_sentiment';

export interface Signal {
  id: string;
  stock: string;
  stockSymbol: string;
  signalType: SignalType;
  date: string;          // ISO date string
  timestamp: number;     // Unix timestamp (ms)
  metadata: SignalMetadata;
  source: string;
  lastSuccessTimestamp: number;
}

export interface SignalMetadata {
  description: string;
  value?: number;
  volume?: number;
  priceAtSignal?: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
  dealSize?: string;
  buyerSeller?: string;
  insiderName?: string;
  insiderDesignation?: string;
  transactionType?: 'buy' | 'sell';
  maValue?: number;
  volumeMultiple?: number;
  newsHeadline?: string;
  newsSource?: string;
}

export interface ConvergenceAlert {
  id: string;
  stock: string;
  stockSymbol: string;
  signals: Signal[];
  signalTypes: SignalType[];
  timestamps: number[];
  windowStart: string;
  windowEnd: string;
  confidenceScore: number;
  aiSummary: string;
  createdAt: number;
  status: 'active' | 'expired' | 'acknowledged';
}

export interface StockInfo {
  name: string;
  symbol: string;
  sector: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  signalCount: number;
  signals: Signal[];
  hasConvergence: boolean;
  aiInsight?: string;
  // Live price fields (populated by Yahoo Finance API)
  livePrice?: number;
  livePriceChange?: number;
  livePriceChangePercent?: number;
  livePriceTimestamp?: number;
}

export interface HistoricalOutcome {
  alertId: string;
  stock: string;
  stockSymbol: string;
  signalTypes: SignalType[];
  confidenceScore: number;
  alertDate: string;          // ISO date of alert
  evaluationDate: string;     // ISO date 30 days later
  priceAtAlert: number;
  priceAtEvaluation: number;
  priceMove: number;          // percentage change
  outcome: 'hit' | 'miss';   // hit = ≥5% move within 30 days
  notes?: string;
}

export interface ThresholdSettings {
  windowDays: number;        // default 7 — sliding window for convergence detection
  minSignalTypes: number;    // default 2 — minimum distinct signal types to trigger alert
  minVolumeMultiple: number; // default 2.0 — minimum volume multiple for breakout signals
  staleHours: number;        // default 48 — hours after which a live signal is considered stale
  minConfidenceToShow: number; // default 0 — UI filter: hide alerts below this confidence
}

export const DEFAULT_THRESHOLDS: ThresholdSettings = {
  windowDays: 7,
  minSignalTypes: 2,
  minVolumeMultiple: 2.0,
  staleHours: 48,
  minConfidenceToShow: 0,
};

export const SIGNAL_CONFIG: Record<SignalType, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: LucideIcon;
  description: string;
}> = {
  bulk_deal: {
    label: 'Bulk Deal',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    icon: Package,
    description: 'NSE Bulk Deal detected',
  },
  insider_trading: {
    label: 'Insider',
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    icon: User,
    description: 'SEBI/BSE insider trading disclosure',
  },
  technical_breakout: {
    label: 'Breakout',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    icon: TrendingUp,
    description: '200-day MA + volume spike',
  },
  news_sentiment: {
    label: 'Sentiment',
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    icon: Newspaper,
    description: 'AI-classified news sentiment',
  },
};
