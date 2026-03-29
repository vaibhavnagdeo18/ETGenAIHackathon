"use client";

import { useState, useEffect, useRef } from 'react';
import { StockInfo, Signal } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { SignalBadge } from './SignalBadge';
import { SignalDetailModal } from './SignalDetailModal';
import { useAppContext } from './AppContext';
import { ArrowUpRight, ArrowDownRight, Activity, Radio, Bookmark, BookmarkCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function StockCard({ stock }: { stock: StockInfo }) {
  const { watchlist, toggleWatchlist } = useAppContext();
  const isWatched = watchlist.has(stock.symbol);

  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);

  // Prefer live price when available, fall back to demo/static price
  const displayPrice = stock.livePrice ?? stock.currentPrice;
  const displayChange = stock.livePriceChange ?? stock.priceChange;
  const displayChangePercent = stock.livePriceChangePercent ?? stock.priceChangePercent;
  const isPositive = displayChange >= 0;
  const isLive = stock.livePrice != null;

  // Flash animation on price change
  const prevPriceRef = useRef<number>(displayPrice);
  const [flashDir, setFlashDir] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    const prev = prevPriceRef.current;
    if (isLive && stock.livePrice != null && stock.livePrice !== prev) {
      setFlashDir(stock.livePrice > prev ? 'up' : 'down');
      prevPriceRef.current = stock.livePrice;
      const t = setTimeout(() => setFlashDir(null), 1600);
      return () => clearTimeout(t);
    }
  }, [stock.livePrice, isLive]);

  const lastUpdate = stock.livePriceTimestamp
    ? (() => {
        const diffMs = Date.now() - stock.livePriceTimestamp;
        const diffMin = Math.floor(diffMs / 60_000);
        if (diffMin < 1) return 'just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        return null;
      })()
    : null;

  const flashBg = flashDir === 'up'
    ? 'rgba(52,211,153,0.18)'
    : flashDir === 'down'
      ? 'rgba(248,113,113,0.18)'
      : 'rgba(0,0,0,0)';

  return (
    <>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Card className="relative overflow-hidden h-full p-5 bg-white/80 border-slate-200 backdrop-blur-xl transition-all duration-300">
          {stock.hasConvergence && (
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          )}

          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex-1 min-w-0 pr-3">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight truncate">
                  {stock.name}
                </h3>
                {/* Watchlist bookmark */}
                <button
                  onClick={() => toggleWatchlist(stock.symbol)}
                  className="shrink-0 p-0.5 rounded text-slate-400 hover:text-indigo-500 transition-colors"
                  title={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
                >
                  {isWatched
                    ? <BookmarkCheck className="w-4 h-4 text-indigo-500" />
                    : <Bookmark className="w-4 h-4" />
                  }
                </button>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {stock.symbol} • {stock.sector}
              </p>
            </div>

            {/* Price block */}
            <div className="text-right flex-shrink-0">
              {isLive && (
                <div className="flex items-center justify-end gap-1 mb-1">
                  <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                    <Radio className="w-2 h-2 animate-pulse" />
                    NSE LIVE
                  </span>
                </div>
              )}

              <motion.div
                animate={{ backgroundColor: flashBg }}
                transition={{ duration: flashDir ? 0.1 : 1.5, ease: 'easeOut' }}
                className="rounded px-1 -mx-1"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={displayPrice.toFixed(2)}
                    initial={{ opacity: 0.4, y: flashDir === 'up' ? -6 : flashDir === 'down' ? 6 : 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`text-sm font-semibold ${
                      flashDir === 'up' ? 'text-emerald-600' : flashDir === 'down' ? 'text-rose-600' : 'text-slate-700'
                    }`}
                  >
                    ₹{displayPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              <div className={`flex items-center justify-end gap-1 text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                <span>
                  {isPositive ? '+' : ''}
                  {displayChange.toFixed(2)} ({Math.abs(displayChangePercent).toFixed(2)}%)
                </span>
              </div>

              {lastUpdate && (
                <p className="text-[9px] text-slate-400 mt-0.5 text-right">{lastUpdate}</p>
              )}
            </div>
          </div>

          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Recent Signals</span>
              <span className="text-xs font-semibold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                {stock.signalCount}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[32px]">
              {stock.signals.length > 0 ? (
                stock.signals.map(signal => (
                  <div
                    key={signal.id}
                    onClick={() => setSelectedSignal(signal)}
                    className="cursor-pointer"
                  >
                    <SignalBadge type={signal.signalType} />
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Activity className="w-3.5 h-3.5" />
                  No active signals
                </div>
              )}
            </div>
          </div>

          {/* AI Insight */}
          {stock.signalCount > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200/50">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="p-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                  <Activity className="w-3 h-3 text-indigo-600" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  AI Insight
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500 line-clamp-2 italic">
                {stock.aiInsight ||
                  `Evaluating ${stock.signalCount} recent ${stock.signalCount === 1 ? 'signal' : 'signals'}…`}
              </p>
            </div>
          )}
        </Card>
      </motion.div>

      <SignalDetailModal signal={selectedSignal} onClose={() => setSelectedSignal(null)} />
    </>
  );
}
