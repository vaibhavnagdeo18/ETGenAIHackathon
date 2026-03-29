"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAppContext } from '@/components/AppContext';
import { LiveFeedItem } from '@/components/LiveFeedItem';
import { Signal } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Zap } from 'lucide-react';

function ScanBars() {
  return (
    <div className="flex gap-0.5 items-end h-5">
      {[1, 1.5, 0.8, 1.2, 0.6, 1.4, 1, 0.9, 1.3, 0.7].map((scale, i) => (
        <motion.div
          key={i}
          className="w-1 bg-indigo-500 rounded-full"
          animate={{ scaleY: [scale * 0.3, scale, scale * 0.3] }}
          transition={{
            repeat: Infinity,
            duration: 0.9 + i * 0.07,
            delay: i * 0.06,
            ease: 'easeInOut',
          }}
          style={{ height: '100%', originY: 1 }}
        />
      ))}
    </div>
  );
}

export default function FeedPage() {
  const { signals, alerts, isLoading } = useAppContext();
  const [visibleSignals, setVisibleSignals] = useState<Signal[]>([]);

  // Group signals by stock to detect potential convergences in the feed
  const convergenceStocks = useMemo(
    () => new Set(alerts.map(a => a.stockSymbol)),
    [alerts]
  );

  // Simulate live stream by dropping signals in one by one
  useEffect(() => {
    if (isLoading || signals.length === 0) return;
    setVisibleSignals([]);
    const sorted = [...signals].sort((a, b) => a.timestamp - b.timestamp);
    let i = 0;
    const iv = setInterval(() => {
      if (i < sorted.length) {
        setVisibleSignals(prev => [sorted[i], ...prev]);
        i++;
      } else {
        clearInterval(iv);
      }
    }, 750);
    return () => clearInterval(iv);
  }, [signals, isLoading]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="h-12 w-64 bg-slate-200/60 rounded-xl animate-pulse" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-200/30 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24">

      {/* ── Header ───────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6 pb-5 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/80">
              Live Signal Stream
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <Radio className="w-7 h-7 text-indigo-600 animate-pulse" />
            Intelligence Feed
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-lg">
            Real-time stream of parsed signals. Each event is evaluated by the convergence engine
            — overlapping signals on the same stock trigger an alert.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <ScanBars />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
              {visibleSignals.length} Signals
            </span>
          </div>
        </div>
      </div>

      {/* ── Convergence Notice Banner ──────────────────── */}
      <AnimatePresence>
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl border border-indigo-500/20 bg-indigo-50/60 backdrop-blur-sm"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-sm">
              <span className="font-bold text-slate-900">Convergence detected</span>
              <span className="text-slate-500"> on </span>
              <span className="font-semibold text-indigo-600">
                {[...convergenceStocks].join(', ')}
              </span>
              <span className="text-slate-500"> — signals marked below</span>
            </div>
            <a
              href="/alerts"
              className="ml-auto text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors shrink-0"
            >
              View alerts →
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Feed List ─────────────────────────────────── */}
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute top-0 bottom-0 left-[18px] w-px bg-gradient-to-b from-indigo-500/30 via-slate-200/60 to-transparent" />

        <div className="space-y-3 pl-10">
          <AnimatePresence>
            {visibleSignals.filter(Boolean).map(sig => (
              <div key={sig.id} className="relative">
                {/* Timeline dot */}
                <div className={`absolute -left-[29px] top-4 w-3 h-3 rounded-full border-2 border-white ${
                  convergenceStocks.has(sig.stockSymbol) ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 'bg-slate-400'
                }`} />

                {/* Convergence stock highlight ring */}
                {convergenceStocks.has(sig.stockSymbol) && (
                  <div className="absolute -inset-0.5 rounded-xl border border-indigo-500/20 pointer-events-none" />
                )}

                <LiveFeedItem signal={sig} />
              </div>
            ))}
          </AnimatePresence>

          {visibleSignals.length === 0 && (
            <div className="flex items-center gap-3 py-8 text-sm text-slate-500 italic">
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Radio className="w-4 h-4" />
              </motion.div>
              Waiting for incoming signals…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
