"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { Signal, ConvergenceAlert, StockInfo, ThresholdSettings, DEFAULT_THRESHOLDS } from '@/lib/types';
import { DEMO_STOCKS } from '@/lib/demo-data';

interface AppContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  signals: Signal[];
  alerts: ConvergenceAlert[];
  stocks: StockInfo[];
  isLoading: boolean;
  isPriceLive: boolean;
  refreshData: () => Promise<void>;
  // Watchlist
  watchlist: Set<string>;
  toggleWatchlist: (symbol: string) => void;
  // Thresholds / settings
  thresholds: ThresholdSettings;
  updateThresholds: (patch: Partial<ThresholdSettings>) => void;
  // Notifications
  notificationsEnabled: boolean;
  requestNotificationPermission: () => Promise<void>;
  // Data ingestion
  ingestData: () => Promise<{ technicals: number; news: number; bulkDeals: number }>;
  isIngesting: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [alerts, setAlerts] = useState<ConvergenceAlert[]>([]);
  const [stocks, setStocks] = useState<StockInfo[]>([...DEMO_STOCKS]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPriceLive, setIsPriceLive] = useState(false);

  // Watchlist — persisted to localStorage
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());

  // Thresholds — persisted to localStorage
  const [thresholds, setThresholds] = useState<ThresholdSettings>(DEFAULT_THRESHOLDS);

  // Notifications
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const prevAlertIdsRef = useRef<Set<string>>(new Set());

  // ── Hydrate from localStorage after mount ─────────────────────────────
  useEffect(() => {
    const storedDemo = localStorage.getItem('isDemoMode');
    if (storedDemo !== null) setIsDemoMode(storedDemo === 'true');

    const storedWatchlist = localStorage.getItem('watchlist');
    if (storedWatchlist) {
      try { setWatchlist(new Set(JSON.parse(storedWatchlist))); } catch {}
    }

    const storedThresholds = localStorage.getItem('thresholds');
    if (storedThresholds) {
      try { setThresholds({ ...DEFAULT_THRESHOLDS, ...JSON.parse(storedThresholds) }); } catch {}
    }

    const storedNotif = localStorage.getItem('notificationsEnabled');
    if (storedNotif === 'true' && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, []);

  const toggleDemoMode = () => setIsDemoMode(prev => {
    const next = !prev;
    localStorage.setItem('isDemoMode', String(next));
    return next;
  });

  const toggleWatchlist = (symbol: string) => {
    setWatchlist(prev => {
      const next = new Set(prev);
      next.has(symbol) ? next.delete(symbol) : next.add(symbol);
      localStorage.setItem('watchlist', JSON.stringify([...next]));
      return next;
    });
  };

  const updateThresholds = (patch: Partial<ThresholdSettings>) => {
    setThresholds(prev => {
      const next = { ...prev, ...patch };
      localStorage.setItem('thresholds', JSON.stringify(next));
      return next;
    });
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    setNotificationsEnabled(granted);
    localStorage.setItem('notificationsEnabled', String(granted));
  };

  // ── Fire browser notification when new convergences appear ────────────
  useEffect(() => {
    if (!notificationsEnabled) return;
    const newAlerts = alerts.filter(a => !prevAlertIdsRef.current.has(a.id));
    if (newAlerts.length > 0 && prevAlertIdsRef.current.size > 0) {
      newAlerts.forEach(alert => {
        new Notification(`⚡ Convergence: ${alert.stock}`, {
          body: `${alert.signals.length} signals · ${alert.confidenceScore}/100 confidence`,
          icon: '/icon-192.png',
          tag: alert.id,
        });
      });
    }
    prevAlertIdsRef.current = new Set(alerts.map(a => a.id));
  }, [alerts, notificationsEnabled]);

  const isRefreshingRef = useRef(false);

  const refreshData = useCallback(async (silent = false) => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    if (!silent) setIsLoading(true);
    try {
      const ts = Date.now();
      const [sigResult, alertResult, insightResult] = await Promise.allSettled([
        fetch(`/api/signals?demo=${isDemoMode}&t=${ts}`, { cache: 'no-store' }).then(r => r.ok ? r.json() : Promise.reject(r.status)),
        fetch(`/api/alerts?demo=${isDemoMode}&t=${ts}`, { cache: 'no-store' }).then(r => r.ok ? r.json() : Promise.reject(r.status)),
        fetch(`/api/insights?demo=${isDemoMode}&t=${ts}`, { cache: 'no-store' }).then(r => r.ok ? r.json() : Promise.reject(r.status)),
      ]);

      const sigData: Signal[] = sigResult.status === 'fulfilled' ? sigResult.value : [];
      const alertData: ConvergenceAlert[] = alertResult.status === 'fulfilled' ? alertResult.value : [];
      const insightData: Record<string, string> = insightResult.status === 'fulfilled' ? insightResult.value : {};

      if (sigResult.status === 'fulfilled') setSignals(sigData);
      if (alertResult.status === 'fulfilled') setAlerts(alertData);

      if (sigResult.status === 'fulfilled' || alertResult.status === 'fulfilled') {
        setStocks(prev =>
          prev.map(stock => {
            const stockSignals = sigData.filter((s: Signal) => s.stockSymbol === stock.symbol);
            const hasConvergence = alertData.some((a: ConvergenceAlert) => a.stockSymbol === stock.symbol);
            const aiInsight = insightData[stock.symbol];
            return {
              ...stock,
              signals: stockSignals,
              signalCount: stockSignals.length,
              hasConvergence,
              aiInsight,
            };
          })
        );
      }
    } catch (err) {
      console.error('[SignalOS] Data refresh error:', err);
    } finally {
      isRefreshingRef.current = false;
      if (!silent) setIsLoading(false);
    }
  }, [isDemoMode]);

  // ── Data ingestion ────────────────────────────────────────────────────
  const [isIngesting, setIsIngesting] = useState(false);

  const ingestData = useCallback(async () => {
    setIsIngesting(true);
    try {
      const [techRes, newsRes, bulkRes] = await Promise.allSettled([
        fetch('/api/ingest/technicals', { method: 'POST' }),
        fetch('/api/ingest/news',       { method: 'POST' }),
        fetch('/api/ingest/bulk-deals', { method: 'POST' }),
      ]);

      const techData = techRes.status === 'fulfilled' && techRes.value.ok ? await techRes.value.json() : {};
      const newsData = newsRes.status === 'fulfilled' && newsRes.value.ok ? await newsRes.value.json() : {};
      const bulkData = bulkRes.status === 'fulfilled' && bulkRes.value.ok ? await bulkRes.value.json() : {};

      await fetch('/api/convergence?demo=false', { method: 'POST' });
      await refreshData(true);

      return {
        technicals: techData.breakoutsDetected ?? 0,
        news:       newsData.positiveSignals   ?? 0,
        bulkDeals:  bulkData.dealsGenerated    ?? 0,
      };
    } finally {
      setIsIngesting(false);
    }
  }, [refreshData]);

  // ── Live price polling (Yahoo Finance via /api/prices) ──────────────────
  const refreshPrices = useCallback(async () => {
    try {
      const symbols = DEMO_STOCKS.map(s => s.symbol).join(',');
      const res = await fetch(`/api/prices?symbols=${encodeURIComponent(symbols)}`, {
        cache: 'no-store',
      });
      if (!res.ok) return;

      const priceData: Record<string, {
        price: number;
        change: number;
        changePercent: number;
        timestamp: number;
        marketState: string;
      }> = await res.json();

      const hasData = Object.keys(priceData).length > 0;
      setIsPriceLive(hasData);

      if (!hasData) return;

      setStocks(prev =>
        prev.map(stock => {
          const live = priceData[stock.symbol];
          if (!live) return stock;
          return {
            ...stock,
            livePrice: live.price,
            livePriceChange: live.change,
            livePriceChangePercent: live.changePercent,
            livePriceTimestamp: live.timestamp,
          };
        })
      );
    } catch (err) {
      console.error('[SignalOS] Price refresh error:', err);
    }
  }, []);

  // Initial data load + live-mode polling
  useEffect(() => {
    refreshData(false);
    if (isDemoMode) return;
    const interval = setInterval(() => refreshData(true), 15_000);
    return () => clearInterval(interval);
  }, [isDemoMode, refreshData]);

  // Price polling — always on (prices are public data, demo or live)
  useEffect(() => {
    refreshPrices();
    const interval = setInterval(refreshPrices, 90_000);
    return () => clearInterval(interval);
  }, [refreshPrices]);

  return (
    <AppContext.Provider
      value={{
        isDemoMode,
        toggleDemoMode,
        signals,
        alerts,
        stocks,
        isLoading,
        isPriceLive,
        refreshData,
        watchlist,
        toggleWatchlist,
        thresholds,
        updateThresholds,
        notificationsEnabled,
        requestNotificationPermission,
        ingestData,
        isIngesting,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
