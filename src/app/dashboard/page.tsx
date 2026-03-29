"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { StatsBar } from '@/components/StatsBar';
import { StockCard } from '@/components/StockCard';
import { useAppContext } from '@/components/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ArrowUpDown, ChevronDown } from 'lucide-react';
import { ExpandingSearchDock } from '@/components/ui/expanding-search-dock-shadcnui';

type SortKey = 'convergence' | 'signals' | 'price_change' | 'name';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'convergence', label: 'Convergence First' },
  { key: 'signals',     label: 'Most Signals' },
  { key: 'price_change', label: 'Biggest Mover' },
  { key: 'name',        label: 'A → Z' },
];

export default function DashboardPage() {
  const { stocks, alerts, isLoading } = useAppContext();
  const [searchTerm, setSearchTerm]     = useState('');
  const [activeSector, setActiveSector] = useState('All');
  const [sortKey, setSortKey]           = useState<SortKey>('convergence');
  const [sortOpen, setSortOpen]         = useState(false);
  const [alertsExpanded, setAlertsExpanded] = useState(false);

  const sectors = useMemo(() => {
    const s = new Set(stocks.map(stock => stock.sector));
    return ['All', ...Array.from(s).sort()];
  }, [stocks]);

  const sectorCounts = useMemo(() => {
    const counts: Record<string, number> = { All: stocks.length };
    stocks.forEach(s => {
      counts[s.sector] = (counts[s.sector] ?? 0) + 1;
    });
    return counts;
  }, [stocks]);

  const filteredStocks = useMemo(() => {
    return stocks.filter(stock => {
      const matchesSearch =
        stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSector = activeSector === 'All' || stock.sector === activeSector;
      return matchesSearch && matchesSector;
    });
  }, [stocks, searchTerm, activeSector]);

  const sortedStocks = useMemo(() => {
    return [...filteredStocks].sort((a, b) => {
      if (sortKey === 'convergence') {
        if (a.hasConvergence !== b.hasConvergence) return a.hasConvergence ? -1 : 1;
        if (a.signalCount !== b.signalCount) return b.signalCount - a.signalCount;
        return a.name.localeCompare(b.name);
      }
      if (sortKey === 'signals') return b.signalCount - a.signalCount;
      if (sortKey === 'price_change') {
        const aChange = Math.abs(a.livePriceChangePercent ?? a.priceChangePercent);
        const bChange = Math.abs(b.livePriceChangePercent ?? b.priceChangePercent);
        return bChange - aChange;
      }
      return a.name.localeCompare(b.name);
    });
  }, [filteredStocks, sortKey]);

  const activeAlerts = alerts.filter(a => a.status === 'active');

  if (isLoading) {
    return (
      <div className="space-y-6 pb-20">
        {/* Skeleton header */}
        <div className="h-12 w-72 bg-slate-200/60 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200/40 rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-52 bg-slate-200/30 rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">

      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600/80">
              Intelligence Dashboard
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl leading-none">
            Market Overview
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-xl">
            Monitoring <span className="text-slate-700 font-semibold">{stocks.length} high-volume NSE equities</span> for multi-source convergence.
            Stocks with active alerts are ranked first.
          </p>
        </div>

        {/* Search */}
        <ExpandingSearchDock
          placeholder="Search stock or symbol…"
          onSearch={q => setSearchTerm(q)}
        />
      </div>

      {/* ── Active Convergence Banner ────────────────────── */}
      <AnimatePresence>
        {activeAlerts.length > 0 && !searchTerm && activeSector === 'All' && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-50/80 via-slate-50/80 to-violet-50/60 p-4 backdrop-blur-sm"
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-indigo-500/60 via-violet-500/40 to-transparent" />
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/convergence.png" alt="Convergence" className="w-7 h-7 object-contain mix-blend-multiply" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {activeAlerts.length} Active Convergence{activeAlerts.length > 1 ? 's' : ''} Detected
                  </div>
                  <div className="text-xs text-indigo-600/70">
                    {alertsExpanded
                      ? activeAlerts.map(a => a.stock).join(' · ')
                      : activeAlerts.slice(0, 3).map(a => a.stock).join(' · ') + (activeAlerts.length > 3 ? ` · +${activeAlerts.length - 3} more` : '')
                    }
                  </div>
                  {activeAlerts.length > 3 && (
                    <button
                      onClick={() => setAlertsExpanded(v => !v)}
                      className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors mt-0.5"
                    >
                      {alertsExpanded ? 'View less ↑' : 'View more ↓'}
                    </button>
                  )}
                </div>
              </div>
              <Link
                href="/alerts"
                className="shrink-0 text-xs font-bold text-indigo-600 border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 px-4 py-2 rounded-lg transition-colors"
              >
                View All →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <StatsBar />

      {/* ── Filters & Sort Row ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Sector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-1 scrollbar-none">
          <div className="flex items-center gap-1 px-2 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-200 mr-1 shrink-0">
            <Filter className="w-3 h-3" />
          </div>
          {sectors.map(sector => (
            <button
              key={sector}
              onClick={() => setActiveSector(sector)}
              className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                activeSector === sector
                  ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-100/40 border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              {sector}
              <span className={`text-[9px] px-1 py-0 rounded-full ${activeSector === sector ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-400'}`}>
                {sectorCounts[sector] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setSortOpen(v => !v)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-500 border border-slate-200 rounded-full hover:border-slate-300 hover:text-slate-700 transition-all bg-slate-100/40"
          >
            <ArrowUpDown className="w-3 h-3" />
            {SORT_OPTIONS.find(o => o.key === sortKey)?.label}
            <ChevronDown className={`w-3 h-3 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {sortOpen && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-44 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-lg z-20"
              >
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => { setSortKey(opt.key); setSortOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors ${
                      sortKey === opt.key
                        ? 'text-indigo-600 bg-indigo-500/10'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Results count */}
      {(searchTerm || activeSector !== 'All') && (
        <div className="flex items-center gap-2">
          <p className="text-xs text-slate-500">
            Showing <span className="text-slate-700 font-semibold">{sortedStocks.length}</span> of {stocks.length} stocks
          </p>
          <button
            onClick={() => { setSearchTerm(''); setActiveSector('All'); }}
            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* ── Stock Grid ────────────────────────────────── */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" onClick={() => setSortOpen(false)}>
        <AnimatePresence mode="popLayout">
          {sortedStocks.map((stock, i) => (
            <motion.div
              key={stock.symbol}
              layout
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.3) }}
            >
              <StockCard stock={stock} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {sortedStocks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center p-20 bg-slate-100/20 border border-dashed border-slate-200 rounded-3xl"
        >
          <Search className="w-10 h-10 text-slate-400 mb-4" />
          <p className="text-slate-500 font-medium">No stocks matched your search or filter.</p>
          <button
            onClick={() => { setSearchTerm(''); setActiveSector('All'); }}
            className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-bold transition-colors"
          >
            Clear all filters
          </button>
        </motion.div>
      )}
    </div>
  );
}
