"use client";

import { useAppContext } from '@/components/AppContext';
import { StockCard } from '@/components/StockCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, BookmarkX, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function WatchlistPage() {
  const { stocks, watchlist, toggleWatchlist, isLoading } = useAppContext();

  const watchedStocks = stocks.filter(s => watchlist.has(s.symbol));

  if (isLoading) {
    return (
      <div className="space-y-6 pb-20 max-w-5xl mx-auto">
        <div className="h-12 w-48 bg-slate-200/60 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-52 bg-slate-200/30 rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600/80">
              Personal Tracker
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl leading-none">
            Watchlist
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {watchedStocks.length > 0
              ? `Tracking ${watchedStocks.length} stock${watchedStocks.length > 1 ? 's' : ''}. Click the bookmark icon on any card to add or remove.`
              : 'No stocks watched yet. Browse the overview and click the bookmark icon to add stocks.'}
          </p>
        </div>

        {watchedStocks.length > 0 && (
          <button
            onClick={() => watchedStocks.forEach(s => toggleWatchlist(s.symbol))}
            className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-rose-500 border border-slate-200 hover:border-rose-500/30 px-3 py-2 rounded-lg transition-all"
          >
            <BookmarkX className="w-3.5 h-3.5" />
            Clear all
          </button>
        )}
      </div>

      {/* Empty state */}
      {watchedStocks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center p-20 bg-slate-100/20 border border-dashed border-slate-200 rounded-3xl"
        >
          <Bookmark className="w-10 h-10 text-slate-400 mb-4" />
          <p className="text-slate-500 font-medium mb-4">Your watchlist is empty</p>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Browse stocks
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}

      {/* Stock grid */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {watchedStocks.map((stock, i) => (
            <motion.div
              key={stock.symbol}
              layout
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.2, delay: Math.min(i * 0.05, 0.3) }}
            >
              <StockCard stock={stock} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
